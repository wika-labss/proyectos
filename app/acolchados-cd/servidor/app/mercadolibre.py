"""Vínculo con Mercado Libre: cuentas, tokens y llamadas a su API.

Tres decisiones de diseño que conviene no deshacer:

1. **Varias cuentas, no una.** Las credenciales viven en la tabla `ml_cuentas`,
   no en el `.env`. Hoy se prueba con una cuenta de test y mañana se conecta la
   del dueño sin tocar código ni perder el historial de la anterior.

2. **La renovación va con candado.** El refresh token de Mercado Libre es de
   **un solo uso** y solo vale el último emitido. Si dos peticiones lo renuevan
   a la vez, una gana y la otra deja el token muerto: la integración se cae
   hasta que alguien vuelva a autorizar a mano. El candado lo impide.

3. **`expires_in` manda.** La documentación dice "6 horas" en el texto pero su
   propio ejemplo devuelve 10800 segundos, que son 3. Se usa lo que venga en la
   respuesta, nunca un número escrito a mano.
"""

import json
import logging
import os
import secrets
import threading
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

registro = logging.getLogger("acd.ml")

# Identidad de NUESTRA aplicación. Esto sí va en el .env: no cambia nunca,
# y no identifica a ningún vendedor.
APP_ID = os.getenv("ML_APP_ID", "").strip()
SECRET = os.getenv("ML_SECRET", "").strip()
SITIO = os.getenv("ML_SITIO", "MLC").strip().upper()      # MLC = Chile

# La URL a la que Mercado Libre devuelve al vendedor tras autorizar. Debe
# coincidir EXACTAMENTE con la registrada en la aplicación, sin nada variable.
REDIRECCION = os.getenv("ML_REDIRECCION", "https://vissiuss.lat/api/ml/callback").strip()

API = "https://api.mercadolibre.com"
# Cada país tiene su dominio de autorización. El token se pide siempre a api.
AUTORIZACION = {
    "MLC": "https://auth.mercadolibre.cl",
    "MLA": "https://auth.mercadolibre.com.ar",
    "MLB": "https://auth.mercadolivre.com.br",
    "MLM": "https://auth.mercadolibre.com.mx",
    "MLU": "https://auth.mercadolibre.com.uy",
    "MCO": "https://auth.mercadolibre.com.co",
    "MPE": "https://auth.mercadolibre.com.pe",
}

MINUTOS_MARGEN = 10        # se renueva antes de que expire, no justo al filo
ESPERA = 20                # segundos de paciencia con la API

# Un candado por cuenta: solo serializa la renovación de esa cuenta.
_candados: dict[int, threading.Lock] = {}
_candado_maestro = threading.Lock()


def configurado() -> bool:
    return bool(APP_ID and SECRET)


def _candado(cuenta_id: int) -> threading.Lock:
    with _candado_maestro:
        return _candados.setdefault(cuenta_id, threading.Lock())


def ahora():
    return datetime.now(timezone.utc)


def iso(momento):
    return momento.isoformat(timespec="seconds")


class ErrorML(Exception):
    """Algo salió mal hablando con Mercado Libre."""

    def __init__(self, mensaje, codigo=None, detalle=None):
        super().__init__(mensaje)
        self.codigo = codigo
        self.detalle = detalle or {}


# ─── Llamadas de bajo nivel ───────────────────────────────────────────────
def _pedir(url, datos=None, cabeceras=None, metodo=None, forma="json"):
    cuerpo = None
    cab = dict(cabeceras or {})
    if datos is not None:
        if forma == "form":
            cuerpo = urllib.parse.urlencode(datos).encode()
            cab["Content-Type"] = "application/x-www-form-urlencoded"
        else:
            cuerpo = json.dumps(datos).encode()
            cab["Content-Type"] = "application/json"
    cab.setdefault("Accept", "application/json")

    peticion = urllib.request.Request(url, cuerpo, cab, method=metodo)
    try:
        with urllib.request.urlopen(peticion, timeout=ESPERA) as r:
            texto = r.read().decode("utf-8", "replace")
            return json.loads(texto) if texto else {}
    except urllib.error.HTTPError as e:
        texto = e.read().decode("utf-8", "replace")
        try:
            detalle = json.loads(texto)
        except ValueError:
            detalle = {"raw": texto[:400]}
        raise ErrorML(
            detalle.get("message") or detalle.get("error_description")
            or detalle.get("error") or f"Mercado Libre respondió {e.code}",
            codigo=e.code, detalle=detalle,
        ) from e
    except (urllib.error.URLError, TimeoutError) as e:
        raise ErrorML(f"No se pudo hablar con Mercado Libre: {e}") from e


