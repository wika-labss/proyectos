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
CATEGORIES_FILE = DATA_DIR / "categories.json"
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


def load_categories():
    data = load_json(CATEGORIES_FILE, {})
    return data if isinstance(data, dict) else {}


def save_categories(cats):
    atomic_write(CATEGORIES_FILE, cats)


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


def new_id(title, existing):
    base = slugify(title)
    pid, i = base, 2
    while pid in existing:
        pid = f"{base}-{i}"
        i += 1
    return pid


def sanitize_product(payload, category_name=""):
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
        "category_id": as_str(payload.get("category_id")),
        "category": as_str(payload.get("category"), category_name or "Sin categoría"),
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


def sync_product_categories(products=None, cats=None):
    products = products if products is not None else load_products()
    cats = cats if cats is not None else load_categories()
    changed = False
    for product in products.values():
        cid = product.get("category_id")
        if cid and cid in cats:
            name = cats[cid]["name"]
            if product.get("category") != name:
                product["category"] = name
                changed = True
        elif not cid:
            match = next((k for k, v in cats.items() if v.get("name") == product.get("category")), slugify(product.get("category") or "sin-categoria"))
            if match not in cats:
                cats[match] = {"name": product.get("category") or "Sin categoría", "order": 999}
                save_categories(cats)
            product["category_id"] = match
            changed = True
    if changed:
        save_products(products)
    return products, cats


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


def is_admin():
    return session.get("role") == "admin"


def is_api():
    return request.path.startswith("/admin/api") or request.path.startswith("/portal/api")


def require_admin():
    if is_admin():
        return None
    if is_api():
        return jsonify({"error": "No autorizado"}), 401
    return redirect(url_for("admin_login", next=request.path))


def products_list(products=None):
    products = products if products is not None else load_products()
    items = [dict(id=pid, **data) for pid, data in products.items()]
    items.sort(key=lambda p: (p.get("category", ""), p.get("order", 0), p.get("title", "")))
    return items


def category_rows(products=None, cats=None):
    products = products if products is not None else load_products()
    cats = cats if cats is not None else load_categories()
    counts = {cid: 0 for cid in cats}
    for item in products_list(products):
        cid = item.get("category_id") or slugify(item.get("category") or "")
        counts[cid] = counts.get(cid, 0) + 1
    rows = []
    for cid, meta in cats.items():
        rows.append({
            "id": cid,
            "name": meta.get("name") or cid,
            "order": meta.get("order") or 0,
            "count": counts.get(cid, 0),
            "product_count": counts.get(cid, 0),
        })
    rows.sort(key=lambda c: (c["order"], c["name"]))
    return rows


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

def render_login(error=None, next_url=None):
    session["csrf_token"] = session.get("csrf_token") or secrets.token_hex(16)
    return render_template(
        "login.html",
        error=error,
        csrf_token=session["csrf_token"],
        next_url=next_url or "/admin",
        action=url_for("admin_login"),
    )


@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if request.method == "GET":
        if is_admin():
            return redirect(request.args.get("next") or "/admin")
        return render_login(next_url=request.args.get("next"))

    next_url = request.form.get("next") or "/admin"
    if not next_url.startswith("/"):
        next_url = "/admin"
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
        and record.get("role") == "admin"
        and check_password_hash(record.get("password_hash") or "", password)
    )
    if not valid:
        session["csrf_token"] = secrets.token_hex(16)
        return render_login("Usuario o contraseña incorrectos.", next_url), 401
    session.clear()
    session.permanent = True
    session["user"] = username
    session["role"] = "admin"
    return redirect(next_url)


@app.route("/admin/logout", methods=["GET", "POST"])
def admin_logout():
    session.clear()
    return redirect(url_for("admin_login"))


@app.get("/portal")
@app.get("/portal/login")
@app.get("/portal/<path:_rest>")
def portal_redirect(_rest=None):
    return redirect("/admin")


# --- Catálogo ---------------------------------------------------------------

@app.get("/admin")
def admin_home():
    err = require_admin()
    if err:
        return err
    with LOCK:
        products, cats = sync_product_categories()
        rows = category_rows(products, cats)
    return render_template("admin_categories.html", user=current_user(), nav="catalogo", categories=rows)


@app.get("/admin/c/<cid>")
def admin_category_products(cid):
    err = require_admin()
    if err:
        return err
    with LOCK:
        products, cats = sync_product_categories()
        cat = cats.get(cid)
        if not cat:
            abort(404)
        items = [p for p in products_list(products) if p.get("category_id") == cid]
        for item in items:
            item["size_count"] = len(product_sizes(item))
            price = ""
            for table in item.get("tables") or []:
                rows = table.get("rows") or []
                if rows and len(rows[0]) > 1:
                    price = rows[0][1]
                    break
            item["price_from"] = price
    return render_template(
        "admin_products.html",
        user=current_user(),
        nav="catalogo",
        category={"id": cid, **cat},
        products=items,
    )


@app.get("/admin/nuevo")
def admin_new_product():
    err = require_admin()
    if err:
        return err
    cid = request.args.get("categoria") or ""
    with LOCK:
        cats = load_categories()
    name = (cats.get(cid) or {}).get("name", "")
    return render_template(
        "admin_editor.html",
        user=current_user(),
        nav="catalogo",
        is_new=True,
        categories=category_rows(),
        product={"id": "", "category_id": cid, "category": name, "title": "", "description": "", "imagen": "", "order": 0, "colors": [], "notes": [], "tables": []},
    )


