from __future__ import annotations

from typing import Any

from parsers import iter_xhr
from schema import ChannelResult, ProductRow, to_clp, utc_now


class ParseError(RuntimeError):
    pass


def _client_price(product: dict[str, Any]) -> tuple[int | None, int | None]:
    listed = to_clp(product.get("real_price") if product.get("real_price") is not None else product.get("price"))
    client = to_clp(product.get("price"))
    for discount in product.get("discounts") or []:
        if not isinstance(discount, dict):
            continue
        if discount.get("apply_to_user") and discount.get("price") is not None:
            client = to_clp(discount.get("price"))
            break
    original = listed if listed != client else None
    return client, original


def parse_store(store: dict[str, Any], source_url: str) -> ChannelResult:
    store_name = str(store.get("name") or store.get("brand_name") or "Rappi")
    scraped_at = utc_now()
    items: list[ProductRow] = []
    for corridor in store.get("corridors") or []:
        section_name = str(corridor.get("name") or "")
        for product in corridor.get("products") or []:
            price, original = _client_price(product)
            items.append(
                ProductRow(
                    platform="rappi",
                    store=store_name,
                    section=section_name,
                    name=str(product.get("name") or ""),
                    description=str(product.get("description") or ""),
                    price_clp=price,
                    price_original_clp=original,
                    available=None,
                    source_url=source_url,
                    scraped_at=scraped_at,
                    product_id=str(product.get("id") or product.get("product_id") or ""),
                )
            )
    if not items:
        raise ParseError("El store Rappi no trae corridors[].products[].")
    return ChannelResult(
        platform="rappi",
        store=store_name,
        source_url=source_url,
        native_source="xhr POST restaurants-bus/store/id/{id}",
        items=items,
    )


def from_bee(bee: dict[str, Any], source_url: str) -> ChannelResult:
    for url, _method, body in iter_xhr(bee):
        if "restaurants-bus/store/id/" not in url:
            continue
        if isinstance(body, dict) and isinstance(body.get("corridors"), list):
            return parse_store(body, source_url)
        data = body.get("data") if isinstance(body, dict) else None
        if isinstance(data, dict) and isinstance(data.get("corridors"), list):
            return parse_store(data, source_url)
    raise ParseError("No se encontró el XHR Rappi restaurants-bus/store/id/{id}.")