# ─── Paso 1: mandar al vendedor a autorizar ───────────────────────────────
def url_de_autorizacion(estado: str) -> str:
    """El enlace al que se manda al vendedor para que autorice la aplicación.

    `estado` es un valor de un solo uso que generamos nosotros y comprobamos
    al volver: sin él, cualquiera podría llamar a nuestro callback y colgar
    SU cuenta de Mercado Libre en nuestro panel.
    """
    base = AUTORIZACION.get(SITIO, AUTORIZACION["MLC"])
    parametros = urllib.parse.urlencode({
        "response_type": "code",
        "client_id": APP_ID,
        "redirect_uri": REDIRECCION,
        "state": estado,
    })
    return f"{base}/authorization?{parametros}"


# ─── Paso 2: cambiar el código por un token ───────────────────────────────
def _guardar_tokens(cx, respuesta: dict, cuenta_id: int | None = None) -> int:
    """Escribe los tokens recibidos. Devuelve el id de la cuenta."""
    vence = ahora() + timedelta(seconds=int(respuesta.get("expires_in", 10800)))
    ml_user = str(respuesta.get("user_id", ""))
    momento = iso(ahora())

    if cuenta_id is None:
        fila = cx.execute("SELECT id FROM ml_cuentas WHERE ml_user_id = ?", (ml_user,)).fetchone()
        cuenta_id = fila["id"] if fila else None

    if cuenta_id is None:
        cursor = cx.execute(
            "INSERT INTO ml_cuentas (ml_user_id, sitio, access_token, refresh_token, "
            "expira, scope, creada, actualizada) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (ml_user, SITIO, respuesta["access_token"], respuesta["refresh_token"],
             iso(vence), respuesta.get("scope", ""), momento, momento),
        )
        return cursor.lastrowid

    cx.execute(
        "UPDATE ml_cuentas SET access_token = ?, refresh_token = ?, expira = ?, "
        "scope = ?, activa = 1, error = '', actualizada = ? WHERE id = ?",
        (respuesta["access_token"], respuesta["refresh_token"], iso(vence),
         respuesta.get("scope", ""), momento, cuenta_id),
    )
    return cuenta_id


def canjear_codigo(bd, codigo: str) -> int:
    """Cambia el código de autorización por tokens y guarda la cuenta."""
    respuesta = _pedir(f"{API}/oauth/token", {
        "grant_type": "authorization_code",
        "client_id": APP_ID,
        "client_secret": SECRET,
        "code": codigo,
        "redirect_uri": REDIRECCION,
    }, forma="form")

    with bd() as cx:
        cuenta_id = _guardar_tokens(cx, respuesta)

    # El apodo es solo para que el panel muestre algo legible.
    try:
        quien = _pedir(f"{API}/users/me",
                       cabeceras={"Authorization": f"Bearer {respuesta['access_token']}"})
        with bd() as cx:
            cx.execute(
                "UPDATE ml_cuentas SET apodo = ?, es_prueba = ? WHERE id = ?",
                (quien.get("nickname", ""), 1 if quien.get("site_status") == "test" else 0,
                 cuenta_id),
            )
    except ErrorML as fallo:
        registro.warning("Cuenta %s vinculada pero sin apodo: %s", cuenta_id, fallo)

    return cuenta_id


