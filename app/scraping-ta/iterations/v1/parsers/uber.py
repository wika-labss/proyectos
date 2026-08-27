from __future__ import annotations

import json
import re
from typing import Any

from schema import ChannelResult, ProductRow, to_clp, utc_now

_LD_RE = re.compile(
    r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
    re.I | re.S,
)
_RQ_RE = re.compile(
    r'<script[^>]*id=["\']__REACT_QUERY_STATE__["\'][^>]*>(.*?)</script>',
    re.I | re.S,
)
_DISC_FROM_RE = re.compile(r"discounted from\s*CLP\s*([\d.,\s\u00a0]+)", re.I)
_PROMO_SECTIONS = {"save on select items"}


class ParseError(RuntimeError):
    pass


def _as_list(value: Any) -> list[Any]:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]


def _badge_text(value: Any) -> str:
    if isinstance(value, dict):
        return str(value.get("text") or "")
    if isinstance(value, str):
        return value
    return ""


def _decode_react_query(raw: str) -> dict[str, Any]:
    text = raw.strip()
    # HTML style=%5C\u0022... becomes a raw quote and breaks JSON; keep it escaped.
    text = text.replace("%5C\\u0022", '\\"')
    text = re.sub(r"\\u([0-9a-fA-F]{4})", lambda mo: chr(int(mo.group(1), 16)), text)
    data = json.loads(text)
    if not isinstance(data, dict):
        raise ParseError("__REACT_QUERY_STATE__ no es un objeto JSON.")
    return data


def _uber_price_to_clp(value: Any) -> int | None:
    number = to_clp(value)
    if number is None:
        return None
    # Uber stores CLP in hundredths (1199000 → 11990).
    if number >= 1000 and number % 100 == 0:
        return number // 100
    return number


def _parse_clp_label(text: str) -> int | None:
    cleaned = (text or "").replace("\xa0", " ").replace(" ", "").replace(",", "")
    match = re.search(r"(\d+(?:\.\d+)?)", cleaned)
    if not match:
        return None
    return to_clp(match.group(1))


def _original_from_tagline(item: dict[str, Any]) -> int | None:
    tagline = item.get("priceTagline") or {}
    if not isinstance(tagline, dict):
        return None
    acc = str(tagline.get("accessibilityText") or "")
    match = _DISC_FROM_RE.search(acc)
    if match:
        return _parse_clp_label(match.group(1))
    fmt = str(tagline.get("textFormat") or "")
    struck = re.search(
        r"line-through[^<]*>\s*CLP\s*([\d.,\s\u00a0]+)",
        fmt,
        re.I,
    )
    if struck:
        return _parse_clp_label(struck.group(1))
    return None


def _store_payload(state: dict[str, Any]) -> dict[str, Any] | None:
    for query in state.get("queries") or []:
        if not isinstance(query, dict):
            continue
        key = query.get("queryKey")
        name = key[0] if isinstance(key, list) and key else None
        data = (query.get("state") or {}).get("data")
        if name == "getStoreV1" and isinstance(data, dict):
            return data
        if isinstance(data, dict) and data.get("catalogSectionsMap"):
            return data
    return None


def parse_react_query(state: dict[str, Any], source_url: str) -> ChannelResult:
    store_data = _store_payload(state)
    if not store_data:
        raise ParseError("REACT_QUERY_STATE no trae getStoreV1.")
    store = str(store_data.get("title") or "Uber Eats")
    scraped_at = utc_now()
    by_id: dict[str, ProductRow] = {}

    def consider(section_name: str, item: dict[str, Any]) -> None:
        if not isinstance(item, dict) or not item.get("title"):
            return
        uid = str(item.get("uuid") or item.get("title"))
        client = _uber_price_to_clp(item.get("price"))
        original = _original_from_tagline(item)
        if original == client:
            original = None
        sold_out = item.get("isSoldOut")
        available = item.get("isAvailable")
        if sold_out is True:
            available = False
        row = ProductRow(
            platform="ubereats",
            store=store,
            section=section_name,
            name=str(item.get("title") or ""),
            description=str(item.get("itemDescription") or ""),
            price_clp=client,
            price_original_clp=original,
            available=available,
            source_url=source_url,
            scraped_at=scraped_at,
            product_id=str(item.get("uuid") or ""),
        )
        existing = by_id.get(uid)
        if existing is None:
            by_id[uid] = row
            return
        promo_existing = existing.section.lower() in _PROMO_SECTIONS
        promo_new = section_name.lower() in _PROMO_SECTIONS
        richer = (original is not None) and (existing.price_original_clp is None)
        if richer or (promo_existing and not promo_new):
            by_id[uid] = row

    def visit(obj: Any, section: str = "") -> None:
        if isinstance(obj, dict):
            title = _badge_text(obj.get("catalogName") or obj.get("title")) or section
            for item in obj.get("catalogItems") or []:
                consider(title, item)
            for value in obj.values():
                visit(value, title)
        elif isinstance(obj, list):
            for value in obj:
                visit(value, section)

    visit(store_data.get("catalogSectionsMap") or store_data)
    items = list(by_id.values())
    if not items:
        raise ParseError("REACT_QUERY_STATE no trae catalogItems.")
    return ChannelResult(
        platform="ubereats",
        store=store,
        source_url=source_url,
        native_source="__REACT_QUERY_STATE__ catalogItems (getStoreV1)",
        items=items,
    )


def _offer_price(item: dict[str, Any]) -> int | None:
    offers = item.get("offers")
    if isinstance(offers, list) and offers:
        offers = offers[0]
    if not isinstance(offers, dict):
        return None
    return to_clp(offers.get("price"))


def parse_restaurant(node: dict[str, Any], source_url: str) -> ChannelResult:
    store = str(node.get("name") or "Uber Eats")
    menu = node.get("hasMenu") or {}
    scraped_at = utc_now()
    items: list[ProductRow] = []
    for section in _as_list(menu.get("hasMenuSection")):
        if not isinstance(section, dict):
            continue
        section_name = str(section.get("name") or "")
        for item in _as_list(section.get("hasMenuItem")):
            if not isinstance(item, dict):
                continue
            items.append(
                ProductRow(
                    platform="ubereats",
                    store=store,
                    section=section_name,
                    name=str(item.get("name") or ""),
                    description=str(item.get("description") or ""),
                    price_clp=_offer_price(item),
                    price_original_clp=None,
                    available=None,
                    source_url=source_url,
                    scraped_at=scraped_at,
                )
            )
    if not items:
        raise ParseError("JSON-LD de Uber no trae hasMenu.hasMenuSection.")
    return ChannelResult(
        platform="ubereats",
        store=store,
        source_url=source_url,
        native_source="JSON-LD Restaurant.hasMenu (SSR, sin precio lista)",
        items=items,
    )


def from_html(html: str, source_url: str) -> ChannelResult:
    match = _RQ_RE.search(html or "")
    if match:
        try:
            return parse_react_query(_decode_react_query(match.group(1)), source_url)
        except (ParseError, json.JSONDecodeError, ValueError):
            pass
    for raw in _LD_RE.findall(html or ""):
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            continue
        nodes = data if isinstance(data, list) else [data]
        for node in nodes:
            if not isinstance(node, dict):
                continue
            types = node.get("@type")
            type_set = {types} if isinstance(types, str) else set(types or [])
            if "Restaurant" in type_set and node.get("hasMenu"):
                return parse_restaurant(node, source_url)
    raise ParseError("No se encontró catálogo Uber (__REACT_QUERY_STATE__ ni JSON-LD hasMenu).")
