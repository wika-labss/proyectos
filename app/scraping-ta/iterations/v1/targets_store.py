from __future__ import annotations

import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
TARGETS_PATH = ROOT / "targets.json"

DEFAULT_TARGETS = {
    "peya": "",
    "uber": "",
    "rappi": "",
    "justo": "https://www.tarragona.cl/pedir",
}


def _clean(value: Any) -> str:
    return str(value or "").strip()


def load_targets() -> dict[str, str]:
    data = dict(DEFAULT_TARGETS)
    if TARGETS_PATH.exists():
        try:
            stored = json.loads(TARGETS_PATH.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            stored = {}
        if isinstance(stored, dict):
            for key in DEFAULT_TARGETS:
                if key in stored:
                    data[key] = _clean(stored.get(key))
    return data


def save_targets(payload: dict[str, Any]) -> dict[str, str]:
    data = load_targets()
    for key in DEFAULT_TARGETS:
        if key in payload:
            data[key] = _clean(payload.get(key))
    TARGETS_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return data
