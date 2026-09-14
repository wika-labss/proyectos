import argparse
import getpass
import json
import os
import re
import secrets
import threading
import unicodedata
import urllib.parse
import uuid
import webbrowser
from datetime import datetime, timedelta, timezone
from pathlib import Path

import mod_meli

from flask import Flask, abort, jsonify, redirect, render_template_string, request, send_from_directory, session, url_for
from werkzeug.security import check_password_hash, generate_password_hash

PROJECT_ROOT = Path(__file__).resolve().parent
DATA_DIR = PROJECT_ROOT / "data"
PRODUCTS_FILE = DATA_DIR / "products.json"
UPLOADS_DIR = PROJECT_ROOT / "uploads"
products_lock = threading.Lock()

ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024
UPLOAD_FILENAME_RE = re.compile(r"^[0-9a-f]{32}\.(?:png|jpg|jpeg|webp|gif)$")

def load_dotenv():
    path = PROJECT_ROOT / ".env"
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_dotenv()

app = Flask(__name__, static_folder=str(PROJECT_ROOT), static_url_path="")

# --- Acceso al panel de precios --------------------------------------------
# En producción define estas variables de entorno en el servidor en vez de
# depender de los valores de prueba de más abajo:
#   FLASK_SECRET_KEY    -> cadena aleatoria larga, debe mantenerse estable
#                          entre reinicios (si cambia, se cierran las sesiones)
#   ADMIN_USERNAME      -> usuario de acceso al panel
#   ADMIN_PASSWORD_HASH -> generado con:  python app.py --hash-password
#   FLASK_ENV=production -> hace que la cookie de sesión solo viaje por HTTPS
DEFAULT_ADMIN_USERNAME = "admin"
DEFAULT_ADMIN_PASSWORD = "cambiar123"

app.secret_key = os.environ.get("FLASK_SECRET_KEY") or secrets.token_hex(32)
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = os.environ.get("FLASK_ENV") == "production"
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_BYTES
app.permanent_session_lifetime = timedelta(hours=8)


@app.errorhandler(413)
def handle_upload_too_large(_e):
    return jsonify({"error": "La imagen supera el tamaño máximo permitido (5 MB)."}), 413

ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", DEFAULT_ADMIN_USERNAME)
ADMIN_PASSWORD_HASH = os.environ.get("ADMIN_PASSWORD_HASH")
if not ADMIN_PASSWORD_HASH:
    ADMIN_PASSWORD_HASH = generate_password_hash(DEFAULT_ADMIN_PASSWORD)
    print(
        "\n[aviso] No se definio ADMIN_PASSWORD_HASH: usando credenciales de prueba "
        f"(usuario: {DEFAULT_ADMIN_USERNAME} / contraseña: {DEFAULT_ADMIN_PASSWORD}).\n"
        "   Antes de publicar el sitio, genera tu propia contraseña con:\n"
        "     python app.py --hash-password\n"
        "   y define ADMIN_USERNAME, ADMIN_PASSWORD_HASH y FLASK_SECRET_KEY como\n"
        "   variables de entorno del servidor de producción.\n"
    )


def is_logged_in():
    return bool(session.get("admin_user"))


# --- Catálogo de productos (data/products.json) ----------------------------

def load_products():
    if not PRODUCTS_FILE.exists():
        return {}
    with open(PRODUCTS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_products(products):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    tmp_path = PRODUCTS_FILE.with_suffix(".json.tmp")
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    tmp_path.replace(PRODUCTS_FILE)


def slugify(text):
    text = unicodedata.normalize("NFKD", text or "").encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text or "producto"


def new_product_id(title, existing):
    base = slugify(title)
    pid = base
    i = 2
    while pid in existing:
        pid = f"{base}-{i}"
        i += 1
    return pid


def sanitize_product(payload):
    if not isinstance(payload, dict):
        payload = {}

    def as_str(v, default=""):
        return v if isinstance(v, str) else default

    def as_str_list(v):
        return [x for x in v if isinstance(x, str)] if isinstance(v, list) else []

    def as_tables(v):
        out = []
        if isinstance(v, list):
            for t in v:
                if not isinstance(t, dict):
                    continue
                headers = [h if isinstance(h, str) else "" for h in t.get("headers", [])] if isinstance(t.get("headers"), list) else []
                rows = []
                if isinstance(t.get("rows"), list):
                    for r in t["rows"]:
                        if isinstance(r, list):
                            rows.append([c if isinstance(c, str) else "" for c in r])
                out.append({"title": as_str(t.get("title")), "headers": headers, "rows": rows})
        return out

    order = payload.get("order")
    meli = payload.get("meli") if isinstance(payload.get("meli"), dict) else {}
    clean = {
        "order": order if isinstance(order, (int, float)) else 0,
        "category": as_str(payload.get("category"), "Sin categoría"),
        "title": as_str(payload.get("title"), "Nuevo producto"),
        "description": as_str(payload.get("description")),
        "imagen": as_str(payload.get("imagen")),
        "colors": as_str_list(payload.get("colors")),
        "notes": as_str_list(payload.get("notes")),
        "tables": as_tables(payload.get("tables")),
    }
    item_id = as_str(meli.get("item_id"))
    if item_id:
        clean["meli"] = {
            "item_id": item_id,
            "permalink": as_str(meli.get("permalink")),
            "status": as_str(meli.get("status")),
            "published_at": as_str(meli.get("published_at")),
        }
    return clean


def require_admin_json():
    if not is_logged_in():
        return jsonify({"error": "No autenticado"}), 401
    return None


def delete_upload_file(url):
    """Best-effort delete of a previously uploaded image. Only ever touches
    files matching our own generated <uuid-hex>.<ext> pattern inside
    UPLOADS_DIR, so a crafted `imagen` value can't be used to delete
    arbitrary files on the server."""
    if not isinstance(url, str) or not url.startswith("/uploads/"):
        return
    filename = url[len("/uploads/"):]
    if not UPLOAD_FILENAME_RE.match(filename):
        return
    path = (UPLOADS_DIR / filename).resolve()
    try:
        if path.is_file() and path.parent == UPLOADS_DIR.resolve():
            path.unlink()
    except OSError:
        pass


@app.post("/admin/api/uploads")
def api_upload_image():
    err = require_admin_json()
    if err:
        return err
    file = request.files.get("image")
    if not file or not file.filename:
        return jsonify({"error": "No se recibió ninguna imagen"}), 400
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        return jsonify({"error": "Formato no permitido. Usa JPG, PNG, WEBP o GIF."}), 400
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}.{ext}"
    file.save(UPLOADS_DIR / filename)
    return jsonify({"url": f"/uploads/{filename}"}), 201