@app.get("/admin/p/<pid>")
def admin_edit_product(pid):
    err = require_admin()
    if err:
        return err
    with LOCK:
        products, _cats = sync_product_categories()
        product = products.get(pid)
        if not product:
            abort(404)
    return render_template(
        "admin_editor.html",
        user=current_user(),
        nav="catalogo",
        is_new=False,
        categories=category_rows(),
        product=dict(id=pid, **product),
    )


@app.get("/admin/api/categories")
def api_categories_list():
    err = require_admin()
    if err:
        return err
    with LOCK:
        products, cats = sync_product_categories()
        return jsonify({"categories": category_rows(products, cats)})


@app.post("/admin/api/categories")
def api_categories_create():
    err = require_admin()
    if err:
        return err
    body = request.get_json(silent=True) or {}
    name = str(body.get("name") or "").strip()
    if not name:
        return jsonify({"error": "El nombre es obligatorio"}), 400
    try:
        order = int(body.get("order") or 0)
    except (TypeError, ValueError):
        order = 0
    with LOCK:
        cats = load_categories()
        cid = new_id(name, cats)
        cats[cid] = {"name": name, "order": order}
        save_categories(cats)
    return jsonify({"id": cid, "name": name, "order": order}), 201


@app.put("/admin/api/categories/<cid>")
def api_categories_update(cid):
    err = require_admin()
    if err:
        return err
    body = request.get_json(silent=True) or {}
    name = str(body.get("name") or "").strip()
    if not name:
        return jsonify({"error": "El nombre es obligatorio"}), 400
    try:
        order = int(body.get("order") if body.get("order") is not None else 0)
    except (TypeError, ValueError):
        order = 0
    with LOCK:
        cats = load_categories()
        if cid not in cats:
            return jsonify({"error": "Categoría no encontrada"}), 404
        cats[cid] = {"name": name, "order": order}
        save_categories(cats)
        products = load_products()
        for product in products.values():
            if product.get("category_id") == cid:
                product["category"] = name
        save_products(products)
    return jsonify({"id": cid, "name": name, "order": order})


@app.delete("/admin/api/categories/<cid>")
def api_categories_delete(cid):
    err = require_admin()
    if err:
        return err
    with LOCK:
        cats = load_categories()
        if cid not in cats:
            return jsonify({"error": "Categoría no encontrada"}), 404
        products = load_products()
        used = any(p.get("category_id") == cid for p in products.values())
        if used:
            return jsonify({"error": "No se puede borrar: tiene productos. Muévelos o elíminalos antes."}), 400
        cats.pop(cid)
        save_categories(cats)
    return jsonify({"ok": True})


@app.post("/admin/api/products")
def api_products_create():
    err = require_admin()
    if err:
        return err
    body = request.get_json(silent=True) or {}
    with LOCK:
        cats = load_categories()
        cid = str(body.get("category_id") or "").strip()
        if cid not in cats:
            return jsonify({"error": "Categoría inválida"}), 400
        product = sanitize_product(body, cats[cid]["name"])
        product["category_id"] = cid
        product["category"] = cats[cid]["name"]
        products = load_products()
        pid = new_id(product["title"], products)
        products[pid] = product
        save_products(products)
        ensure_stock_keys(products)
    return jsonify(dict(id=pid, **product)), 201


@app.put("/admin/api/products/<pid>")
def api_products_update(pid):
    err = require_admin()
    if err:
        return err
    body = request.get_json(silent=True) or {}
    with LOCK:
        products = load_products()
        if pid not in products:
            return jsonify({"error": "Producto no encontrado"}), 404
        cats = load_categories()
        cid = str(body.get("category_id") or products[pid].get("category_id") or "").strip()
        if cid not in cats:
            return jsonify({"error": "Categoría inválida"}), 400
        product = sanitize_product(body, cats[cid]["name"])
        product["category_id"] = cid
        product["category"] = cats[cid]["name"]
        old_imagen = products[pid].get("imagen")
        products[pid] = product
        save_products(products)
        ensure_stock_keys(products)
    if old_imagen and old_imagen != product.get("imagen"):
        delete_upload_file(old_imagen)
    return jsonify(dict(id=pid, **product))


@app.delete("/admin/api/products/<pid>")
def api_products_delete(pid):
    err = require_admin()
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


@app.post("/admin/api/uploads")
def api_upload():
    err = require_admin()
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


# --- Stock ------------------------------------------------------------------

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


@app.get("/admin/stock")
def admin_stock():
    err = require_admin()
    if err:
        return err
    with LOCK:
        rows = stock_rows()
        cats = sorted({r["category"] for r in rows if r["category"]})
    return render_template(
        "admin_stock.html",
        user=current_user(),
        nav="stock",
        rows=rows,
        categories=cats,
        low_stock=LOW_STOCK,
    )


@app.get("/admin/reportes")
def admin_reportes():
    err = require_admin()
    if err:
        return err
    return render_template("admin_reportes.html", user=current_user(), nav="reportes")


@app.get("/admin/api/stock")
def admin_api_stock():
    err = require_admin()
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
    err = require_admin()
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
    err = require_admin()
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
        return Response(
            buf.getvalue(),
            mimetype="text/csv; charset=utf-8",
            headers={"Content-Disposition": "attachment; filename=reporte-stock.csv"},
        )
    return jsonify({"stock": rows, "movimientos": filtered})


def main():
    parser = argparse.ArgumentParser(description="Acolchados CD v2 — portal admin")
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=5003)
    args = parser.parse_args()
    with LOCK:
        sync_product_categories()
        ensure_stock_keys()
    print(f"Público: http://127.0.0.1:{args.port}/")
    print(f"Portal:  http://127.0.0.1:{args.port}/admin  (admin / cambiar123)")
    app.run(host=args.host, port=args.port, debug=False, use_reloader=False, threaded=True)


if __name__ == "__main__":
    main()
