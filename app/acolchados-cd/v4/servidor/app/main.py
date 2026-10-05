"""Acolchados CD — catálogo público y panel de administración.

Dos mundos en un solo servicio:

  · /api/...        lo que ve cualquier visitante de la web
  · /<PANEL>/...    el panel privado, en una URL secreta y con usuario y clave

El stock y las notas internas nunca salen por la parte pública.
"""

import json
import os
import re
import secrets
import sqlite3
import unicodedata
from contextlib import asynccontextmanager, contextmanager
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from hashlib import pbkdf2_hmac
from hmac import compare_digest
from pathlib import Path
from time import time

from fastapi import APIRouter, Depends, FastAPI, File, HTTPException, Request, Response, UploadFile
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse, RedirectResponse
from pydantic import BaseModel, Field

from pdf_cotizacion import generar_pdf

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

CREATE INDEX IF NOT EXISTS ix_var_prod ON variantes(producto_id);
CREATE INDEX IF NOT EXISTS ix_mov_fecha ON movimientos(fecha DESC);

CREATE TABLE IF NOT EXISTS cotizaciones (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  numero       TEXT NOT NULL UNIQUE,
  fecha        TEXT NOT NULL,
  validez_dias INTEGER NOT NULL DEFAULT 15,
  solicitante  TEXT NOT NULL DEFAULT '',
  empresa      TEXT NOT NULL DEFAULT '',
  telefono     TEXT NOT NULL DEFAULT '',
  correo       TEXT NOT NULL DEFAULT '',
  nota         TEXT NOT NULL DEFAULT '',
  neto         INTEGER NOT NULL DEFAULT 0,
  iva          INTEGER NOT NULL DEFAULT 0,
  total        INTEGER NOT NULL DEFAULT 0,
  creado       TEXT NOT NULL,
  actualizado  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cotizacion_lineas (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  cotizacion_id  INTEGER NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
  producto_id    INTEGER,
  nombre         TEXT NOT NULL DEFAULT '',
  tamano         TEXT NOT NULL DEFAULT '',
  detalle        TEXT NOT NULL DEFAULT '',
  cantidad       INTEGER NOT NULL DEFAULT 1,
  precio         INTEGER NOT NULL DEFAULT 0,
  orden          INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS ix_cot_lineas ON cotizacion_lineas(cotizacion_id);
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
        # los que se agregan después del primero.
        tener = {f["name"] for f in cx.execute("PRAGMA table_info(productos)").fetchall()}
        if "columnas" not in tener:
            cx.execute(
                "ALTER TABLE productos ADD COLUMN columnas TEXT NOT NULL DEFAULT '[\"Medida\"]'"
            )
        tener_v = {
            f["name"] for f in cx.execute("PRAGMA table_info(variantes)").fetchall()
        }
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


NOTA_INICIAL = (
    "Valores netos por unidad, no incluyen IVA. "
    "Las medidas y colores especiales se cotizan aparte."
)


class LineaCotizacion(BaseModel):
    producto_id: int | None = None
    nombre: str = Field(default="", max_length=160)
    tamano: str = Field(default="", max_length=80)
    detalle: str = Field(default="", max_length=500)
    cantidad: int = Field(default=1, ge=1, le=100_000)
    precio: int = Field(default=0, ge=0, le=99_000_000)


class CotizacionEntrada(BaseModel):
    numero: str = Field(min_length=1, max_length=40)
    fecha: str = Field(min_length=8, max_length=10)
    validez_dias: int = Field(default=15, ge=1, le=365)
    solicitante: str = Field(default="", max_length=120)
    empresa: str = Field(default="", max_length=120)
    telefono: str = Field(default="", max_length=40)
    correo: str = Field(default="", max_length=200)
    nota: str = Field(default="", max_length=2000)
    neto: int = Field(default=0, ge=0, le=99_000_000)
    iva: int = Field(default=0, ge=0, le=99_000_000)
    total: int = Field(default=0, ge=0, le=99_000_000)
    lineas: list[LineaCotizacion] = []


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
    try:
        dato = json.loads(texto) if texto else vacio
    except (ValueError, TypeError):
        return list(vacio)
    return dato if isinstance(dato, list) else list(vacio)


def columnas_de(nombres: list[str]) -> list[str]:
    """Títulos de los textos entre tamaño y precio. El primero es la medida de siempre."""
    limpias = []
    for i, nombre in enumerate(nombres[:6]):
        nombre = " ".join(nombre.split())[:40]
        limpias.append(nombre or ("Medida" if i == 0 else "Campo"))
    return limpias or ["Medida"]


def guardar_variantes(cx, producto_id: int, variantes: list[Variante], n_extras: int):
    cx.execute("DELETE FROM variantes WHERE producto_id = ?", (producto_id,))
    for i, v in enumerate(variantes):
        extras = [" ".join(e.split())[:80] for e in v.extras][:n_extras]
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
    }


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
    with bd() as cx:
        columnas = columnas_de(datos.columnas)
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
    with bd() as cx:
        if not cx.execute("SELECT 1 FROM productos WHERE id = ?", (producto_id,)).fetchone():
            raise HTTPException(status_code=404, detail="Ese producto ya no existe")
        columnas = columnas_de(datos.columnas)
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


# ─── Cotizaciones formales ────────────────────────────────────────────────
def hoy_chile() -> str:
    return datetime.now(ZoneInfo("America/Santiago")).date().isoformat()


def numero_siguiente(cx) -> str:
    anio = datetime.now(ZoneInfo("America/Santiago")).year
    prefijo = f"COT-{anio}-"
    mayor = 0
    for fila in cx.execute(
        "SELECT numero FROM cotizaciones WHERE numero LIKE ?", (prefijo + "%",)
    ):
        cola = fila["numero"][len(prefijo):]
        if cola.isdigit():
            mayor = max(mayor, int(cola))
    return f"{prefijo}{mayor + 1:04d}"


def leer_cotizaciones(cx):
    filas = cx.execute(
        "SELECT id, numero, fecha, solicitante, empresa, total "
        "FROM cotizaciones ORDER BY id DESC"
    ).fetchall()
    return [dict(f) for f in filas]


def leer_cotizacion(cx, cotizacion_id: int):
    fila = cx.execute("SELECT * FROM cotizaciones WHERE id = ?", (cotizacion_id,)).fetchone()
    if not fila:
        return None
    lineas = cx.execute(
        "SELECT id, producto_id, nombre, tamano, detalle, cantidad, precio "
        "FROM cotizacion_lineas WHERE cotizacion_id = ? ORDER BY orden, id",
        (cotizacion_id,),
    ).fetchall()
    datos = dict(fila)
    datos["lineas"] = [dict(linea) for linea in lineas]
    return datos


def guardar_lineas(cx, cotizacion_id: int, lineas: list[LineaCotizacion]):
    cx.execute("DELETE FROM cotizacion_lineas WHERE cotizacion_id = ?", (cotizacion_id,))
    for orden, linea in enumerate(lineas):
        cx.execute(
            "INSERT INTO cotizacion_lineas "
            "(cotizacion_id, producto_id, nombre, tamano, detalle, cantidad, precio, orden) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                cotizacion_id,
                linea.producto_id,
                linea.nombre.strip(),
                linea.tamano.strip(),
                linea.detalle.strip(),
                linea.cantidad,
                linea.precio,
                orden,
            ),
        )


