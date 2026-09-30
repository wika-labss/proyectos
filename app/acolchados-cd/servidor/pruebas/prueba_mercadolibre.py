"""Prueba del vínculo con Mercado Libre, sin tocar Mercado Libre.

Se reemplaza su API por una falsa que imita lo que hace la de verdad: tokens
que caducan, refresh tokens de un solo uso, y 401 cuando el token murió.

    python servidor/pruebas/prueba_mercadolibre.py
"""

import os
import shutil
import sys
import tempfile
import threading
from pathlib import Path

CARPETA = Path(tempfile.mkdtemp(prefix="ml-prueba-"))
os.environ.update(
    DATOS_DIR=str(CARPETA),
    ADMIN_PATH="prueba-secreta",
    ADMIN_USUARIO="carlos",
    ADMIN_CLAVE="una-clave-larguisima-de-prueba",
    COOKIE_SEGURA="0",
    ML_APP_ID="1234567890",
    ML_SECRET="secreto-de-prueba",
    ML_SITIO="MLC",
    ML_REDIRECCION="https://vissiuss.lat/api/ml/callback",
)

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "app"))

import mercadolibre as ml  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

verde, rojo, gris, fin = "\033[92m", "\033[91m", "\033[90m", "\033[0m"
fallos = 0


def comprobar(titulo, condicion, detalle=""):
    global fallos
    if condicion:
        print(f"  {verde}ok{fin}   {titulo}")
    else:
        fallos += 1
        print(f"  {rojo}FALLA{fin} {titulo}   {detalle}")


# ─── Un Mercado Libre de mentira ──────────────────────────────────────────
class MLFalso:
    """Imita lo que importa: caducidad, refresh de un solo uso y 401."""

    def __init__(self):
        self.refresh_valido = "TG-refresh-1"
        self.tokens_vivos = set()
        self.serie = 0
        self.canjes = 0
        self.renovaciones = 0
        self.llamadas = []
        self.expires_in = 10800          # lo que devuelve ML de verdad: 3 h
        self.candado = threading.Lock()

    def _nuevo(self):
        with self.candado:
            self.serie += 1
            n = self.serie
        acceso = f"APP_USR-token-{n}"
        self.tokens_vivos.add(acceso)
        self.refresh_valido = f"TG-refresh-{n + 1}"
        return {
            "access_token": acceso,
            "token_type": "bearer",
            "expires_in": self.expires_in,
            "scope": "offline_access read write",
            "user_id": 7654321,
            "refresh_token": self.refresh_valido,
        }

    def pedir(self, url, datos=None, cabeceras=None, metodo=None, forma="json"):
        if url.endswith("/oauth/token"):
            if datos.get("grant_type") == "authorization_code":
                if datos.get("code") != "CODIGO-BUENO":
                    raise ml.ErrorML("invalid_grant", 400, {"error": "invalid_grant"})
                self.canjes += 1
                return self._nuevo()

            # refresh: de un solo uso, solo vale el último
            if datos.get("refresh_token") != self.refresh_valido:
                raise ml.ErrorML(
                    "Error validating grant. Your authorization code or refresh token "
                    "may be expired or it was already used", 400,
                    {"error": "invalid_grant"})
            self.renovaciones += 1
            return self._nuevo()

        token = (cabeceras or {}).get("Authorization", "").replace("Bearer ", "")
        if token not in self.tokens_vivos:
            raise ml.ErrorML("invalid_token", 401, {"message": "invalid_token"})
        self.llamadas.append((metodo or "GET", url))
        if url.endswith("/users/me"):
            return {"id": 7654321, "nickname": "TESTUSER123", "site_id": "MLC",
                    "user_type": "normal", "site_status": "test",
                    "first_name": "Usuario", "last_name": "De Prueba"}
        return {"ok": True}

    def matar_tokens(self):
        """Como cuando el vendedor cambia su contraseña."""
        self.tokens_vivos.clear()


falso = MLFalso()
ml._pedir = falso.pedir

import main  # noqa: E402

main.preparar()
cliente = TestClient(main.app)
PANEL = "/prueba-secreta"
CAB = {"X-Panel": "1"}

