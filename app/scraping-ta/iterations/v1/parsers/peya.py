from __future__ import annotations

from typing import Any

from parsers import iter_xhr
from schema import ChannelResult, ProductRow, to_clp, utc_now


class ParseError(RuntimeError):
    pass


def parse_menu(menu: dict[str, Any], source_url: str) -> ChannelResult:
    store = str(menu.get("name") or "PedidosYa")
    scraped_at = utc_now()
    items: list[ProductRow] = []
    for section in menu.get("sections") or []:
        section_name = str(section.get("name") or "")
        for product in section.get("products") or []:
            price = product.get("price") or {}
            final = to_clp(price.get("finalPrice"))
            original = to_clp(price.get("originalPrice"))
            if original == final:
                original = None
            items.append(
                ProductRow(
                    platform="pedidosya",
                    store=store,
                    section=section_name,
                    name=str(product.get("name") or ""),
                    description=str(product.get("description") or ""),
                    price_clp=final,
                    price_original_clp=original,
                    available=product.get("enabled"),
                    source_url=source_url,
                    scraped_at=scraped_at,
                    product_id=str(product.get("id") or product.get("legacyId") or ""),
                )
            )
    return ChannelResult(
        platform="pedidosya",
        store=store,
        source_url=source_url,
        native_source="xhr GET /v2/niles/partners/{id}/menus",
        items=items,
    )


def from_bee(bee: dict[str, Any], source_url: str) -> ChannelResult:
    for url, _method, body in iter_xhr(bee):
        if (
            "/niles/partners/" in url
            and "/menus" in url
            and isinstance(body, dict)
            and isinstance(body.get("sections"), list)
        ):
            return parse_menu(body, source_url)
    raise ParseError("No se encontró el XHR de menú PedidosYa (/v2/niles/partners/.../menus).")
