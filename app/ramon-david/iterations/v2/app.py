import argparse
import csv
import io
import json
import os
import re
import secrets
import threading
import unicodedata
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

from flask import (
    Flask,
    Response,
    abort,
    jsonify,
    redirect,
    render_template,
    request,
    send_from_directory,
    session,
    url_for,
)
from werkzeug.security import check_password_hash

PROJECT_ROOT = Path(__file__).resolve().parent
DATA_DIR = PROJECT_ROOT / "data"
PRODUCTS_FILE = DATA_DIR / "products.json"
USERS_FILE = DATA_DIR / "users.json"
STOCK_FILE = DATA_DIR / "stock.json"
MOVEMENTS_FILE = DATA_DIR / "stock_movimientos.json"
UPLOADS_DIR = PROJECT_ROOT / "uploads"
LOCK = threading.Lock()

ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024
UPLOAD_FILENAME_RE = re.compile(r"^[0-9a-f]{32}\.(?:png|jpg|jpeg|webp|gif)$")
LOW_STOCK = 5

app = Flask(
    __name__,
    static_folder=str(PROJECT_ROOT),
    static_url_path="",
    template_folder=str(PROJECT_ROOT / "templates"),
)
app.secret_key = os.environ.get("FLASK_SECRET_KEY") or secrets.token_hex(32)
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = os.environ.get("FLASK_ENV") == "production"
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_BYTES
app.permanent_session_lifetime = timedelta(hours=8)


@app.errorhandler(413)
def handle_upload_too_large(_e):
    return jsonify({"error": "La imagen supera el tamaño máximo permitido (5 MB)."}), 413


def atomic_write(path: Path, payload):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    tmp.replace(path)


def load_json(path: Path, default):
    if not path.exists():
        return default
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_products():
    data = load_json(PRODUCTS_FILE, {})
    return data if isinstance(data, dict) else {}


def save_products(products):
    atomic_write(PRODUCTS_FILE, products)


def load_users():
    data = load_json(USERS_FILE, {})
    return data if isinstance(data, dict) else {}


def load_stock():
    data = load_json(STOCK_FILE, {})
    return data if isinstance(data, dict) else {}


def save_stock(stock):
    atomic_write(STOCK_FILE, stock)


def load_movements():
    data = load_json(MOVEMENTS_FILE, [])
    return data if isinstance(data, list) else []


def save_movements(items):
    atomic_write(MOVEMENTS_FILE, items)


def slugify(text):
    text = unicodedata.normalize("NFKD", text or "").encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text or "item"


def new_product_id(title, existing):
    base = slugify(title)
    pid, i = base, 2
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
    return {
        "order": order if isinstance(order, (int, float)) else 0,
        "category": as_str(payload.get("category"), "Sin categoría"),
        "title": as_str(payload.get("title"), "Nuevo producto"),
        "description": as_str(payload.get("description")),
        "imagen": as_str(payload.get("imagen")),
        "colors": as_str_list(payload.get("colors")),
        "notes": as_str_list(payload.get("notes")),
        "tables": as_tables(payload.get("tables")),
    }


def product_sizes(product):
    tables = product.get("tables") or []
    for table in tables:
        title = (table.get("title") or "").lower()
        if "precio" in title or "valor" in title:
            sizes = [str(row[0]).strip() for row in (table.get("rows") or []) if row and str(row[0]).strip()]
            if sizes:
                return sizes
    for table in tables:
        sizes = [str(row[0]).strip() for row in (table.get("rows") or []) if row and str(row[0]).strip()]
        if sizes:
            return sizes
    return ["base"]


def stock_key(pid, size):
    return f"{pid}|{size}"


def ensure_stock_keys(products=None, stock=None):
    products = products if products is not None else load_products()
    stock = stock if stock is not None else load_stock()
    changed = False
    for pid, product in products.items():
        for size in product_sizes(product):
            key = stock_key(pid, size)
            if key not in stock:
                stock[key] = 0
                changed = True
    if changed:
        save_stock(stock)
    return stock


def delete_upload_file(url):
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


def current_user():
    return session.get("user")


def current_role():
    return session.get("role")


def wants_json():
    return request.path.startswith("/portal/api") or request.path.startswith("/admin/api") or request.accept_mimetypes.best == "application/json" and request.path.startswith("/api")


