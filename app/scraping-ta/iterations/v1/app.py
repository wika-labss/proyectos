from __future__ import annotations

import json
import os
import secrets
import threading
import traceback
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, RedirectResponse
from pydantic import BaseModel, Field
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from auth import (
    COOKIE_NAME,
    SESSION_TTL_S,
    admin_username,
    agent_url,
    auth_enabled,
    make_session,
    read_session,
    verify_credentials,
)
from bee import BeeError, credits_of, scrape_once
from excel_report import build_workbook
from parsers import peya as peya_parser
from parsers import rappi as rappi_parser
from parsers import uber as uber_parser
from schema import ChannelResult, ProductRow
from targets_store import load_targets, save_targets
from token_store import load_token, save_token, token_configured

ROOT = Path(__file__).resolve().parent
RUNS_DIR = ROOT / "runs"
STATIC_DIR = ROOT / "static"
CREDITS_PER_BEE = 75

app = FastAPI(title="Scraping TA", version="1.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"chrome-extension://.*",
    allow_methods=["*"],
    allow_headers=["*"],
)

OPEN_PATHS = {"/login", "/api/login", "/api/health"}
# Bearer INGEST_KEY (not admin cookie). Validated in the route.
INGEST_OPEN_PATHS = {"/api/ingest"}
# Session cookie or Bearer INGEST_KEY (extension autofill).
INGEST_OR_SESSION_PATHS = {"/api/jobs/active"}


def ingest_key() -> str:
    return (os.environ.get("INGEST_KEY") or "").strip()


def _bearer_token(request: Request) -> str | None:
    header = request.headers.get("Authorization") or ""
    if header.lower().startswith("bearer "):
        token = header[7:].strip()
        return token or None
    return None


def valid_ingest_bearer(request: Request) -> bool:
    key = ingest_key()
    token = _bearer_token(request)
    if not key or not token:
        return False
    return secrets.compare_digest(token, key)


def require_ingest(request: Request) -> None:
    if not ingest_key():
        raise HTTPException(status_code=503, detail="INGEST_KEY no configurada en el servidor.")
    if not valid_ingest_bearer(request):
        raise HTTPException(status_code=401, detail="Bearer INGEST_KEY inválido.")


