from __future__ import annotations

import json
import traceback
import uuid
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, HTMLResponse
from pydantic import BaseModel, Field

from bee import BeeError, credits_of, scrape_once
from excel_report import build_workbook
from parsers import justo as justo_parser
from parsers import peya as peya_parser
from parsers import rappi as rappi_parser
from parsers import uber as uber_parser
from schema import ChannelResult
from token_store import load_token, save_token, token_configured

ROOT = Path(__file__).resolve().parent
RUNS_DIR = ROOT / "runs"
STATIC_DIR = ROOT / "static"
CREDITS_PER_BEE = 75

app = FastAPI(title="Tarragona auditoría de menú", version="1.0.0")


class TokenBody(BaseModel):
    token: str = Field(min_length=8)


class AuditBody(BaseModel):
    peya: str = ""
    uber: str = ""
    rappi: str = ""
    justo: str = ""


def _clean_url(value: str) -> str:
    return (value or "").strip()


def _estimate_credits(body: AuditBody) -> int:
    n = 0
    if _clean_url(body.peya):
        n += 1
    if _clean_url(body.uber):
        n += 1
    if _clean_url(body.rappi):
        n += 1
    justo = _clean_url(body.justo)
    if justo and not justo_parser.is_tarragona_justo(justo):
        n += 1
    return n * CREDITS_PER_BEE


def _skipped(platform: str) -> ChannelResult:
    return ChannelResult(
        platform=platform,
        store="",
        source_url="",
        native_source="",
        skipped=True,
    )


def _failed(platform: str, url: str, credits: int, error: str) -> ChannelResult:
    return ChannelResult(
        platform=platform,
        store="",
        source_url=url,
        native_source="",
        credits_used=credits,
        error=error,
    )


def _require_token() -> str:
    token = load_token()
    if not token:
        raise HTTPException(
            status_code=400,
            detail="Falta el token ScrapingBee. Pégalo en el módulo de token y guarda.",
        )
    return token


def _audit_peya(url: str) -> ChannelResult:
    token = _require_token()
    bee = scrape_once(url, token)
    try:
        result = peya_parser.from_bee(bee, url)
    except peya_parser.ParseError as exc:
        return _failed("pedidosya", url, credits_of(bee), str(exc))
    result.credits_used = credits_of(bee)
    return result


def _audit_uber(url: str) -> ChannelResult:
    token = _require_token()
    bee = scrape_once(url, token)
    try:
        result = uber_parser.from_html(bee.get("body") or "", url)
    except uber_parser.ParseError as exc:
        return _failed("ubereats", url, credits_of(bee), str(exc))
    result.credits_used = credits_of(bee)
    return result


def _audit_rappi(url: str) -> ChannelResult:
    token = _require_token()
    bee = scrape_once(url, token)
    try:
        result = rappi_parser.from_bee(bee, url)
    except rappi_parser.ParseError as exc:
        return _failed("rappi", url, credits_of(bee), str(exc))
    result.credits_used = credits_of(bee)
    return result


def _audit_justo(url: str) -> ChannelResult:
    if justo_parser.is_tarragona_justo(url):
        return justo_parser.from_tarragona_cdn(url)
    token = _require_token()
    bee = scrape_once(url, token)
    try:
        website_id = justo_parser.website_id_from_bee(bee)
        if not website_id:
            raise justo_parser.ParseError("No se pudo leer websiteId Justo del HTML/XHR.")
        website = justo_parser.fetch_website(website_id)
        data = website.get("data") or website
        menu_id = str(data.get("defaultMenuId") or "")
        if not menu_id:
            raise justo_parser.ParseError("El website Justo no tiene defaultMenuId.")
        payload = justo_parser.fetch_menu(website_id, menu_id)
        result = justo_parser.parse_menu_payload(payload, url)
    except justo_parser.ParseError as exc:
        return _failed("justo", url, credits_of(bee), str(exc))
    result.credits_used = credits_of(bee)
    return result


AUDITORS = {
    "peya": ("pedidosya", _audit_peya),
    "uber": ("ubereats", _audit_uber),
    "rappi": ("rappi", _audit_rappi),
    "justo": ("justo", _audit_justo),
}


@app.get("/", response_class=HTMLResponse)
def index() -> HTMLResponse:
    html_path = STATIC_DIR / "index.html"
    return HTMLResponse(html_path.read_text(encoding="utf-8"))


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {"ok": True, "token_configured": token_configured()}


@app.get("/api/token")
def get_token_status() -> dict[str, Any]:
    return {"configured": token_configured()}


@app.post("/api/token")
def post_token(body: TokenBody) -> dict[str, Any]:
    save_token(body.token)
    return {"configured": True}


@app.post("/api/audit/estimate")
def estimate(body: AuditBody) -> dict[str, Any]:
    return {
        "credits_estimated": _estimate_credits(body),
        "bee_calls": _estimate_credits(body) // CREDITS_PER_BEE,
        "justo_cdn": bool(_clean_url(body.justo) and justo_parser.is_tarragona_justo(_clean_url(body.justo))),
    }


@app.post("/api/audit")
def audit(body: AuditBody) -> dict[str, Any]:
    jobs: list[tuple[str, str, Any]] = []
    for field, (platform, fn) in AUDITORS.items():
        url = _clean_url(getattr(body, field))
        if url:
            jobs.append((platform, url, fn))

    if not jobs:
        raise HTTPException(status_code=400, detail="Pega al menos una URL.")

    needs_bee = any(
        platform != "justo" or not justo_parser.is_tarragona_justo(url)
        for platform, url, _fn in jobs
    )
    if needs_bee:
        _require_token()

    RUNS_DIR.mkdir(exist_ok=True)
    results: list[ChannelResult] = []
    for platform, url, fn in jobs:
        try:
            results.append(fn(url))
        except HTTPException:
            raise
        except (BeeError, peya_parser.ParseError, uber_parser.ParseError, rappi_parser.ParseError, justo_parser.ParseError) as exc:
            results.append(_failed(platform, url, CREDITS_PER_BEE if platform != "justo" else 0, str(exc)))
        except Exception as exc:
            traceback.print_exc()
            results.append(_failed(platform, url, 0, f"Error inesperado: {exc}"))

    present = {r.platform for r in results}
    for field, (platform, _fn) in AUDITORS.items():
        if platform not in present:
            results.append(_skipped(platform))

    run_id = uuid.uuid4().hex[:12]
    xlsx = build_workbook(results)
    xlsx_path = RUNS_DIR / f"{run_id}.xlsx"
    meta_path = RUNS_DIR / f"{run_id}.json"
    xlsx_path.write_bytes(xlsx)

    payload = {
        "run_id": run_id,
        "credits_estimated": _estimate_credits(body),
        "credits_used": sum(r.credits_used for r in results),
        "channels": [
            {
                "platform": r.platform,
                "store": r.store,
                "source_url": r.source_url,
                "native_source": r.native_source,
                "item_count": 0 if r.skipped else r.item_count,
                "credits_used": r.credits_used,
                "error": r.error,
                "skipped": r.skipped,
                "items": [row.as_dict() for row in r.items[:8]],
            }
            for r in results
        ],
    }
    meta_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return payload


@app.get("/api/report/{run_id}.xlsx")
def download_report(run_id: str) -> FileResponse:
    path = RUNS_DIR / f"{run_id}.xlsx"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Informe no encontrado.")
    return FileResponse(
        path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=f"auditoria-menu-{run_id}.xlsx",
    )