def require_role(*roles):
    role = current_role()
    if role in roles:
        return None
    if wants_json() or request.path.startswith("/portal/api") or request.path.startswith("/admin/api"):
        return jsonify({"error": "No autorizado"}), 403 if current_user() else 401
    if "admin" in roles and "user" not in roles:
        return redirect(url_for("admin_login", next=request.path))
    return redirect(url_for("portal_login", next=request.path))


def products_list(products=None):
    products = products if products is not None else load_products()
    items = [dict(id=pid, **data) for pid, data in products.items()]
    items.sort(key=lambda p: (p.get("category", ""), p.get("order", 0), p.get("title", "")))
    return items


def categories_from(products=None):
    counts = {}
    for item in products_list(products):
        cat = item.get("category") or "Sin categoría"
        counts.setdefault(cat, {"name": cat, "slug": slugify(cat), "count": 0})
        counts[cat]["count"] += 1
    return sorted(counts.values(), key=lambda c: c["name"])


# --- Público ----------------------------------------------------------------

@app.get("/")
def home():
    return send_from_directory(PROJECT_ROOT, "index.html")


@app.get("/api/products")
def api_products_public():
    return jsonify({"products": products_list()})


@app.get("/data/<path:_ignored>")
def block_data_dir(_ignored):
    abort(404)


@app.get("/templates/<path:_ignored>")
def block_templates(_ignored):
    abort(404)


# --- Auth -------------------------------------------------------------------

def render_login(portal, error=None, next_url=None):
    session["csrf_token"] = session.get("csrf_token") or secrets.token_hex(16)
    default_next = "/admin" if portal == "admin" else "/portal"
    return render_template(
        "login.html",
        portal=portal,
        error=error,
        csrf_token=session["csrf_token"],
        next_url=next_url or default_next,
        action=url_for("admin_login") if portal == "admin" else url_for("portal_login"),
    )


def attempt_login(expected_role, default_next):
    next_url = request.form.get("next") or default_next
    if not next_url.startswith("/"):
        next_url = default_next
    token = session.get("csrf_token") or ""
    submitted = request.form.get("csrf_token") or ""
    username = (request.form.get("username") or "").strip()
    password = request.form.get("password") or ""
    users = load_users()
    record = users.get(username) if isinstance(users.get(username), dict) else None
    valid = (
        bool(token)
        and secrets.compare_digest(submitted, token)
        and record is not None
        and record.get("role") == expected_role
        and check_password_hash(record.get("password_hash") or "", password)
    )
    if not valid:
        session["csrf_token"] = secrets.token_hex(16)
        return render_login(expected_role if expected_role == "admin" else "user", "Usuario o contraseña incorrectos.", next_url), 401
    session.clear()
    session.permanent = True
    session["user"] = username
    session["role"] = expected_role
    return redirect(next_url)


@app.route("/portal/login", methods=["GET", "POST"])
def portal_login():
    if request.method == "GET":
        if current_role() == "user":
            return redirect(request.args.get("next") or "/portal")
        return render_login("user", next_url=request.args.get("next"))
    return attempt_login("user", "/portal")


@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if request.method == "GET":
        if current_role() == "admin":
            return redirect(request.args.get("next") or "/admin")
        return render_login("admin", next_url=request.args.get("next"))
    return attempt_login("admin", "/admin")


@app.get("/portal/logout")
def portal_logout():
    session.clear()
    return redirect(url_for("portal_login"))


@app.get("/admin/logout")
def admin_logout():
    session.clear()
    return redirect(url_for("admin_login"))


# --- Portal usuario ---------------------------------------------------------

@app.get("/portal")
def portal_home():
    err = require_role("user")
    if err:
        return err
    with LOCK:
        products = load_products()
    return render_template(
        "portal_categories.html",
        user=current_user(),
        categories=categories_from(products),
    )


@app.get("/portal/c/<slug>")
def portal_category(slug):
    err = require_role("user")
    if err:
        return err
    with LOCK:
        products = load_products()
    cats = {c["slug"]: c for c in categories_from(products)}
    cat = cats.get(slug)
    if not cat:
        abort(404)
    items = [p for p in products_list(products) if slugify(p.get("category")) == slug]
    return render_template(
        "portal_products.html",
        user=current_user(),
        category=cat,
        products=items,
    )