def validar_cotizacion(datos: CotizacionEntrada):
    if not datos.solicitante.strip():
        raise HTTPException(status_code=400, detail="El solicitante necesita un nombre")
    if not datos.lineas:
        raise HTTPException(status_code=400, detail="La cotización necesita al menos una línea")
    for linea in datos.lineas:
        if not linea.nombre.strip():
            raise HTTPException(status_code=400, detail="Cada línea necesita un producto")
    try:
        datetime.strptime(datos.fecha, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="La fecha debe ser AAAA-MM-DD")


def _valores_cotizacion(datos: CotizacionEntrada):
    return (
        datos.numero.strip(),
        datos.fecha,
        datos.validez_dias,
        datos.solicitante.strip(),
        datos.empresa.strip(),
        datos.telefono.strip(),
        datos.correo.strip(),
        datos.nota.strip(),
        datos.neto,
        datos.iva,
        datos.total,
    )


@panel.get("/api/cotizaciones", dependencies=[Depends(exigir_sesion)])
def lista_cotizaciones():
    with bd() as cx:
        return {"cotizaciones": leer_cotizaciones(cx)}


@panel.get("/api/cotizaciones/nueva", dependencies=[Depends(exigir_sesion)])
def borrador_cotizacion():
    with bd() as cx:
        numero = numero_siguiente(cx)
    return {
        "numero": numero,
        "fecha": hoy_chile(),
        "validez_dias": 15,
        "solicitante": "",
        "empresa": "",
        "telefono": "",
        "correo": "",
        "nota": NOTA_INICIAL,
        "neto": 0,
        "iva": 0,
        "total": 0,
        "lineas": [],
    }


