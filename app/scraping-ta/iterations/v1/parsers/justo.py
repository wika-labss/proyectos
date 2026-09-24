from __future__ import annotations

import re
from typing import Any
from urllib.parse import urlparse

import httpx

from parsers import iter_xhr
from schema import ChannelResult, ProductRow, to_clp, utc_now

TARRAGONA_WEBSITE_ID = "hPy8jxhEz4yWPb8qr"
TARRAGONA_MENU_ID = "PZKKxcPg44sL2gRxX"
WEBDATA_BASE = "https://webdatacdn.getjusto.com"


class ParseError(RuntimeError):
    pass


def is_tarragona_justo(url: str) -> bool:
    host = urlparse(url).hostname or ""
    return host.endswith("tarragona.cl")


def parse_menu_payload(payload: dict[str, Any], source_url: str) -> ChannelResult:
    data = payload.get("data", payload) if isinstance(payload, dict) else {}
    products = data.get("products") or {}
    categories = data.get("categories") or {}
    menu = data.get("menu") or {}
    order = list(menu.get("categoryIds") or categories.keys())
    scraped_at = utc_now()
    items: list[ProductRow] = []
    seen: set[str] = set()
    store = "Tarragona"
    sample = next(iter(products.values()), None) if isinstance(products, dict) else None
    if isinstance(sample, dict) and sample.get("websiteName"):
        store = str(sample["websiteName"])

    def add_product(section_name: str, product: dict[str, Any]) -> None:
        pid = str(product.get("_id") or "")
        if pid in seen:
            return
        seen.add(pid)
        av = product.get("availabilityAt") or {}
        final = to_clp(av.get("finalPrice"))
        base = to_clp(av.get("basePrice"))
        original = base if base != final else None
        items.append(
            ProductRow(
                platform="justo",
                store=store,
                section=section_name,
                name=str(product.get("name") or ""),
                description=str(product.get("description") or ""),
                price_clp=final,
                price_original_clp=original,
                available=av.get("available"),
                source_url=source_url,
                scraped_at=scraped_at,
                product_id=pid,
            )
        )

    if isinstance(products, dict) and isinstance(categories, dict):
        for cid in order:
            category = categories.get(cid) or {}
            section_name = str(category.get("name") or "")
            for pid in category.get("productIds") or []:
                product = products.get(pid)
                if isinstance(product, dict):
                    add_product(section_name, product)
        for product in products.values():
            if isinstance(product, dict):
                cats = product.get("categories") or []
                section = cats[0].get("name") if cats and isinstance(cats[0], dict) else ""
                add_product(section, product)

    if not items:
        raise ParseError("El JSON Justo no trae products/categories.")
    return ChannelResult(
        platform="justo",
        store=store,
        source_url=source_url,
        native_source="GET webdatacdn /v1/websites/{id}/menus/{menuId}",
        items=items,
    )


def fetch_menu(website_id: str, menu_id: str, timeout: float = 30.0) -> dict[str, Any]:
    url = f"{WEBDATA_BASE}/v1/websites/{website_id}/menus/{menu_id}"
    with httpx.Client(timeout=timeout, headers={"Accept": "application/json"}) as client:
        response = client.get(url)
        response.raise_for_status()
        return response.json()


def fetch_website(website_id: str, timeout: float = 30.0) -> dict[str, Any]:
    url = f"{WEBDATA_BASE}/v1/websites/{website_id}"
    with httpx.Client(timeout=timeout, headers={"Accept": "application/json"}) as client:
        response = client.get(url)
        response.raise_for_status()
        return response.json()


def from_tarragona_cdn(source_url: str) -> ChannelResult:
    website = fetch_website(TARRAGONA_WEBSITE_ID)
    data = website.get("data") or website
    menu_id = str(data.get("defaultMenuId") or TARRAGONA_MENU_ID)
    payload = fetch_menu(TARRAGONA_WEBSITE_ID, menu_id)
    return parse_menu_payload(payload, source_url)


_WEBSITE_ID_RE = re.compile(r'"websiteId"\s*:\s*"([A-Za-z0-9]{10,})"')


def website_id_from_bee(bee: dict[str, Any]) -> str | None:
    for url, _method, body in iter_xhr(bee):
        if "getjusto.com" not in url:
            continue
        blob = str(body)
        match = _WEBSITE_ID_RE.search(blob)
        if match:
            return match.group(1)
    html = bee.get("body") or ""
    match = _WEBSITE_ID_RE.search(html)
    return match.group(1) if match else None