@app.get("/api/products")
def api_products_list():
    products = load_products()
    items = [dict(id=pid, **data) for pid, data in products.items()]
    items.sort(key=lambda p: (p.get("category", ""), p.get("order", 0), p.get("title", "")))
    return jsonify({"products": items})


@app.post("/admin/api/products")
def api_products_create():
    err = require_admin_json()
    if err:
        return err
    product = sanitize_product(request.get_json(silent=True))
    with products_lock:
        products = load_products()
        pid = new_product_id(product["title"], products)
        products[pid] = product
        save_products(products)
    return jsonify(dict(id=pid, **product)), 201


@app.put("/admin/api/products/<pid>")
def api_products_update(pid):
    err = require_admin_json()
    if err:
        return err
    incoming = request.get_json(silent=True) or {}
    product = sanitize_product(incoming)
    with products_lock:
        products = load_products()
        if pid not in products:
            return jsonify({"error": "Producto no encontrado"}), 404
        if not product.get("meli") and products[pid].get("meli"):
            product["meli"] = products[pid]["meli"]
        old_imagen = products[pid].get("imagen")
        products[pid] = product
        save_products(products)
    if old_imagen and old_imagen != product.get("imagen"):
        delete_upload_file(old_imagen)
    return jsonify(dict(id=pid, **product))


@app.delete("/admin/api/products/<pid>")
def api_products_delete(pid):
    err = require_admin_json()
    if err:
        return err
    with products_lock:
        products = load_products()
        if pid not in products:
            return jsonify({"error": "Producto no encontrado"}), 404
        removed = products.pop(pid)
        save_products(products)
    delete_upload_file(removed.get("imagen"))
    return jsonify({"ok": True})


# Block direct static access to the data directory — it's only ever meant to
# be read through /api/products, not downloaded as a raw file.
@app.get("/data/<path:_ignored>")
def block_data_dir(_ignored):
    abort(404)


# --- Páginas del sitio -------------------------------------------------------

@app.get("/")
def home():
    return send_from_directory(PROJECT_ROOT, "index.html")


LOGIN_PAGE = """<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Acceso administrador | Acolchados CD</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/main.css">
<link rel="stylesheet" href="/css/componentes.css">
<style>
  .login-wrap{min-height:calc(100vh - 82px);display:flex;align-items:center;justify-content:center;padding:60px 24px;background:var(--paper)}
  .login-card{width:100%;max-width:400px}
  .login-card .eyebrow{margin-bottom:10px}
  .login-card h1{font-size:clamp(34px,5vw,44px);margin-bottom:10px}
  .login-card>p{color:var(--muted);margin-bottom:32px;font-size:14px}
  .login-form{display:grid;gap:20px;background:#fff;padding:36px 32px}
  .login-form label{font-size:11px;letter-spacing:1px;text-transform:uppercase}
  .login-form input{display:block;width:100%;border:0;border-bottom:1px solid var(--line);background:transparent;padding:12px 0;font:15px var(--sans);outline:0}
  .login-form input:focus{border-color:var(--teal)}
  .login-error{background:#fbe9e7;color:#a4361f;font-size:13px;padding:12px 14px;margin:0}
  .login-form button{justify-content:center;width:100%;border:0;cursor:pointer}
</style></head><body>
<header class="site-header"><a class="brand" href="/"><span class="brand-mark">CD</span><span class="brand-name">ACOLCHADOS <b>CD</b></span></a>
<nav class="main-nav"><a href="/">Inicio</a><a href="/nosotros.html">Nosotros</a><a href="/productos.html">Productos</a><a class="active" href="/admin">Precios</a></nav></header>
<main><div class="login-wrap"><div class="login-card">
<p class="eyebrow teal">Acceso restringido</p>
<h1>Panel de <em>precios</em></h1>
<p>Ingresa tus credenciales de administrador para editar el catálogo y los precios.</p>
{% if error %}<p class="login-error">{{ error }}</p>{% endif %}
<form class="login-form" method="post" action="{{ url_for('admin_login') }}">
<input type="hidden" name="csrf_token" value="{{ csrf_token }}">
<input type="hidden" name="next" value="{{ next_url }}">
<label for="username">Usuario<input id="username" name="username" required autofocus autocomplete="username"></label>
<label for="password">Contraseña<input id="password" name="password" type="password" required autocomplete="current-password"></label>
<button class="button button-dark" type="submit">Ingresar <span>→</span></button>
</form>
</div></div></main>
</body></html>"""


