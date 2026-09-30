"""Prueba del formulario de cotización, sin tocar el servidor real.

Se corre desde cualquier sitio:

    python servidor/pruebas/prueba_cotizaciones.py

Usa una base de datos temporal y no manda ni un correo de verdad.

El envío de correo se reemplaza por un espía que anota lo que se habría
mandado, así se puede revisar el contenido exacto de los dos mensajes.
"""

import os
import shutil
import sys
import tempfile
from pathlib import Path

CARPETA = Path(tempfile.mkdtemp(prefix="acd-prueba-"))
os.environ.update(
    DATOS_DIR=str(CARPETA),
    ADMIN_PATH="prueba-secreta",
    ADMIN_USUARIO="carlos",
    ADMIN_CLAVE="una-clave-larguisima-de-prueba",
    COOKIE_SEGURA="0",
    SMTP_HOST="smtp.ejemplo",
    SMTP_USUARIO="web@vissiuss.lat",
    SMTP_CLAVE="x",
    CORREO_DESDE="web@vissiuss.lat",
    CORREO_INTERNO="contacto@vissiuss.lat",
)

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "app"))

import correo  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

ENVIADOS = []
correo._enviar = lambda m: ENVIADOS.append(m)

import main  # noqa: E402

main.preparar()   # el ciclo de vida no corre con TestClient suelto
cliente = TestClient(main.app)
PANEL = "/prueba-secreta"

verde, rojo, fin = "\033[92m", "\033[91m", "\033[0m"
fallos = 0


def comprobar(titulo, condicion, detalle=""):
    global fallos
    if condicion:
        print(f"  {verde}ok{fin}   {titulo}")
    else:
        fallos += 1
        print(f"  {rojo}FALLA{fin} {titulo}   {detalle}")


def sembrar():
    entrar = cliente.post(f"{PANEL}/api/entrar",
                          json={"usuario": "carlos", "clave": "una-clave-larguisima-de-prueba"})
    assert entrar.status_code == 200, entrar.text
    for nombre in ["Colcha con fundas", "Plumón acolchado", "Producto oculto"]:
        cliente.post(
            f"{PANEL}/api/productos",
            headers={"X-Panel": "1"},
            json={"nombre": nombre, "descripcion": "x", "categoria": "dorm",
                  "visible": nombre != "Producto oculto",
                  "variantes": [{"tamano": "2 plazas", "precio": 30000}]},
        )
    return cliente.get(f"{PANEL}/api/productos", headers={"X-Panel": "1"}).json()["productos"]


def cotizar(**cambios):
    cuerpo = {"nombre": "María Pérez", "email": "maria@ejemplo.cl",
              "telefono": "+56 9 1234 5678", "productos": [], "mensaje": "Hola"}
    cuerpo.update(cambios)
    return cliente.post("/api/cotizaciones", json=cuerpo)


print("\n=== Preparando ===")
productos = sembrar()
ids = {p["nombre"]: p["id"] for p in productos}
print(f"  {len(productos)} productos de prueba")

print("\n=== Camino feliz: varios productos ===")
ENVIADOS.clear()
r = cotizar(email="maria@ejemplo.cl",
            productos=[ids["Colcha con fundas"], ids["Plumón acolchado"]])
comprobar("responde 200", r.status_code == 200, r.text)
comprobar("salieron 2 correos", len(ENVIADOS) == 2, f"salieron {len(ENVIADOS)}")

al_cliente = next((m for m in ENVIADOS if m["To"] == "maria@ejemplo.cl"), None)
interno = next((m for m in ENVIADOS if m["To"] == "contacto@vissiuss.lat"), None)
comprobar("uno va al cliente", al_cliente is not None)
comprobar("otro va a la casa", interno is not None)

if al_cliente and interno:
    cuerpo_cliente = al_cliente.get_content()
    cuerpo_interno = interno.get_content()
    comprobar("el remitente es nuestro, no el del visitante",
              "web@vissiuss.lat" in al_cliente["From"])
    comprobar("el cliente ve los dos productos",
              "Colcha con fundas" in cuerpo_cliente and "Plumón acolchado" in cuerpo_cliente)
    comprobar("el aviso interno dice quién y qué",
              "María Pérez" in cuerpo_interno and "quiere saber la cotización" in cuerpo_interno)
    comprobar("responder al aviso interno le escribe al cliente",
              interno["Reply-To"] == "maria@ejemplo.cl")

print("\n=== Lo que NO debe pasar ===")

ENVIADOS.clear()
r = cotizar(email="victima@ejemplo.cl",
            mensaje="PINCHA AQUI http://estafa.ru y gana un millon",
            productos=[ids["Colcha con fundas"]])
al_cliente = next((m for m in ENVIADOS if m["To"] == "victima@ejemplo.cl"), None)
comprobar("el texto del visitante NO llega al correo del cliente",
          al_cliente is not None and "estafa.ru" not in al_cliente.get_content())
comprobar("pero sí llega al aviso interno",
          any("estafa.ru" in m.get_content() for m in ENVIADOS if m["To"] == "contacto@vissiuss.lat"))

ENVIADOS.clear()
r = cotizar(email="otra@ejemplo.cl", nombre="Juan\nBcc: miles@de.victimas")
comprobar("inyección de cabeceras: no aparece un Bcc",
          all(m.get("Bcc") is None for m in ENVIADOS), [dict(m.items()) for m in ENVIADOS])
comprobar("inyección de cabeceras: el asunto queda en una sola línea",
          all("\n" not in str(m["Subject"]) for m in ENVIADOS))

