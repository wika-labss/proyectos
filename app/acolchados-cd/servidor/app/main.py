"""Acolchados CD — catálogo público y panel de administración.

Dos mundos en un solo servicio:

  · /api/...        lo que ve cualquier visitante de la web
  · /<PANEL>/...    el panel privado, en una URL secreta y con usuario y clave

El stock y las notas internas nunca salen por la parte pública.
"""

import json
import logging
import os
import re
import secrets
import sqlite3
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from contextlib import asynccontextmanager, contextmanager
from datetime import datetime, timedelta, timezone
from hashlib import pbkdf2_hmac
from hmac import compare_digest
from pathlib import Path
from time import time
from typing import Literal

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    FastAPI,
    File,
    HTTPException,
    Request,
    Response,
    UploadFile,
)
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse, RedirectResponse
from pydantic import BaseModel, Field

import correo
import mercadolibre as ml

registro = logging.getLogger("acd")

# ─── Configuración ────────────────────────────────────────────────────────
RAIZ = Path(__file__).resolve().parent
DATOS = Path(os.getenv("DATOS_DIR", "/datos"))
MEDIA = DATOS / "media"
BD = DATOS / "tienda.db"

# URL secreta del panel. Se define en el .env y no aparece en ninguna página.
PANEL = "/" + os.getenv("ADMIN_PATH", "panel").strip("/")
USUARIO_INICIAL = os.getenv("ADMIN_USUARIO", "admin").strip()
CLAVE_INICIAL = os.getenv("ADMIN_CLAVE", "")

HORAS_SESION = int(os.getenv("HORAS_SESION", "8"))
COOKIE = "acd_sesion"
# En producción la web va por HTTPS (Cloudflare), así que la cookie va marcada
# como segura. Para probar por la red local con http, poner COOKIE_SEGURA=0.
COOKIE_SEGURA = os.getenv("COOKIE_SEGURA", "1") == "1"

MAX_FALLOS = 5            # intentos de clave antes de bloquear
BLOQUEO_MINUTOS = 15
MAX_IMAGEN = 6 * 1024 * 1024
ITERACIONES = 240_000

# Cualquier petición que no sea subir una foto se queda en 256 KB. Sin esto,
# alguien sin contraseña puede mandar cuerpos enormes y ahogar la memoria.
MAX_CUERPO = 256 * 1024

# Turnstile de Cloudflare: si no hay clave, el formulario funciona igual pero
# sin esa barrera. En producción debe estar puesta.
TURNSTILE_CLAVE = os.getenv("TURNSTILE_SECRETO", "").strip()
# Esta otra es pública por diseño: va escrita en el HTML del formulario.
TURNSTILE_SITIO = os.getenv("TURNSTILE_SITIO", "").strip()
TURNSTILE_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

# Frenos del formulario de cotización. Los de correo son los importantes: sin
# ellos, cualquiera puede escribir la dirección de una víctima una y otra vez
# y usar nuestro servidor para llenarle el buzón.
POR_IP_HORA = 3
POR_IP_DIA = 10
POR_CORREO_HORA = 2
POR_CORREO_DIA = 5
GLOBAL_DIA = 120          # tope absoluto de correos salientes por día
MAX_PRODUCTOS = 20        # cuántos productos se pueden marcar en una cotización
MAX_COLUMNAS = 6          # títulos de texto entre tamaño y precio, contando Medida

# Las categorías (las "líneas" que filtran el catálogo) se administran desde
# el panel. Estas son solo las que existen la primera vez que arranca.
CATEGORIAS_INICIALES = [
    ("dorm", "Dormitorio", 0),
    ("mesa", "Mesa", 1),
    ("extra", "Complementos", 2),
]

# Firmas de archivo: no nos fiamos de la extensión que manda el navegador.
FIRMAS = [
    (b"\xff\xd8\xff", ".jpg", "image/jpeg"),
    (b"\x89PNG\r\n\x1a\n", ".png", "image/png"),
    (b"GIF87a", ".gif", "image/gif"),
    (b"GIF89a", ".gif", "image/gif"),
]
TIPOS = {".jpg": "image/jpeg", ".png": "image/png", ".gif": "image/gif", ".webp": "image/webp"}


def ahora():
    return datetime.now(timezone.utc)


def iso(momento):
    return momento.isoformat(timespec="seconds")