ADMIN_PAGE = """<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Panel de precios | Acolchados CD</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root{--ink:#17302c;--ink-soft:#5a6d67;--ink-faint:#8a9a94;--bg:#f6f2ea;--surface:#fff;--surface-2:#efe7d8;
    --teal:#148d94;--teal-dark:#0f6a6f;--teal-tint:#dcefec;--sand:#b98a4a;--sand-tint:#f1e3c8;
    --border:#e2d8c2;--border-soft:#ece3d1;--danger:#a8432d;--danger-tint:#f6e2db;
    --shadow:0 1px 2px rgba(23,48,44,.06),0 6px 20px -8px rgba(23,48,44,.18);--radius:14px}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:'DM Sans',sans-serif;font-size:14px}
  h1,h2,h3{font-family:'Fraunces',Georgia,serif;font-weight:600;margin:0}
  .mono{font-family:'JetBrains Mono',monospace;font-variant-numeric:tabular-nums}
  button,input,textarea,select{font-family:inherit;font-size:inherit;color:inherit}
  button{cursor:pointer}
  .topbar{display:flex;align-items:center;gap:16px;padding:14px 22px;background:var(--surface);border-bottom:1px solid var(--border)}
  .topbar h1{font-size:17px}
  .topbar-links{margin-left:auto;display:flex;gap:16px;align-items:center;font-size:12.5px}
  .topbar-links a{color:var(--ink-soft);text-decoration:none}
  .topbar-links a:hover{color:var(--teal)}
  .sync-pill{display:flex;align-items:center;gap:7px;padding:5px 11px;border-radius:999px;background:var(--surface-2);color:var(--ink-soft);font-size:12px;font-weight:500}
  .sync-dot{width:7px;height:7px;border-radius:50%;background:var(--ink-faint)}
  .sync-pill[data-state=saved] .sync-dot{background:var(--teal)}
  .sync-pill[data-state=saving] .sync-dot{background:var(--sand)}
  .sync-pill[data-state=error] .sync-dot{background:var(--danger)}
  .shell{display:flex;min-height:calc(100vh - 55px)}
  .sidebar{width:290px;flex-shrink:0;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column}
  .sidebar-top{padding:14px}
  .search-box input{width:100%;border:1px solid var(--border-soft);background:var(--surface-2);border-radius:8px;padding:8px 10px;outline:0}
  .search-box input:focus{border-color:var(--teal)}
  .nav-scroll{flex:1;overflow-y:auto;padding:0 10px 14px}
  .nav-group-label{font-size:10.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-faint);padding:10px 10px 4px}
  .nav-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;cursor:pointer;margin:1px 0}
  .nav-item:hover{background:var(--surface-2)}
  .nav-item.active{background:var(--teal-tint)}
  .nav-item.active .nav-item-title{color:var(--teal-dark)}
  .nav-item-title{font-size:13px;font-weight:500;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .nav-item-price{font-size:11px;color:var(--ink-faint);flex-shrink:0}
  .nav-item-del{opacity:0;flex-shrink:0;width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;color:var(--ink-faint);background:none;border:none}
  .nav-item:hover .nav-item-del{opacity:1}
  .nav-item-del:hover{background:var(--danger-tint);color:var(--danger)}
  .sidebar-bottom{padding:10px 14px 14px;border-top:1px solid var(--border-soft)}
  .btn{border:1px solid var(--border);background:var(--surface);color:var(--ink);border-radius:8px;padding:9px 13px;font-weight:600;font-size:13px;display:inline-flex;align-items:center;justify-content:center;gap:6px}
  .btn:hover{background:var(--surface-2)}
  .btn-primary{background:var(--teal);border-color:var(--teal);color:#fff}
  .btn-primary:hover{background:var(--teal-dark)}
  .btn-danger-outline{border-color:var(--danger);color:var(--danger);background:none}
  .btn-danger-outline:hover{background:var(--danger-tint)}
  .btn-block{width:100%}
  .btn-sm{padding:5px 9px;font-size:12px;border-radius:6px}
  .content{flex:1;overflow-y:auto}
  .content-inner{max-width:1100px;margin:0 auto;padding:26px 26px 80px}
  .empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:10px;height:70vh;color:var(--ink-soft);padding:40px}
  .empty-state h2{color:var(--ink);font-size:21px}
  .editor-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px}
  .crumb{font-size:12px;color:var(--ink-faint);font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px}
  .title-input{font-family:'Fraunces',serif;font-size:24px;font-weight:600;border:none;background:none;padding:2px 0;width:100%;outline:none;border-bottom:1px solid transparent}
  .title-input:hover,.title-input:focus{border-bottom-color:var(--border)}
  .layout-split{display:grid;grid-template-columns:1.3fr 1fr;gap:20px;align-items:start}
  .panel{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px 20px;box-shadow:var(--shadow);margin-bottom:16px}
  .panel h3{font-size:14px;margin-bottom:12px}
  .panel h3 .hint{font-family:'DM Sans',sans-serif;font-weight:400;color:var(--ink-faint);font-size:12px;margin-left:8px}
  .field{margin-bottom:13px}
  .field:last-child{margin-bottom:0}
  .field label{display:block;font-size:11px;font-weight:600;color:var(--ink-soft);margin-bottom:5px;text-transform:uppercase;letter-spacing:.03em}
  .field input,.field textarea{width:100%;border:1px solid var(--border);background:var(--bg);border-radius:8px;padding:8px 10px;outline:none}
  .field input:focus,.field textarea:focus{border-color:var(--teal)}
  .field textarea{resize:vertical;min-height:60px}
  .field-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .chip-list{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:9px}
  .chip{display:flex;align-items:center;gap:6px;background:var(--sand-tint);border:1px solid var(--border);border-radius:999px;padding:5px 6px 5px 12px;font-size:12.5px;font-weight:500}
  .chip button{width:18px;height:18px;border-radius:50%;border:none;background:rgba(0,0,0,.06);color:var(--ink-soft);font-size:12px}
  .chip button:hover{background:var(--danger);color:#fff}
  .add-inline{display:flex;gap:8px}
  .add-inline input{flex:1}
  .note-row{display:flex;gap:8px;align-items:center;margin-bottom:8px}
  .note-row input{flex:1}
  .icon-btn{width:28px;height:28px;border-radius:7px;border:1px solid var(--border);background:var(--surface);color:var(--ink-soft);flex-shrink:0}
  .icon-btn:hover{background:var(--danger-tint);color:var(--danger);border-color:var(--danger)}
  .table-block{border:1px solid var(--border-soft);border-radius:10px;padding:12px 12px 14px;margin-bottom:12px;background:var(--bg)}
  .table-block-head{display:flex;gap:10px;align-items:center;margin-bottom:10px}
  .table-title{flex:1;font-weight:600}
  .grid-row{display:grid;gap:6px;margin-bottom:6px;align-items:center}
  .grid-row input{width:100%;padding:6px 8px;border-radius:6px}
  .grid-row.header-row input{font-weight:700;font-size:12px;color:var(--teal-dark);background:var(--teal-tint);border-color:transparent}
  .row-del{width:24px;height:24px;border-radius:6px;border:none;background:none;color:var(--ink-faint)}
  .row-del:hover{background:var(--danger-tint);color:var(--danger)}
  .table-block-foot,.tables-foot{display:flex;gap:8px;margin-top:8px}
  .image-field{display:flex;gap:14px;align-items:flex-start}
  .image-thumb{width:120px;height:90px;border-radius:8px;object-fit:cover;background:var(--surface-2);flex-shrink:0;border:1px solid var(--border)}
  .image-placeholder{width:120px;height:90px;border-radius:8px;border:1.5px dashed var(--border);background:var(--bg);display:flex;align-items:center;justify-content:center;color:var(--ink-faint);font-size:11px;text-align:center;flex-shrink:0;padding:6px}
  .image-actions{display:flex;flex-direction:column;gap:8px;flex:1;min-width:0}
  .image-actions-row{display:flex;gap:8px;flex-wrap:wrap}
  .image-url-fallback{font-size:11.5px;color:var(--ink-faint)}
  .image-url-fallback input{margin-top:4px;font-size:12px}
  .field-note{font-size:11px;color:var(--ink-faint);margin:0}
  .preview-sticky{position:sticky;top:0}
  .preview-eyebrow{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-faint);margin-bottom:10px}
  .preview-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px 20px 18px;box-shadow:var(--shadow)}
  .preview-cat{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--sand);margin-bottom:6px}
  .preview-card h2{font-size:20px;margin-bottom:8px}
  .preview-desc{color:var(--ink-soft);font-size:13px;line-height:1.55;margin-bottom:12px}
  .preview-img{width:100%;border-radius:8px;margin-bottom:12px;display:block;background:var(--surface-2);max-height:180px;object-fit:cover}
  .preview-colors{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
  .swatch{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--ink-soft)}
  .swatch-dot{width:13px;height:13px;border-radius:50%;border:1px solid var(--border)}
  .preview-table{width:100%;border-collapse:collapse;margin-bottom:12px;font-size:12.5px}
  .preview-table caption{text-align:left;font-weight:600;font-size:12px;color:var(--teal-dark);padding-bottom:6px;caption-side:top}
  .preview-table th,.preview-table td{text-align:left;padding:6px 8px;border-bottom:1px solid var(--border-soft)}
  .preview-table th{color:var(--ink-soft);font-weight:600;font-size:11px;text-transform:uppercase}
  .preview-table td.price{font-family:'JetBrains Mono',monospace}
  .preview-notes{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:5px}
  .preview-notes li{font-size:12px;color:var(--ink-faint);padding-left:14px;position:relative}
  .preview-notes li::before{content:'—';position:absolute;left:0}
  .preview-empty{color:var(--ink-faint);font-size:12.5px;font-style:italic}
  .toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%) translateY(20px);background:var(--ink);color:var(--bg);padding:10px 18px;border-radius:999px;font-size:13px;font-weight:500;opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;z-index:50}
  .toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
  @media(max-width:980px){.layout-split{grid-template-columns:1fr}}
</style></head><body>
<header class="topbar">
  <h1>Panel de precios · Acolchados CD</h1>
  <div class="topbar-links">
    <a href="/admin/meli">Ventas Mercado Libre</a>
    <a href="/productos.html" target="_blank" rel="noreferrer">Ver catálogo público ↗</a>
    <a href="/admin/logout">Cerrar sesión</a>
  </div>
  <div class="sync-pill" id="syncPill" data-state="saved"><span class="sync-dot"></span><span id="syncLabel">Sincronizado</span></div>
</header>
<div class="shell">
  <aside class="sidebar">
    <div class="sidebar-top"><div class="search-box"><input type="text" id="searchInput" placeholder="Buscar producto…"></div></div>
    <nav class="nav-scroll" id="navScroll"></nav>
    <div class="sidebar-bottom"><button class="btn btn-primary btn-block" id="btnNewProduct">+ Nuevo producto</button></div>
  </aside>
  <main class="content"><div class="content-inner" id="contentInner"></div></main>
</div>
<div class="toast" id="toast"></div>
<script>
(function(){
  "use strict";
  var CATEGORY_ORDER = ["Sábanas","Plumones","Quilts","Cubre Plumón","Pieceras","Colchas","Protectores de colchón","Faldones y Almohadas","Toallas","Servicios"];
  var COLOR_HEX = {"blanco":"#ffffff","azul marino":"#1f2a4a","beige":"#e8dcc0","gris":"#9a978d","beige oscuro":"#b89a67","beige claro":"#e6d7ab","pistacho":"#adbb7e","negro":"#242322","café moro":"#5b4230","gris perla":"#a9adae"};

  var state = { products: {}, selected: null, draft: null, search: "", dirty: false, saveTimer: null };
  var $content = document.getElementById("contentInner");
  var $nav = document.getElementById("navScroll");
  var $syncPill = document.getElementById("syncPill");
  var $syncLabel = document.getElementById("syncLabel");
  var $toast = document.getElementById("toast");

  function clone(o){ return JSON.parse(JSON.stringify(o)); }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","'":"&#39;"}[c]; }); }
  function showToast(msg){ $toast.textContent = msg; $toast.classList.add("show"); clearTimeout($toast._t); $toast._t = setTimeout(function(){ $toast.classList.remove("show"); }, 1800); }
  function setSync(s, label){ $syncPill.setAttribute("data-state", s); $syncLabel.textContent = label; }

  function blankProduct(){
    return { order:50, category:"Sábanas", title:"Nuevo producto", description:"", imagen:"", colors:[], notes:[],
      tables:[{ title:"", headers:["Tamaño","Valor Neto"], rows:[["1 plaza","$ 0"]] }] };
  }

  function api(url, opts){
    opts = opts || {};
    opts.credentials = "same-origin";
    if (opts.body){ opts.headers = Object.assign({"Content-Type":"application/json"}, opts.headers||{}); }
    return fetch(url, opts).then(function(r){
      if (r.status === 401){ window.location.href = "/admin/login?next=/admin"; throw new Error("No autenticado"); }
      return r.json().then(function(data){ if (!r.ok) throw new Error(data.error||"Error"); return data; });
    });
  }

  function loadProducts(){
    return api("/api/products").then(function(data){
      var next = {};
      (data.products||[]).forEach(function(p){ var id=p.id; delete p.id; next[id]=p; });
      state.products = next;
      renderNav();
    });
  }

  function scheduleSave(){
    state.dirty = true;
    setSync("saving","Guardando…");
    clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(doSave, 550);
  }

  function doSave(){
    if (!state.selected) return;
    api("/admin/api/products/" + encodeURIComponent(state.selected), { method:"PUT", body: JSON.stringify(state.draft) })
      .then(function(data){
        var id = data.id; delete data.id;
        state.products[state.selected] = data;
        state.dirty = false;
        setSync("saved","Sincronizado");
        renderNav();
      })
      .catch(function(){ setSync("error","No se pudo guardar"); });
  }

  function priceRange(product){
    var vals = [];
    (product.tables||[]).forEach(function(t){ (t.rows||[]).forEach(function(r){
      var last = r[r.length-1]||""; var num = parseInt(String(last).replace(/[^0-9]/g,""),10);
      if (!isNaN(num)) vals.push(num);
    }); });
    if (!vals.length) return "";
    return "desde $" + Math.min.apply(null, vals).toLocaleString("es-CL");
  }

  function renderNav(){
    var q = state.search.trim().toLowerCase();
    var byCat = {};
    Object.keys(state.products).forEach(function(id){
      var p = state.products[id];
      if (q && !(p.title||"").toLowerCase().includes(q) && !(p.category||"").toLowerCase().includes(q)) return;
      var cat = p.category || "Sin categoría";
      (byCat[cat] = byCat[cat] || []).push([id, p]);
    });
    var cats = Object.keys(byCat).sort(function(a,b){
      var ia=CATEGORY_ORDER.indexOf(a), ib=CATEGORY_ORDER.indexOf(b);
      if (ia===-1) ia=999; if (ib===-1) ib=999;
      return ia!==ib ? ia-ib : a.localeCompare(b);
    });
    cats.forEach(function(c){ byCat[c].sort(function(a,b){ return (a[1].order||0)-(b[1].order||0) || a[1].title.localeCompare(b[1].title); }); });

    var html = "";
    cats.forEach(function(cat){
      html += '<div class="nav-group-label">'+esc(cat)+'</div>';
      byCat[cat].forEach(function(pair){
        var id=pair[0], p=pair[1];
        var active = state.selected===id;
        html += '<div class="nav-item'+(active?" active":"")+'" data-action="open" data-id="'+id+'">'+
          '<span class="nav-item-title">'+esc(p.title||"(sin título)")+'</span>'+
          '<span class="nav-item-price mono">'+esc(priceRange(p))+'</span>'+
          '<button class="nav-item-del" data-action="del" data-id="'+id+'" aria-label="Eliminar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button>'+
          '</div>';
      });
    });
    if (!cats.length){ html += '<div style="padding:14px 10px;color:var(--ink-faint);font-size:12.5px;">Sin resultados.</div>'; }
    $nav.innerHTML = html;
  }

  $nav.addEventListener("click", function(e){
    var del = e.target.closest('[data-action="del"]');
    if (del){ e.stopPropagation(); confirmDelete(del.getAttribute("data-id")); return; }
    var open = e.target.closest('[data-action="open"]');
    if (open){ openProduct(open.getAttribute("data-id")); }
  });
  document.getElementById("searchInput").addEventListener("input", function(e){ state.search = e.target.value; renderNav(); });

  document.getElementById("btnNewProduct").addEventListener("click", function(){
    setSync("saving","Creando…");
    api("/admin/api/products", { method:"POST", body: JSON.stringify(blankProduct()) })
      .then(function(data){
        var id = data.id; delete data.id;
        state.products[id] = data;
        openProduct(id);
        setSync("saved","Sincronizado");
        showToast("Producto creado");
      })
      .catch(function(){ setSync("error","No se pudo crear"); });
  });

  function openProduct(id){
    state.selected = id;
    state.draft = clone(state.products[id] || blankProduct());
    state.dirty = false;
    renderNav();
    renderEditor();
  }

  function confirmDelete(id){
    var p = state.products[id];
    if (!p || !confirm('Eliminar "'+p.title+'" del catálogo? Esta acción no se puede deshacer.')) return;
    api("/admin/api/products/"+encodeURIComponent(id), { method:"DELETE" }).then(function(){
      delete state.products[id];
      if (state.selected===id){ state.selected=null; state.draft=null; renderEditor(); }
      renderNav();
      showToast("Producto eliminado");
    }).catch(function(){ showToast("No se pudo eliminar"); });
  }

  function renderEditor(){
    if (!state.selected){
      $content.innerHTML = '<div class="empty-state"><h2>Selecciona un producto</h2><p>Elige un artículo del catálogo en la barra lateral para editar sus precios, medidas, colores y notas — o crea uno nuevo.</p></div>';
      return;
    }
    var p = state.draft;
    var html = '';
    html += '<div class="editor-header"><div style="flex:1;min-width:0;">';
    html += '<div class="crumb">'+esc(p.category||"Sin categoría")+'</div>';
    html += '<input type="text" class="title-input" data-field="title" value="'+esc(p.title)+'" placeholder="Nombre del producto"></div>';
    html += '<div><button class="btn btn-danger-outline" id="btnDeleteCurrent">Eliminar</button></div></div>';

    html += '<div class="layout-split"><div>';

    html += '<div class="panel"><h3>Imagen del producto <span class="hint">para que la carta no se vea vacía</span></h3>';
    html += '<div class="image-field">';
    html += p.imagen ? '<img class="image-thumb" src="'+esc(p.imagen)+'" alt="">' : '<div class="image-placeholder">Sin imagen</div>';
    html += '<div class="image-actions">';
    html += '<div class="image-actions-row"><button class="btn btn-sm" type="button" id="btnUploadImage">'+(p.imagen?'Reemplazar imagen':'Subir imagen')+'</button>';
    html += p.imagen ? '<button class="btn btn-sm btn-danger-outline" type="button" id="btnRemoveImage">Quitar</button>' : '';
    html += '</div><input type="file" id="imageFileInput" accept="image/png,image/jpeg,image/webp,image/gif" hidden>';
    html += '<p class="field-note">JPG, PNG, WEBP o GIF · máx. 5 MB</p>';
    html += '<label class="image-url-fallback">¿La imagen ya está publicada en otro sitio? Pega su URL<input type="text" data-field="imagen" value="'+esc(p.imagen)+'" placeholder="https://…"></label>';
    html += '</div></div></div>';

    html += '<div class="panel"><h3>General</h3>';
    html += '<div class="field-row"><div class="field"><label>Categoría</label><input type="text" list="catList" data-field="category" value="'+esc(p.category)+'"></div>';
    html += '<div class="field"><label>Orden en categoría</label><input type="number" data-field="order" value="'+esc(p.order||0)+'"></div></div>';
    html += '<div class="field"><label>Descripción</label><textarea data-field="description">'+esc(p.description)+'</textarea></div>';
    html += '</div>';

    html += '<div class="panel"><h3>Colores disponibles <span class="hint">opcional</span></h3>';
    html += '<div class="chip-list" id="colorChips">'+renderColorChips(p)+'</div>';
    html += '<div class="add-inline"><input type="text" id="newColorInput" placeholder="Nombre de color"><button class="btn" id="btnAddColor">Agregar</button></div></div>';

    html += '<div class="panel"><h3>Notas <span class="hint">opcional</span></h3>';
    html += '<div id="notesList">'+(p.notes||[]).map(function(n,i){
      return '<div class="note-row"><input type="text" data-note-i="'+i+'" value="'+esc(n)+'"><button class="icon-btn" data-action="rm-note" data-i="'+i+'"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button></div>';
    }).join("")+'</div><button class="btn btn-sm" id="btnAddNote">+ Nota</button></div>';

    html += '<div class="panel"><h3>Tablas de precios y medidas</h3>';
    html += '<div id="tablesWrap">'+(p.tables||[]).map(renderTableBlock).join("")+'</div>';
    html += '<div class="tables-foot"><button class="btn btn-sm" id="btnAddTable">+ Tabla</button></div></div>';

    html += '</div><div><div class="preview-sticky"><div class="preview-eyebrow">Vista previa</div><div class="preview-card" id="previewCard"></div></div></div></div>';
    html += '<datalist id="catList">'+CATEGORY_ORDER.map(function(c){ return '<option value="'+esc(c)+'">'; }).join("")+'</datalist>';

    $content.innerHTML = html;
    renderPreview();
    wireEditorEvents();
  }

  function renderColorChips(p){
    return (p.colors||[]).map(function(c,i){
      return '<span class="chip"><span class="swatch-dot" style="width:11px;height:11px;background:'+(COLOR_HEX[c.toLowerCase()]||"#ccc")+'"></span>'+esc(c)+'<button data-action="rm-color" data-i="'+i+'">×</button></span>';
    }).join("");
  }

  function renderTableBlock(t, ti){
    var headers = t.headers||[]; var cols = headers.length||1;
    var tmpl = "repeat("+cols+", minmax(90px,1fr)) 26px";
    var html = '<div class="table-block"><div class="table-block-head">';
    html += '<input type="text" class="table-title" data-table-title="'+ti+'" placeholder="Título de tabla (opcional)" value="'+esc(t.title||"")+'">';
    html += '<button class="icon-btn" data-action="rm-table" data-ti="'+ti+'"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button></div>';
    html += '<div class="grid-row header-row" style="grid-template-columns:'+tmpl+'">';
    headers.forEach(function(h,ci){ html += '<input type="text" data-header="'+ti+'.'+ci+'" value="'+esc(h)+'">'; });
    html += '<button class="row-del" data-action="rm-col" data-ti="'+ti+'">×</button></div>';
    (t.rows||[]).forEach(function(row,ri){
      html += '<div class="grid-row" style="grid-template-columns:'+tmpl+'">';
      for (var ci=0; ci<cols; ci++){ html += '<input type="text" class="mono" data-cell="'+ti+'.'+ri+'.'+ci+'" value="'+esc(row[ci]||"")+'">'; }
      html += '<button class="row-del" data-action="rm-row" data-ti="'+ti+'" data-ri="'+ri+'">×</button></div>';
    });
    html += '<div class="table-block-foot"><button class="btn btn-sm" data-action="add-row" data-ti="'+ti+'">+ Fila</button><button class="btn btn-sm" data-action="add-col" data-ti="'+ti+'">+ Columna</button></div></div>';
    return html;
  }

  function renderPreview(){
    var p = state.draft; var $pv = document.getElementById("previewCard");
    if (!$pv) return;
    var html = '<div class="preview-cat">'+esc(p.category||"")+'</div><h2>'+esc(p.title||"(sin título)")+'</h2>';
    if (p.imagen) html += '<img class="preview-img" src="'+esc(p.imagen)+'" alt="">';
    if (p.description) html += '<p class="preview-desc">'+esc(p.description)+'</p>';
    if ((p.colors||[]).length){
      html += '<div class="preview-colors">'+p.colors.map(function(c){ return '<span class="swatch"><span class="swatch-dot" style="background:'+(COLOR_HEX[c.toLowerCase()]||"#ccc")+'"></span>'+esc(c)+'</span>'; }).join("")+'</div>';
    }
    var tables = (p.tables||[]).filter(function(t){ return (t.rows||[]).length; });
    if (tables.length){
      tables.forEach(function(t){
        html += '<table class="preview-table">';
        if (t.title) html += '<caption>'+esc(t.title)+'</caption>';
        html += '<thead><tr>'+(t.headers||[]).map(function(h){ return '<th>'+esc(h)+'</th>'; }).join("")+'</tr></thead>';
        html += '<tbody>'+(t.rows||[]).map(function(r){ return '<tr>'+r.map(function(c,i){ return '<td'+(i===r.length-1?' class="price"':'')+'>'+esc(c)+'</td>'; }).join("")+'</tr>'; }).join("")+'</tbody></table>';
      });
    } else { html += '<p class="preview-empty">Sin tablas de precios.</p>'; }
    if ((p.notes||[]).length){ html += '<ul class="preview-notes">'+p.notes.map(function(n){ return '<li>'+esc(n)+'</li>'; }).join("")+'</ul>'; }
    $pv.innerHTML = html;
  }

  function wireEditorEvents(){
    var p = state.draft;
    $content.querySelectorAll("[data-field]").forEach(function(el){
      el.addEventListener("input", function(){
        var f = el.getAttribute("data-field");
        p[f] = el.type==="number" ? (Number(el.value)||0) : el.value;
        if (f==="category"||f==="title"){ document.querySelector(".crumb").textContent = p.category||"Sin categoría"; }
        renderPreview(); renderNav(); scheduleSave();
      });
    });
    var imgUrlInput = $content.querySelector('.image-url-fallback input[data-field="imagen"]');
    if (imgUrlInput) imgUrlInput.addEventListener("change", function(){ renderEditor(); });

    var btnUploadImage = document.getElementById("btnUploadImage");
    var imageFileInput = document.getElementById("imageFileInput");
    if (btnUploadImage && imageFileInput){
      btnUploadImage.addEventListener("click", function(){ imageFileInput.click(); });
      imageFileInput.addEventListener("change", function(e){
        var file = e.target.files[0];
        e.target.value = "";
        if (!file) return;
        if (file.size > 5*1024*1024){ showToast("La imagen supera 5 MB"); return; }
        var fd = new FormData();
        fd.append("image", file);
        setSync("saving","Subiendo imagen…");
        fetch("/admin/api/uploads", { method:"POST", credentials:"same-origin", body: fd })
          .then(function(r){
            if (r.status===401){ window.location.href="/admin/login?next=/admin"; throw new Error("no-auth"); }
            return r.json().then(function(d){ if (!r.ok) throw new Error(d.error||"Error"); return d; });
          })
          .then(function(data){
            p.imagen = data.url;
            renderEditor();
            setSync("saved","Sincronizado");
            scheduleSave();
          })
          .catch(function(err){ if (err.message!=="no-auth") setSync("error", err.message||"No se pudo subir la imagen"); });
      });
    }
    var btnRemoveImage = document.getElementById("btnRemoveImage");
    if (btnRemoveImage){
      btnRemoveImage.addEventListener("click", function(){
        p.imagen = "";
        renderEditor();
        scheduleSave();
      });
    }

    document.getElementById("btnAddColor").addEventListener("click", addColor);
    document.getElementById("newColorInput").addEventListener("keydown", function(e){ if (e.key==="Enter"){ e.preventDefault(); addColor(); } });
    function addColor(){
      var inp = document.getElementById("newColorInput"); var v = inp.value.trim();
      if (!v) return;
      p.colors = p.colors||[]; p.colors.push(v); inp.value="";
      document.getElementById("colorChips").innerHTML = renderColorChips(p);
      renderPreview(); scheduleSave();
    }
    document.getElementById("btnAddNote").addEventListener("click", function(){ p.notes=p.notes||[]; p.notes.push(""); renderEditor(); });
    document.getElementById("btnAddTable").addEventListener("click", function(){ p.tables=p.tables||[]; p.tables.push({title:"",headers:["Tamaño","Valor Neto"],rows:[["",""]]}); renderEditor(); scheduleSave(); });
    document.getElementById("btnDeleteCurrent").addEventListener("click", function(){ confirmDelete(state.selected); });

    $content.querySelectorAll("[data-note-i]").forEach(function(el){ el.addEventListener("input", function(){ p.notes[+el.getAttribute("data-note-i")] = el.value; renderPreview(); scheduleSave(); }); });
    $content.querySelectorAll("[data-header]").forEach(function(el){ el.addEventListener("input", function(){ var parts=el.getAttribute("data-header").split("."); p.tables[+parts[0]].headers[+parts[1]] = el.value; renderPreview(); scheduleSave(); }); });
    $content.querySelectorAll("[data-cell]").forEach(function(el){ el.addEventListener("input", function(){ var parts=el.getAttribute("data-cell").split("."); p.tables[+parts[0]].rows[+parts[1]][+parts[2]] = el.value; renderPreview(); scheduleSave(); }); });
    $content.querySelectorAll("[data-table-title]").forEach(function(el){ el.addEventListener("input", function(){ p.tables[+el.getAttribute("data-table-title")].title = el.value; renderPreview(); scheduleSave(); }); });

    $content.addEventListener("click", function(e){
      var btn;
      if ((btn=e.target.closest('[data-action="rm-color"]'))){ p.colors.splice(+btn.getAttribute("data-i"),1); renderEditor(); scheduleSave(); return; }
      if ((btn=e.target.closest('[data-action="rm-note"]'))){ p.notes.splice(+btn.getAttribute("data-i"),1); renderEditor(); scheduleSave(); return; }
      if ((btn=e.target.closest('[data-action="rm-table"]'))){ p.tables.splice(+btn.getAttribute("data-ti"),1); renderEditor(); scheduleSave(); return; }
      if ((btn=e.target.closest('[data-action="add-row"]'))){ var ti=+btn.getAttribute("data-ti"); var cols=(p.tables[ti].headers||[]).length||1; var row=[]; for(var i=0;i<cols;i++) row.push(""); p.tables[ti].rows.push(row); renderEditor(); scheduleSave(); return; }
      if ((btn=e.target.closest('[data-action="rm-row"]'))){ p.tables[+btn.getAttribute("data-ti")].rows.splice(+btn.getAttribute("data-ri"),1); renderEditor(); scheduleSave(); return; }
      if ((btn=e.target.closest('[data-action="add-col"]'))){ var ti3=+btn.getAttribute("data-ti"); p.tables[ti3].headers.push("Columna"); p.tables[ti3].rows.forEach(function(r){ r.push(""); }); renderEditor(); scheduleSave(); return; }
      if ((btn=e.target.closest('[data-action="rm-col"]'))){ var ti4=+btn.getAttribute("data-ti"); if (p.tables[ti4].headers.length<=1) return; p.tables[ti4].headers.pop(); p.tables[ti4].rows.forEach(function(r){ r.pop(); }); renderEditor(); scheduleSave(); return; }
    });
  }

  loadProducts().then(renderEditor);
})();
</script>
</body></html>"""


