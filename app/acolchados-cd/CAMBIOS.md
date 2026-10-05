# Cambios y funciones nuevas

Estos cambios ya están en `main`. Cubren el catálogo (campos entre tamaño y
precio), la ficha pública y la cotización de varios productos.

El correo del formulario sigue en [`CONTACTO.md`](CONTACTO.md). La
reconstrucción del contenedor está en [`RECONSTRUIR.md`](RECONSTRUIR.md).

---

## Qué cambió

| Área | Antes | Ahora |
|---|---|---|
| Panel, tabla de tallas | Tamaño, una columna Medida, precio, stock | Medida sigue. Se pueden sumar columnas de texto antes del precio |
| Ficha pública | La foto llenaba la columna recortada y el detalle se cortaba | La foto entra completa y el detalle tiene scroll |
| Cotización | «Cotizar este producto» llevaba un solo nombre al formulario | «Agregar a cotización» junta varios productos y los manda juntos |
| Cotización por tamaño | Se probó un botón Agregar en cada fila | Se quitó: comprimía Tamaño, Encimera, Bajera, Funda y Valor neto |

---

## Panel: campos entre tamaño y precio

En el editor de producto, la primera columna de texto sigue llamándose
**Medida** y su título se puede editar. El botón azul **+ Añadir campo**
inserta otra columna en todas las tallas, justo antes de Precio neto.
Hasta seis títulos. Cada columna extra se quita con ×; la primera no.

Sirve para una sábana:

| Tamaño | Encimera | Bajera | Funda | Precio neto |
|---|---|---|---|---|
| 1 plaza | 150 × 245 cm | 90 × 200 + 25 cm | 1 de 50 × 70 cm | … |

Un plumón se queda con una sola columna Medida. Precio, stock y mínimo no
se mueven. El stock sigue siendo uno por tamaño.

En la base:

| Dónde | Campo | Qué guarda |
|---|---|---|
| `productos` | `columnas` | Títulos, por ejemplo `["Encimera","Bajera","Funda"]`. Si falta, `["Medida"]` |
| `variantes` | `medida` | El texto de la primera columna. Los productos viejos no se reescriben |
| `variantes` | `extras` | Los textos de las columnas que se agregan después |

Al arrancar, si la base ya existía, se agregan esas dos columnas vacías.
Los precios y el stock quedan donde estaban.

### Funciones del servidor

En `servidor/app/main.py`:

| Función | Qué hace |
|---|---|
| `lista_json` | Lee un JSON guardado como texto. Si está vacío o roto, devuelve la lista por defecto |
| `columnas_de` | Limpia los títulos: máximo 6, 40 caracteres. El primero vacío vuelve a «Medida»; los demás, a «Campo» |
| `guardar_variantes` | Borra y vuelve a escribir las tallas. `medida` es la primera columna; `extras` son las siguientes, alineadas con los títulos |
| `leer_productos` | Devuelve `columnas` en el producto y `extras` en cada talla |
| `productos_publicos` | Publica `columnas` y, en cada tamaño, `medida`, `extras` y `precio`. El stock no sale |

`crear_producto` y `editar_producto` guardan `columnas` junto con el resto
del producto.

---

## Ficha pública

En `web/index.html`:

- El cuadro de la ficha mide como máximo el alto de la pantalla. El texto
  de la derecha se desplaza con scroll.
- La foto usa un alto definido (`min(78vh, 640px)` en escritorio,
  `min(32vh, 220px)` en pantallas chicas) y `object-fit: contain`. Se ve
  entera. El archivo de la imagen no se modifica.
- La tabla arma las columnas con `columnas`. Si el producto solo tiene
  Medida, la tabla sigue siendo Tamaño, Medida, Valor neto.

---

## Cotización

El botón de la ficha dice **Agregar a cotización**. Suma el producto
completo, una sola vez. No hay botón por tamaño.

Aparece un botón fijo **Cotización** con la cantidad, encima de WhatsApp.
Ahí se ve la lista y se puede quitar un ítem. La misma lista sale en el
formulario de contacto, arriba del selector de producto.

Al enviar, los nombres van juntos en el campo oculto `cotizacion`, uno por
línea. El aviso confirma cuántos productos se incluyeron. La lista se borra
después de enviar.

La lista vive en el navegador (`sessionStorage`, clave `acd-coti`). No se
guarda en el servidor. Recargar la página no la pierde; cerrar el navegador,
sí.

### Funciones en la página

| Función | Qué hace |
|---|---|
| `agregarCoti` | Añade el producto si todavía no está |
| `enCoti` | Dice si ese producto ya está en la lista |
| `guardarCoti` | Escribe la lista en `sessionStorage` |
| `pintarCoti` | Actualiza el botón, el panel, la lista del formulario y el campo `cotizacion`. Si la ficha está abierta, el botón pasa a «Agregado» |

---

## Cotizaciones formales (PDF)

En el panel hay una pestaña **Cotizaciones**. No es el carrito de la página:
esa lista sigue viviendo solo en el navegador. Esta se guarda en la base y
baja un PDF.

Al crear una, el servidor propone:

| Campo | Valor inicial | Se puede cambiar |
|---|---|---|
| Número | `COT-2026-0001`, correlativo del año | Sí |
| Fecha | Hoy, hora de Chile | Sí |
| Validez | 15 días | Sí |
| Nota | Valores netos, medidas especiales aparte | Sí |
| Neto, IVA 19 %, total | Cero hasta que hay líneas. Al editar una línea se recalculan desde cantidad × precio neto | Sí. El PDF imprime los montos guardados, no los vuelve a calcular |

El solicitante lleva nombre, empresa, teléfono y correo. Cada línea elige un
producto del catálogo, un tamaño, el detalle (Medida y las columnas extra,
por ejemplo Encimera / Bajera / Funda), la cantidad y el precio neto.

El PDF usa el logo de Acolchados CD como marca de agua, tenue, en todas las
hojas, y el pie con San José 5887, San Miguel, el teléfono y el correo.

En la base: `cotizaciones` y `cotizacion_lineas`. Se crean al arrancar el
servicio, igual que el resto de las tablas. Para verlo en el servidor hay
que reconstruir el contenedor, como en [`RECONSTRUIR.md`](RECONSTRUIR.md):
entran reportlab y pillow, y el logo va dentro de la imagen del servicio.

### Funciones

| Dónde | Qué hace |
|---|---|
| `numero_siguiente` | Arma el siguiente `COT-año-0001` |
| `hoy_chile` | Fecha de hoy en `America/Santiago` |
| `generar_pdf` | Dibuja el PDF con los totales guardados y la marca de agua |
| `abrirCotizacion` | Editor del panel. Al cambiar una línea vuelve a proponer neto, IVA y total |
| `bajarPdf` | Descarga el archivo con la sesión del panel |

---

## Qué no hace todavía

- El formulario de la página no envía correo. Confirma en la página. El paso
  del SMTP está en `CONTACTO.md`.
- No hay pago, pedido ni despacho. Sigue siendo cotización, no tienda.
- En la página pública no se cotiza una talla suelta. En el PDF formal sí:
  cada línea elige un tamaño.
