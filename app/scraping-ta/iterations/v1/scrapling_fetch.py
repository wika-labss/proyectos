from __future__ import annotations

import os
from typing import Any

from bee import BeeError

# Un fetch: capturar XHR nativos que ya parsean Peya/Rappi/Justo.
XHR_RE = (
    r"niles/partners/.*/menus"
    r"|restaurants-bus/store/id/"
    r"|webdatacdn\.getjusto"
    r"|getjusto\.com"
)


def _env_flag(name: str, default: bool) -> bool:
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() not in {"0", "false", "no", "off"}


def _proxy() -> str | None:
    return (os.environ.get("SCRAPLING_PROXY") or "").strip() or None


def _decode_body(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, bytes):
        return value.decode("utf-8", errors="replace")
    return str(value)


def payload_from_page(page: Any) -> dict[str, Any]:
    """Mapea una Response de Scrapling al JSON de Bee (`body` + `xhr`)."""
    html = getattr(page, "html", None)
    if not isinstance(html, str) or not html:
        html = _decode_body(getattr(page, "body", b""))
    xhr_rows: list[dict[str, Any]] = []
    for xhr in getattr(page, "captured_xhr", None) or []:
        xhr_rows.append(
            {
                "url": str(getattr(xhr, "url", "") or ""),
                "method": str(getattr(xhr, "method", "") or ""),
                "status": getattr(xhr, "status", None),
                "body": _decode_body(getattr(xhr, "body", b"")),
            }
        )
    return {
        "fetcher": "scrapling",
        "cost": 0,
        "status": getattr(page, "status", None),
        "body": html,
        "xhr": xhr_rows,
    }


def scrape_once(url: str) -> dict[str, Any]:
    """Una sola navegación StealthyFetcher. Sin retries."""
    try:
        from scrapling.fetchers import StealthyFetcher
    except ImportError as exc:
        raise BeeError(
            "Scrapling no está instalado. pip install 'scrapling[fetchers]' && scrapling install"
        ) from exc

    kwargs: dict[str, Any] = {
        "headless": True,
        "network_idle": True,
        "timeout": int(os.environ.get("SCRAPLING_TIMEOUT_MS") or "90000"),
        "wait": int(os.environ.get("SCRAPLING_WAIT_MS") or "8000"),
        "capture_xhr": XHR_RE,
        "google_search": True,
        "solve_cloudflare": _env_flag("SCRAPLING_SOLVE_CF", True),
        "block_webrtc": True,
        "retries": 1,  # un fetch; sin loop interno de Scrapling (default es 3)
    }
    proxy = _proxy()
    if proxy:
        kwargs["proxy"] = proxy

    try:
        page = StealthyFetcher.fetch(url, **kwargs)
    except TypeError:
        # Versiones donde capture_xhr solo vive en la sesión.
        from scrapling.fetchers import StealthySession

        session_kwargs = {
            "headless": True,
            "network_idle": True,
            "timeout": kwargs["timeout"],
            "capture_xhr": XHR_RE,
            "solve_cloudflare": kwargs["solve_cloudflare"],
            "block_webrtc": True,
            "retries": 1,
        }
        if proxy:
            session_kwargs["proxy"] = proxy
        try:
            with StealthySession(**session_kwargs) as session:
                page = session.fetch(url, wait=kwargs["wait"], google_search=True)
        except Exception as exc:
            raise BeeError(f"Scrapling falló en {url}: {exc}") from exc
    except Exception as exc:
        raise BeeError(f"Scrapling falló en {url}: {exc}") from exc

    if page is None:
        raise BeeError(f"Scrapling no devolvió página para {url}")
    return payload_from_page(page)