class AuthGate(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        if not auth_enabled():
            return await call_next(request)
        if request.method == "OPTIONS":
            return await call_next(request)
        path = request.url.path
        if path in OPEN_PATHS or path in INGEST_OPEN_PATHS:
            return await call_next(request)
        user = read_session(request.cookies.get(COOKIE_NAME))
        if user:
            request.state.user = user
            return await call_next(request)
        if path in INGEST_OR_SESSION_PATHS and valid_ingest_bearer(request):
            return await call_next(request)
        if path.startswith("/api/"):
            return Response(
                content='{"detail":"Sesión requerida."}',
                status_code=401,
                media_type="application/json",
            )
        return RedirectResponse("/login", status_code=303)


app.add_middleware(AuthGate)

JOBS: dict[str, dict[str, Any]] = {}
JOBS_LOCK = threading.Lock()
MERGE_LOCK = threading.Lock()


class TokenBody(BaseModel):
    token: str = Field(min_length=8)


class AuditBody(BaseModel):
    peya: str = ""
    uber: str = ""
    rappi: str = ""


class RetryBody(BaseModel):
    platform: str
    url: str = ""
    run_id: str | None = None


class LoginBody(BaseModel):
    username: str
    password: str


class TargetsBody(BaseModel):
    peya: str = ""
    uber: str = ""
    rappi: str = ""


class IngestBody(BaseModel):
    job_id: str | None = None
    run_id: str | None = None
    platform: str
    source_url: str = ""
    body: str = ""
    xhr: list[Any] = Field(default_factory=list)


FIELD_BY_PLATFORM = {
    "peya": "pedidosya",
    "pedidosya": "pedidosya",
    "uber": "ubereats",
    "ubereats": "ubereats",
    "rappi": "rappi",
}

PLATFORM_FIELD = {
    "pedidosya": "peya",
    "ubereats": "uber",
    "rappi": "rappi",
}

CHANNEL_ORDER = ("pedidosya", "ubereats", "rappi")


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


AUDITORS = {
    "peya": ("pedidosya", _audit_peya),
    "uber": ("ubereats", _audit_uber),
    "rappi": ("rappi", _audit_rappi),
}


def _html(name: str) -> HTMLResponse:
    path = STATIC_DIR / name
    return HTMLResponse(path.read_text(encoding="utf-8"))


@app.get("/", response_class=HTMLResponse)
def index() -> HTMLResponse:
    return _html("admin.html")


@app.get("/admin", response_class=HTMLResponse)
def admin_page() -> HTMLResponse:
    return _html("admin.html")


@app.get("/login", response_model=None)
def login_page(request: Request):
    if auth_enabled() and read_session(request.cookies.get(COOKIE_NAME)):
        return RedirectResponse("/", status_code=303)
    return _html("login.html")


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {
        "ok": True,
        "token_configured": token_configured(),
        "auth": auth_enabled(),
        "ingest_configured": bool(ingest_key()),
    }


@app.get("/api/me")
def me(request: Request) -> dict[str, Any]:
    user = getattr(request.state, "user", None) or read_session(request.cookies.get(COOKIE_NAME))
    if auth_enabled() and not user:
        raise HTTPException(status_code=401, detail="Sesión requerida.")
    return {
        "username": user or "local",
        "auth": auth_enabled(),
        "token_configured": token_configured(),
        "ingest_configured": bool(ingest_key()),
        "agent_url": agent_url(),
    }


@app.post("/api/login")
def login(body: LoginBody) -> JSONResponse:
    if not verify_credentials(body.username, body.password):
        raise HTTPException(status_code=401, detail="Usuario o clave incorrectos.")
    response = JSONResponse({"ok": True, "username": admin_username()})
    response.set_cookie(
        COOKIE_NAME,
        make_session(admin_username()),
        httponly=True,
        samesite="lax",
        max_age=SESSION_TTL_S,
        path="/",
    )
    return response


@app.post("/api/logout")
def logout() -> JSONResponse:
    response = JSONResponse({"ok": True})
    response.delete_cookie(COOKIE_NAME, path="/")
    return response


@app.get("/api/targets")
def get_targets() -> dict[str, Any]:
    return {"targets": load_targets()}


@app.post("/api/targets")
def post_targets(body: TargetsBody) -> dict[str, Any]:
    return {"targets": save_targets(body.model_dump())}


@app.get("/api/reports")
def list_reports() -> dict[str, Any]:
    RUNS_DIR.mkdir(exist_ok=True)
    reports: list[dict[str, Any]] = []
    paths = sorted(RUNS_DIR.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True)
    for path in paths[:50]:
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        run_id = str(data.get("run_id") or path.stem)
        channels = []
        for channel in data.get("channels") or []:
            channels.append({
                "platform": channel.get("platform"),
                "store": channel.get("store"),
                "item_count": channel.get("item_count") or len(channel.get("items") or []),
                "credits_used": channel.get("credits_used") or 0,
                "error": channel.get("error"),
                "skipped": bool(channel.get("skipped")),
                "source_url": channel.get("source_url") or "",
                "has_xlsx": _xlsx_path(run_id, str(channel.get("platform") or "")).exists(),
            })
        mtime = datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc)
        xlsx = _xlsx_flags(run_id)
        reports.append({
            "run_id": run_id,
            "status": data.get("status"),
            "step": data.get("step"),
            "credits_used": data.get("credits_used") or 0,
            "credits_estimated": data.get("credits_estimated") or 0,
            "urls": data.get("urls") or {},
            "channels": channels,
            "xlsx": xlsx,
            "has_xlsx": any(xlsx.values()),
            "updated_at": mtime.replace(microsecond=0).isoformat(),
        })
    return {"reports": reports}


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


def _xlsx_path(run_id: str, platform: str) -> Path:
    plat = FIELD_BY_PLATFORM.get((platform or "").strip().lower(), (platform or "").strip().lower())
    return RUNS_DIR / f"{run_id}-{plat}.xlsx"


def _xlsx_flags(run_id: str) -> dict[str, bool]:
    return {name: _xlsx_path(run_id, name).exists() for name in CHANNEL_ORDER}