# ─── Base de datos ────────────────────────────────────────────────────────
ESQUEMA = """
CREATE TABLE IF NOT EXISTS admin (
  id          INTEGER PRIMARY KEY CHECK (id = 1),
  usuario     TEXT NOT NULL,
  salt        TEXT NOT NULL,
  clave_hash  TEXT NOT NULL,
  actualizado TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sesiones (
  token  TEXT PRIMARY KEY,
  creada TEXT NOT NULL,
  expira TEXT NOT NULL,
  ip     TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS intentos (
  ip     TEXT PRIMARY KEY,
  fallos INTEGER NOT NULL DEFAULT 0,
  hasta  REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS categorias (
  clave  TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  orden  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS productos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      TEXT NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  categoria   TEXT NOT NULL DEFAULT 'dorm',
  etiqueta    TEXT NOT NULL DEFAULT '',
  imagen      TEXT NOT NULL DEFAULT '',
  colores     TEXT NOT NULL DEFAULT '[]',
  columnas    TEXT NOT NULL DEFAULT '["Medida"]',
  notas       TEXT NOT NULL DEFAULT '',
  visible     INTEGER NOT NULL DEFAULT 1,
  orden       INTEGER NOT NULL DEFAULT 0,
  creado      TEXT NOT NULL,
  actualizado TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS variantes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  tamano      TEXT NOT NULL DEFAULT '',
  medida      TEXT NOT NULL DEFAULT '',
  extras      TEXT NOT NULL DEFAULT '[]',
  precio      INTEGER NOT NULL DEFAULT 0,
  stock       INTEGER NOT NULL DEFAULT 0,
  minimo      INTEGER NOT NULL DEFAULT 0,
  orden       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS movimientos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  producto    TEXT NOT NULL,
  tamano      TEXT NOT NULL DEFAULT '',
  cambio      INTEGER NOT NULL,
  resultante  INTEGER NOT NULL,
  motivo      TEXT NOT NULL DEFAULT '',
  fecha       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cotizaciones (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre    TEXT NOT NULL,
  email     TEXT NOT NULL,
  telefono  TEXT NOT NULL DEFAULT '',
  productos TEXT NOT NULL DEFAULT '[]',
  mensaje   TEXT NOT NULL DEFAULT '',
  ip        TEXT NOT NULL DEFAULT '',
  estado    TEXT NOT NULL DEFAULT 'nueva',
  correo    TEXT NOT NULL DEFAULT 'pendiente',
  creada    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ml_cuentas (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  ml_user_id    TEXT NOT NULL UNIQUE,
  apodo         TEXT NOT NULL DEFAULT '',
  sitio         TEXT NOT NULL DEFAULT 'MLC',
  access_token  TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expira        TEXT NOT NULL,
  scope         TEXT NOT NULL DEFAULT '',
  activa        INTEGER NOT NULL DEFAULT 1,
  es_prueba     INTEGER NOT NULL DEFAULT 0,
  error         TEXT NOT NULL DEFAULT '',
  creada        TEXT NOT NULL,
  actualizada   TEXT NOT NULL
);

-- Valores de un solo uso del paso de autorización (anti secuestro del callback)
CREATE TABLE IF NOT EXISTS ml_estados (
  estado TEXT PRIMARY KEY,
  creado TEXT NOT NULL
);

-- Los avisos que manda Mercado Libre. Se guardan crudos y se procesan aparte:
-- hay que contestarle rápido o los reintenta.
CREATE TABLE IF NOT EXISTS ml_avisos (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  topico     TEXT NOT NULL,
  recurso    TEXT NOT NULL,
  ml_user_id TEXT NOT NULL DEFAULT '',
  recibido   TEXT NOT NULL,
  procesado  TEXT NOT NULL DEFAULT '',
  intentos   INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS ix_var_prod ON variantes(producto_id);
CREATE INDEX IF NOT EXISTS ix_mov_fecha ON movimientos(fecha DESC);
CREATE INDEX IF NOT EXISTS ix_cot_creada ON cotizaciones(creada DESC);
CREATE INDEX IF NOT EXISTS ix_cot_email ON cotizaciones(email, creada);
CREATE INDEX IF NOT EXISTS ix_cot_ip ON cotizaciones(ip, creada);
CREATE INDEX IF NOT EXISTS ix_ml_avisos ON ml_avisos(procesado, recibido);
"""


def conectar():
    cx = sqlite3.connect(BD, timeout=15)
    cx.row_factory = sqlite3.Row
    cx.execute("PRAGMA journal_mode=WAL")
    cx.execute("PRAGMA foreign_keys=ON")
    return cx


@contextmanager
def bd():
    cx = conectar()
    try:
        yield cx
        cx.commit()
    finally:
        cx.close()


def preparar():
    DATOS.mkdir(parents=True, exist_ok=True)
    MEDIA.mkdir(parents=True, exist_ok=True)
    with bd() as cx:
        cx.executescript(ESQUEMA)

        # Bases ya creadas: la medida original sigue en `medida`.
        # `columnas` nombra los textos entre tamaño y precio; `extras` guarda
        # los que se agregan después del primero. Los productos viejos no se
        # reescriben: quedan con el título "Medida" y el texto que ya tenían.
        tener = {f["name"] for f in cx.execute("PRAGMA table_info(productos)").fetchall()}
        if "columnas" not in tener:
            cx.execute(
                "ALTER TABLE productos ADD COLUMN columnas TEXT NOT NULL DEFAULT '[\"Medida\"]'"
            )
        tener_v = {f["name"] for f in cx.execute("PRAGMA table_info(variantes)").fetchall()}
        if "extras" not in tener_v:
            cx.execute(
                "ALTER TABLE variantes ADD COLUMN extras TEXT NOT NULL DEFAULT '[]'"
            )

        if not cx.execute("SELECT 1 FROM categorias LIMIT 1").fetchone():
            cx.executemany(
                "INSERT INTO categorias (clave, nombre, orden) VALUES (?, ?, ?)",
                CATEGORIAS_INICIALES,
            )

        existe = cx.execute("SELECT 1 FROM admin WHERE id = 1").fetchone()
        if not existe:
            if not CLAVE_INICIAL:
                raise RuntimeError(
                    "Falta ADMIN_CLAVE en el .env: es la clave con la que se crea "
                    "la cuenta del panel la primera vez."
                )
            salt, clave_hash = hashear(CLAVE_INICIAL)
            cx.execute(
                "INSERT INTO admin (id, usuario, salt, clave_hash, actualizado) "
                "VALUES (1, ?, ?, ?, ?)",
                (USUARIO_INICIAL, salt, clave_hash, iso(ahora())),
            )
        cx.execute("DELETE FROM sesiones WHERE expira < ?", (iso(ahora()),))


# ─── Claves y sesiones ────────────────────────────────────────────────────
def hashear(clave: str, salt: str | None = None):
    salt = salt or secrets.token_hex(16)
    calculado = pbkdf2_hmac("sha256", clave.encode(), bytes.fromhex(salt), ITERACIONES)
    return salt, calculado.hex()


def clave_correcta(clave: str, salt: str, esperado: str) -> bool:
    _, calculado = hashear(clave, salt)
    return compare_digest(calculado, esperado)


def ip_de(peticion: Request) -> str:
    # Cloudflare y Caddy nos pasan la IP real en esta cabecera.
    real = peticion.headers.get("cf-connecting-ip") or peticion.headers.get("x-forwarded-for", "")
    if real:
        return real.split(",")[0].strip()
    return peticion.client.host if peticion.client else "?"


def bloqueado(cx, ip: str) -> int:
    fila = cx.execute("SELECT hasta FROM intentos WHERE ip = ?", (ip,)).fetchone()
    if not fila:
        return 0
    restante = int(fila["hasta"] - time())
    return max(restante, 0)