entrar = cliente.post(f"{PANEL}/api/entrar",
                      json={"usuario": "carlos", "clave": "una-clave-larguisima-de-prueba"})
assert entrar.status_code == 200, entrar.text

# ─── El enlace de autorización ────────────────────────────────────────────
print("\n=== El enlace que se le da al vendedor ===")
r = cliente.post(f"{PANEL}/api/ml/conectar", headers=CAB)
comprobar("el panel devuelve un enlace", r.status_code == 200, r.text)
url = r.json()["url"]
print(f"  {gris}{url[:110]}…{fin}")
comprobar("apunta al dominio chileno", url.startswith("https://auth.mercadolibre.cl/authorization"))
for trozo in ("response_type=code", "client_id=1234567890", "state="):
    comprobar(f"lleva {trozo.rstrip('=')}", trozo in url)
comprobar("la redirect_uri va exacta y sin datos variables",
          "redirect_uri=https%3A%2F%2Fvissiuss.lat%2Fapi%2Fml%2Fcallback" in url)

import urllib.parse  # noqa: E402
estado = urllib.parse.parse_qs(urllib.parse.urlparse(url).query)["state"][0]

# ─── El callback, que es público ──────────────────────────────────────────
print("\n=== El callback (ruta pública: aquí se defiende) ===")
anonimo = TestClient(main.app)

r = anonimo.get("/api/ml/callback?code=CODIGO-BUENO&state=inventado", follow_redirects=False)
comprobar("un estado inventado NO conecta nada",
          r.status_code == 303 and "ml=error" in r.headers["location"], r.status_code)
with main.bd() as cx:
    comprobar("y no quedó ninguna cuenta",
              cx.execute("SELECT COUNT(*) AS n FROM ml_cuentas").fetchone()["n"] == 0)

r = anonimo.get("/api/ml/callback?state=" + estado, follow_redirects=False)
comprobar("sin código tampoco", "ml=error" in r.headers["location"])

r = anonimo.get(f"/api/ml/callback?code=CODIGO-BUENO&state={estado}", follow_redirects=False)
comprobar("el estado ya se gastó: no sirve dos veces",
          "ml=error" in r.headers["location"], r.headers.get("location"))

# ahora uno bueno
estado2 = cliente.post(f"{PANEL}/api/ml/conectar", headers=CAB).json()["url"]
estado2 = urllib.parse.parse_qs(urllib.parse.urlparse(estado2).query)["state"][0]
r = anonimo.get(f"/api/ml/callback?code=CODIGO-BUENO&state={estado2}", follow_redirects=False)
comprobar("con estado válido y código bueno, conecta",
          r.status_code == 303 and "ml=ok" in r.headers["location"], r.headers.get("location"))

r = cliente.get(f"{PANEL}/api/ml/cuentas", headers=CAB)
cuentas = r.json()["cuentas"]
comprobar("la cuenta quedó guardada", len(cuentas) == 1, cuentas)
comprobar("con su apodo", cuentas and cuentas[0]["apodo"] == "TESTUSER123", cuentas)
comprobar("marcada como cuenta de prueba", cuentas and cuentas[0]["es_prueba"] == 1)
cuenta_id = cuentas[0]["id"]

print("\n=== Lo que NO debe salir por la API ===")
comprobar("los tokens no se envían al navegador",
          "access_token" not in r.text and "refresh_token" not in r.text)
publico = anonimo.get("/api/productos")
comprobar("la API pública no menciona Mercado Libre", "ml_" not in publico.text)
sin_sesion = anonimo.get(f"{PANEL}/api/ml/cuentas")
comprobar("sin sesión no se ven las cuentas", sin_sesion.status_code == 401)

# ─── Tokens ───────────────────────────────────────────────────────────────
print("\n=== Renovación de tokens (la parte delicada) ===")
r = cliente.get(f"{PANEL}/api/ml/cuentas/{cuenta_id}/prueba", headers=CAB)
comprobar("se puede llamar a la API con el token", r.status_code == 200, r.text)
comprobar("y devuelve quién es", r.json().get("apodo") == "TESTUSER123", r.text)

