from __future__ import annotations

import json
from typing import Any, Iterator


def parse_jsonish(value: Any) -> Any:
    if isinstance(value, (dict, list)):
        return value
    if not isinstance(value, str) or not value.strip():
        return None
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return None


def iter_xhr(bee: dict[str, Any]) -> Iterator[tuple[str, str, Any]]:
    for entry in bee.get("xhr") or []:
        if not isinstance(entry, dict):
            continue
        url = str(entry.get("url") or "")
        method = str(entry.get("method") or "")
        body = parse_jsonish(entry.get("body"))
        yield url, method, body
