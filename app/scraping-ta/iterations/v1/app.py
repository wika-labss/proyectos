from __future__ import annotations

import json
import threading
import traceback
import uuid
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from pydantic import BaseModel, Field

from bee import BeeError
from excel_report import build_workbook
from fetchers import credits_of, fetcher_name, needs_bee_token, scrape_once
from parsers import justo as justo_parser
from parsers import peya as peya_parser
from parsers import rappi as rappi_parser
from parsers import uber as uber_parser
from schema import ChannelResult, ProductRow
from token_store import load_token, save_token, token_configured

ROOT = Path(__file__).resolve().parent
RUNS_DIR = ROOT / "runs"
STATIC_DIR = ROOT / "static"
CREDITS_PER_BEE = 75

app = FastAPI(title="Scraping TA", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

JOBS: dict[str, dict[str, Any]] = {}
JOBS_LOCK = threading.Lock()


class TokenBody(BaseModel):
    token: str = Field(min_length=8)


class AuditBody(BaseModel):
    peya: str = ""
    uber: str = ""
    rappi: str = ""
    justo: str = ""


class RetryBody(BaseModel):
    platform: str
    url: str = ""
    run_id: str | None = None


FIELD_BY_PLATFORM = {
    "peya": "pedidosya",
    "pedidosya": "pedidosya",
    "uber": "ubereats",
    "ubereats": "ubereats",
    "rappi": "rappi",
    "justo": "justo",
}

PLATFORM_FIELD = {
    "pedidosya": "peya",
    "ubereats": "uber",
    "rappi": "rappi",
    "justo": "justo",
}

CHANNEL_ORDER = ("pedidosya", "ubereats", "rappi", "justo")


def _clean_url(value: str) -> str:
    return (value or "").strip()


def _estimate_credits(body: AuditBody) -> int:
    if not needs_bee_token():
        return 0
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


def _scrape(url: str) -> dict[str, Any]:
    token = _require_token() if needs_bee_token() else load_token()
    return scrape_once(url, token)


def _audit_peya(url: str) -> ChannelResult:
    bee = _scrape(url)
    try:
        result = peya_parser.from_bee(bee, url)
    except peya_parser.ParseError as exc:
        return _failed("pedidosya", url, credits_of(bee), str(exc))
    result.credits_used = credits_of(bee)
    return result


def _audit_uber(url: str) -> ChannelResult:
    bee = _scrape(url)
    try:
        result = uber_parser.from_html(bee.get("body") or "", url)
    except uber_parser.ParseError as exc:
        return _failed("ubereats", url, credits_of(bee), str(exc))
    result.credits_used = credits_of(bee)
    return result


def _audit_rappi(url: str) -> ChannelResult:
    bee = _scrape(url)
    try:
        result = rappi_parser.from_bee(bee, url)
    except rappi_parser.ParseError as exc:
        return _failed("rappi", url, credits_of(bee), str(exc))
    result.credits_used = credits_of(bee)
    return result


def _audit_justo(url: str) -> ChannelResult:
    if justo_parser.is_tarragona_justo(url):
        return justo_parser.from_tarragona_cdn(url)
    bee = _scrape(url)
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
    return {
        "ok": True,
        "token_configured": token_configured(),
        "fetcher": fetcher_name(),
        "needs_bee_token": needs_bee_token(),
    }


@app.get("/api/token")
def get_token_status() -> dict[str, Any]:
    return {
        "configured": token_configured(),
        "fetcher": fetcher_name(),
        "needs_bee_token": needs_bee_token(),
    }


@app.post("/api/token")
def post_token(body: TokenBody) -> dict[str, Any]:
    save_token(body.token)
    return {"configured": True}


@app.post("/api/audit/estimate")
def estimate(body: AuditBody) -> dict[str, Any]:
    return {
        "credits_estimated": _estimate_credits(body),
        "bee_calls": 0 if not needs_bee_token() else _estimate_credits(body) // CREDITS_PER_BEE,
        "justo_cdn": bool(_clean_url(body.justo) and justo_parser.is_tarragona_justo(_clean_url(body.justo))),
        "fetcher": fetcher_name(),
    }


def _channel_dict(result: ChannelResult) -> dict[str, Any]:
    return {
        "platform": result.platform,
        "store": result.store,
        "source_url": result.source_url,
        "native_source": result.native_source,
        "item_count": 0 if result.skipped else result.item_count,
        "credits_used": result.credits_used,
        "error": result.error,
        "skipped": result.skipped,
        "items": [row.as_dict() for row in result.items],
    }


def _public_job(job: dict[str, Any]) -> dict[str, Any]:
    payload = json.loads(json.dumps(job))
    for channel in payload.get("channels") or []:
        items = channel.get("items") or []
        channel["items"] = items[:8]
        if "item_count" not in channel or channel.get("item_count") is None:
            channel["item_count"] = 0 if channel.get("skipped") else len(items)
    return payload


def _row_from_dict(item: dict[str, Any], platform: str) -> ProductRow:
    return ProductRow(
        platform=str(item.get("platform") or platform),
        store=str(item.get("store") or ""),
        section=str(item.get("section") or ""),
        name=str(item.get("name") or ""),
        description=str(item.get("description") or ""),
        price_clp=item.get("price_clp"),
        price_original_clp=item.get("price_original_clp"),
        available=item.get("available"),
        source_url=str(item.get("source_url") or ""),
        scraped_at=str(item.get("scraped_at") or ""),
        product_id=str(item.get("product_id") or ""),
    )


def _result_from_channel(channel: dict[str, Any]) -> ChannelResult:
    platform = str(channel.get("platform") or "")
    return ChannelResult(
        platform=platform,
        store=str(channel.get("store") or ""),
        source_url=str(channel.get("source_url") or ""),
        native_source=str(channel.get("native_source") or ""),
        credits_used=int(channel.get("credits_used") or 0),
        items=[_row_from_dict(item, platform) for item in channel.get("items") or []],
        error=channel.get("error"),
        skipped=bool(channel.get("skipped")),
    )


def _urls_from_body(body: AuditBody) -> dict[str, str]:
    return {
        "peya": _clean_url(body.peya),
        "uber": _clean_url(body.uber),
        "rappi": _clean_url(body.rappi),
        "justo": _clean_url(body.justo),
    }


def _body_from_urls(urls: dict[str, str]) -> AuditBody:
    return AuditBody(
        peya=urls.get("peya") or "",
        uber=urls.get("uber") or "",
        rappi=urls.get("rappi") or "",
        justo=urls.get("justo") or "",
    )


def _load_job(run_id: str) -> dict[str, Any]:
    with JOBS_LOCK:
        job = JOBS.get(run_id)
    if job:
        return job
    meta_path = RUNS_DIR / f"{run_id}.json"
    if meta_path.exists():
        data = json.loads(meta_path.read_text(encoding="utf-8"))
        with JOBS_LOCK:
            JOBS[run_id] = data
        return data
    raise HTTPException(status_code=404, detail="Auditoría no encontrada.")


def _ordered_channel_dicts(channels: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_plat: dict[str, dict[str, Any]] = {}
    extras: list[dict[str, Any]] = []
    for ch in channels:
        plat = str(ch.get("platform") or "")
        if plat in CHANNEL_ORDER:
            by_plat[plat] = ch
        else:
            extras.append(ch)
    return [by_plat[name] for name in CHANNEL_ORDER if name in by_plat] + extras


def _persist_job(run_id: str, payload: dict[str, Any]) -> None:
    RUNS_DIR.mkdir(exist_ok=True)
    payload = dict(payload)
    payload["channels"] = _ordered_channel_dicts(list(payload.get("channels") or []))
    channels = [_result_from_channel(ch) for ch in payload["channels"]]
    (RUNS_DIR / f"{run_id}.xlsx").write_bytes(build_workbook(channels))
    (RUNS_DIR / f"{run_id}.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    with JOBS_LOCK:
        JOBS[run_id] = payload


def _run_one_channel(platform: str, url: str) -> ChannelResult:
    fn = {name: func for name, func in AUDITORS.values()}.get(platform)
    if not fn:
        raise HTTPException(status_code=400, detail=f"Canal desconocido: {platform}")
    try:
        return fn(url)
    except HTTPException as exc:
        detail = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
        return _failed(platform, url, 0, detail)
    except (BeeError, peya_parser.ParseError, uber_parser.ParseError, rappi_parser.ParseError, justo_parser.ParseError) as exc:
        fee = CREDITS_PER_BEE if needs_bee_token() and platform != "justo" else 0
        return _failed(platform, url, fee, str(exc))
    except Exception as exc:
        traceback.print_exc()
        return _failed(platform, url, 0, f"Error inesperado: {exc}")


def _prepare_jobs(body: AuditBody) -> list[tuple[str, str, Any]]:
    jobs: list[tuple[str, str, Any]] = []
    for field, (platform, fn) in AUDITORS.items():
        url = _clean_url(getattr(body, field))
        if url:
            jobs.append((platform, url, fn))
    if not jobs:
        raise HTTPException(status_code=400, detail="Pega al menos una URL.")
    needs_remote = any(
        platform != "justo" or not justo_parser.is_tarragona_justo(url)
        for platform, url, _fn in jobs
    )
    if needs_remote and needs_bee_token():
        _require_token()
    return jobs


def _run_audit_job(run_id: str, body: AuditBody) -> None:
    urls = _urls_from_body(body)
    jobs = []
    for field, (platform, _fn) in AUDITORS.items():
        url = urls.get(field) or ""
        if url:
            jobs.append((platform, url))
    results: list[ChannelResult] = []
    try:
        for platform, url in jobs:
            with JOBS_LOCK:
                JOBS[run_id]["step"] = f"Consultando {platform}…"
                JOBS[run_id]["status"] = "running"
            results.append(_run_one_channel(platform, url))
            with JOBS_LOCK:
                JOBS[run_id]["channels"] = [_channel_dict(r) for r in results]
                JOBS[run_id]["credits_used"] = sum(r.credits_used for r in results)

        present = {r.platform for r in results}
        for _field, (platform, _fn) in AUDITORS.items():
            if platform not in present:
                results.append(_skipped(platform))

        payload = {
            "run_id": run_id,
            "status": "done",
            "step": "Listo",
            "credits_estimated": _estimate_credits(body),
            "credits_used": sum(r.credits_used for r in results),
            "channels": [_channel_dict(r) for r in results],
            "urls": urls,
            "error": None,
        }
        _persist_job(run_id, payload)
    except Exception as exc:
        traceback.print_exc()
        with JOBS_LOCK:
            JOBS[run_id]["status"] = "error"
            JOBS[run_id]["step"] = "Error"
            JOBS[run_id]["error"] = str(exc)


def _run_retry_job(run_id: str, platform: str, url: str) -> None:
    try:
        result = _run_one_channel(platform, url)
        job = _load_job(run_id)
        channels = [ch for ch in (job.get("channels") or []) if ch.get("platform") != platform]
        channels.append(_channel_dict(result))
        present = {ch.get("platform") for ch in channels}
        for _field, (name, _fn) in AUDITORS.items():
            if name not in present:
                channels.append(_channel_dict(_skipped(name)))
        urls = dict(job.get("urls") or {})
        field = PLATFORM_FIELD.get(platform, platform)
        urls[field] = url
        payload = {
            "run_id": run_id,
            "status": "done",
            "step": f"Listo ({platform} reintentado)",
            "credits_estimated": _estimate_credits(_body_from_urls(urls)),
            "credits_used": sum(int(ch.get("credits_used") or 0) for ch in channels),
            "channels": channels,
            "urls": urls,
            "error": None,
        }
        _persist_job(run_id, payload)
    except Exception as exc:
        traceback.print_exc()
        with JOBS_LOCK:
            JOBS[run_id]["status"] = "error"
            JOBS[run_id]["step"] = "Error"
            JOBS[run_id]["error"] = str(exc)


@app.post("/api/audit")
def audit(body: AuditBody) -> dict[str, Any]:
    _prepare_jobs(body)
    run_id = uuid.uuid4().hex[:12]
    snapshot = {
        "run_id": run_id,
        "status": "queued",
        "step": "En cola",
        "credits_estimated": _estimate_credits(body),
        "credits_used": 0,
        "channels": [],
        "urls": _urls_from_body(body),
        "error": None,
    }
    with JOBS_LOCK:
        JOBS[run_id] = snapshot
    threading.Thread(target=_run_audit_job, args=(run_id, body), daemon=True).start()
    return _public_job(snapshot)


@app.post("/api/audit/retry")
def retry_channel(body: RetryBody) -> dict[str, Any]:
    platform = FIELD_BY_PLATFORM.get((body.platform or "").strip().lower())
    if not platform:
        raise HTTPException(status_code=400, detail="Canal inválido. Usa peya, uber, rappi o justo.")
    url = _clean_url(body.url)
    run_id = (body.run_id or "").strip() or None
    if run_id:
        job = _load_job(run_id)
        if job.get("status") in {"queued", "running"}:
            raise HTTPException(status_code=409, detail="Esa auditoría todavía está corriendo.")
        if not url:
            field = PLATFORM_FIELD[platform]
            url = _clean_url((job.get("urls") or {}).get(field) or "")
            if not url:
                for channel in job.get("channels") or []:
                    if channel.get("platform") == platform:
                        url = _clean_url(channel.get("source_url") or "")
                        break
    if not url:
        raise HTTPException(status_code=400, detail="Pega la URL de ese canal para reintentar.")
    if (platform != "justo" or not justo_parser.is_tarragona_justo(url)) and needs_bee_token():
        _require_token()
    if not run_id:
        only = AuditBody()
        setattr(only, PLATFORM_FIELD[platform], url)
        return audit(only)
    with JOBS_LOCK:
        JOBS[run_id]["status"] = "running"
        JOBS[run_id]["step"] = f"Reintentando {platform}…"
        JOBS[run_id]["error"] = None
        snapshot = dict(JOBS[run_id])
    threading.Thread(target=_run_retry_job, args=(run_id, platform, url), daemon=True).start()
    return _public_job(snapshot)


@app.get("/api/audit/{run_id}")
def audit_status(run_id: str) -> dict[str, Any]:
    job = _load_job(run_id)
    return _public_job(job)


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
