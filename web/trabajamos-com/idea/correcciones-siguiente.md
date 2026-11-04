# Correcciones para las siguientes sesiones — trabajamos.com

Fecha: 3 de noviembre de 2026 (America/Santiago).
Look cerrado en esta jornada: **Look C, tipografía Jakarta, paleta cobalto**. Rama `cursor/look-c-cobalto-listo-aa58`. El look de Fase 2 sigue sin firma.

Este archivo es la lista de trabajo. No cambia `02-features.md` ni `04-html-design.md` (ambos aprobados). Donde una corrección aprieta un contrato ya firmado, está marcada como **delta de gate**: hay que alinearla con Vissiuss antes de codear.

## Qué ya está y no se reabre

- Home de búsqueda, tarjetas con nombre, oficio y contacto, campos opacos, selector de 10 oficios de ejemplo entre «Buscar oficios» y «Crear perfil».
- Marca Vissiuss = imperdible negro (`public/assets/vissiuss-logo.png`) en la cabecera, el splash y la esquina del banner del perfil.
- Panel del emprendedor en `/panel/perfil.html`, `/panel/ofertas.html`, `/panel/portafolio.html`, `/panel/localidad.html`. Cuenta aparte en `/panel/crear-cuenta.html`.
- 64 tests en `iterations/v1`. Conservar ids de Fase 1: `#form-buscar`, `#q`, `#localidad`, `#usar-ubicacion`, `#ubicacion-actual`, `#estado-busqueda`, `#reintentar`, `#resultados`, `#contacto-dato`.

## 1. Interfaz del emprendedor

Archivos: `src/vistas/panel.ts`, `src/vistas/comun.ts` (`cabeceraBanner`), `src/vistas/publico.ts` (`vistaPerfil`), `public/assets/app.css`, `migrations/001_inicial.sql`, `src/datos.ts`.

### 1.1 Barra lateral con las opciones de edición

Hoy el panel **no tiene barra lateral**. En escritorio, `app.css` (media `min-width: 760px`, `body:has(.menu-salir)`) esconde `.tw-nav` y deja solo el botón «Menú». Las secciones (Editar perfil, Ofertas, Portafolio, Localidad, Ver mi perfil público, Salir) viven dentro del cajón `#menu-cajon`, que parte cerrado. En el pantallazo de Localidad se ve ese cajón abierto a la derecha, tapando el contenido, con título «Navegación».

Corrección: en el panel, barra lateral siempre visible en escritorio, con esas mismas opciones y el estado de cada una (publicado / sin ofertas / sin imágenes / localidad sin confirmar). El cajón queda para el ancho chico. El home público no recupera una nav de secciones: ahí siguen los dos botones y el selector de oficios.

### 1.2 Lo guardado tiene que verse en el perfil público

`seccionPublicacion` en el panel lista conteos (nombre, contacto, redes, ofertas, portafolio, localidad) y un enlace «Ver mi perfil público». El perfil público (`vistaPerfil`) muestra nombre, el título de la primera oferta, localidad, contacto, ofertas, imágenes y mapa.

Corrección: después de guardar, el perfil público debe reflejar el dato nuevo sin recargar a mano ni quedar con el valor anterior. Revisar nombre, contacto, redes, cada oferta (título, tipo, `#`), cada imagen del portafolio y la localidad marcada. El resumen del panel debe coincidir con lo que se ve en `/perfil.html?slug=…`.

### 1.3 Portafolio en mosaico de cuadrados

En el perfil público, `.tw-folio` ya es una grilla con `aspect-ratio: 1` y `object-fit: cover`. En el panel, `vistaPortafolio` pinta una lista vertical de `<figure>` a tamaño completo, sin miniaturas.

Corrección: panel y perfil público comparten un mosaico de miniaturas cuadradas. Cada celda muestra la foto recortada al cuadrado, el texto alternativo y, en el panel, el botón Quitar. No estirar la foto ni mostrar el archivo a ancho de página.

### 1.4 Categorías en los oficios

Hoy una oferta tiene `tipo` (`proyecto` | `servicio` | `oficio`), `titulo` y `tag` libre (`#gasfiter`). El selector del home usa diez nombres inventados solo como ejemplo de búsqueda (`OFICIOS_EJEMPLO` en `publico.ts`): Gasfitería, Electricidad, Carpintería, Pintura, Albañilería, Jardinería, Cerrajería, Limpieza, Mudanzas, Maestro chasquilla. No están en la base.

