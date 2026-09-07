"""Smoke V2: público, roles, stock."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app import app  # noqa: E402


def main():
    c = app.test_client()
    assert c.get("/").status_code == 200
    assert c.get("/api/products").status_code == 200
    assert c.get("/portal").status_code == 302
    assert c.get("/admin").status_code == 302

    login_page = c.get("/portal/login")
    html = login_page.get_data(as_text=True)
    token = html.split('name="csrf_token" value="')[1].split('"')[0]
    r = c.post("/portal/login", data={"username": "user", "password": "usuario123", "csrf_token": token, "next": "/portal"}, follow_redirects=False)
    assert r.status_code == 302, r.status_code
    cats = c.get("/portal")
    assert cats.status_code == 200
    assert "Sábanas" in cats.get_data(as_text=True)
    sab = c.get("/portal/c/sabanas")
    assert sab.status_code == 200
    assert "sabana-300" in sab.get_data(as_text=True) or "300 hilos" in sab.get_data(as_text=True)
    denied = c.post("/admin/api/stock", json={"product_id": "sabana-300", "size": "1 plaza", "delta": 1, "motivo": "x"})
    assert denied.status_code in (401, 403)

    c2 = app.test_client()
    login2 = c2.get("/admin/login")
    token2 = login2.get_data(as_text=True).split('name="csrf_token" value="')[1].split('"')[0]
    r2 = c2.post("/admin/login", data={"username": "admin", "password": "cambiar123", "csrf_token": token2, "next": "/admin"})
    assert r2.status_code == 302
    dash = c2.get("/admin")
    assert dash.status_code == 200
    create_denied = c2.post("/portal/api/products", json={"title": "Hack", "category": "X"})
    assert create_denied.status_code in (401, 403)
    mov = c2.post("/admin/api/stock", json={"product_id": "sabana-300", "size": "1 plaza", "delta": 4, "motivo": "ingreso smoke"})
    assert mov.status_code == 200, mov.get_data(as_text=True)
    bad = c2.post("/admin/api/stock", json={"product_id": "sabana-300", "size": "1 plaza", "delta": -99, "motivo": "demasiado"})
    assert bad.status_code == 400
    rep = c2.get("/admin/api/stock/reportes")
    assert rep.status_code == 200
    csv = c2.get("/admin/api/stock/reportes?format=csv")
    assert csv.status_code == 200
    assert b"stock" in csv.data
    print("smoke v2 OK")


if __name__ == "__main__":
    main()
