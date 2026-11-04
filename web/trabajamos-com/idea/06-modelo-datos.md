---
id: "WEB-DATA-001"
title: "trabajamos.com — Modelo de datos"
status: "APROBADO"
version: "0.1.1"
owner: "Vissiuss"
created_at: "2026-11-02"
updated_at: "2026-11-04"
motor: "PostgreSQL 16 + PostGIS 3"
---

# [06] Modelo de datos — trabajamos.com

> Fuente de verdad del esquema. Las migraciones ejecutables son `iterations/v1/migrations/001_inicial.sql` y `002_registro_perfil.sql`. El esquema resultante debe coincidir con este documento.  
> Contrato de vistas: `04-html-design.md` §6. Módulos: `03-module-discovery.md`.  
> **v0.1.1 (2026-11-04):** delta de gate del registro, sin firma nueva. `perfiles` guarda `telefono` y `correo_publico` (ya no un solo `contacto_tipo` + `contacto_valor`). `oferta_tipo` suma `producto`. Un perfil es público solo con teléfono, correo, al menos una oferta y al menos una imagen.

## 1. Extensiones

| Extensión | Para qué |
| :--- | :--- |
| `postgis` | Tipo `geography(Point, 4326)`, distancia en metros y búsqueda por cercanía con índice GIST |
| `citext` | Correo sin distinguir mayúsculas |
| `pgcrypto` | `gen_random_uuid()` |

## 2. Diagrama

```mermaid
erDiagram
  usuarios ||--o{ sesiones : abre
  usuarios ||--o| perfiles : tiene
  perfiles ||--o{ redes : publica
  perfiles ||--o{ ofertas : publica
  perfiles ||--o{ imagenes : publica
  usuarios {
    uuid id PK
    citext correo UK
    text password_hash
  }
  sesiones {
    text token_hash PK
    uuid usuario_id FK
    timestamptz expira_en
  }
  perfiles {
    uuid id PK
    uuid usuario_id FK
    text slug UK
    text nombre
    text telefono
    citext correo_publico
    geography punto
    text punto_etiqueta
  }
  redes {
    uuid id PK
    uuid perfil_id FK
    text nombre
    text url
  }
  ofertas {
    uuid id PK
    uuid perfil_id FK
    oferta_tipo tipo
    text titulo
    text tag
  }
  imagenes {
    uuid id PK
    uuid perfil_id FK
    text archivo
    text alt
  }
  geocache {
    text clave PK
    jsonb respuesta
  }
```

## 3. Tipos

| Tipo | Valores | Contrato `04` |
| :--- | :--- | :--- |
| `oferta_tipo` | `proyecto`, `servicio`, `oficio`, `producto` | `Oferta.tipo` |

`producto` es una oferta de algo en venta. `002_registro_perfil.sql` lo agrega con `ALTER TYPE oferta_tipo ADD VALUE`. No se usa en la misma transacción que lo crea.

El enum `contacto_tipo` de `001` se elimina en `002`. El enlace `https://` no es un contacto: queda en `redes`. Si una fila vieja tenía `contacto_tipo = url`, `002` copia esa URL a una red llamada `Sitio`.

## 4. Tablas

### `usuarios` (`MOD-06`)

| Columna | Tipo | Regla |
| :--- | :--- | :--- |
| `id` | `uuid` PK | `gen_random_uuid()` |
| `correo` | `citext` | `NOT NULL UNIQUE`, check de formato básico |
| `password_hash` | `text` | `NOT NULL`. argon2id (`$argon2id$…`). Nunca se guarda la contraseña. |
| `intentos_fallidos` | `integer` | `NOT NULL DEFAULT 0` |
| `bloqueado_hasta` | `timestamptz` | `NULL`. Tras 5 intentos fallidos se bloquea 15 minutos. |
| `creado_en` | `timestamptz` | `NOT NULL DEFAULT now()` |
| `ultimo_acceso_en` | `timestamptz` | `NULL` |

### `sesiones` (`MOD-06`)

| Columna | Tipo | Regla |
| :--- | :--- | :--- |
| `token_hash` | `text` PK | SHA-256 del token de la cookie. La cookie lleva el token; la base solo el hash. |
| `usuario_id` | `uuid` | `NOT NULL` FK `usuarios(id) ON DELETE CASCADE` |
| `creado_en` | `timestamptz` | `NOT NULL DEFAULT now()` |
| `expira_en` | `timestamptz` | `NOT NULL`. 7 días desde el último uso. |

