# Reconstruir el contenedor

Hace falta cuando el código de `servidor/` cambió y el contenedor `tienda`
sigue corriendo la imagen anterior. Es el caso de los campos de texto entre
tamaño y precio: la base que ya existe no tiene las columnas `columnas` ni
`extras` hasta que arranca el proceso nuevo.

La carpeta `datos/` no se toca. Ahí están `tienda.db` y las fotos de
`media/`. El volumen del `docker-compose.yml` la vuelve a montar en el
contenedor nuevo.

La página pública no sale de este contenedor. Caddy la lee de
`/srv/static/principal/`. Si cambió `web/index.html`, hay que copiarla
aparte, al final.

---

## Antes

Desde el directorio de la app en el servidor (`~/srv/apps/tienda` o el que
se esté usando):

```bash
tar czf respaldo-$(date +%F).tar.gz datos
```

Ese archivo es la base y las fotos. Si algo sale mal, se vuelve a
descomprimir encima de `datos/`.

No ejecutes `python semilla.py`. Esa carga es solo la primera vez. Con
`--forzar` vuelve a insertar el catálogo de ejemplo encima del real.

---

## Paso 1 · Traer el código

```bash
git pull
```

El `.env` se queda. No hace falta recrearlo: `docker compose` lo vuelve a
leer al crear el contenedor.

---

## Paso 2 · Reconstruir

```bash
docker compose up -d --build
```

Eso construye la imagen de `servidor/`, reemplaza el contenedor `tienda` y
lo deja en la red `proxy`. No publica puertos.

Al arrancar, el proceso revisa la base. Si faltan `columnas` y `extras`,
las agrega. Cada producto queda con el título `Medida` y cada talla
conserva el texto que ya tenía. Precio, stock y fotos siguen donde estaban.
También crea, si no existen, las tablas `cotizaciones` y
`cotizacion_lineas`. No reescribe cotizaciones ya guardadas.

La imagen nueva instala `reportlab` y `pillow`, y lleva el logo dentro de
`servidor/app/logo.png` para la marca de agua del PDF. Sin este
`--build`, la pestaña Cotizaciones no puede generar el archivo.


Comprobar que quedó en marcha:

```bash
docker compose ps
docker compose logs --tail 40 tienda
```

`tienda` tiene que estar `Up`. En el log no debe aparecer un error de
migración ni de `ADMIN_CLAVE`.

---

## Paso 3 · La página, si cambió el HTML

```bash
sudo cp web/index.html /srv/static/principal/index.html
```

Sin esta copia, el panel ya guarda Encimera, Bajera y Funda, pero la ficha
pública sigue mostrando una sola columna Medida.

El logo no cambia en este paso. Si hiciera falta:

```bash
sudo cp web/logo.png /srv/static/principal/logo.png
```

---

## Paso 4 · Comprobar

El catálogo responde y trae `columnas` en cada producto:

```bash
docker exec caddy wget -qO- --header="Host: vissiuss.lat" http://127.0.0.1/api/productos
```

En el panel, abre un producto que ya existía. La tabla sigue siendo
Tamaño, Medida, Precio neto, Stock y Mínimo, con los mismos números. El
botón azul **+ Añadir campo** agrega una columna de texto antes del precio.
Guarda, recarga la ficha en https://vissiuss.lat y confirma que el título
nuevo aparece en la tabla.

Caddy y el túnel no se reinician para esto. Si la API no responde, revisa
que `tienda` y `caddy` sigan en la red `proxy`.
