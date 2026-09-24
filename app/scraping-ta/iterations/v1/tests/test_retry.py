from __future__ import annotations

import time

from fastapi.testclient import TestClient

from schema import ChannelResult, ProductRow, utc_now


def _wait_done(client: TestClient, started: dict, attempts: int = 40) -> dict:
    data = started
    run_id = started["run_id"]
    for _ in range(attempts):
        if data.get("status") in {"done", "error"}:
            return data
        time.sleep(0.15)
        data = client.get(f"/api/audit/{run_id}").json()
    return data


def _row(platform: str, url: str, name: str, price: int) -> ProductRow:
    return ProductRow(
        platform=platform,
        store="Tarragona test",
        section="Promos",
        name=name,
        description="",
        price_clp=price,
        price_original_clp=price + 1000,
        available=True,
        source_url=url,
        scraped_at=utc_now(),
    )


def test_retry_peya_without_token_returns_400(monkeypatch):
    import app as appmod

    monkeypatch.setattr(appmod, "load_token", lambda: "")
    client = TestClient(appmod.app)
    res = client.post(
        "/api/audit/retry",
        json={"platform": "peya", "url": "https://www.pedidosya.cl/restaurantes/x"},
    )
    assert res.status_code == 400
    assert "token" in res.json()["detail"].lower()


def test_retry_invalid_platform_returns_400():
    import app as appmod

    client = TestClient(appmod.app)
    res = client.post("/api/audit/retry", json={"platform": "glovo", "url": "https://example.com"})
    assert res.status_code == 400


def test_retry_merges_into_existing_run(monkeypatch):
    import app as appmod

    calls: list[tuple[str, str]] = []

    def fake_one(platform: str, url: str) -> ChannelResult:
        calls.append((platform, url))
        return ChannelResult(
            platform=platform,
            store="Tarragona test",
            source_url=url,
            native_source="test",
            credits_used=0 if platform == "justo" else 75,
            items=[_row(platform, url, f"Item {platform}", 3990)],
        )

    monkeypatch.setattr(appmod, "_run_one_channel", fake_one)
    monkeypatch.setattr(appmod, "load_token", lambda: "test-token")
    client = TestClient(appmod.app)

    started = client.post("/api/audit", json={"justo": "https://www.tarragona.cl/pedir"})
    assert started.status_code == 200
    data = _wait_done(client, started.json())
    assert data["status"] == "done"
    run_id = data["run_id"]
    justo = next(ch for ch in data["channels"] if ch["platform"] == "justo")
    assert justo["item_count"] == 1
    assert not any(ch["platform"] == "pedidosya" and not ch["skipped"] for ch in data["channels"])

    retry = client.post(
        "/api/audit/retry",
        json={
            "platform": "peya",
            "url": "https://www.pedidosya.cl/restaurantes/tarragona-menu",
            "run_id": run_id,
        },
    )
    assert retry.status_code == 200
    merged = _wait_done(client, retry.json())
    assert merged["status"] == "done"
    assert merged["run_id"] == run_id
    platforms = [ch["platform"] for ch in merged["channels"]]
    assert platforms[:4] == ["pedidosya", "ubereats", "rappi", "justo"]
    peya = next(ch for ch in merged["channels"] if ch["platform"] == "pedidosya")
    justo = next(ch for ch in merged["channels"] if ch["platform"] == "justo")
    assert peya["item_count"] == 1
    assert peya["skipped"] is False
    assert justo["item_count"] == 1
    assert merged["credits_used"] == 75
    assert ("pedidosya", "https://www.pedidosya.cl/restaurantes/tarragona-menu") in calls

    xlsx = client.get(f"/api/report/{run_id}.xlsx")
    assert xlsx.status_code == 200
    assert xlsx.content[:2] == b"PK"


def test_retry_while_running_returns_409(monkeypatch):
    import app as appmod

    monkeypatch.setattr(appmod, "load_token", lambda: "test-token")
    client = TestClient(appmod.app)
    run_id = "retry409test"
    with appmod.JOBS_LOCK:
        appmod.JOBS[run_id] = {
            "run_id": run_id,
            "status": "running",
            "step": "Consultando justo…",
            "channels": [],
            "urls": {"justo": "https://www.tarragona.cl/pedir"},
            "error": None,
        }
    res = client.post(
        "/api/audit/retry",
        json={"platform": "justo", "url": "https://www.tarragona.cl/pedir", "run_id": run_id},
    )
    assert res.status_code == 409