ENVIADOS.clear()
r = cotizar(email="trampa@ejemplo.cl", web="soy-un-bot")
comprobar("el campo trampa descarta en silencio",
          r.status_code == 200 and len(ENVIADOS) == 0, f"{r.status_code} / {len(ENVIADOS)}")

for malo in ["no-es-un-correo", "a@b", "con espacio@x.cl", "doble..punto@x.cl", "<a@b.cl>"]:
    r = cotizar(email=malo)
    # 400 lo pone nuestro validador, 422 lo pone Pydantic antes. Los dos rechazan.
    comprobar(f"rechaza el correo {malo!r}", r.status_code in (400, 422), r.status_code)

ENVIADOS.clear()
r = cotizar(email="inventado@ejemplo.cl", productos=[ids["Producto oculto"], 99999])
if r.status_code == 200:
    m = next((m for m in ENVIADOS if m["To"] == "inventado@ejemplo.cl"), None)
    comprobar("un producto oculto o inexistente no se puede citar",
              m is not None and "Producto oculto" not in m.get_content())

print("\n=== Frenos ===")
ENVIADOS.clear()
codigos = [cotizar(email=f"persona{i}@ejemplo.cl").status_code for i in range(6)]
comprobar("la misma IP se frena", 429 in codigos, codigos)

with main.bd() as cx:
    cx.execute("DELETE FROM cotizaciones")
codigos = [cotizar(email="misma@ejemplo.cl").status_code for i in range(4)]
comprobar("el mismo destinatario se frena (anti buzón lleno)", 429 in codigos, codigos)

r = cliente.post("/api/cotizaciones", json={"nombre": "x" * 200, "email": "a@b.cl"})
comprobar("nombre demasiado largo: 422", r.status_code == 422, r.status_code)

r = cliente.post("/api/cotizaciones",
                 headers={"Content-Length": str(5 * 1024 * 1024)},
                 content=b'{"nombre":"a","email":"a@b.cl"}')
comprobar("cuerpo declarado enorme: 413", r.status_code == 413, r.status_code)

print("\n=== El panel ===")
r = cliente.get(f"{PANEL}/api/cotizaciones", headers={"X-Panel": "1"})
comprobar("el panel lista las cotizaciones", r.status_code == 200 and r.json()["cotizaciones"])
if r.status_code == 200 and r.json()["cotizaciones"]:
    uno = r.json()["cotizaciones"][0]
    comprobar("trae los productos como lista", isinstance(uno["productos"], list))
    m = cliente.post(f"{PANEL}/api/cotizaciones/{uno['id']}/estado",
                     headers={"X-Panel": "1"}, json={"estado": "atendida"})
    comprobar("se puede marcar como atendida", m.status_code == 200, m.text)
    m = cliente.post(f"{PANEL}/api/cotizaciones/{uno['id']}/estado",
                     headers={"X-Panel": "1"}, json={"estado": "cualquier-cosa"})
    comprobar("no acepta un estado inventado", m.status_code == 422, m.status_code)

sin_sesion = TestClient(main.app)
r = sin_sesion.get(f"{PANEL}/api/cotizaciones")
comprobar("sin sesión no se ven las cotizaciones", r.status_code == 401, r.status_code)

r = cliente.get("/api/productos")
comprobar("la API pública NO expone cotizaciones", "cotizaciones" not in r.text)

# ─── Sin SMTP configurado (como está producción hoy) ──────────────────────
print("\n=== Si el correo NO está configurado ===")
ENVIADOS.clear()
with main.bd() as cx:
    cx.execute("DELETE FROM cotizaciones")
_host_real = correo.SERVIDOR
correo.SERVIDOR = ""                       # así responde configurado() == False
r = cliente.post("/api/cotizaciones", json={
    "nombre": "Sin Correo", "email": "sincorreo@ejemplo.cl",
    "telefono": "", "productos": [], "otro": True,
    "mensaje": "Quiero una cotización", "web": "", "token": ""})
comprobar("la cotización igual se acepta", r.status_code == 200, r.text)
comprobar("no se manda ningún correo", len(ENVIADOS) == 0, len(ENVIADOS))
comprobar("y avisa a la página que no hay correo",
          r.json().get("correo") is False, r.text)
with main.bd() as cx:
    n = cx.execute("SELECT COUNT(*) c FROM cotizaciones").fetchone()["c"]
comprobar("la cotización NO se pierde: queda en la base", n == 1, n)
correo.SERVIDOR = _host_real
r = cliente.post("/api/cotizaciones", json={
    "nombre": "Con Correo", "email": "concorreo@ejemplo.cl",
    "telefono": "", "productos": [], "otro": True,
    "mensaje": "Otra más", "web": "", "token": ""})
comprobar("con SMTP configurado sí promete confirmación",
          r.json().get("correo") is True, r.text)

print("\n=== Ejemplo del correo que le llega al cliente ===\n")
ENVIADOS.clear()
with main.bd() as cx:
    cx.execute("DELETE FROM cotizaciones")
cotizar(email="ver@ejemplo.cl", nombre="María Pérez",
        productos=[ids["Colcha con fundas"], ids["Plumón acolchado"]])
for m in ENVIADOS:
    print(f"  ┌─ To: {m['To']}   Subject: {m['Subject']}")
    for linea in m.get_content().splitlines():
        print(f"  │ {linea}")
    print("  └────────────────────────────────────────\n")

shutil.rmtree(CARPETA, ignore_errors=True)
print(f"{rojo if fallos else verde}{'FALLAS: ' + str(fallos) if fallos else 'Todo en orden'}{fin}\n")
sys.exit(1 if fallos else 0)
