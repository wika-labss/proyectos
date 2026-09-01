from __future__ import annotations

import os
from typing import Any

from bee import BeeError, credits_of as bee_credits_of, scrape_once as bee_scrape_once

# scrapling = browser local (0 créditos Bee). bee = ScrapingBee stealth CL.
_DEFAULT = "scrapling"


def fetcher_name() -> str:
    name = (os.environ.get("SCRAPING_TA_FETCHER") or _DEFAULT).strip().lower()
    if name in {"scrapling", "sl"}:
        return "scrapling"
    if name in {"bee", "scrapingbee"}:
        return "bee"
    return _DEFAULT


def needs_bee_token() -> bool:
    return fetcher_name() == "bee"


def scrape_once(url: str, api_key: str | None = None) -> dict[str, Any]:
    """Una navegación por URL. Sin retry loop."""
    if fetcher_name() == "bee":
        if not api_key:
            raise BeeError("Falta el token ScrapingBee.")
        payload = bee_scrape_once(url, api_key)
        payload.setdefault("fetcher", "bee")
        return payload
    from scrapling_fetch import scrape_once as scrapling_once

    return scrapling_once(url)


def credits_of(payload: dict[str, Any]) -> int:
    if (payload.get("fetcher") or "") == "scrapling":
        return 0
    return bee_credits_of(payload)
