from __future__ import annotations

import json
from pathlib import Path

import pytest

from excel_report import build_workbook, normalize_name
from parsers import justo as justo_parser
from parsers import peya as peya_parser
from parsers import rappi as rappi_parser
from parsers import uber as uber_parser
from schema import ChannelResult, ProductRow, utc_now

PEYA = Path("/tmp/peya-bee/menu-xhr-alameda.json")
PEYA_BEE = Path("/tmp/peya-bee/xhr-alameda.json")
UBER_HTML = Path("/tmp/uber-bee/xhr-raw.json")
RAPPI = Path("/tmp/rappi-bee/store-raw.json")
RAPPI_BEE = Path("/tmp/rappi-bee/xhr-raw.json")
JUSTO = Path("/tmp/tarragona-bee/webdata-_v1_websites_hPy8jxhEz4yWPb8qr_menus_PZKKxcPg44sL2gRxX.json")


def test_normalize_name_strips_accents_and_noise():
    assert normalize_name("Promo  Box Recargado🍗") == "promo box recargado"


def test_peya_native_menu():
    if not PEYA.exists():
        pytest.skip("dump Peya no disponible")
    menu = json.loads(PEYA.read_text())
    result = peya_parser.parse_menu(menu, "https://www.pedidosya.cl/example")
    assert result.item_count >= 60
    bowl = next(p for p in result.items if p.name == "Bowl Irresistible")
    assert bowl.price_clp == 6000
    assert bowl.price_original_clp == 8190


def test_peya_from_bee_xhr():
    if not PEYA_BEE.exists():
        pytest.skip("dump Bee Peya no disponible")
    bee = json.loads(PEYA_BEE.read_text())
    result = peya_parser.from_bee(bee, "https://www.pedidosya.cl/example")
    assert result.item_count >= 60


def test_uber_catalog_includes_list_price():
    if not UBER_HTML.exists():
        pytest.skip("dump Uber no disponible")
    bee = json.loads(UBER_HTML.read_text())
    result = uber_parser.from_html(bee["body"], "https://www.ubereats.com/store/example")
    assert result.store.startswith("Tarragona")
    assert result.native_source.startswith("__REACT_QUERY_STATE__")
    assert result.item_count >= 60
    dupla = next(p for p in result.items if p.name == "Dupla Box Sandwich Clasicos")
    assert dupla.price_clp == 11990
    assert dupla.price_original_clp == 18590
    box = next(p for p in result.items if p.name == "Promo Box Recargado")
    assert box.price_clp == 5000
    assert box.price_original_clp is not None
    assert box.price_original_clp > box.price_clp
    discounted = [p for p in result.items if p.price_original_clp]
    assert len(discounted) >= 10


def test_rappi_store_and_discount():
    if not RAPPI.exists():
        pytest.skip("dump Rappi no disponible")
    store = json.loads(RAPPI.read_text())
    result = rappi_parser.parse_store(store, "https://www.rappi.cl/example")
    assert result.item_count >= 50
    promo = next(p for p in result.items if p.name == "Promo Box Recargado RAPPI")
    assert promo.price_clp == 6000
    assert promo.price_original_clp == 12090


def test_rappi_from_bee_xhr():
    if not RAPPI_BEE.exists():
        pytest.skip("dump Bee Rappi no disponible")
    bee = json.loads(RAPPI_BEE.read_text())
    result = rappi_parser.from_bee(bee, "https://www.rappi.cl/example")
    assert result.item_count >= 50


def test_justo_cdn_payload():
    if not JUSTO.exists():
        pytest.skip("dump Justo no disponible")
    payload = json.loads(JUSTO.read_text())
    result = justo_parser.parse_menu_payload(payload, "https://www.tarragona.cl/pedir")
    assert result.item_count >= 59
    promo = next(p for p in result.items if p.name == "Promo Box Recargado")
    assert promo.price_clp == 3990
    assert promo.price_original_clp == 9990
    assert promo.section.startswith("Dias Full")


def test_excel_has_three_sheets():
    rows = [
        ProductRow(
            platform="pedidosya",
            store="A",
            section="Promos",
            name="Promo Box Recargado",
            description="",
            price_clp=5000,
            price_original_clp=9990,
            available=True,
            source_url="u1",
            scraped_at=utc_now(),
        ),
        ProductRow(
            platform="justo",
            store="B",
            section="Promos",
            name="Promo Box Recargado",
            description="",
            price_clp=3990,
            price_original_clp=9990,
            available=True,
            source_url="u2",
            scraped_at=utc_now(),
        ),
    ]
    channels = [
        ChannelResult("pedidosya", "A", "u1", "xhr", items=[rows[0]]),
        ChannelResult("justo", "B", "u2", "cdn", items=[rows[1]]),
    ]
    data = build_workbook(channels)
    assert data[:2] == b"PK"
    assert len(data) > 1000


def test_tarragona_url_detection():
    assert justo_parser.is_tarragona_justo("https://www.tarragona.cl/pedir")
    assert not justo_parser.is_tarragona_justo("https://otro.getjusto.com/pedir")


def test_audit_job_polls_to_done():
    import time
    from fastapi.testclient import TestClient
    from app import app

    client = TestClient(app)
    started = client.post("/api/audit", json={"justo": "https://www.tarragona.cl/pedir"})
    assert started.status_code == 200
    body = started.json()
    assert body["status"] in {"queued", "running", "done"}
    run_id = body["run_id"]
    data = body
    for _ in range(30):
        if data.get("status") in {"done", "error"}:
            break
        time.sleep(0.3)
        data = client.get(f"/api/audit/{run_id}").json()
    assert data["status"] == "done"
    justo = next(ch for ch in data["channels"] if ch["platform"] == "justo")
    assert justo["item_count"] >= 50
    xlsx = client.get(f"/api/report/{run_id}.xlsx")
    assert xlsx.status_code == 200
    assert xlsx.content[:2] == b"PK"
