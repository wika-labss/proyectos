from __future__ import annotations

from fastapi.testclient import TestClient

INGEST_KEY = "test-ingest-key"


def _peya_xhr() -> list[dict]:
    return [{
        "url": "https://www.pedidosya.cl/v2/niles/partners/abc/menus?occasion=DELIVERY",
        "method": "GET",
        "body": {
            "name": "Local Test",
            "sections": [{
                "name": "Promos",
                "products": [{
                    "id": "1",
                    "name": "Promo Box",
                    "description": "",
                    "enabled": True,
                    "price": {"finalPrice": 5000, "originalPrice": 9990},
                }],
            }],
        },
    }]


def _rappi_xhr() -> list[dict]:
    return [{
        "url": "https://services.rappi.cl/api/web-gateway/web/restaurants-bus/store/id/123/",
        "method": "POST",
        "body": {
            "name": "Local Test",
            "corridors": [{
                "name": "Promos",
                "products": [{
                    "id": "1",
                    "name": "Promo Box Rappi",
                    "description": "",
                    "price": 5000,
                    "real_price": 9990,
                }],
            }],
        },
    }]


def _uber_html() -> str:
    state = (
        '{"queries":[{"queryKey":["getStoreV1"],"state":{"data":{'
        '"title":"Local Test",'
        '"catalogSectionsMap":{"s1":{"catalogName":"Promos","catalogItems":['
        '{"uuid":"u1","title":"Promo Box Uber","itemDescription":"","price":500000,"isAvailable":true}'
        "]}}}}}]}"
    )
    return (
        "<html><head></head><body>"
        f'<script id="__REACT_QUERY_STATE__">{state}</script>'
        "</body></html>"
    )


def _client(tmp_path, monkeypatch, auth: str = "0"):
    import app as appmod

    monkeypatch.setenv("INGEST_KEY", INGEST_KEY)
    monkeypatch.setenv("SCRAPING_TA_AUTH", auth)
    monkeypatch.setattr(appmod, "RUNS_DIR", tmp_path)
    with appmod.JOBS_LOCK:
        appmod.JOBS.clear()
    return TestClient(appmod.app), appmod


def test_ingest_requires_bearer(tmp_path, monkeypatch):
    client, _appmod = _client(tmp_path, monkeypatch)
    res = client.post("/api/ingest", json={
        "platform": "peya",
        "source_url": "https://www.pedidosya.cl/restaurantes/x",
        "body": "<html></html>",
        "xhr": _peya_xhr(),
    })
    assert res.status_code == 401


def test_ingest_missing_key_returns_503(tmp_path, monkeypatch):
    import app as appmod

    monkeypatch.delenv("INGEST_KEY", raising=False)
    monkeypatch.setenv("SCRAPING_TA_AUTH", "0")
    monkeypatch.setattr(appmod, "RUNS_DIR", tmp_path)
    client = TestClient(appmod.app)
    res = client.post(
        "/api/ingest",
        headers={"Authorization": "Bearer nope"},
        json={"platform": "peya", "source_url": "https://www.pedidosya.cl/x", "body": "", "xhr": []},
    )
    assert res.status_code == 503


