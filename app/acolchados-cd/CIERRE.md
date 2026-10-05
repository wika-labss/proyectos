# Cierre — versión 4

Quedó en `main` el 5 de octubre de 2026. El pull request
[#111](https://github.com/wika-labss/proyectos/pull/111) está fusionado.

La carpeta de trabajo es `app/acolchados-cd`. `v4/` es la copia completa de
este mismo punto, por si hay que reconstruir o comparar desde ahí.

---

## Mapa

| Para qué | Archivo |
|---|---|
| Qué hace cada función | [`CAMBIOS.md`](CAMBIOS.md) |
| Reconstruir el contenedor en el servidor | [`RECONSTRUIR.md`](RECONSTRUIR.md) |
| Conectar el correo del formulario | [`CONTACTO.md`](CONTACTO.md) |
| Mudar el sitio a otra máquina | [`MIGRACION.md`](MIGRACION.md) |
| Copia congelada | [`v4/`](v4/) |

---

## Qué incluye la versión 4

- Columnas de texto entre tamaño y precio. La primera sigue siendo Medida.
  Las demás (Encimera, Bajera, Funda) se agregan con el botón azul y se
  guardan en `extras`.
- La ficha pública muestra la foto completa y el detalle con scroll.
- El carrito de la página junta varios productos y los manda juntos en el
  formulario. No cotiza por tamaño.
- El panel tiene la pestaña **Cotizaciones**: número `COT-año-0001`, fecha
  de Chile, validez de 15 días, solicitante, nota, líneas del catálogo y
  totales neto, IVA 19 % y total. Esos tres montos se pueden corregir. El
  PDF imprime lo guardado y lleva el logo como marca de agua.

El carrito de la página y la cotización formal no son la misma cosa. El
primero vive en el navegador. La segunda se guarda en la base y baja un PDF.

---

## Cómo se arma una cotización

1. Entra al panel y abre **Cotizaciones**.
2. **+ Nueva cotización**. Revisa número, fecha y validez. Cámbialos si hace
   falta.
3. Completa el solicitante. El nombre es obligatorio.
4. **+ Añadir línea**. Elige producto y tamaño. El detalle sale de las
   columnas de esa talla. Ajusta cantidad y precio neto.
5. Neto, IVA y total se proponen solos al tocar una línea. Si los corriges
   a mano, guarda antes de volver a editar una línea.
6. Guarda. **PDF** descarga el archivo.

Hace falta al menos una línea con producto. Un número repetido no se guarda.

---

## Para dejarlo en el servidor

Sigue [`RECONSTRUIR.md`](RECONSTRUIR.md), en este orden:

1. Respalda `datos/`.
2. `git pull` en el directorio de la app.
3. `docker compose up -d --build`.
4. Si la página pública cambió: `sudo cp web/index.html /srv/static/principal/index.html`.

No corras `semilla.py` en la base real. Las tablas nuevas se crean al
arrancar. Los productos, precios y stock que ya existen se quedan.

La página en producción sigue siendo https://vissiuss.lat. El túnel de
revisión era solo para mirar una base de demostración y no forma parte del
sitio.

---

## Qué queda para otro día

- El formulario de contacto confirma en la página y no envía correo. El
  material está en `CONTACTO.md`.
- No hay pago, pedido, boleta ni despacho.
- En la página no se cotiza una talla suelta. En el PDF formal sí.
