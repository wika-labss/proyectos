from __future__ import annotations

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent
TOKEN_PATH = ROOT / ".scrapingbee_key"


def load_token() -> str | None:
    env = (os.environ.get("SCRAPINGBEE_API_KEY") or "").strip()
    if env:
        return env
    if TOKEN_PATH.exists():
        value = TOKEN_PATH.read_text(encoding="utf-8").strip()
        return value or None
    return None


def save_token(token: str) -> None:
    cleaned = token.strip()
    if not cleaned:
        raise ValueError("Token vacío.")
    TOKEN_PATH.write_text(cleaned + "\n", encoding="utf-8")
    try:
        TOKEN_PATH.chmod(0o600)
    except OSError:
        pass


def token_configured() -> bool:
    return bool(load_token())


def mask_token(token: str) -> str:
    if len(token) <= 8:
        return "****"
    return token[:4] + "…" + token[-4:]
