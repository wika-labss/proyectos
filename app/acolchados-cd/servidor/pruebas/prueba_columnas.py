"""Prueba de las columnas de texto entre tamaño y precio (CAMBIOS.md).

Cubre las dos cosas que pueden salir mal: que una base que YA existía pierda
precios o stock al migrar, y que los títulos y los textos se desalineen.

    python servidor/pruebas/prueba_columnas.py
"""

import os
import shutil
import sqlite3
import sys
import tempfile
from pathlib import Path

CARPETA = Path(tempfile.mkdtemp(prefix="col-prueba-"))
os.environ.update(
    DATOS_DIR=str(CARPETA),
    ADMIN_PATH="prueba-secreta",
    ADMIN_USUARIO="carlos",
    ADMIN_CLAVE="una-clave-larguisima-de-prueba",
    COOKIE_SEGURA="0",
)

# ─── Una base con el esquema VIEJO, como la que está en producción ────────
vieja = sqlite3.connect(CARPETA / "tienda.db")
vieja.executescript(
    """
CREATE TABLE productos (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL,
 descripcion TEXT NOT NULL DEFAULT '', categoria TEXT NOT NULL DEFAULT 'dorm',
 etiqueta TEXT NOT NULL DEFAULT '', imagen TEXT NOT NULL DEFAULT '',
 colores TEXT NOT NULL DEFAULT '[]', notas TEXT NOT NULL DEFAULT '',
 visible INTEGER NOT NULL DEFAULT 1, orden INTEGER NOT NULL DEFAULT 0,
 creado TEXT NOT NULL, actualizado TEXT NOT NULL);
CREATE TABLE variantes (id INTEGER PRIMARY KEY AUTOINCREMENT, producto_id INTEGER NOT NULL,
 tamano TEXT NOT NULL DEFAULT '', medida TEXT NOT NULL DEFAULT '',
 precio INTEGER NOT NULL DEFAULT 0, stock INTEGER NOT NULL DEFAULT 0,
 minimo INTEGER NOT NULL DEFAULT 0, orden INTEGER NOT NULL DEFAULT 0);
INSERT INTO productos (id, nombre, creado, actualizado)
 VALUES (1, 'Plumón de antes', '2026-01-01', '2026-01-01');
INSERT INTO variantes (producto_id, tamano, medida, precio, stock, minimo, orden)
 VALUES (1, '2 plazas', '230 x 240 cm', 34990, 7, 2, 0);
"""
)
vieja.commit()
vieja.close()

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "app"))

from fastapi.testclient import TestClient  # noqa: E402

import main  # noqa: E402

verde, rojo, fin = "\033[92m", "\033[91m", "\033[0m"
fallos = 0


def comprobar(titulo, condicion, detalle=""):
    global fallos
    if condicion:
        print(f"  {verde}ok{fin}   {titulo}")
    else:
        fallos += 1
        print(f"  {rojo}FALLA{fin} {titulo}   {detalle}")


main.preparar()
cliente = TestClient(main.app)
PANEL = "/prueba-secreta"
CAB = {"X-Panel": "1"}
entrar = cliente.post(
    f"{PANEL}/api/entrar",
    json={"usuario": "carlos", "clave": "una-clave-larguisima-de-prueba"},
)
assert entrar.status_code == 200, entrar.text

# ─── La migración no debe tocar lo que ya había ───────────────────────────
print("\n=== Una base que ya existía ===")
with main.bd() as cx:
    p = main.leer_productos(cx, solo_visibles=False)[0]
v = p["variantes"][0]
comprobar("el producto viejo sigue ahí", p["nombre"] == "Plumón de antes")
comprobar("queda con el título Medida", p["columnas"] == ["Medida"], p["columnas"])
comprobar("la medida original se conserva", v["medida"] == "230 x 240 cm", v["medida"])
comprobar("el precio no se movió", v["precio"] == 34990, v["precio"])
comprobar("el stock no se movió", v["stock"] == 7, v["stock"])
comprobar("el mínimo no se movió", v["minimo"] == 2, v["minimo"])
comprobar("extras arranca vacío", v["extras"] == [], v["extras"])

main.preparar()
comprobar("arrancar dos veces no rompe la base", True)

# ─── Crear una sábana con varias columnas ─────────────────────────────────
print("\n=== Una sábana con Encimera, Bajera y Funda ===")
sabana = {
    "nombre": "Sábana de prueba",
    "columnas": ["Medida", "Encimera", "Bajera", "Funda"],
    "variantes": [
        {
            "tamano": "1 plaza",
            "medida": "90 cm",
            "extras": ["150 × 245 cm", "90 × 200 + 25 cm", "1 de 50 × 70 cm"],
            "precio": 25990,
            "stock": 4,
            "minimo": 1,
        }
    ],
}
r = cliente.post(f"{PANEL}/api/productos", headers=CAB, json=sabana)
comprobar("se crea con cuatro columnas", r.status_code == 200, r.text)
nuevo_id = r.json().get("id")