# ─── Paso 3: mantener el token vivo ───────────────────────────────────────
def _renovar(bd, cuenta_id: int, token_fallido: str | None = None) -> str:
    """Renueva el token de una cuenta. Serializado: ver la nota de arriba.

    `token_fallido` es el token que acaba de dar 401. Importa: un token puede
    morir ANTES de su fecha de caducidad (si el vendedor cambia su contraseña
    o revoca permisos), así que en ese caso no sirve mirar el reloj. Lo que se
    comprueba entonces es si otro hilo ya renovó —su token será distinto al
    que falló— para no gastar dos veces el refresh, que es de un solo uso.
    """
    with _candado(cuenta_id):
        # Otra petición pudo renovarlo mientras esperábamos el candado.
        with bd() as cx:
            fila = cx.execute(
                "SELECT access_token, refresh_token, expira FROM ml_cuentas WHERE id = ?",
                (cuenta_id,)).fetchone()
        if not fila:
            raise ErrorML("Esa cuenta ya no está vinculada")

        if token_fallido is not None:
            if fila["access_token"] != token_fallido:
                return fila["access_token"]      # otro ya lo arregló
        elif fila["expira"] > iso(ahora() + timedelta(minutes=MINUTOS_MARGEN)):
            return fila["access_token"]

        try:
            respuesta = _pedir(f"{API}/oauth/token", {
                "grant_type": "refresh_token",
                "client_id": APP_ID,
                "client_secret": SECRET,
                "refresh_token": fila["refresh_token"],
            }, forma="form")
        except ErrorML as fallo:
            # invalid_grant aquí significa que hay que volver a autorizar a mano.
            with bd() as cx:
                cx.execute(
                    "UPDATE ml_cuentas SET activa = 0, error = ?, actualizada = ? WHERE id = ?",
                    (str(fallo)[:300], iso(ahora()), cuenta_id))
            raise

        with bd() as cx:
            _guardar_tokens(cx, respuesta, cuenta_id)
        registro.info("Token de la cuenta %s renovado", cuenta_id)
        return respuesta["access_token"]


def token_de(bd, cuenta_id: int) -> str:
    """El token vigente de una cuenta, renovándolo si hace falta."""
    with bd() as cx:
        fila = cx.execute(
            "SELECT access_token, expira, activa FROM ml_cuentas WHERE id = ?",
            (cuenta_id,)).fetchone()
    if not fila:
        raise ErrorML("Esa cuenta ya no está vinculada")
    if not fila["activa"]:
        raise ErrorML("La cuenta perdió la autorización: hay que volver a conectarla")
    if fila["expira"] > iso(ahora() + timedelta(minutes=MINUTOS_MARGEN)):
        return fila["access_token"]
    return _renovar(bd, cuenta_id)


# ─── Llamadas a la API ya autenticadas ────────────────────────────────────
def llamar(bd, cuenta_id: int, ruta: str, metodo: str = "GET",
           datos=None, parametros=None):
    """Una llamada a la API de Mercado Libre en nombre de una cuenta.

    Si el token acaba de morir (cambio de contraseña, permisos revocados), se
    intenta renovar una vez antes de rendirse.
    """
    url = f"{API}{ruta}" if ruta.startswith("/") else f"{API}/{ruta}"
    if parametros:
        url += "?" + urllib.parse.urlencode(parametros)

    token = token_de(bd, cuenta_id)
    try:
        return _pedir(url, datos, {"Authorization": f"Bearer {token}"}, metodo)
    except ErrorML as fallo:
        if fallo.codigo != 401:
            raise
        registro.info("401 en %s: renuevo y reintento", ruta)
        token = _renovar(bd, cuenta_id, token_fallido=token)
        return _pedir(url, datos, {"Authorization": f"Bearer {token}"}, metodo)


def nuevo_estado(bd) -> str:
    """Un valor de un solo uso para el paso de autorización."""
    estado = secrets.token_urlsafe(24)
    with bd() as cx:
        cx.execute("INSERT INTO ml_estados (estado, creado) VALUES (?, ?)",
                   (estado, iso(ahora())))
        # Limpieza: los que quedaron a medias no sirven de nada.
        cx.execute("DELETE FROM ml_estados WHERE creado < ?",
                   (iso(ahora() - timedelta(minutes=30)),))
    return estado


def consumir_estado(bd, estado: str) -> bool:
    """Comprueba y gasta el estado. Solo vale una vez y dura 30 minutos."""
    if not estado:
        return False
    with bd() as cx:
        fila = cx.execute("SELECT creado FROM ml_estados WHERE estado = ?", (estado,)).fetchone()
        if not fila:
            return False
        cx.execute("DELETE FROM ml_estados WHERE estado = ?", (estado,))
        return fila["creado"] >= iso(ahora() - timedelta(minutes=30))