def anotar_fallo(cx, ip: str):
    fila = cx.execute("SELECT fallos FROM intentos WHERE ip = ?", (ip,)).fetchone()
    fallos = (fila["fallos"] if fila else 0) + 1
    hasta = time() + BLOQUEO_MINUTOS * 60 if fallos >= MAX_FALLOS else 0
    cx.execute(
        "INSERT INTO intentos (ip, fallos, hasta) VALUES (?, ?, ?) "
        "ON CONFLICT(ip) DO UPDATE SET fallos = excluded.fallos, hasta = excluded.hasta",
        (ip, 0 if hasta else fallos, hasta),
    )


def sesion_valida(peticion: Request) -> bool:
    token = peticion.cookies.get(COOKIE, "")
    if not token:
        return False
    with bd() as cx:
        fila = cx.execute("SELECT expira FROM sesiones WHERE token = ?", (token,)).fetchone()
        if not fila:
            return False
        if fila["expira"] < iso(ahora()):
            cx.execute("DELETE FROM sesiones WHERE token = ?", (token,))
            return False
    return True


def exigir_sesion(peticion: Request):
    """Dependencia: corta cualquier petición del panel que no venga autenticada."""
    if not sesion_valida(peticion):
        raise HTTPException(status_code=401, detail="Sesión no válida")
    # Segunda barrera contra peticiones lanzadas desde otro sitio web.
    if peticion.method != "GET" and peticion.headers.get("x-panel") != "1":
        raise HTTPException(status_code=403, detail="Petición no permitida")
    return True


# ─── Modelos de entrada ───────────────────────────────────────────────────
class Color(BaseModel):
    nombre: str = Field(max_length=40)
    hex: str = Field(default="#CCCCCC", max_length=7)


class Variante(BaseModel):
    tamano: str = Field(default="", max_length=60)
    medida: str = Field(default="", max_length=80)
    extras: list[str] = []
    precio: int = Field(default=0, ge=0, le=99_000_000)
    stock: int = Field(default=0, ge=0, le=1_000_000)
    minimo: int = Field(default=0, ge=0, le=1_000_000)


class ProductoEntrada(BaseModel):
    nombre: str = Field(min_length=1, max_length=120)
    descripcion: str = Field(default="", max_length=600)
    categoria: str = "dorm"
    etiqueta: str = Field(default="", max_length=60)
    imagen: str = Field(default="", max_length=500)
    notas: str = Field(default="", max_length=2000)
    visible: bool = True
    orden: int = 0
    colores: list[Color] = []
    columnas: list[str] = []
    variantes: list[Variante] = []


class CategoriaEntrada(BaseModel):
    nombre: str = Field(min_length=1, max_length=60)
    orden: int = Field(default=0, ge=0, le=999)


class Credenciales(BaseModel):
    usuario: str = Field(max_length=60)
    clave: str = Field(max_length=200)


class CambioClave(BaseModel):
    actual: str = Field(max_length=200)
    nueva: str = Field(min_length=10, max_length=200)


class AjusteStock(BaseModel):
    cambio: int = Field(ge=-1_000_000, le=1_000_000)
    motivo: str = Field(default="", max_length=120)


class EstadoCotizacion(BaseModel):
    estado: Literal["nueva", "atendida"]


# ─── Categorías ───────────────────────────────────────────────────────────
def leer_categorias(cx):
    return [
        dict(f)
        for f in cx.execute("SELECT clave, nombre, orden FROM categorias ORDER BY orden, nombre")
    ]


def clave_desde(nombre: str) -> str:
    """Convierte 'Ropa de Cama' en 'ropa-de-cama' para usarlo en la URL."""
    plano = unicodedata.normalize("NFKD", nombre).encode("ascii", "ignore").decode()
    limpio = re.sub(r"[^a-z0-9]+", "-", plano.lower()).strip("-")[:32]
    return limpio or "categoria"


def clave_libre(cx, nombre: str) -> str:
    base = clave_desde(nombre)
    clave, n = base, 2
    while cx.execute("SELECT 1 FROM categorias WHERE clave = ?", (clave,)).fetchone():
        clave = f"{base}-{n}"
        n += 1
    return clave


def categoria_valida(cx, propuesta: str) -> str:
    """Si la categoría no existe, cae en la primera disponible."""
    if cx.execute("SELECT 1 FROM categorias WHERE clave = ?", (propuesta,)).fetchone():
        return propuesta
    primera = cx.execute("SELECT clave FROM categorias ORDER BY orden, nombre LIMIT 1").fetchone()
    return primera["clave"] if primera else "dorm"


# ─── Lectura de productos ─────────────────────────────────────────────────
def leer_productos(cx, solo_visibles: bool):
    consulta = "SELECT * FROM productos"
    if solo_visibles:
        consulta += " WHERE visible = 1"
    consulta += " ORDER BY orden, id"
    productos = [dict(f) for f in cx.execute(consulta).fetchall()]
    if not productos:
        return []

    ids = [p["id"] for p in productos]
    marcas = ",".join("?" * len(ids))
    variantes = cx.execute(
        f"SELECT * FROM variantes WHERE producto_id IN ({marcas}) ORDER BY orden, id", ids
    ).fetchall()

    por_producto: dict[int, list] = {i: [] for i in ids}
    for v in variantes:
        por_producto[v["producto_id"]].append(dict(v))

    for p in productos:
        try:
            p["colores"] = json.loads(p["colores"])
        except (ValueError, TypeError):
            p["colores"] = []
        p["columnas"] = lista_json(p.get("columnas"), ["Medida"]) or ["Medida"]
        p["variantes"] = por_producto.get(p["id"], [])
        for v in p["variantes"]:
            v["extras"] = lista_json(v.get("extras"), [])
    return productos


def lista_json(texto, vacio: list) -> list:
    """Lee una lista guardada como texto. Si está vacía o rota, la por defecto."""
    try:
        dato = json.loads(texto) if texto else vacio
    except (ValueError, TypeError):
        return list(vacio)
    return dato if isinstance(dato, list) else list(vacio)


