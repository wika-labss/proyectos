# Base de datos — vissiuss.lat

Revisión del servidor en producción, 23 de septiembre de 2026.

---

## Resumen

**No hay contenedor de base de datos.** Ni MySQL, ni PostgreSQL, ni MongoDB.

La base de datos es **SQLite**: un solo archivo, `tienda.db`, de 68 KB, que
vive en el disco del servidor fuera del contenedor. La aplicación lo abre
directamente, como quien abre un documento.

---

## Dónde está

```
~/srv/apps/tienda/datos/          en el disco del servidor
├── tienda.db          68 KB      toda la base de datos
└── media/                        las fotos subidas desde el panel
        │
        └── montado como volumen  →  contenedor "tienda", en /datos
```

Que esté **fuera** del contenedor es deliberado: el contenedor se puede borrar
y reconstruir las veces que haga falta, y los datos siguen ahí intactos.

---

## Los contenedores que hay

Cinco en total, y ninguno es de base de datos.

| Contenedor | Imagen | Qué hace |
|---|---|---|
| `tienda` | propia (FastAPI) | La web de Acolchados: API pública y panel. **SQLite vive aquí dentro** |
| `caddy` | `caddy:2-alpine` | Reparte el tráfico entre la página estática y la aplicación |
| `cloudflared` | `cloudflare/cloudflared` | El túnel que conecta el servidor a internet |
| `mediamtx` | `bluenviron/mediamtx` | El vídeo de la cámara (nada que ver con la web) |
| `control` | propia (FastAPI) | El movimiento de la cámara (nada que ver con la web) |

El contenedor `tienda` **no publica ningún puerto**: solo Caddy puede hablarle.

---

## Por qué SQLite y no un contenedor aparte

La diferencia de fondo: **SQLite no es un servidor**.

MySQL y PostgreSQL son programas que corren aparte, escuchan en un puerto,
tienen sus propios usuarios y contraseñas, y hay que mantenerlos actualizados.
SQLite es una **librería** que ya viene dentro de Python: la aplicación abre
el archivo y listo. No hay proceso extra, ni puerto, ni credenciales.

Para este proyecto es la decisión correcta, por cuatro razones concretas:

| Razón | Por qué pesa aquí |
|---|---|
| **Una sola persona escribe** | El cliente, desde el panel. Los servidores de base de datos existen para coordinar muchos escritores simultáneos; aquí no hay nada que coordinar |
| **El respaldo es copiar un archivo** | Con PostgreSQL haría falta `pg_dump`, credenciales y que el servicio esté levantado |
| **Migrar es copiar ese archivo** | Nada de exportar e importar entre servidores |
| **Un contenedor menos** | Menos que actualizar, menos que vigilar, menos que se pueda caer |

### Cuándo habría que cambiar

Si algún día hubiera **diez personas editando el inventario a la vez**, o si
la base creciera a varios gigabytes, ahí sí convendría un servidor de base de
datos de verdad. Con el uso actual sería complicarse sin ganar nada.

Migrar llegado el caso no es dramático: el esquema es SQL estándar y las
consultas van parametrizadas, así que el cambio se concentra en la función que
abre la conexión.

---

## Qué contiene ahora mismo

| Tabla | Filas | Qué guarda |
|---|---|---|
| `productos` | 26 | El catálogo |
| `variantes` | 98 | Tamaños, medidas, precios y stock de cada producto |
| `categorias` | 4 | Las líneas que filtran el catálogo en la web |
| `movimientos` | 9 | El historial de entradas y salidas de stock |
| `sesiones` | 10 | Las sesiones abiertas del panel |
| `admin` | 1 | La cuenta del panel (contraseña cifrada con PBKDF2) |
| `intentos` | 0 | Los intentos fallidos de acceso, para el bloqueo por IP |

Motor **SQLite 3.46.1**, en modo **WAL** (*write-ahead logging*), que permite
leer mientras se escribe sin que nadie se quede esperando.

> **Nota:** todavía no aparece la tabla `cotizaciones`. El formulario de
> correo está escrito y probado, pero aún no se ha subido al servidor. Lo que
> corre en producción es la versión anterior.

---

## Cuánto ocupa

| Qué | Tamaño |
|---|---|
| **La web entera** (código + base de datos + fotos) | **388 KB** |
| La página estática que sirve Caddy | 108 KB |
| Imagen Docker del contenedor `tienda` | 244 MB |
| Docker en total (6 imágenes) | 583 MB |
| Caché de construcción | 387 MB, de los cuales **72 MB se pueden liberar** |

Los datos del negocio son menos de medio megabyte. Lo que pesa es Python y sus
dependencias dentro de la imagen del contenedor.

Para recuperar los 72 MB de caché que ya no sirven:

```bash
docker builder prune -f
```

---

## Lo que esto implica para el respaldo

Aquí está la ventaja práctica más importante de haber elegido SQLite:
**respaldar la web entera son 388 KB**. Un año completo de respaldos diarios
cabe en unos 140 MB.

Un detalle que sí importa: con el modo WAL activo, **copiar el archivo `.db` a
pelo puede dejar un respaldo corrupto**, porque parte de los datos recién
escritos están todavía en el archivo de registro. Hay que usar el comando
propio de SQLite, que se encarga de dejar una copia consistente:

```bash
sqlite3 datos/tienda.db ".backup copia.db"
```

El respaldo diario automático sigue pendiente. Está detallado en el informe de
seguridad, donde figura como la segunda prioridad de toda la lista.

---

## Migrar al servidor del cliente

Cuando llegue el momento, mudar la base de datos son tres pasos:

1. Parar el contenedor `tienda` en el servidor actual
2. Copiar la carpeta `datos/` completa (base de datos y fotos) al servidor nuevo
3. Levantar el contenedor allí

No hay que exportar, ni importar, ni recrear tablas, ni migrar usuarios. El
procedimiento completo, incluido el dominio y el túnel, está en `MIGRACION.md`.