@app.get("/admin")
def admin_home():
    if not is_logged_in():
        return redirect(url_for("admin_login", next="/admin"))
    return ADMIN_PAGE


@app.get("/admin/meli")
def admin_meli():
    if not is_logged_in():
        return redirect(url_for("admin_login", next="/admin/meli"))
    return send_from_directory(PROJECT_ROOT, "admin_meli.html")


@app.get("/admin/meli/connect")
def admin_meli_connect():
    if not is_logged_in():
        return redirect(url_for("admin_login", next="/admin/meli"))
    if not mod_meli.configured():
        return (
            "Faltan MELI_CLIENT_ID y MELI_CLIENT_SECRET. Cópialos en iterations/v1/.env y reinicia Flask.",
            500,
            {"Content-Type": "text/plain; charset=utf-8"},
        )
    state = secrets.token_urlsafe(16)
    session["meli_oauth_state"] = state
    return redirect(mod_meli.authorization_url(state))


@app.get("/oauth/callback")
@app.get("/meli/callback")
def meli_oauth_callback():
    error = request.args.get("error")
    if error:
        return f"Mercado Libre denegó la autorización: {error}", 400
    code = request.args.get("code")
    expected = session.get("meli_oauth_state")
    state = request.args.get("state")
    if expected and state and state != expected:
        return "State OAuth inválido. Vuelve a conectar desde el panel.", 400
    if not code:
        return "Falta el parámetro code.", 400
    status, body = mod_meli.exchange_code(code)
    if status != 200:
        return jsonify(body), status
    return redirect("/admin/meli")