def columnas_de(nombres: list[str]) -> list[str]:
    """Títulos de los textos entre tamaño y precio. El primero es la medida de siempre."""
    limpias = []
    for i, nombre in enumerate(nombres[:MAX_COLUMNAS]):
        nombre = " ".join(str(nombre or "").split())[:40]
        limpias.append(nombre or ("Medida" if i == 0 else "Campo"))
    return limpias or ["Medida"]


def guardar_variantes(cx, producto_id: int, variantes: list[Variante], n_extras: int):
    cx.execute("DELETE FROM variantes WHERE producto_id = ?", (producto_id,))
    for i, v in enumerate(variantes):
        # Los extras se alinean con los títulos: se recortan si sobran y se
        # rellenan con vacío si faltan, así la fila nunca se desalinea.
        extras = [" ".join(str(e or "").split())[:80] for e in v.extras][:n_extras]
        extras += [""] * (n_extras - len(extras))
        cx.execute(
            "INSERT INTO variantes (producto_id, tamano, medida, extras, precio, stock, minimo, orden) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                producto_id,
                v.tamano.strip(),
                v.medida.strip(),
                json.dumps(extras, ensure_ascii=False),
                v.precio,
                v.stock,
                v.minimo,
                i,
            ),
        )


# ─── Aplicación ───────────────────────────────────────────────────────────
@asynccontextmanager
async def ciclo_de_vida(_: FastAPI):
    preparar()
    yield


app = FastAPI(
    title="Acolchados CD",
    lifespan=ciclo_de_vida,
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)


@app.middleware("http")
async def limite_de_cuerpo(peticion: Request, siguiente):
    """Corta las peticiones gigantes antes de leerlas.

    Pydantic valida los largos, pero lo hace DESPUÉS de tener todo el cuerpo
    en memoria. Este corte pasa antes y no necesita contraseña para actuar.
    """
    if peticion.method in ("POST", "PUT", "PATCH"):
        declarado = peticion.headers.get("content-length")
        tope = MAX_IMAGEN + 8192 if peticion.url.path.endswith("/imagenes") else MAX_CUERPO
        if declarado and declarado.isdigit() and int(declarado) > tope:
            return JSONResponse({"detail": "La petición es demasiado grande"}, status_code=413)
    return await siguiente(peticion)


@app.middleware("http")
async def cabeceras(peticion: Request, siguiente):
    respuesta = await siguiente(peticion)
    respuesta.headers["X-Content-Type-Options"] = "nosniff"
    respuesta.headers["Referrer-Policy"] = "same-origin"
    if peticion.url.path.startswith(PANEL):
        # Que ningún buscador ni caché guarde rastro del panel.
        respuesta.headers["X-Robots-Tag"] = "noindex, nofollow, noarchive"
        respuesta.headers["Cache-Control"] = "no-store"
        respuesta.headers["X-Frame-Options"] = "DENY"
    return respuesta


@app.get("/api/salud")
def salud():
    return {"ok": True}


@app.get("/api/productos")
def productos_publicos():
    """Lo que ve la web: foto, descripción, colores, tamaños y precios.

    El stock y las notas internas nunca salen de aquí.
    """
    with bd() as cx:
        crudos = leer_productos(cx, solo_visibles=True)
        categorias = leer_categorias(cx)

    nombres = {c["clave"]: c["nombre"] for c in categorias}
    salida = []
    for p in crudos:
        salida.append(
            {
                "id": p["id"],
                "nombre": p["nombre"],
                "descripcion": p["descripcion"],
                "categoria": p["categoria"],
                "etiqueta": p["etiqueta"] or nombres.get(p["categoria"], ""),
                "imagen": p["imagen"],
                "colores": p["colores"],
                "columnas": p["columnas"],
                "tamanos": [
                    {
                        "tamano": v["tamano"],
                        "medida": v["medida"],
                        "extras": v["extras"],
                        "precio": v["precio"],
                    }
                    for v in p["variantes"]
                    if v["tamano"] or v["medida"] or any(v["extras"])
                ],
            }
        )
    # Solo se publican las categorías que tengan algo que mostrar.
    usadas = {p["categoria"] for p in salida}
    return {
        "categorias": [c for c in categorias if c["clave"] in usadas],
        "productos": salida,
        "turnstile": TURNSTILE_SITIO,
    }


# ─── Cotizaciones (formulario público) ────────────────────────────────────
class Cotizacion(BaseModel):
    nombre: str = Field(min_length=2, max_length=80)
    email: str = Field(min_length=5, max_length=200)
    telefono: str = Field(default="", max_length=40)
    productos: list[int] = Field(default_factory=list, max_length=MAX_PRODUCTOS)
    otro: bool = False
    mensaje: str = Field(default="", max_length=1500)
    # Campo trampa: está oculto por CSS, una persona nunca lo llena.
    web: str = Field(default="", max_length=200)
    token: str = Field(default="", max_length=4000)


def turnstile_ok(token: str, ip: str) -> bool:
    if not TURNSTILE_CLAVE:
        return True          # sin clave configurada, no hay barrera que validar
    datos = urllib.parse.urlencode(
        {"secret": TURNSTILE_CLAVE, "response": token, "remoteip": ip}
    ).encode()
    try:
        with urllib.request.urlopen(TURNSTILE_URL, datos, timeout=8) as r:
            return bool(json.loads(r.read()).get("success"))
    except (urllib.error.URLError, ValueError, TimeoutError) as fallo:
        registro.warning("Turnstile no respondió: %s", fallo)
        return False         # ante la duda, no pasa


def cuantas(cx, campo: str, valor: str, horas: int) -> int:
    desde = iso(ahora() - timedelta(hours=horas))
    return cx.execute(
        f"SELECT COUNT(*) AS n FROM cotizaciones WHERE {campo} = ? AND creada >= ?",
        (valor, desde),
    ).fetchone()["n"]