r = cliente.get(f"{PANEL}/api/productos", headers=CAB)
creado = [x for x in r.json()["productos"] if x["id"] == nuevo_id][0]
comprobar("los títulos vuelven en orden",
          creado["columnas"] == ["Medida", "Encimera", "Bajera", "Funda"], creado["columnas"])
comprobar("los tres textos quedaron alineados",
          creado["variantes"][0]["extras"] == ["150 × 245 cm", "90 × 200 + 25 cm", "1 de 50 × 70 cm"],
          creado["variantes"][0]["extras"])

# ─── Quitar una columna ───────────────────────────────────────────────────
print("\n=== Quitar una columna no desalinea el resto ===")
menos = dict(sabana)
menos["columnas"] = ["Medida", "Encimera", "Funda"]
menos["variantes"] = [dict(sabana["variantes"][0], extras=["150 × 245 cm", "1 de 50 × 70 cm"])]
r = cliente.put(f"{PANEL}/api/productos/{nuevo_id}", headers=CAB, json=menos)
comprobar("se puede guardar con una columna menos", r.status_code == 200, r.text)
creado = [x for x in cliente.get(f"{PANEL}/api/productos", headers=CAB).json()["productos"]
          if x["id"] == nuevo_id][0]
comprobar("quedan dos extras, no tres",
          creado["variantes"][0]["extras"] == ["150 × 245 cm", "1 de 50 × 70 cm"],
          creado["variantes"][0]["extras"])

# ─── Los límites ──────────────────────────────────────────────────────────
print("\n=== Los límites del servidor ===")
r = cliente.post(f"{PANEL}/api/productos", headers=CAB, json={
    "nombre": "Muchas columnas",
    "columnas": ["a", "b", "c", "d", "e", "f", "g", "h", "i"],
    "variantes": [],
})
tope = [x for x in cliente.get(f"{PANEL}/api/productos", headers=CAB).json()["productos"]
        if x["nombre"] == "Muchas columnas"][0]
comprobar("nunca guarda más de seis títulos", len(tope["columnas"]) == 6, tope["columnas"])

r = cliente.post(f"{PANEL}/api/productos", headers=CAB, json={
    "nombre": "Títulos en blanco",
    "columnas": ["", "  ", ""],
    "variantes": [],
})
blanco = [x for x in cliente.get(f"{PANEL}/api/productos", headers=CAB).json()["productos"]
          if x["nombre"] == "Títulos en blanco"][0]
comprobar("el primer título vacío vuelve a ser Medida",
          blanco["columnas"][0] == "Medida", blanco["columnas"])
comprobar("los demás vacíos quedan como Campo",
          blanco["columnas"][1:] == ["Campo", "Campo"], blanco["columnas"])

r = cliente.post(f"{PANEL}/api/productos", headers=CAB, json={
    "nombre": "Sobran extras",
    "columnas": ["Medida", "Uno"],
    "variantes": [{"tamano": "x", "medida": "m", "extras": ["a", "b", "c", "d"],
                   "precio": 1, "stock": 0, "minimo": 0}],
})
sobra = [x for x in cliente.get(f"{PANEL}/api/productos", headers=CAB).json()["productos"]
         if x["nombre"] == "Sobran extras"][0]
comprobar("los extras que sobran se recortan",
          sobra["variantes"][0]["extras"] == ["a"], sobra["variantes"][0]["extras"])

# ─── La API pública ───────────────────────────────────────────────────────
print("\n=== Lo que ve la página (y lo que NO debe ver) ===")
publico = cliente.get("/api/productos")
datos = publico.json()
sab = [x for x in datos["productos"] if x["id"] == nuevo_id]
comprobar("la sábana se publica", len(sab) == 1)
if sab:
    comprobar("trae los títulos de las columnas", "columnas" in sab[0], sab[0].keys())
    comprobar("cada tamaño trae sus extras", "extras" in sab[0]["tamanos"][0], sab[0]["tamanos"][0])
    comprobar("y trae el precio", sab[0]["tamanos"][0]["precio"] == 25990)
comprobar("el stock NO sale en la API pública", '"stock"' not in publico.text)
comprobar("las notas internas NO salen", '"notas"' not in publico.text)

viejo = [x for x in datos["productos"] if x["id"] == 1]
comprobar("el producto viejo también trae columnas",
          viejo and viejo[0]["columnas"] == ["Medida"], viejo)

shutil.rmtree(CARPETA, ignore_errors=True)
print(f"\n{rojo if fallos else verde}{'FALLAS: ' + str(fallos) if fallos else 'Todo en orden'}{fin}\n")
sys.exit(1 if fallos else 0)
