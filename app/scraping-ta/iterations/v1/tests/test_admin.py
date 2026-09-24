from __future__ import annotations

from fastapi.testclient import TestClient


def test_reports_open_when_auth_disabled():
    import app as appmod

    client = TestClient(appmod.app)
    res = client.get("/api/reports")
    assert res.status_code == 200
    assert "reports" in res.json()


def test_login_required_when_auth_enabled(monkeypatch):
    import app as appmod

    monkeypatch.setenv("SCRAPING_TA_AUTH", "1")
    client = TestClient(appmod.app, follow_redirects=False)
    blocked = client.get("/api/reports")
    assert blocked.status_code == 401
    login = client.post("/api/login", json={"username": "admin", "password": "cambiar123"})
    assert login.status_code == 200
    allowed = client.get("/api/reports")
    assert allowed.status_code == 200


def test_login_rejects_bad_password(monkeypatch):
    import app as appmod

    monkeypatch.setenv("SCRAPING_TA_AUTH", "1")
    client = TestClient(appmod.app)
    res = client.post("/api/login", json={"username": "admin", "password": "nope"})
    assert res.status_code == 401


def test_targets_roundtrip(tmp_path, monkeypatch):
    import targets_store as store

    monkeypatch.setattr(store, "TARGETS_PATH", tmp_path / "targets.json")
    saved = store.save_targets({"justo": "https://www.tarragona.cl/pedir", "peya": "https://example.com/peya"})
    assert saved["justo"].endswith("/pedir")
    assert saved["peya"].endswith("/peya")
    assert store.load_targets()["peya"].endswith("/peya")


def test_admin_pages_exist():
    import app as appmod

    client = TestClient(appmod.app)
    home = client.get("/", follow_redirects=True)
    assert home.status_code == 200
    assert "Vissiuss" in home.text
    assert "Nuevo informe" in home.text
    assert "Traer CDN" in home.text
    login = client.get("/login")
    assert login.status_code == 200
    assert "Admin Scraping TA" in login.text