def revisar_frenos(cx, ip: str, destino: str):
    """Los dos primeros evitan el spam. Los de correo evitan algo peor:
    que alguien use el formulario para llenarle el buzón a un tercero."""
    if cuantas(cx, "ip", ip, 1) >= POR_IP_HORA or cuantas(cx, "ip", ip, 24) >= POR_IP_DIA:
        raise HTTPException(429, "Ya recibimos varias solicitudes suyas. "
                                 "Escríbanos por WhatsApp si es urgente.")
    if (cuantas(cx, "email", destino, 1) >= POR_CORREO_HORA
            or cuantas(cx, "email", destino, 24) >= POR_CORREO_DIA):
        raise HTTPException(429, "Ya hay una solicitud en curso con este correo. "
                                 "Revise su bandeja de entrada.")
    desde = iso(ahora() - timedelta(hours=24))
    total = cx.execute(
        "SELECT COUNT(*) AS n FROM cotizaciones WHERE creada >= ?", (desde,)
    ).fetchone()["n"]
    if total >= GLOBAL_DIA:
        raise HTTPException(429, "Estamos recibiendo muchas solicitudes. "
                                 "Inténtelo más tarde o llámenos.")


def despachar(cotizacion_id: int, nombre, destino, telefono, productos, mensaje, ip):
    """Se ejecuta DESPUÉS de responderle al visitante: si el correo tarda o
    falla, la cotización ya está guardada y la página no se queda colgada."""
    estado = "enviado"
    try:
        correo.confirmacion_al_cliente(nombre, destino, productos)
    except Exception as fallo:                          # noqa: BLE001
        registro.error("No salió la confirmación al cliente: %s", fallo)
        estado = "falló al cliente"
    try:
        correo.aviso_interno(nombre, destino, telefono, productos, mensaje, ip)
    except Exception as fallo:                          # noqa: BLE001
        registro.error("No salió el aviso interno: %s", fallo)
        estado = "falló interno" if estado == "enviado" else "falló"

    with bd() as cx:
        cx.execute("UPDATE cotizaciones SET correo = ? WHERE id = ?", (estado, cotizacion_id))


@app.post("/api/cotizaciones")
def pedir_cotizacion(datos: Cotizacion, peticion: Request, tareas: BackgroundTasks):
    ip = ip_de(peticion)

    # La trampa: si viene llena es un bot. Le decimos que todo bien y no
    # hacemos nada — que no aprenda qué lo delató.
    if datos.web.strip():
        return {"ok": True}

    destino = datos.email.strip().lower()
    if not correo.correo_valido(destino):
        raise HTTPException(400, "Revise el correo electrónico, no parece válido")

    if not turnstile_ok(datos.token, ip):
        raise HTTPException(400, "No pudimos verificar que sea una persona. "
                                 "Recargue la página e inténtelo otra vez.")

    with bd() as cx:
        revisar_frenos(cx, ip, destino)

        # Los nombres de los productos salen de la base, NUNCA del formulario:
        # así el correo que enviamos no lleva ni una palabra escrita por quien
        # rellenó el formulario.
        nombres = []
        if datos.productos:
            marcas = ",".join("?" * len(datos.productos))
            nombres = [
                f["nombre"]
                for f in cx.execute(
                    f"SELECT nombre FROM productos WHERE id IN ({marcas}) AND visible = 1 "
                    "ORDER BY orden, id",
                    datos.productos,
                )
            ]
        if datos.otro or not nombres:
            nombres.append("Otro (lo detalla en el mensaje)")

        nombre = " ".join(datos.nombre.split())[:80]
        telefono = " ".join(datos.telefono.split())[:40]
        mensaje = datos.mensaje.strip()[:1500]

        cursor = cx.execute(
            "INSERT INTO cotizaciones (nombre, email, telefono, productos, mensaje, ip, creada) "
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            (nombre, destino, telefono, json.dumps(nombres, ensure_ascii=False),
             mensaje, ip, iso(ahora())),
        )
        nueva = cursor.lastrowid

    hay_correo = correo.configurado()
    if hay_correo:
        tareas.add_task(despachar, nueva, nombre, destino, telefono, nombres, mensaje, ip)
    else:
        registro.warning("Cotización %s guardada pero el correo no está configurado", nueva)

    # La página necesita saberlo: sin SMTP no puede prometerle al visitante una
    # confirmación que nunca va a llegar. La cotización igual quedó guardada.
    return {"ok": True, "correo": hay_correo}


# ─── Mercado Libre: lo que tiene que ser público ──────────────────────────
# Estas dos rutas las llama Mercado Libre, no el panel, así que no pueden
# esconderse detrás de la URL secreta ni pedir sesión.

@app.get("/api/ml/callback")
def ml_callback(peticion: Request, code: str = "", state: str = "", error: str = ""):
    """Aquí vuelve el vendedor después de autorizar en Mercado Libre.

    Es una ruta pública: cualquiera puede llamarla. Por eso el `state` es
    obligatorio, de un solo uso y lo generamos nosotros desde el panel — sin
    él, un desconocido podría colgar SU cuenta de Mercado Libre en el panel
    del cliente.
    """
    def volver(mensaje: str, bien: bool = False):
        destino = f"{PANEL}/?ml={'ok' if bien else 'error'}&" + urllib.parse.urlencode({"m": mensaje})
        return RedirectResponse(destino, status_code=303)

    if error:
        return volver(f"Mercado Libre rechazó la conexión: {error}")
    if not ml.consumir_estado(bd, state):
        registro.warning("Callback de ML con estado inválido desde %s", ip_de(peticion))
        return volver("La conexión caducó o no se inició desde el panel. Inténtalo otra vez.")
    if not code:
        return volver("Mercado Libre no devolvió el código de autorización")

    try:
        cuenta_id = ml.canjear_codigo(bd, code)
    except ml.ErrorML as fallo:
        registro.error("No se pudo canjear el código de ML: %s", fallo)
        return volver(str(fallo))

    with bd() as cx:
        fila = cx.execute("SELECT apodo, ml_user_id FROM ml_cuentas WHERE id = ?",
                          (cuenta_id,)).fetchone()
    quien = (fila["apodo"] if fila else "") or (fila["ml_user_id"] if fila else "")
    return volver(f"Cuenta {quien} conectada", bien=True)


