from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


@dataclass
class ProductRow:
    platform: str
    store: str
    section: str
    name: str
    description: str
    price_clp: int | None
    price_original_clp: int | None
    available: bool | None
    source_url: str
    scraped_at: str
    product_id: str = ""

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class ChannelResult:
    platform: str
    store: str
    source_url: str
    native_source: str
    credits_used: int = 0
    items: list[ProductRow] = field(default_factory=list)
    error: str | None = None
    skipped: bool = False

    @property
    def item_count(self) -> int:
        return len(self.items)


def to_clp(value: Any) -> int | None:
    if value is None or value == "":
        return None
    try:
        return int(round(float(value)))
    except (TypeError, ValueError):
        return None
