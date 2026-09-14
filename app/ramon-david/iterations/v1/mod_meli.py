"""MOD-10: Mercado Libre (OAuth, publicación de catálogo, órdenes, notificaciones)."""

from __future__ import annotations

import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

API = "https://api.mercadolibre.com"
AUTH_HOST = os.environ.get("MELI_AUTH_HOST", "https://auth.mercadolibre.cl")
SITE_ID = os.environ.get("MELI_SITE_ID", "MLC")
TEST_TITLE = "Item de Prueba - Por favor, NO OFERTAR"

CATEGORY_BY_LOCAL = {
    "Sábanas": "MLC82322",
    "Plumones": "MLC1631",
    "Quilts": "MLC1631",
    "Cubre Plumón": "MLC1631",
    "Pieceras": "MLC1631",
    "Colchas": "MLC1631",
    "Protectores de colchón": "MLC1631",
    "Faldones y Almohadas": "MLC1631",
    "Toallas": "MLC1631",
}

MATTRESS_SIZE_IDS = {
    "1 plaza": "11590766",
    "1.5 plazas": "3137046",
    "2 plazas": "1387960",
    "king": "4781694",
    "super king": "1149020",
    "súper king": "1149020",
}

def _data_dir() -> Path:
    return Path(__file__).resolve().parent / "data"


def tokens_path() -> Path:
    return _data_dir() / "meli_tokens.json"


def client_id() -> str:
    return os.environ.get("MELI_CLIENT_ID", "").strip()


def client_secret() -> str:
    return os.environ.get("MELI_CLIENT_SECRET", "").strip()


def redirect_uri() -> str:
    return os.environ.get("MELI_REDIRECT_URI", "https://vissiuss.lat/oauth/callback").strip()


def test_mode() -> bool:
    return os.environ.get("MELI_TEST_MODE", "1").strip() not in {"0", "false", "False"}


def configured() -> bool:
    return bool(client_id() and client_secret())


def load_tokens() -> dict:
    path = tokens_path()
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def save_tokens(payload: dict) -> None:
    _data_dir().mkdir(parents=True, exist_ok=True)
    tmp = tokens_path().with_suffix(".json.tmp")
    tmp.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(tokens_path())


def _request(method: str, url: str, *, token: str | None = None, json_body=None, form=None, timeout=40):
    headers = {"Accept": "application/json"}
    data = None
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if json_body is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(json_body).encode("utf-8")
    elif form is not None:
        headers["Content-Type"] = "application/x-www-form-urlencoded"
        data = urllib.parse.urlencode(form).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8")
            body = json.loads(raw) if raw else {}
            return resp.status, body
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        try:
            body = json.loads(raw) if raw else {}
        except json.JSONDecodeError:
            body = {"message": raw, "error": "http_error"}
        body.setdefault("status", exc.code)
        return exc.code, body
    except urllib.error.URLError as exc:
        return 504, {"error": "timeout", "message": str(exc.reason if getattr(exc, "reason", None) else exc)}


def authorization_url(state: str) -> str:
    params = {
        "response_type": "code",
        "client_id": client_id(),
        "redirect_uri": redirect_uri(),
        "state": state,
    }
    return f"{AUTH_HOST}/authorization?{urllib.parse.urlencode(params)}"


def exchange_code(code: str) -> tuple[int, dict]:
    status, body = _request(
        "POST",
        f"{API}/oauth/token",
        form={
            "grant_type": "authorization_code",
            "client_id": client_id(),
            "client_secret": client_secret(),
            "code": code,
            "redirect_uri": redirect_uri(),
        },
    )
    if status == 200 and body.get("access_token"):
        save_tokens(_token_record(body))
    return status, body


def refresh_access_token() -> tuple[int, dict]:
    tokens = load_tokens()
    refresh = tokens.get("refresh_token")
    if not refresh:
        return 400, {"error": "no_refresh_token", "message": "No hay refresh_token. Activa Refresh Token en DevCenter y vuelve a conectar."}
    status, body = _request(
        "POST",
        f"{API}/oauth/token",
        form={
            "grant_type": "refresh_token",
            "client_id": client_id(),
            "client_secret": client_secret(),
            "refresh_token": refresh,
        },
    )
    if status == 200 and body.get("access_token"):
        save_tokens(_token_record(body))
    return status, body


def _token_record(body: dict) -> dict:
    return {
        "access_token": body.get("access_token"),
        "refresh_token": body.get("refresh_token"),
        "token_type": body.get("token_type"),
        "expires_in": body.get("expires_in"),
        "scope": body.get("scope"),
        "user_id": body.get("user_id"),
        "saved_at": datetime.now(timezone.utc).isoformat(),
    }


def access_token() -> str | None:
    return load_tokens().get("access_token")


def api(method: str, path: str, *, json_body=None, retry=True):
    token = access_token()
    if not token:
        return 401, {"error": "not_connected", "message": "Conecta Mercado Libre desde el módulo de ventas."}
    status, body = _request(method, f"{API}{path}", token=token, json_body=json_body)
    if retry and status == 401 and load_tokens().get("refresh_token"):
        refresh_status, _ = refresh_access_token()
        if refresh_status == 200:
            return api(method, path, json_body=json_body, retry=False)
    return status, body