@app.post("/api/ml/avisos")
async def ml_avisos(peticion: Request):
    """Los avisos de Mercado Libre (webhooks).

    Solo se guardan; procesarlos viene después. Mercado Libre espera una
    respuesta rápida y reintenta si tardamos, así que aquí no se llama a su
    API ni se hace nada lento.

    El aviso no trae los datos, solo la ruta del recurso. Tampoco viene
    firmado, así que no se cree nada por lo que diga: sirve de pista para ir
    a buscar el dato con nuestro token.
    """
    try:
        aviso = await peticion.json()
    except (ValueError, UnicodeDecodeError):
        return JSONResponse({"ok": True}, status_code=200)   # no pedir reintentos

    recurso = str(aviso.get("resource", ""))[:300]
    topico = str(aviso.get("topic", ""))[:60]
    if recurso and topico:
        with bd() as cx:
            cx.execute(
                "INSERT INTO ml_avisos (topico, recurso, ml_user_id, recibido) "
                "VALUES (?, ?, ?, ?)",
                (topico, recurso, str(aviso.get("user_id", ""))[:40], iso(ahora())),
            )
    return {"ok": True}


@app.get("/media/{nombre}")
def imagen(nombre: str):
    if not re.fullmatch(r"[a-zA-Z0-9_-]{1,80}\.(jpg|png|gif|webp)", nombre):
        raise HTTPException(status_code=404, detail="No existe")
    ruta = MEDIA / nombre
    if not ruta.is_file():
        raise HTTPException(status_code=404, detail="No existe")
    return FileResponse(
        ruta,
        media_type=TIPOS.get(ruta.suffix, "application/octet-stream"),
        headers={"Cache-Control": "public, max-age=604800"},
    )


# ─── Panel de administración (URL secreta) ────────────────────────────────
panel = APIRouter(prefix=PANEL)


@panel.get("")
def panel_sin_barra():
    # Con la barra final, el HTML puede pedir "api/..." de forma relativa.
    return RedirectResponse(PANEL + "/", status_code=307)


@panel.get("/")
def panel_html():
    return FileResponse(RAIZ / "panel.html", media_type="text/html; charset=utf-8")


@panel.get("/api/sesion")
def estado_sesion(peticion: Request):
    if not sesion_valida(peticion):
        return JSONResponse({"activa": False}, status_code=401)
    with bd() as cx:
        fila = cx.execute("SELECT usuario FROM admin WHERE id = 1").fetchone()
    return {"activa": True, "usuario": fila["usuario"] if fila else ""}


@panel.post("/api/entrar")
def entrar(datos: Credenciales, peticion: Request, respuesta: Response):
    ip = ip_de(peticion)
    with bd() as cx:
        espera = bloqueado(cx, ip)
        if espera:
            raise HTTPException(
                status_code=429,
                detail=f"Demasiados intentos. Vuelve a probar en {espera // 60 + 1} minutos.",
            )
        fila = cx.execute("SELECT usuario, salt, clave_hash FROM admin WHERE id = 1").fetchone()
        usuario_ok = fila is not None and compare_digest(datos.usuario.strip(), fila["usuario"])
        clave_ok = fila is not None and clave_correcta(datos.clave, fila["salt"], fila["clave_hash"])

        if not (usuario_ok and clave_ok):
            anotar_fallo(cx, ip)
            raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

        cx.execute("DELETE FROM intentos WHERE ip = ?", (ip,))
        token = secrets.token_urlsafe(32)
        creada = ahora()
        cx.execute(
            "INSERT INTO sesiones (token, creada, expira, ip) VALUES (?, ?, ?, ?)",
            (token, iso(creada), iso(creada + timedelta(hours=HORAS_SESION)), ip),
        )

    respuesta.set_cookie(
        COOKIE,
        token,
        max_age=HORAS_SESION * 3600,
        httponly=True,
        secure=COOKIE_SEGURA,
        samesite="lax",
        path=PANEL,
    )
    return {"ok": True, "usuario": datos.usuario.strip()}


@panel.post("/api/salir")
def salir(peticion: Request, respuesta: Response):
    token = peticion.cookies.get(COOKIE, "")
    if token:
        with bd() as cx:
            cx.execute("DELETE FROM sesiones WHERE token = ?", (token,))
    respuesta.delete_cookie(COOKIE, path=PANEL)
    return {"ok": True}


@panel.post("/api/clave", dependencies=[Depends(exigir_sesion)])
def cambiar_clave(datos: CambioClave, peticion: Request):
    with bd() as cx:
        fila = cx.execute("SELECT salt, clave_hash FROM admin WHERE id = 1").fetchone()
        if not clave_correcta(datos.actual, fila["salt"], fila["clave_hash"]):
            raise HTTPException(status_code=401, detail="La contraseña actual no coincide")
        salt, clave_hash = hashear(datos.nueva)
        cx.execute(
            "UPDATE admin SET salt = ?, clave_hash = ?, actualizado = ? WHERE id = 1",
            (salt, clave_hash, iso(ahora())),
        )
        # Al cambiar la clave se cierran todas las sesiones, menos la actual.
        cx.execute("DELETE FROM sesiones WHERE token <> ?", (peticion.cookies.get(COOKIE, ""),))
    return {"ok": True}


@panel.get("/api/productos", dependencies=[Depends(exigir_sesion)])
def productos_admin():
    with bd() as cx:
        productos = leer_productos(cx, solo_visibles=False)
        categorias = leer_categorias(cx)
    for c in categorias:
        c["productos"] = sum(1 for p in productos if p["categoria"] == c["clave"])
    return {"categorias": categorias, "productos": productos}


@panel.post("/api/categorias", dependencies=[Depends(exigir_sesion)])
def crear_categoria(datos: CategoriaEntrada):
    nombre = datos.nombre.strip()
    if not nombre:
        raise HTTPException(status_code=400, detail="La categoría necesita un nombre")
    with bd() as cx:
        repetida = cx.execute(
            "SELECT 1 FROM categorias WHERE lower(nombre) = lower(?)", (nombre,)
        ).fetchone()
        if repetida:
            raise HTTPException(status_code=409, detail="Ya existe una categoría con ese nombre")
        siguiente = cx.execute("SELECT COALESCE(MAX(orden), -1) + 1 AS n FROM categorias").fetchone()
        clave = clave_libre(cx, nombre)
        cx.execute(
            "INSERT INTO categorias (clave, nombre, orden) VALUES (?, ?, ?)",
            (clave, nombre, datos.orden if datos.orden else siguiente["n"]),
        )
    return {"ok": True, "clave": clave}