Corrección: catálogo de categorías de oficio. Al publicar una oferta de tipo oficio, el emprendedor elige una categoría de ese catálogo (además del `#`). La misma categoría alimenta el selector del home, para que deje de ser una lista suelta. Definir la lista con Vissiuss antes de migrar; no dejar los diez ejemplos como si ya fueran el catálogo.

### 1.5 Descripción y foto de perfil

`perfiles` no tiene descripción ni foto. En `vistaPerfil` el recuadro de la izquierda (`.tw-profile__photo`) y la esquina del banner usan el mismo PNG de Vissiuss. El texto bajo el nombre es el título de la primera oferta, no un texto del emprendedor.

Corrección, como en el pantallazo marcado:

- El recuadro de la izquierda es la **foto de perfil** del emprendedor. Si no hay foto, un vacío neutro. El imperdible se queda solo como marca (cabecera y esquina del banner).
- Junto al nombre, un **campo de descripción** editable en el panel y visible en el perfil público.
- Subir la foto por el mismo camino que el portafolio: JPEG, PNG o WebP, tope 5 MB, sin datos de ubicación en el archivo.

**Delta de gate:** `FEAT-01` hoy exige nombre y un solo contacto. Descripción y foto son campos nuevos.

## 2. Formulario de registro de perfil

Hoy el alta está partida. `/panel/crear-cuenta.html` pide correo y contraseña. Después, `/panel/perfil.html` pide nombre y **un** medio de contacto (teléfono, correo **o** enlace). Ofertas, portafolio y localidad son pantallas siguientes y pueden quedar vacías. Sin ofertas el perfil existe, pero la búsqueda no lo encuentra. Sin localidad las ofertas no salen como oficios cercanos.

El registro de perfil que sigue debe pedir, en un solo recorrido:

1. Nombre, oficio, contacto y ubicación.
2. Contacto obligatorio por **los dos** canales: correo y teléfono. Los dos se publican. El botón Contactar sigue abriendo un destino (`tel:`, `mailto:` o `https:`); hay que decidir cuál de los dos abre el botón y mostrar el otro como dato copiable.
3. Ofertas: servicios a ofrecer y productos en venta. **Al menos uno** para terminar el registro. El tipo `proyecto | servicio | oficio` de hoy no distingue «producto en venta»; agregarlo o mapearlo, y dejarlo escrito.
4. Portafolio: **al menos una imagen**, con texto alternativo, en el mismo recorrido.

Sin el dato obligatorio, el perfil no queda publicado y el formulario dice qué falta. La cuenta (correo de acceso y contraseña) puede seguir un paso antes; no mezclar la contraseña con el teléfono público.

**Delta de gate:** `FEAT-01` permite un solo medio. `FEAT-02` y `FEAT-03` permiten cero ofertas y cero imágenes. Este formulario los vuelve obligatorios para publicar. Actualizar `02`, `04` y `06-modelo-datos.md` en la misma sesión que el código. Los tests de perfil sin ofertas y sin imágenes hay que reescribirlos a propósito, no romperlos de paso.

## 3. Informativo de la página («Públícate ahora»)

No existe ese botón ni esa página. El CTA actual es «Crear perfil» y lleva a `/panel/entrar.html`.

Corrección: un botón **Públícate ahora** en el home que abre una página informativa **antes** del registro. Cuatro bloques:

1. Cómo funciona la página: el cliente busca por oficio y comuna; el emprendedor publica perfil, ofertas, portafolio y localidad; el contacto sale en el perfil.
2. Normas de la comunidad. Redactarlas con Vissiuss. No inventar un reglamento en el código.
3. Planes disponibles. **Falta crearlos.** Dejar el bloque con un vacío explícito hasta que existan precios y límites. No mostrar planes de ejemplo como si se pudieran contratar.
4. Preguntas frecuentes. **Falta crearlas.** Mismo criterio: sección presente, contenido cuando esté escrito.

Desde esa página, el paso siguiente es crear la cuenta y entrar al formulario de la sección 2.

## Orden sugerido

1. Barra lateral del panel y revisión de que cada guardado se ve en el perfil público (no pide gate nuevo).
2. Mosaico cuadrado del portafolio en el panel (el perfil público ya recorta a cuadrado).
3. Foto de perfil y descripción, con el delta de `FEAT-01` escrito en `02` / `04` / `06`.
4. Categorías de oficio, después de fijar el catálogo.
5. Formulario de registro con contacto doble, una oferta y una imagen.
6. Página «Públícate ahora», con normas, y los huecos de planes y preguntas frecuentes marcados como pendientes de redacción.