antes = falso.renovaciones
cliente.get(f"{PANEL}/api/ml/cuentas/{cuenta_id}/prueba", headers=CAB)
comprobar("con el token vigente NO renueva de más", falso.renovaciones == antes)

# forzar caducidad
with main.bd() as cx:
    cx.execute("UPDATE ml_cuentas SET expira = ? WHERE id = ?",
               (ml.iso(ml.ahora()), cuenta_id))
r = cliente.get(f"{PANEL}/api/ml/cuentas/{cuenta_id}/prueba", headers=CAB)
comprobar("si caducó, renueva sola y sigue", r.status_code == 200, r.text)
comprobar("y renovó exactamente una vez", falso.renovaciones == antes + 1, falso.renovaciones)

# el token muere de golpe (el vendedor cambió su contraseña)
falso.matar_tokens()
r = cliente.get(f"{PANEL}/api/ml/cuentas/{cuenta_id}/prueba", headers=CAB)
comprobar("ante un 401 renueva y reintenta sin fallar", r.status_code == 200, r.text)

# un token muerto Y varias peticiones a la vez: el caso peor
falso.matar_tokens()
antes = falso.renovaciones
res2, err2 = [], []


def golpear_api():
    try:
        res2.append(ml.llamar(main.bd, cuenta_id, "/users/me"))
    except Exception as e:            # noqa: BLE001
        err2.append(e)


hs = [threading.Thread(target=golpear_api) for _ in range(6)]
for h in hs:
    h.start()
for h in hs:
    h.join()
comprobar("6 peticiones con el token muerto: ninguna falla", not err2, err2[:2])
comprobar("y el refresh se gastó una sola vez",
          falso.renovaciones == antes + 1, f"renovaciones: {falso.renovaciones - antes}")

# ─── La trampa del refresh de un solo uso ─────────────────────────────────
print("\n=== Refresh de un solo uso, con peticiones en paralelo ===")
with main.bd() as cx:
    cx.execute("UPDATE ml_cuentas SET expira = ? WHERE id = ?",
               (ml.iso(ml.ahora()), cuenta_id))
antes = falso.renovaciones
resultados, errores = [], []


def golpear():
    try:
        resultados.append(ml.token_de(main.bd, cuenta_id))
    except Exception as e:            # noqa: BLE001
        errores.append(e)


hilos = [threading.Thread(target=golpear) for _ in range(8)]
for h in hilos:
    h.start()
for h in hilos:
    h.join()

comprobar("ninguna de las 8 peticiones simultáneas falló", not errores, errores[:2])
comprobar("solo se renovó UNA vez, no ocho",
          falso.renovaciones == antes + 1, f"renovaciones: {falso.renovaciones - antes}")
comprobar("todas se llevaron el mismo token", len(set(resultados)) == 1, set(resultados))

# ─── Desconectar ──────────────────────────────────────────────────────────
print("\n=== Avisos y desconexión ===")
r = anonimo.post("/api/ml/avisos", json={
    "resource": "/orders/2195160686", "user_id": 7654321,
    "topic": "orders_v2", "application_id": 1234567890, "attempts": 1})
comprobar("el webhook contesta 200 (si no, ML reintenta)", r.status_code == 200, r.text)
r = cliente.get(f"{PANEL}/api/ml/cuentas", headers=CAB)
comprobar("el aviso quedó en cola", r.json()["avisos_pendientes"] == 1, r.json())

r = anonimo.post("/api/ml/avisos", content=b"esto no es json")
comprobar("un aviso corrupto no revienta ni pide reintento", r.status_code == 200)

r = cliente.request("DELETE", f"{PANEL}/api/ml/cuentas/{cuenta_id}", headers=CAB)
comprobar("se puede desconectar la cuenta", r.status_code == 200, r.text)
r = cliente.request("DELETE", f"{PANEL}/api/ml/cuentas/{cuenta_id}", headers=CAB)
comprobar("desconectar dos veces da 404, no 'ok'", r.status_code == 404, r.status_code)

shutil.rmtree(CARPETA, ignore_errors=True)
print(f"\n{rojo if fallos else verde}{'FALLAS: ' + str(fallos) if fallos else 'Todo en orden'}{fin}\n")
sys.exit(1 if fallos else 0)