@panel.put("/api/categorias/{clave}", dependencies=[Depends(exigir_sesion)])
def editar_categoria(clave: str, datos: CategoriaEntrada):
    nombre = datos.nombre.strip()
    if not nombre:
        raise HTTPException(status_code=400, detail="La categoría necesita un nombre")
    with bd() as cx:
        if not cx.execute("SELECT 1 FROM categorias WHERE clave = ?", (clave,)).fetchone():
            raise HTTPException(status_code=404, detail="Esa categoría ya no existe")
        repetida = cx.execute(
            "SELECT 1 FROM categorias WHERE lower(nombre) = lower(?) AND clave <> ?", (nombre, clave)
        ).fetchone()
        if repetida:
            raise HTTPException(status_code=409, detail="Ya existe otra categoría con ese nombre")
        cx.execute(
            "UPDATE categorias SET nombre = ?, orden = ? WHERE clave = ?",
            (nombre, datos.orden, clave),
        )
    return {"ok": True}


@panel.delete("/api/categorias/{clave}", dependencies=[Depends(exigir_sesion)])
def borrar_categoria(clave: str, peticion: Request):
    if peticion.headers.get("x-panel") != "1":
        raise HTTPException(status_code=403, detail="Petición no permitida")
    with bd() as cx:
        if not cx.execute("SELECT 1 FROM categorias WHERE clave = ?", (clave,)).fetchone():
            raise HTTPException(status_code=404, detail="Esa categoría ya no existe")
        usan = cx.execute(
            "SELECT COUNT(*) AS n FROM productos WHERE categoria = ?", (clave,)
        ).fetchone()["n"]
        if usan:
            raise HTTPException(
                status_code=409,
                detail=f"No se puede borrar: {usan} producto(s) están en esta categoría. "
                "Muévelos a otra categoría primero.",
            )
        if cx.execute("SELECT COUNT(*) AS n FROM categorias").fetchone()["n"] <= 1:
            raise HTTPException(status_code=409, detail="Debe quedar al menos una categoría")
        cx.execute("DELETE FROM categorias WHERE clave = ?", (clave,))
    return {"ok": True}


@panel.post("/api/productos", dependencies=[Depends(exigir_sesion)])
def crear_producto(datos: ProductoEntrada):
    momento = iso(ahora())
    columnas = columnas_de(datos.columnas)
    with bd() as cx:
        cursor = cx.execute(
            "INSERT INTO productos (nombre, descripcion, categoria, etiqueta, imagen, "
            "colores, columnas, notas, visible, orden, creado, actualizado) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                datos.nombre.strip(),
                datos.descripcion.strip(),
                categoria_valida(cx, datos.categoria),
                datos.etiqueta.strip(),
                datos.imagen.strip(),
                json.dumps([c.model_dump() for c in datos.colores], ensure_ascii=False),
                json.dumps(columnas, ensure_ascii=False),
                datos.notas.strip(),
                1 if datos.visible else 0,
                datos.orden,
                momento,
                momento,
            ),
        )
        nuevo = cursor.lastrowid
        guardar_variantes(cx, nuevo, datos.variantes, len(columnas) - 1)
    return {"ok": True, "id": nuevo}


@panel.put("/api/productos/{producto_id}", dependencies=[Depends(exigir_sesion)])
def editar_producto(producto_id: int, datos: ProductoEntrada):
    columnas = columnas_de(datos.columnas)
    with bd() as cx:
        if not cx.execute("SELECT 1 FROM productos WHERE id = ?", (producto_id,)).fetchone():
            raise HTTPException(status_code=404, detail="Ese producto ya no existe")
        cx.execute(
            "UPDATE productos SET nombre = ?, descripcion = ?, categoria = ?, etiqueta = ?, "
            "imagen = ?, colores = ?, columnas = ?, notas = ?, visible = ?, orden = ?, "
            "actualizado = ? WHERE id = ?",
            (
                datos.nombre.strip(),
                datos.descripcion.strip(),
                categoria_valida(cx, datos.categoria),
                datos.etiqueta.strip(),
                datos.imagen.strip(),
                json.dumps([c.model_dump() for c in datos.colores], ensure_ascii=False),
                json.dumps(columnas, ensure_ascii=False),
                datos.notas.strip(),
                1 if datos.visible else 0,
                datos.orden,
                iso(ahora()),
                producto_id,
            ),
        )
        guardar_variantes(cx, producto_id, datos.variantes, len(columnas) - 1)
    return {"ok": True}


@panel.delete("/api/productos/{producto_id}", dependencies=[Depends(exigir_sesion)])
def borrar_producto(producto_id: int, peticion: Request):
    if peticion.headers.get("x-panel") != "1":
        raise HTTPException(status_code=403, detail="Petición no permitida")
    with bd() as cx:
        cx.execute("DELETE FROM productos WHERE id = ?", (producto_id,))
    return {"ok": True}


@panel.post("/api/variantes/{variante_id}/stock", dependencies=[Depends(exigir_sesion)])
def ajustar_stock(variante_id: int, datos: AjusteStock):
    with bd() as cx:
        fila = cx.execute(
            "SELECT v.stock, v.tamano, p.nombre FROM variantes v "
            "JOIN productos p ON p.id = v.producto_id WHERE v.id = ?",
            (variante_id,),
        ).fetchone()
        if not fila:
            raise HTTPException(status_code=404, detail="Ese tamaño ya no existe")
        resultante = max(fila["stock"] + datos.cambio, 0)
        cx.execute("UPDATE variantes SET stock = ? WHERE id = ?", (resultante, variante_id))
        cx.execute(
            "INSERT INTO movimientos (producto, tamano, cambio, resultante, motivo, fecha) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (
                fila["nombre"],
                fila["tamano"],
                resultante - fila["stock"],
                resultante,
                datos.motivo.strip(),
                iso(ahora()),
            ),
        )
    return {"ok": True, "stock": resultante}


