from __future__ import annotations

import json
from typing import Any

import httpx

BEE_ENDPOINT = "https://app.scrapingbee.com/api/v1/"
BEE_TIMEOUT_S = 120.0
JS_SCENARIO = {
    "instructions": [
        {"wait": 5000},
        {"scroll_y": 1200},
        {"wait": 3000},
    ]
}


class BeeError(RuntimeError):
    pass


def scrape_once(url: str, api_key: str) -> dict[str, Any]:
    """Una sola llamada stealth CL. Sin retries."""
    params = {
        "api_key": api_key,
        "url": url,
        "render_js": "true",
        "stealth_proxy": "true",
        "country_code": "cl",
        "block_ads": "true",
        "wait": "8000",
        "json_response": "true",
        "js_scenario": json.dumps(JS_SCENARIO, separators=(",", ":")),
    }
    try:
        with httpx.Client(timeout=BEE_TIMEOUT_S) as client:
            response = client.get(BEE_ENDPOINT, params=params)
    except httpx.TimeoutException as exc:
        raise BeeError(f"Timeout ScrapingBee ({BEE_TIMEOUT_S:.0f}s) en {url}") from exc
    except httpx.HTTPError as exc:
        raise BeeError(f"Error de red ScrapingBee: {exc}") from exc

    try:
        payload = response.json()
    except ValueError as exc:
        raise BeeError(f"ScrapingBee no devolvió JSON (HTTP {response.status_code})") from exc

    if response.status_code != 200:
        message = payload.get("error") or payload.get("message") or response.text[:240]
        raise BeeError(f"ScrapingBee HTTP {response.status_code}: {message}")
    return payload


def credits_of(payload: dict[str, Any]) -> int:
    try:
        return int(payload.get("cost") or 0)
    except (TypeError, ValueError):
        return 0