@app.get("/portal/nuevo")
def portal_new_product():
    err = require_role("user")
    if err:
        return err
    preset = request.args.get("categoria") or ""
    return render_template(
        "portal_editor.html",
        user=current_user(),
        product={"id": "", "category": preset, "title": "", "description": "", "imagen": "", "order": 0, "colors": [], "notes": [], "tables": []},
        is_new=True,
    )


@app.get("/portal/p/<pid>")
def portal_edit_product(pid):
    err = require_role("user")
    if err:
        return err
    with LOCK:
        products = load_products()
        product = products.get(pid)
    if not product:
        abort(404)
    return render_template(
        "portal_editor.html",
        user=current_user(),
        product=dict(id=pid, **product),
        is_new=False,
    )


@app.get("/portal/api/products")
def portal_api_list():
    err = require_role("user", "admin")
    if err:
        return err
    return jsonify({"products": products_list()})


@app.post("/portal/api/products")
def portal_api_create():
    err = require_role("user")
    if err:
        return err
    product = sanitize_product(request.get_json(silent=True))
    with LOCK:
        products = load_products()
        pid = new_product_id(product["title"], products)
        products[pid] = product
        save_products(products)
        ensure_stock_keys(products)
    return jsonify(dict(id=pid, **product)), 201


@app.put("/portal/api/products/<pid>")
def portal_api_update(pid):
    err = require_role("user")
    if err:
        return err
    product = sanitize_product(request.get_json(silent=True))
    with LOCK:
        products = load_products()
        if pid not in products:
            return jsonify({"error": "Producto no encontrado"}), 404
        old_imagen = products[pid].get("imagen")
        products[pid] = product
        save_products(products)
        ensure_stock_keys(products)
    if old_imagen and old_imagen != product.get("imagen"):
        delete_upload_file(old_imagen)
    return jsonify(dict(id=pid, **product))


@app.delete("/portal/api/products/<pid>")
def portal_api_delete(pid):
    err = require_role("user")
    if err:
        return err
    with LOCK:
        products = load_products()
        if pid not in products:
            return jsonify({"error": "Producto no encontrado"}), 404
        removed = products.pop(pid)
        save_products(products)
        stock = load_stock()
        for key in [k for k in stock if k.startswith(f"{pid}|")]:
            stock.pop(key, None)
        save_stock(stock)
    delete_upload_file(removed.get("imagen"))
    return jsonify({"ok": True})


@app.post("/portal/api/uploads")
def portal_api_upload():
    err = require_role("user")
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


# --- Admin stock ------------------------------------------------------------

def stock_rows(products=None, stock=None, movements=None):
    products = products if products is not None else load_products()
    stock = ensure_stock_keys(products, stock if stock is not None else load_stock())
    movements = movements if movements is not None else load_movements()
    last = {}
    for mov in movements:
        last[stock_key(mov.get("product_id"), mov.get("size"))] = mov
    rows = []
    for pid, product in products.items():
        for size in product_sizes(product):
            key = stock_key(pid, size)
            qty = int(stock.get(key, 0) or 0)
            mov = last.get(key)
            rows.append({
                "key": key,
                "product_id": pid,
                "title": product.get("title") or pid,
                "category": product.get("category") or "",
                "size": size,
                "qty": qty,
                "low": qty <= LOW_STOCK,
                "last_at": (mov or {}).get("at"),
                "last_delta": (mov or {}).get("delta"),
                "last_motivo": (mov or {}).get("motivo"),
            })
    rows.sort(key=lambda r: (r["category"], r["title"], r["size"]))
    return rows


@app.get("/admin")
def admin_home():
    err = require_role("admin")
    if err:
        return err
    with LOCK:
        rows = stock_rows()
        cats = sorted({r["category"] for r in rows if r["category"]})
    return render_template(
        "admin_stock.html",
        user=current_user(),
        rows=rows,
        categories=cats,
        low_stock=LOW_STOCK,
    )


@app.get("/admin/reportes")
def admin_reportes():
    err = require_role("admin")
    if err:
        return err
    return render_template("admin_reportes.html", user=current_user())