def _public_job(job: dict[str, Any]) -> dict[str, Any]:
    payload = json.loads(json.dumps(job))
    run_id = str(payload.get("run_id") or "")
    xlsx = _xlsx_flags(run_id) if run_id else {name: False for name in CHANNEL_ORDER}
    for channel in payload.get("channels") or []:
        items = channel.get("items") or []
        channel["items"] = items[:8]
        if "item_count" not in channel or channel.get("item_count") is None:
            channel["item_count"] = 0 if channel.get("skipped") else len(items)
        plat = str(channel.get("platform") or "")
        channel["has_xlsx"] = bool(xlsx.get(plat))
    payload["xlsx"] = xlsx
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
    }


def _body_from_urls(urls: dict[str, str]) -> AuditBody:
    return AuditBody(
        peya=urls.get("peya") or "",
        uber=urls.get("uber") or "",
        rappi=urls.get("rappi") or "",
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
        if plat == "justo":
            continue
        if plat in CHANNEL_ORDER:
            by_plat[plat] = ch
        else:
            extras.append(ch)
    return [by_plat[name] for name in CHANNEL_ORDER if name in by_plat] + extras


def _persist_job(run_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    RUNS_DIR.mkdir(exist_ok=True)
    payload = dict(payload)
    payload["channels"] = _ordered_channel_dicts(list(payload.get("channels") or []))
    channels = [_result_from_channel(ch) for ch in payload["channels"]]
    for result in channels:
        path = _xlsx_path(run_id, result.platform)
        if result.skipped or result.error or not result.items:
            continue
        path.write_bytes(build_workbook([result]))
    combined = RUNS_DIR / f"{run_id}.xlsx"
    if combined.exists():
        combined.unlink()
    (RUNS_DIR / f"{run_id}.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    with JOBS_LOCK:
        JOBS[run_id] = payload
    return payload


def _placeholder_channels() -> list[dict[str, Any]]:
    return [_channel_dict(_skipped(name)) for name in CHANNEL_ORDER]


def _new_collecting_job(urls: dict[str, str] | None = None) -> dict[str, Any]:
    run_id = uuid.uuid4().hex[:12]
    payload = {
        "run_id": run_id,
        "status": "collecting",
        "step": "Esperando dumps de la extensión",
        "credits_estimated": 0,
        "credits_used": 0,
        "channels": _placeholder_channels(),
        "urls": urls or {"peya": "", "uber": "", "rappi": ""},
        "error": None,
    }
    return _persist_job(run_id, payload)


def _latest_collecting() -> dict[str, Any] | None:
    RUNS_DIR.mkdir(exist_ok=True)
    seen: set[str] = set()
    jobs: list[dict[str, Any]] = []
    with JOBS_LOCK:
        for job in JOBS.values():
            if job.get("status") == "collecting":
                jobs.append(job)
                seen.add(str(job.get("run_id") or ""))
    for path in RUNS_DIR.glob("*.json"):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        rid = str(data.get("run_id") or path.stem)
        if data.get("status") == "collecting" and rid not in seen:
            jobs.append(data)
            seen.add(rid)
    if not jobs:
        return None

    def sort_key(job: dict[str, Any]) -> float:
        rid = str(job.get("run_id") or "")
        path = RUNS_DIR / f"{rid}.json"
        try:
            return path.stat().st_mtime
        except OSError:
            return 0.0

    return max(jobs, key=sort_key)


def _extension_waiting(channels: list[dict[str, Any]]) -> bool:
    filled = 0
    for channel in channels:
        if channel.get("platform") not in {"pedidosya", "ubereats", "rappi"}:
            continue
        if not channel.get("skipped"):
            filled += 1
    return filled < 3


def _parse_ingest(platform: str, source_url: str, bee: dict[str, Any]) -> ChannelResult:
    if platform == "pedidosya":
        try:
            return peya_parser.from_bee(bee, source_url)
        except peya_parser.ParseError as exc:
            return _failed("pedidosya", source_url, 0, str(exc))
    if platform == "ubereats":
        try:
            return uber_parser.from_html(bee.get("body") or "", source_url)
        except uber_parser.ParseError as exc:
            return _failed("ubereats", source_url, 0, str(exc))
    if platform == "rappi":
        try:
            return rappi_parser.from_bee(bee, source_url)
        except rappi_parser.ParseError as exc:
            return _failed("rappi", source_url, 0, str(exc))
    return _failed(platform, source_url, 0, "Canal no soportado por ingest.")


def _merge_result(run_id: str, result: ChannelResult, url_field: str, url: str) -> dict[str, Any]:
    with MERGE_LOCK:
        job = _load_job(run_id)
        channels = [ch for ch in (job.get("channels") or []) if ch.get("platform") != result.platform]
        channels.append(_channel_dict(result))
        present = {ch.get("platform") for ch in channels}
        for name in CHANNEL_ORDER:
            if name not in present:
                channels.append(_channel_dict(_skipped(name)))
        urls = dict(job.get("urls") or {})
        if url:
            urls[url_field] = url
        if job.get("status") == "collecting":
            waiting = _extension_waiting(channels)
            status = "collecting" if waiting else "done"
            step = "Esperando dumps de la extensión" if waiting else "Listo"
        else:
            status = "done"
            step = f"Listo ({result.platform})"
        payload = {
            "run_id": run_id,
            "status": status,
            "step": step,
            "credits_estimated": int(job.get("credits_estimated") or 0) or _estimate_credits(_body_from_urls(urls)),
            "credits_used": sum(int(ch.get("credits_used") or 0) for ch in channels),
            "channels": channels,
            "urls": urls,
            "error": None,
        }
        return _persist_job(run_id, payload)


def _run_one_channel(platform: str, url: str) -> ChannelResult:
    fn = {name: func for name, func in AUDITORS.values()}.get(platform)
    if not fn:
        raise HTTPException(status_code=400, detail=f"Canal desconocido: {platform}")
    try:
        return fn(url)
    except HTTPException as exc:
        detail = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
        return _failed(platform, url, 0, detail)
    except (BeeError, peya_parser.ParseError, uber_parser.ParseError, rappi_parser.ParseError) as exc:
        return _failed(platform, url, CREDITS_PER_BEE, str(exc))
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
        field = PLATFORM_FIELD.get(platform, platform)
        _merge_result(run_id, result, field, url)
    except Exception as exc:
        traceback.print_exc()
        with JOBS_LOCK:
            JOBS[run_id]["status"] = "error"
            JOBS[run_id]["step"] = "Error"
            JOBS[run_id]["error"] = str(exc)


@app.post("/api/audit")
def audit(body: AuditBody) -> dict[str, Any]:
    _prepare_jobs(body)
    save_targets(_urls_from_body(body))
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
        raise HTTPException(status_code=400, detail="Canal inválido. Usa peya, uber o rappi.")
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


@app.post("/api/jobs")
def create_job(body: TargetsBody | None = None) -> dict[str, Any]:
    urls = _urls_from_body(_body_from_urls((body or TargetsBody()).model_dump()))
    if any(urls.values()):
        save_targets(urls)
    return _public_job(_new_collecting_job(urls))


@app.get("/api/jobs/active")
def active_job() -> dict[str, Any]:
    job = _latest_collecting()
    if not job:
        raise HTTPException(status_code=404, detail="No hay un informe en recolección.")
    return _public_job(job)


@app.post("/api/ingest")
def ingest(body: IngestBody, request: Request) -> dict[str, Any]:
    require_ingest(request)
    platform = FIELD_BY_PLATFORM.get((body.platform or "").strip().lower())
    if not platform:
        raise HTTPException(status_code=400, detail="Canal inválido. Usa peya, uber o rappi.")
    source_url = _clean_url(body.source_url)
    bee = {"body": body.body or "", "xhr": list(body.xhr or [])}
    result = _parse_ingest(platform, source_url, bee)
    run_id = (body.job_id or body.run_id or "").strip() or None
    if run_id:
        _load_job(run_id)
    else:
        existing = _latest_collecting()
        if existing:
            run_id = str(existing["run_id"])
        else:
            created = _new_collecting_job()
            run_id = str(created["run_id"])
    field = PLATFORM_FIELD[platform]
    return _public_job(_merge_result(run_id, result, field, source_url))


@app.get("/api/report/{run_id}/{platform}.xlsx")
def download_report(run_id: str, platform: str) -> FileResponse:
    plat = FIELD_BY_PLATFORM.get((platform or "").strip().lower())
    if not plat:
        raise HTTPException(status_code=404, detail="Canal inválido.")
    path = _xlsx_path(run_id, plat)
    if not path.exists():
        raise HTTPException(status_code=404, detail="Informe no encontrado.")
    return FileResponse(
        path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=f"auditoria-{plat}-{run_id}.xlsx",
    )