@panel.get("/api/cotizaciones/{cotizacion_id}", dependencies=[Depends(exigir_sesion)])
def una_cotizacion(cotizacion_id: int):
    with bd() as cx:
        datos = leer_cotizacion(cx, cotizacion_id)
    if not datos:
        raise HTTPException(status_code=404, detail="Esa cotización ya no existe")
    return datos


@panel.post("/api/cotizaciones", dependencies=[Depends(exigir_sesion)])
def crear_cotizacion(datos: CotizacionEntrada):
    validar_cotizacion(datos)
    momento = iso(ahora())
    try:
        with bd() as cx:
            cursor = cx.execute(
                "INSERT INTO cotizaciones (numero, fecha, validez_dias, solicitante, empresa, "
                "telefono, correo, nota, neto, iva, total, creado, actualizado) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (*_valores_cotizacion(datos), momento, momento),
            )
            nuevo = cursor.lastrowid
            guardar_lineas(cx, nuevo, datos.lineas)
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="Ya existe una cotización con ese número")
    return {"ok": True, "id": nuevo}


@panel.put("/api/cotizaciones/{cotizacion_id}", dependencies=[Depends(exigir_sesion)])
def editar_cotizacion(cotizacion_id: int, datos: CotizacionEntrada):
    validar_cotizacion(datos)
    try:
        with bd() as cx:
            if not cx.execute("SELECT 1 FROM cotizaciones WHERE id = ?", (cotizacion_id,)).fetchone():
                raise HTTPException(status_code=404, detail="Esa cotización ya no existe")
            cx.execute(
                "UPDATE cotizaciones SET numero = ?, fecha = ?, validez_dias = ?, "
                "solicitante = ?, empresa = ?, telefono = ?, correo = ?, nota = ?, "
                "neto = ?, iva = ?, total = ?, actualizado = ? WHERE id = ?",
                (*_valores_cotizacion(datos), iso(ahora()), cotizacion_id),
            )
            guardar_lineas(cx, cotizacion_id, datos.lineas)
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="Ya existe una cotización con ese número")
    return {"ok": True}


@panel.delete("/api/cotizaciones/{cotizacion_id}", dependencies=[Depends(exigir_sesion)])
def borrar_cotizacion(cotizacion_id: int):
    with bd() as cx:
        cx.execute("DELETE FROM cotizaciones WHERE id = ?", (cotizacion_id,))
    return {"ok": True}


@panel.get("/api/cotizaciones/{cotizacion_id}/pdf", dependencies=[Depends(exigir_sesion)])
def pdf_de_cotizacion(cotizacion_id: int):
    with bd() as cx:
        datos = leer_cotizacion(cx, cotizacion_id)
    if not datos:
        raise HTTPException(status_code=404, detail="Esa cotización ya no existe")
    nombre = re.sub(r"[^A-Za-z0-9._-]+", "-", datos["numero"]).strip("-") or "cotizacion"
    return Response(
        content=generar_pdf(datos),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{nombre}.pdf"'},
    )


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