Índice: `sesiones(usuario_id)`.

### `perfiles` (`MOD-01`, `MOD-04`)

| Columna | Tipo | Regla |
| :--- | :--- | :--- |
| `id` | `uuid` PK | |
| `usuario_id` | `uuid` | `NOT NULL UNIQUE` FK `usuarios(id) ON DELETE CASCADE`. Un perfil por cuenta. |
| `slug` | `text` | `NOT NULL UNIQUE`, `^[a-z0-9]+(-[a-z0-9]+)*$`. Se genera al crear y no cambia. |
| `nombre` | `text` | `NOT NULL`, 1 a 120 caracteres sin espacios sobrantes |
| `telefono` | `text` | Teléfono público. `NULL` solo en filas viejas a medias: esas no son públicas. En un perfil publicado, 1 a 40 caracteres ya recortados, con código de país (D-01) |
| `correo_publico` | `citext` | Correo que ve el cliente. Distinto de `usuarios.correo` (acceso) y de la contraseña. `NULL` solo en filas viejas a medias. En un perfil publicado, formato de correo, hasta 254 caracteres (D-01) |
| `punto` | `geography(Point, 4326)` | `NULL` = sin localidad confirmada. No bloquea la publicación |
| `punto_etiqueta` | `text` | `NULL`. Check: `(punto IS NULL) = (punto_etiqueta IS NULL)` (D-08) |
| `creado_en`, `actualizado_en` | `timestamptz` | `NOT NULL DEFAULT now()` |

Índice: GIST en `punto`.

### `redes` (`MOD-01`)

| Columna | Tipo | Regla |
| :--- | :--- | :--- |
| `id` | `uuid` PK | (D-09) |
| `perfil_id` | `uuid` | `NOT NULL` FK `perfiles(id) ON DELETE CASCADE` |
| `nombre` | `text` | `NOT NULL`, 1 a 60 caracteres |
| `url` | `text` | `NOT NULL`, empieza con `https://` |
| `orden` | `integer` | `NOT NULL` |
| `creado_en` | `timestamptz` | `NOT NULL DEFAULT now()` |

Índice: `redes(perfil_id, orden)`.

### `ofertas` (`MOD-02`)

| Columna | Tipo | Regla |
| :--- | :--- | :--- |
| `id` | `uuid` PK | (D-09) |
| `perfil_id` | `uuid` | `NOT NULL` FK `perfiles(id) ON DELETE CASCADE` |
| `tipo` | `oferta_tipo` | `NOT NULL`. `proyecto`, `servicio`, `oficio` o `producto` (producto en venta) |
| `titulo` | `text` | `NOT NULL`, 1 a 120 caracteres (D-07) |
| `tag` | `text` | `NOT NULL`. Check: empieza con un solo `#` seguido de un carácter que no es espacio, sin espacio al final ni espacios dobles, hasta 61 caracteres (`#` + 60). Las minúsculas las asegura la aplicación con la regla única de `04` §3.3 (`toLocaleLowerCase("es-CL")`); la base no lo repite porque `lower()` depende del locale del servidor. |
| `creado_en` | `timestamptz` | `NOT NULL DEFAULT now()` |

Índices: `ofertas(tag)`, `ofertas(perfil_id, creado_en)`.

### `imagenes` (`MOD-03`)

| Columna | Tipo | Regla |
| :--- | :--- | :--- |
| `id` | `uuid` PK | (D-09) |
| `perfil_id` | `uuid` | `NOT NULL` FK `perfiles(id) ON DELETE CASCADE` |
| `archivo` | `text` | `NOT NULL UNIQUE`. Ruta relativa dentro de `UPLOADS_DIR`: `{perfil_id}/{id}.webp` |
| `alt` | `text` | `NOT NULL`, 1 a 300 caracteres |
| `ancho`, `alto` | `integer` | `NOT NULL` |
| `bytes` | `integer` | `NOT NULL` |
| `creado_en` | `timestamptz` | `NOT NULL DEFAULT now()` |

Índice: `imagenes(perfil_id, creado_en)`.

### `geocache` (`MOD-04`)