@app.get("/admin/api/stock")
def admin_api_stock():
    err = require_role("admin")
    if err:
        return err
    with LOCK:
        rows = stock_rows()
    category = (request.args.get("categoria") or "").strip()
    product_q = (request.args.get("producto") or "").strip().lower()
    size = (request.args.get("talla") or "").strip()
    only_low = request.args.get("bajo") in {"1", "true", "si"}
    if category:
        rows = [r for r in rows if r["category"] == category]
    if product_q:
        rows = [r for r in rows if product_q in (r["title"] + r["product_id"]).lower()]
    if size:
        rows = [r for r in rows if r["size"] == size]
    if only_low:
        rows = [r for r in rows if r["low"]]
    return jsonify({"rows": rows, "low_stock": LOW_STOCK})


@app.post("/admin/api/stock")
def admin_api_move():
    err = require_role("admin")
    if err:
        return err
    body = request.get_json(silent=True) or {}
    pid = str(body.get("product_id") or "").strip()
    size = str(body.get("size") or "").strip() or "base"
    motivo = str(body.get("motivo") or "").strip()
    try:
        delta = int(body.get("delta"))
    except (TypeError, ValueError):
        return jsonify({"error": "delta debe ser un entero distinto de 0"}), 400
    if delta == 0:
        return jsonify({"error": "delta no puede ser 0"}), 400
    if not pid or not motivo:
        return jsonify({"error": "product_id y motivo son obligatorios"}), 400
    with LOCK:
        products = load_products()
        if pid not in products:
            return jsonify({"error": "Producto no encontrado"}), 404
        sizes = product_sizes(products[pid])
        if size not in sizes:
            return jsonify({"error": "Talla no válida para este producto", "sizes": sizes}), 400
        stock = ensure_stock_keys(products)
        key = stock_key(pid, size)
        current = int(stock.get(key, 0) or 0)
        if delta < 0 and current + delta < 0:
            return jsonify({"error": "Saldo insuficiente", "qty": current}), 400
        stock[key] = current + delta
        save_stock(stock)
        movements = load_movements()
        mov = {
            "id": uuid.uuid4().hex,
            "product_id": pid,
            "size": size,
            "delta": delta,
            "motivo": motivo,
            "at": datetime.now(timezone.utc).isoformat(),
            "actor": current_user(),
        }
        movements.append(mov)
        save_movements(movements)
    return jsonify({"ok": True, "qty": stock[key], "movement": mov})


@app.get("/admin/api/stock/reportes")
def admin_api_report():
    err = require_role("admin")
    if err:
        return err
    date_from = (request.args.get("desde") or "").strip()
    date_to = (request.args.get("hasta") or "").strip()
    as_csv = request.args.get("format") == "csv"
    with LOCK:
        rows = stock_rows()
        movements = load_movements()
    filtered = []
    for mov in movements:
        at = (mov.get("at") or "")[:10]
        if date_from and at < date_from:
            continue
        if date_to and at > date_to:
            continue
        filtered.append(mov)
    titles = {r["product_id"]: r["title"] for r in rows}
    if as_csv:
        buf = io.StringIO()
        writer = csv.writer(buf)
        writer.writerow(["tipo", "producto_id", "titulo", "talla", "unidades_o_delta", "motivo", "fecha", "actor"])
        for r in rows:
            writer.writerow(["stock", r["product_id"], r["title"], r["size"], r["qty"], "", r.get("last_at") or "", ""])
        for mov in filtered:
            writer.writerow([
                "movimiento",
                mov.get("product_id"),
                titles.get(mov.get("product_id"), ""),
                mov.get("size"),
                mov.get("delta"),
                mov.get("motivo"),
                mov.get("at"),
                mov.get("actor"),
            ])
        data = buf.getvalue()
        return Response(
            data,
            mimetype="text/csv; charset=utf-8",
            headers={"Content-Disposition": "attachment; filename=reporte-stock.csv"},
        )
    return jsonify({"stock": rows, "movimientos": filtered})


def main():
    parser = argparse.ArgumentParser(description="Acolchados CD v2 — portales y stock")
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=5003)
    args = parser.parse_args()
    with LOCK:
        ensure_stock_keys()
    print(f"Público:  http://127.0.0.1:{args.port}/")
    print(f"Portal:   http://127.0.0.1:{args.port}/portal  (user / usuario123)")
    print(f"Admin:    http://127.0.0.1:{args.port}/admin   (admin / cambiar123)")
    app.run(host=args.host, port=args.port, debug=False, use_reloader=False, threaded=True)


if __name__ == "__main__":
    main()