@app.post("/admin/api/meli/exchange")
def meli_exchange():
    err = require_admin_json()
    if err:
        return err
    payload = request.get_json(silent=True) or {}
    code = (payload.get("code") or "").strip()
    if "code=" in code:
        parsed = urllib.parse.urlparse(code if "://" in code else "https://local/?" + code)
        found = urllib.parse.parse_qs(parsed.query).get("code") or []
        if found:
            code = found[0]
    code = code.split("&")[0].strip()
    if not code:
        return jsonify({"error": "missing_code", "message": "Pega el code de la URL de callback."}), 400
    status, body = mod_meli.exchange_code(code)
    if status != 200:
        return jsonify(body), status
    return jsonify({"ok": True, "user_id": body.get("user_id")})


@app.get("/admin/api/meli/status")
def meli_status():
    err = require_admin_json()
    if err:
        return err
    return jsonify(mod_meli.public_status())


@app.get("/admin/api/meli/me")
def meli_me():
    err = require_admin_json()
    if err:
        return err
    if not mod_meli.access_token():
        return jsonify({"error": "not_connected"}), 400
    status, body = mod_meli.me()
    if status != 200:
        return jsonify(body), status
    return jsonify({"id": body.get("id"), "nickname": body.get("nickname")})


@app.post("/admin/api/meli/publish/<pid>")
def meli_publish(pid):
    err = require_admin_json()
    if err:
        return err
    with products_lock:
        products = load_products()
        product = products.get(pid)
        if not product:
            return jsonify({"error": "not_found", "message": "Producto no existe"}), 404
        try:
            status, body = mod_meli.publish_product(product, pid)
        except ValueError as exc:
            return jsonify({"error": "invalid_product", "message": str(exc)}), 400
        if status in (200, 201) and body.get("id"):
            product = dict(product)
            product["meli"] = {
                "item_id": body.get("id"),
                "permalink": body.get("permalink") or "",
                "status": body.get("status") or "",
                "published_at": datetime.now(timezone.utc).isoformat(),
            }
            products[pid] = sanitize_product(product)
            save_products(products)
            return jsonify(products[pid].get("meli") or {})
        return jsonify(body), status