| Columna | Tipo | Regla |
| :--- | :--- | :--- |
| `clave` | `text` PK | `directa:{texto en minúsculas}` o `inversa:{lat con 4 decimales},{lng con 4 decimales}` |
| `respuesta` | `jsonb` | `NOT NULL`. Lista de `{ lat, lng, etiqueta }` o `{ etiqueta }` |
| `creado_en` | `timestamptz` | `NOT NULL DEFAULT now()`. Vigencia: 30 días. |

### `schema_migrations`

| Columna | Tipo | Regla |
| :--- | :--- | :--- |
| `version` | `text` PK | Nombre del archivo de migración |
| `aplicada_en` | `timestamptz` | `NOT NULL DEFAULT now()` |

## 5. Consultas clave

**Búsqueda de cercanos (`MOD-05`, `VIEW-04`).** Usa el índice GIST con el operador `<->` y devuelve la distancia en km:

```sql
SELECT o.id, o.tipo, o.titulo, o.tag, p.slug, p.nombre, p.telefono, p.correo_publico,
       ST_Distance(p.punto, ST_MakePoint($lng, $lat)::geography) / 1000.0 AS distancia_km
FROM ofertas o
JOIN perfiles p ON p.id = o.perfil_id
WHERE o.tag = $tag AND p.punto IS NOT NULL
  AND p.telefono IS NOT NULL AND btrim(p.telefono) <> ''
  AND p.correo_publico IS NOT NULL AND btrim(p.correo_publico::text) <> ''
  AND EXISTS (SELECT 1 FROM imagenes i WHERE i.perfil_id = p.id)
  AND EXISTS (SELECT 1 FROM ofertas pub WHERE pub.perfil_id = p.id)
ORDER BY p.punto <-> ST_MakePoint($lng, $lat)::geography, p.nombre
LIMIT 100;
```

**Perfil público.** `perfil.html?slug=` usa el mismo filtro (teléfono, correo, al menos una oferta y al menos una imagen). Sin eso, la respuesta es "Perfil no disponible".

**Distinguir los dos vacíos (D-04).** Si la consulta no trae filas, un `EXISTS` del mismo `#` sobre perfiles publicados separa "No encontramos #xyz" de "Ninguna oferta de #xyz tiene localidad marcada".

## 6. Reglas de integridad que vive en la aplicación

- Normalización del `#` (`04` §3.3). La base valida la forma, no las tildes.
- Teléfono público en formato internacional (`+` y 8 a 15 dígitos) y correo público con formato válido. Los dos se guardan. Enlaces `https://` completos, como red.
- Un perfil publicado no se queda sin ofertas ni sin imágenes: la aplicación no quita la última.
- La ubicación no es requisito de publicación. Sin `punto`, la oferta existe y no entra a cercanos.
- Archivo de imagen real (lo abre `sharp`), máximo 5 MB.
- Bloqueo tras intentos fallidos y token CSRF.

## 7. Al salir del servidor de prueba

| Tema | En QA | En producción |
| :--- | :--- | :--- |
| Base de datos | Contenedor `postgis/postgis` con volumen local | PostgreSQL gestionado con PostGIS, respaldos automáticos y recuperación a un punto en el tiempo. El esquema se migra tal cual con `npm run migrate`. |
| Respaldos | `scripts/backup.sh` (`pg_dump` + carpeta de imágenes) | Respaldo gestionado y copia fuera del servidor |
| Imágenes | Carpeta `UPLOADS_DIR` en el disco | Almacenamiento de objetos compatible con S3 y CDN. `imagenes.archivo` pasa a ser la clave del objeto; la tabla no cambia. |
| Geocodificación | Nominatim público (1 consulta por segundo) | Nominatim propio o un proveedor de pago. Solo cambia el adaptador (`GEOCODER`). |
| Teselas del mapa | OpenStreetMap público | Proveedor de teselas con acuerdo de uso |
| Autenticación | Correo y contraseña, sin correo saliente | Agregar verificación de correo y recuperación de contraseña por correo (nueva tabla `tokens_correo`) |
| Secretos | `.env` en el servidor | Gestor de secretos y rotación de `SESSION_SECRET` |
| Sesiones vencidas | Se borran al iniciar sesión | Tarea periódica de limpieza |