@panel.get("/api/movimientos", dependencies=[Depends(exigir_sesion)])
def movimientos():
    with bd() as cx:
        filas = cx.execute("SELECT * FROM movimientos ORDER BY id DESC LIMIT 100").fetchall()
    return {"movimientos": [dict(f) for f in filas]}


@panel.get("/api/cotizaciones", dependencies=[Depends(exigir_sesion)])
def listar_cotizaciones():
    with bd() as cx:
        filas = cx.execute(
            "SELECT * FROM cotizaciones ORDER BY id DESC LIMIT 200"
        ).fetchall()
    salida = []
    for f in filas:
        d = dict(f)
        try:
            d["productos"] = json.loads(d["productos"])
        except (ValueError, TypeError):
            d["productos"] = []
        salida.append(d)
    return {"cotizaciones": salida}


@panel.post("/api/cotizaciones/{cotizacion_id}/estado", dependencies=[Depends(exigir_sesion)])
def marcar_cotizacion(cotizacion_id: int, datos: EstadoCotizacion):
    with bd() as cx:
        if not cx.execute(
            "SELECT 1 FROM cotizaciones WHERE id = ?", (cotizacion_id,)
        ).fetchone():
            raise HTTPException(404, "Esa cotización ya no existe")
        cx.execute(
            "UPDATE cotizaciones SET estado = ? WHERE id = ?", (datos.estado, cotizacion_id)
        )
    return {"ok": True}


@panel.delete("/api/cotizaciones/{cotizacion_id}", dependencies=[Depends(exigir_sesion)])
def borrar_cotizacion(cotizacion_id: int, peticion: Request):
    if peticion.headers.get("x-panel") != "1":
        raise HTTPException(status_code=403, detail="Petición no permitida")
    with bd() as cx:
        if not cx.execute(
            "SELECT 1 FROM cotizaciones WHERE id = ?", (cotizacion_id,)
        ).fetchone():
            raise HTTPException(404, "Esa cotización ya no existe")
        cx.execute("DELETE FROM cotizaciones WHERE id = ?", (cotizacion_id,))
    return {"ok": True}


@panel.get("/api/ml/cuentas", dependencies=[Depends(exigir_sesion)])
def ml_listar_cuentas():
    with bd() as cx:
        filas = cx.execute(
            "SELECT id, ml_user_id, apodo, sitio, expira, activa, es_prueba, error, creada "
            "FROM ml_cuentas ORDER BY id"
        ).fetchall()
        pendientes = cx.execute(
            "SELECT COUNT(*) AS n FROM ml_avisos WHERE procesado = ''").fetchone()["n"]
    return {
        "configurada": ml.configurado(),
        "redireccion": ml.REDIRECCION,
        "sitio": ml.SITIO,
        "avisos_pendientes": pendientes,
        "cuentas": [dict(f) for f in filas],
    }


@panel.post("/api/ml/conectar", dependencies=[Depends(exigir_sesion)])
def ml_conectar():
    """Devuelve el enlace al que hay que mandar al vendedor para autorizar."""
    if not ml.configurado():
        raise HTTPException(400, "Faltan ML_APP_ID y ML_SECRET en el .env del servidor")
    return {"url": ml.url_de_autorizacion(ml.nuevo_estado(bd))}


@panel.delete("/api/ml/cuentas/{cuenta_id}", dependencies=[Depends(exigir_sesion)])
def ml_desconectar(cuenta_id: int, peticion: Request):
    if peticion.headers.get("x-panel") != "1":
        raise HTTPException(status_code=403, detail="Petición no permitida")
    with bd() as cx:
        if not cx.execute("SELECT 1 FROM ml_cuentas WHERE id = ?", (cuenta_id,)).fetchone():
            raise HTTPException(404, "Esa cuenta ya no está vinculada")
        cx.execute("DELETE FROM ml_cuentas WHERE id = ?", (cuenta_id,))
    return {"ok": True}


@panel.get("/api/ml/cuentas/{cuenta_id}/prueba", dependencies=[Depends(exigir_sesion)])
def ml_probar(cuenta_id: int):
    """Comprobación de que el vínculo funciona de verdad: pregunta quién es."""
    try:
        quien = ml.llamar(bd, cuenta_id, "/users/me")
    except ml.ErrorML as fallo:
        raise HTTPException(502, str(fallo)) from fallo
    return {
        "ok": True,
        "id": quien.get("id"),
        "apodo": quien.get("nickname"),
        "nombre": " ".join(x for x in (quien.get("first_name"), quien.get("last_name")) if x),
        "sitio": quien.get("site_id"),
        "tipo": quien.get("user_type"),
        "reputacion": (quien.get("seller_reputation") or {}).get("level_id"),
    }


@panel.post("/api/imagenes", dependencies=[Depends(exigir_sesion)])
async def subir_imagen(peticion: Request, archivo: UploadFile = File(...)):
    if peticion.headers.get("x-panel") != "1":
        raise HTTPException(status_code=403, detail="Petición no permitida")

    contenido = await archivo.read(MAX_IMAGEN + 1)
    if len(contenido) > MAX_IMAGEN:
        raise HTTPException(status_code=413, detail="La imagen supera los 6 MB")
    if not contenido:
        raise HTTPException(status_code=400, detail="El archivo llegó vacío")

    extension = None
    for firma, ext, _ in FIRMAS:
        if contenido.startswith(firma):
            extension = ext
            break
    if extension is None and contenido[:4] == b"RIFF" and contenido[8:12] == b"WEBP":
        extension = ".webp"
    if extension is None:
        raise HTTPException(status_code=400, detail="Solo se aceptan JPG, PNG, GIF o WEBP")

    nombre = secrets.token_hex(12) + extension
    (MEDIA / nombre).write_bytes(contenido)
    return {"ok": True, "url": f"/media/{nombre}"}


app.include_router(panel)


@app.get("/robots.txt", response_class=PlainTextResponse)
def robots():
    return "User-agent: *\nDisallow: /media/\n"