@app.get("/admin/api/meli/orders")
def meli_orders():
    err = require_admin_json()
    if err:
        return err
    status, body = mod_meli.search_orders()
    return jsonify(body), (status if status != 200 else 200)


@app.route("/meli/notifications", methods=["GET", "POST"])
def meli_notifications():
    payload = request.get_json(silent=True) or dict(request.args)
    mod_meli.append_notification({"method": request.method, "payload": payload})
    return jsonify({"ok": True}), 200


@app.get("/admin/login")
def admin_login():
    if is_logged_in():
        return redirect(request.args.get("next") or "/admin")
    session["csrf_token"] = session.get("csrf_token") or secrets.token_hex(16)
    return render_template_string(
        LOGIN_PAGE,
        error=None,
        csrf_token=session["csrf_token"],
        next_url=request.args.get("next") or "/admin",
    )


@app.post("/admin/login")
def admin_login_submit():
    next_url = request.form.get("next") or "/admin"
    if not next_url.startswith("/"):
        next_url = "/admin"

    token = session.get("csrf_token")
    submitted_token = request.form.get("csrf_token") or ""
    username = request.form.get("username", "")
    password = request.form.get("password", "")

    valid = (
        bool(token)
        and secrets.compare_digest(submitted_token, token)
        and secrets.compare_digest(username, ADMIN_USERNAME)
        and check_password_hash(ADMIN_PASSWORD_HASH, password)
    )
    if not valid:
        session["csrf_token"] = secrets.token_hex(16)
        return (
            render_template_string(
                LOGIN_PAGE,
                error="Usuario o contraseña incorrectos.",
                csrf_token=session["csrf_token"],
                next_url=next_url,
            ),
            401,
        )

    session.clear()
    session.permanent = True
    session["admin_user"] = username
    return redirect(next_url)


