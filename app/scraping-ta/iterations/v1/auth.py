from __future__ import annotations

import hashlib
import hmac
import os
import secrets
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SECRET_PATH = ROOT / ".session_secret"
COOKIE_NAME = "sta_admin"
SESSION_TTL_S = 12 * 60 * 60


def auth_enabled() -> bool:
    return os.environ.get("SCRAPING_TA_AUTH", "1").strip() not in {"0", "false", "False"}


def admin_username() -> str:
    return (os.environ.get("ADMIN_USERNAME") or "admin").strip() or "admin"


def admin_password() -> str:
    return os.environ.get("ADMIN_PASSWORD") or "cambiar123"


def _secret() -> str:
    env = (os.environ.get("SCRAPING_TA_SECRET") or "").strip()
    if env:
        return env
    if SECRET_PATH.exists():
        stored = SECRET_PATH.read_text(encoding="utf-8").strip()
        if stored:
            return stored
    value = secrets.token_hex(32)
    SECRET_PATH.write_text(value + "\n", encoding="utf-8")
    try:
        SECRET_PATH.chmod(0o600)
    except OSError:
        pass
    return value


def verify_credentials(username: str, password: str) -> bool:
    user_ok = secrets.compare_digest((username or "").strip(), admin_username())
    pass_ok = secrets.compare_digest(password or "", admin_password())
    return user_ok and pass_ok


def make_session(username: str) -> str:
    exp = int(time.time()) + SESSION_TTL_S
    payload = f"{username}:{exp}"
    sig = hmac.new(_secret().encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{payload}:{sig}"


def read_session(value: str | None) -> str | None:
    if not value or value.count(":") < 2:
        return None
    username, exp_raw, sig = value.rsplit(":", 2)
    try:
        exp = int(exp_raw)
    except ValueError:
        return None
    if exp < int(time.time()):
        return None
    payload = f"{username}:{exp}"
    expected = hmac.new(_secret().encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(sig, expected):
        return None
    return username


def agent_url() -> str:
    return (os.environ.get("SCRAPING_TA_AGENT_URL") or "").strip()
