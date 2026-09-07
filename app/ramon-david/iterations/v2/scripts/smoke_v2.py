"""Smoke V2: público, un portal, catálogo, stock, reportes."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app import app  # noqa: E402


def login(client):
    page = client.get("/admin/login")
    html = page.get_data(as_text=True)
    token = html.split('name="csrf_token" value="')[1].split('"')[0]
    res = client.post(
        "/admin/login",
        data={"username": "admin", "password": "cambiar123", "csrf_token": token, "next": "/admin"},
    )
    assert res.status_code == 302, res.status_code
    return client


def main():
    guest = app.test_client()
    assert guest.get("/").status_code == 200
    assert guest.get("/api/products").status_code == 200
    portal = guest.get("/portal")
    assert portal.status_code == 302
    assert portal.headers["Location"].endswith("/admin")
    assert guest.get("/admin").status_code == 302
    denied = guest.post("/admin/api/stock", json={"product_id": "sabana-300", "size": "1 plaza", "delta": 1, "motivo": "x"})
    assert denied.status_code == 401

    c = login(app.test_client())
    home = c.get("/admin")
    assert home.status_code == 200
    html = home.get_data(as_text=True)
    assert "Catálogo" in html and "Stock" in html and "Reportes" in html
    assert "Sábanas" in html

    sab = c.get("/admin/c/sabanas")
    assert sab.status_code == 200
    assert "sabana-300" in sab.get_data(as_text=True) or "300 hilos" in sab.get_data(as_text=True)

    created = c.post("/admin/api/categories", json={"name": "Smoke Cat", "order": 999})
    assert created.status_code == 201, created.get_data(as_text=True)
    cid = created.get_json()["id"]
    renamed = c.put("/admin/api/categories/" + cid, json={"name": "Smoke Cat 2", "order": 999})
    assert renamed.status_code == 200

    prod = c.post("/admin/api/products", json={
        "title": "Smoke producto",
        "category_id": cid,
        "description": "temporal",
        "tables": [{"title": "Precios", "headers": ["Talla", "Valor"], "rows": [["1 plaza", "$ 1"]]}],
    })
    assert prod.status_code == 201, prod.get_data(as_text=True)
    pid = prod.get_json()["id"]
    updated = c.put("/admin/api/products/" + pid, json={
        "title": "Smoke producto editado",
        "category_id": cid,
        "description": "editado",
        "tables": [{"title": "Precios", "headers": ["Talla", "Valor"], "rows": [["1 plaza", "$ 2"]]}],
    })
    assert updated.status_code == 200

    blocked = c.delete("/admin/api/categories/" + cid)
    assert blocked.status_code == 400

    assert c.delete("/admin/api/products/" + pid).status_code == 200
    assert c.delete("/admin/api/categories/" + cid).status_code == 200

    stock_page = c.get("/admin/stock")
    assert stock_page.status_code == 200
    reports_page = c.get("/admin/reportes")
    assert reports_page.status_code == 200

    mov = c.post("/admin/api/stock", json={"product_id": "sabana-300", "size": "1 plaza", "delta": 4, "motivo": "ingreso smoke"})
    assert mov.status_code == 200, mov.get_data(as_text=True)
    bad = c.post("/admin/api/stock", json={"product_id": "sabana-300", "size": "1 plaza", "delta": -99, "motivo": "demasiado"})
    assert bad.status_code == 400
    rep = c.get("/admin/api/stock/reportes")
    assert rep.status_code == 200
    csv = c.get("/admin/api/stock/reportes?format=csv")
    assert csv.status_code == 200
    assert b"stock" in csv.data
    print("smoke v2 OK")


if __name__ == "__main__":
    main()