def test_ingest_peya_creates_run_and_xlsx(tmp_path, monkeypatch):
    client, appmod = _client(tmp_path, monkeypatch)
    res = client.post(
        "/api/ingest",
        headers={"Authorization": f"Bearer {INGEST_KEY}"},
        json={
            "platform": "peya",
            "source_url": "https://www.pedidosya.cl/restaurantes/x",
            "body": "<html></html>",
            "xhr": _peya_xhr(),
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "collecting"
    peya = next(ch for ch in data["channels"] if ch["platform"] == "pedidosya")
    assert peya["item_count"] == 1
    assert peya["skipped"] is False
    assert peya["items"][0]["name"] == "Promo Box"
    assert (tmp_path / f"{data['run_id']}.json").exists()
    assert (tmp_path / f"{data['run_id']}-pedidosya.xlsx").exists()
    assert not (tmp_path / f"{data['run_id']}.xlsx").exists()
    xlsx = client.get(f"/api/report/{data['run_id']}/pedidosya.xlsx")
    assert xlsx.status_code == 200
    assert xlsx.content[:2] == b"PK"
    assert data["xlsx"]["pedidosya"] is True
    assert data["xlsx"]["ubereats"] is False
    assert appmod.JOBS[data["run_id"]]["status"] == "collecting"


def test_create_job_and_ingest_into_run(tmp_path, monkeypatch):
    client, _appmod = _client(tmp_path, monkeypatch)
    created = client.post("/api/jobs", json={})
    assert created.status_code == 200
    job = created.json()
    assert job["status"] == "collecting"
    run_id = job["run_id"]

    active = client.get("/api/jobs/active")
    assert active.status_code == 200
    assert active.json()["run_id"] == run_id

    res = client.post(
        "/api/ingest",
        headers={"Authorization": f"Bearer {INGEST_KEY}"},
        json={
            "job_id": run_id,
            "platform": "rappi",
            "source_url": "https://www.rappi.cl/restaurantes/x",
            "body": "",
            "xhr": _rappi_xhr(),
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["run_id"] == run_id
    rappi = next(ch for ch in data["channels"] if ch["platform"] == "rappi")
    assert rappi["item_count"] == 1
    platforms = [ch["platform"] for ch in data["channels"]]
    assert platforms == ["pedidosya", "ubereats", "rappi"]
    assert (tmp_path / f"{run_id}-rappi.xlsx").exists()
    assert not (tmp_path / f"{run_id}-justo.xlsx").exists()


def test_ingest_uber_react_query(tmp_path, monkeypatch):
    client, _appmod = _client(tmp_path, monkeypatch)
    res = client.post(
        "/api/ingest",
        headers={"Authorization": f"Bearer {INGEST_KEY}"},
        json={
            "platform": "uber",
            "source_url": "https://www.ubereats.com/cl/store/x",
            "body": _uber_html(),
            "xhr": [],
        },
    )
    assert res.status_code == 200
    uber = next(ch for ch in res.json()["channels"] if ch["platform"] == "ubereats")
    assert uber["item_count"] == 1
    assert uber["items"][0]["name"] == "Promo Box Uber"
    assert uber["items"][0]["price_clp"] == 5000


def test_ingest_without_signal_records_error(tmp_path, monkeypatch):
    client, _appmod = _client(tmp_path, monkeypatch)
    res = client.post(
        "/api/ingest",
        headers={"Authorization": f"Bearer {INGEST_KEY}"},
        json={
            "platform": "peya",
            "source_url": "https://www.pedidosya.cl/restaurantes/x",
            "body": "<html>challenge</html>",
            "xhr": [],
        },
    )
    assert res.status_code == 200
    peya = next(ch for ch in res.json()["channels"] if ch["platform"] == "pedidosya")
    assert peya["error"]
    assert peya["item_count"] == 0


def test_ingest_rejects_justo(tmp_path, monkeypatch):
    client, _appmod = _client(tmp_path, monkeypatch)
    res = client.post(
        "/api/ingest",
        headers={"Authorization": f"Bearer {INGEST_KEY}"},
        json={"platform": "justo", "source_url": "https://www.tarragona.cl/pedir", "body": "", "xhr": []},
    )
    assert res.status_code == 400


def test_jobs_active_404_when_empty(tmp_path, monkeypatch):
    client, _appmod = _client(tmp_path, monkeypatch)
    res = client.get("/api/jobs/active")
    assert res.status_code == 404


def test_justo_endpoint_gone(tmp_path, monkeypatch):
    client, _appmod = _client(tmp_path, monkeypatch)
    created = client.post("/api/jobs").json()
    res = client.post(f"/api/jobs/{created['run_id']}/justo", json={"justo": "https://www.tarragona.cl/pedir"})
    assert res.status_code == 404


def test_ingest_works_without_admin_cookie(tmp_path, monkeypatch):
    client, _appmod = _client(tmp_path, monkeypatch, auth="1")
    blocked = client.get("/api/reports")
    assert blocked.status_code == 401
    res = client.post(
        "/api/ingest",
        headers={"Authorization": f"Bearer {INGEST_KEY}"},
        json={
            "platform": "peya",
            "source_url": "https://www.pedidosya.cl/restaurantes/x",
            "body": "",
            "xhr": _peya_xhr(),
        },
    )
    assert res.status_code == 200
    active = client.get("/api/jobs/active", headers={"Authorization": f"Bearer {INGEST_KEY}"})
    assert active.status_code == 200


def test_ingest_cors_preflight(tmp_path, monkeypatch):
    client, _appmod = _client(tmp_path, monkeypatch, auth="1")
    res = client.options(
        "/api/ingest",
        headers={
            "Origin": "chrome-extension://abcdefghijklmnopqrstuvwxyz",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "authorization,content-type",
        },
    )
    assert res.status_code in {200, 204}
    allow = res.headers.get("access-control-allow-origin")
    assert allow in {"*", "chrome-extension://abcdefghijklmnopqrstuvwxyz"}


def test_three_extension_channels_mark_done(tmp_path, monkeypatch):
    client, _appmod = _client(tmp_path, monkeypatch)
    run_id = client.post("/api/jobs").json()["run_id"]
    headers = {"Authorization": f"Bearer {INGEST_KEY}"}
    client.post("/api/ingest", headers=headers, json={
        "job_id": run_id, "platform": "peya",
        "source_url": "https://www.pedidosya.cl/x", "body": "", "xhr": _peya_xhr(),
    })
    client.post("/api/ingest", headers=headers, json={
        "job_id": run_id, "platform": "rappi",
        "source_url": "https://www.rappi.cl/x", "body": "", "xhr": _rappi_xhr(),
    })
    last = client.post("/api/ingest", headers=headers, json={
        "job_id": run_id, "platform": "uber",
        "source_url": "https://www.ubereats.com/x", "body": _uber_html(), "xhr": [],
    })
    assert last.status_code == 200
    assert last.json()["status"] == "done"
    assert client.get("/api/jobs/active").status_code == 404
    assert (tmp_path / f"{run_id}-pedidosya.xlsx").exists()
    assert (tmp_path / f"{run_id}-ubereats.xlsx").exists()
    assert (tmp_path / f"{run_id}-rappi.xlsx").exists()
    assert not (tmp_path / f"{run_id}.xlsx").exists()