def me() -> tuple[int, dict]:
    return api("GET", "/users/me")


def parse_price(raw: str) -> int | None:
    if not raw:
        return None
    digits = re.sub(r"[^\d]", "", raw)
    return int(digits) if digits else None


def first_price_and_size(product: dict) -> tuple[int | None, str]:
    size = ""
    price = None
    for table in product.get("tables") or []:
        headers = [h.lower() for h in table.get("headers") or []]
        price_idx = next((i for i, h in enumerate(headers) if "valor" in h or "precio" in h), 1)
        size_idx = 0
        rows = table.get("rows") or []
        if rows and rows[0]:
            size = str(rows[0][size_idx] or "").strip()
            if len(rows[0]) > price_idx:
                price = parse_price(str(rows[0][price_idx]))
            if price:
                return price, size
    return price, size


def mattress_size_id(label: str) -> str:
    key = (label or "").strip().lower()
    return MATTRESS_SIZE_IDS.get(key, MATTRESS_SIZE_IDS["2 plazas"])


def picture_sources(product: dict) -> list[dict]:
    imagen = (product.get("imagen") or "").strip()
    public = os.environ.get("MELI_PUBLIC_BASE_URL", "").rstrip("/")
    fallback = os.environ.get(
        "MELI_FALLBACK_PICTURE",
        "https://http2.mlstatic.com/D_NQ_NP_2X_687111-MLC44741184726_012021-F.webp",
    )
    if imagen.startswith("https://") or imagen.startswith("http://"):
        return [{"source": imagen}]
    if imagen.startswith("/") and public:
        return [{"source": f"{public}{imagen}"}]
    return [{"source": fallback}]


def family_name(product: dict) -> str:
    # User Products: MeLi genera el title. family_name es obligatorio.
    if test_mode():
        return TEST_TITLE[:60]
    name = (product.get("title") or "Producto Acolchados CD").strip()
    return name[:60]


def build_item_payload(product: dict, product_id: str) -> dict:
    price, size_label = first_price_and_size(product)
    if not price or price < 1:
        price = 1000 if test_mode() else None
    # En modo prueba usamos sábanas (atributos conocidos). El título test evita indexación.
    category_id = "MLC82322" if test_mode() else CATEGORY_BY_LOCAL.get(product.get("category") or "", "MLC82322")
    notes = "\n".join(product.get("notes") or [])
    description = "\n\n".join(
        part for part in [(product.get("description") or "").strip(), notes, f"SKU interno: {product_id}"] if part
    )
    payload = {
        "family_name": family_name(product),
        "category_id": category_id,
        "price": price,
        "currency_id": "CLP",
        "available_quantity": 3,
        "buying_mode": "buy_it_now",
        "listing_type_id": os.environ.get("MELI_LISTING_TYPE", "gold_special"),
        "condition": "new",
        "description": {"plain_text": description[:50000] or TEST_TITLE},
        "pictures": picture_sources(product),
        "attributes": [
            {"id": "BRAND", "value_name": "Acolchados CD"},
            {"id": "MODEL", "value_name": (product.get("title") or "Prueba")[:60]},
            {"id": "SHEET_PRESENTATION", "value_id": "196076"},
            {"id": "MATTRESS_SIZE", "value_id": mattress_size_id(size_label)},
            {"id": "EMPTY_GTIN_REASON", "value_id": "17055160"},
        ],
        "shipping": {"mode": "not_specified"},
    }
    if not payload["price"]:
        raise ValueError("El producto no tiene un precio numérico en sus tablas.")
    return payload


def publish_product(product: dict, product_id: str) -> tuple[int, dict]:
    payload = build_item_payload(product, product_id)
    return api("POST", "/items", json_body=payload)


def search_orders() -> tuple[int, dict]:
    tokens = load_tokens()
    seller = tokens.get("user_id")
    if not seller:
        status, me_body = me()
        if status != 200:
            return status, me_body
        seller = me_body.get("id")
    return api("GET", f"/orders/search?seller={seller}&sort=date_desc")


def append_notification(payload: dict) -> None:
    path = _data_dir() / "meli_notifications.jsonl"
    _data_dir().mkdir(parents=True, exist_ok=True)
    line = json.dumps({"at": datetime.now(timezone.utc).isoformat(), **payload}, ensure_ascii=False)
    with path.open("a", encoding="utf-8") as fh:
        fh.write(line + "\n")


def public_status() -> dict:
    tokens = load_tokens()
    connected = bool(tokens.get("access_token"))
    return {
        "configured": configured(),
        "connected": connected,
        "test_mode": test_mode(),
        "site_id": SITE_ID,
        "redirect_uri": redirect_uri(),
        "client_id": client_id(),
        "user_id": tokens.get("user_id"),
        "has_refresh": bool(tokens.get("refresh_token")),
        "saved_at": tokens.get("saved_at"),
    }