@app.get("/admin/logout")
def admin_logout():
    session.clear()
    return redirect(url_for("admin_login"))


def hash_password_cli():
    password = getpass.getpass("Nueva contraseña de administrador: ")
    confirm = getpass.getpass("Confírmala: ")
    if not password or password != confirm:
        raise SystemExit("Las contraseñas no coinciden o están vacías.")
    print("\nADMIN_PASSWORD_HASH=" + generate_password_hash(password))
    print("Copia esa línea a las variables de entorno del servidor (junto a ADMIN_USERNAME y FLASK_SECRET_KEY).")


def main():
    parser = argparse.ArgumentParser(description="Servidor Flask local para Acolchados CD")
    parser.add_argument("--host", default="0.0.0.0", help="Interfaz donde escuchar")
    parser.add_argument("--port", type=int, default=5003, help="Puerto del servidor")
    parser.add_argument("--open", action="store_true", help="Abre el navegador local al iniciar")
    parser.add_argument("--hash-password", action="store_true", help="Genera un ADMIN_PASSWORD_HASH y termina, sin iniciar el servidor")
    args = parser.parse_args()

    if args.hash_password:
        hash_password_cli()
        return

    url = f"http://127.0.0.1:{args.port}/"
    print(f"Acolchados CD disponible en {url}")
    print(f"Admin / precios: {url}admin")
    print(f"Ventas Mercado Libre: {url}admin/meli")
    if args.open:
        threading.Timer(1.0, lambda: webbrowser.open(url)).start()
    app.run(host=args.host, port=args.port, debug=False, use_reloader=False, threaded=True)


if __name__ == "__main__":
    main()
