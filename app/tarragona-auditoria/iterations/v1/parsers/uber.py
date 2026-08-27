from __future__ import annotations

import json
import re
from typing import Any

from schema import ChannelResult, ProductRow, to_clp, utc_now

_LD_RE = re.compile(
    r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
    re.I | re.S,
)


class ParseError(RuntimeError):
    pass


def _as_list(value: Any) -> list[Any]:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]


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
        native_source="JSON-LD Restaurant.hasMenu (SSR)",
        items=items,
    )


def from_html(html: str, source_url: str) -> ChannelResult:
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
    raise ParseError("No se encontró JSON-LD Restaurant.hasMenu en el HTML de Uber.")
