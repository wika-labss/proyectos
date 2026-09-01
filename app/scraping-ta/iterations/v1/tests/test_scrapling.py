from __future__ import annotations

from parsers import iter_xhr
from scrapling_fetch import payload_from_page


class _FakeXhr:
    def __init__(self, url: str, method: str, body: bytes, status: int = 200):
        self.url = url
        self.method = method
        self.body = body
        self.status = status


class _FakePage:
    def __init__(self, html: str, xhr: list[_FakeXhr], status: int = 200):
        self.html = html
        self.body = html.encode("utf-8")
        self.captured_xhr = xhr
        self.status = status


def test_scrapling_payload_feeds_peya_iter_xhr():
    menu = b'{"name":"Tarragona","sections":[{"name":"Promos","products":[]}]}'
    page = _FakePage(
        html="<html>ok</html>",
        xhr=[
            _FakeXhr(
                "https://www.pedidosya.cl/v2/niles/partners/abc/menus?occasion=DELIVERY",
                "GET",
                menu,
            )
        ],
    )
    payload = payload_from_page(page)
    assert payload["fetcher"] == "scrapling"
    assert payload["cost"] == 0
    assert payload["body"] == "<html>ok</html>"
    rows = list(iter_xhr(payload))
    assert len(rows) == 1
    url, method, body = rows[0]
    assert "/niles/partners/" in url
    assert method == "GET"
    assert body["name"] == "Tarragona"
    assert isinstance(body["sections"], list)


def test_health_reports_scrapling_fetcher(monkeypatch):
    import app as appmod
    from fastapi.testclient import TestClient

    monkeypatch.setenv("SCRAPING_TA_FETCHER", "scrapling")
    client = TestClient(appmod.app)
    data = client.get("/api/health").json()
    assert data["fetcher"] == "scrapling"
    assert data["needs_bee_token"] is False
