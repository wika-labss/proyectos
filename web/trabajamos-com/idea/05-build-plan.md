---
id: "WEB-BUILD-001"
title: "trabajamos.com — Plan de Construcción"
status: "APROBADO"
version: "0.1.0"
owner: "Vissiuss"
created_at: "2026-11-02"
updated_at: "2026-11-02"
audit_1_passed: true
audit_2_passed: true
visual_approval_passed: true
audit_3_passed: true
ready_for_construction: true
---

# [05] Plan de Construcción — trabajamos.com

> **Bloqueo:** Si `ready_for_construction: false`, queda prohibido crear o modificar HTML de producción en `iterations/vN/`.  
> **Activación:** `ready_for_construction: true` solo cuando `audit_1_passed`, `audit_2_passed`, `visual_approval_passed` y `audit_3_passed` sean `true`.  
> El SKU comercial A/B **no** se decide aquí. Eso es `negocio/informe-estado-negocio.md`.  
> **Modelo de datos:** `idea/06-modelo-datos.md`.

Decisiones de Vissiuss del 2026-11-02 (UTC-3): base de datos robusta, despliegue en un servidor de prueba (QA), autenticación con usuario y contraseña guardados en la base, imágenes en el disco del servidor, mapa y geocodificación con una API pública gratuita, y estructura de la base documentada en `.md` para cuando el sitio salga del servidor de prueba.

## 1. Origen y hosting (del sitio)

| Capa | Qué usa este proyecto |
|------|------------------------|
| HTML | Generado en el servidor (SSR) con formularios `method="post"`. Funciona sin JavaScript; el JavaScript solo agrega la ubicación del navegador, el mapa y la vista previa del `#`. |
| Servidor | Node.js 22 LTS + TypeScript + Fastify 5 |
| Base de datos | PostgreSQL 16 + PostGIS 3 (`geography(Point, 4326)`, índice GIST) |
| Autenticación | Correo y contraseña en la tabla `usuarios`. Hash argon2id. Sesión en la tabla `sesiones` con cookie `HttpOnly`, `SameSite=Lax` y `Secure` detrás de HTTPS. Token CSRF en cada formulario. Bloqueo temporal tras intentos fallidos. |
| Imágenes | Volumen del servidor (`UPLOADS_DIR`, por defecto `/data/uploads`). Se recodifican a WebP con `sharp`, máximo 1600 px, sin metadata EXIF (se borra el GPS de la foto). Se sirven en `/uploads/`. |
| Mapa | Leaflet con teselas de OpenStreetMap y atribución visible. |
| Geocodificación | Nominatim (OpenStreetMap), directa e inversa, desde el servidor. User-Agent propio, máximo 1 consulta por segundo y caché en la tabla `geocache`. El adaptador se puede cambiar por otro proveedor sin tocar las vistas. |
| Hosting QA | Servidor Linux con Docker Compose: `app`, `db` (`postgis/postgis:16-3.4`) y `caddy` (HTTPS automático). |
| Form / mail | No hay correo en QA. Una contraseña olvidada se restablece con `npm run admin:reset-password`. |

### Decisiones que `04` dejó para `05`

| Tema de `04` | Decisión |
| :--- | :--- |
| Método de autenticación (`VIEW-10`) | Correo y contraseña. El registro es `VIEW-18` "Crear cuenta" (`04` v0.2.2). |
| URL final | Las rutas de `04` se mantienen tal cual: `/index.html` (también `/`), `/perfil.html?slug={slug}`, `/panel/*.html`. |
| Carga del perfil (`VIEW-05` loading) | El servidor entrega el perfil armado. El estado "Cargando perfil…" no existe. "Perfil no disponible" responde 404 con `noindex`. |
| Espera de la ubicación del navegador | 10 segundos. Al agotarse se trata como ubicación no disponible. |
| Límite del listado | 100 resultados, sin paginación. |
| Formato de imagen (`VIEW-15`) | JPEG, PNG o WebP, hasta 5 MB. |
| Mapa (`VIEW-09`, `VIEW-16`) | Leaflet interactivo. Si no carga, la opción escrita de `VIEW-16` sigue activa y `VIEW-09` muestra el texto de la localidad. |
| Proveedor del nombre de un punto (D-08) | Geocodificación inversa de Nominatim. |

## 2. Dependencias

- [x] Contenido: textos de `04`. Datos de prueba con `npm run seed` (emprendedores ficticios en Santiago).
- [x] Formularios según `02-features.md` y `04` (sin WhatsApp; `Contactar` abre `tel:`, `mailto:` o un enlace).
- [x] `title` y `description` según `02` §6 y `04` §4.2.
- [x] Node.js 22, PostgreSQL 16 + PostGIS 3, Docker Compose v2 en el servidor QA.
- [x] Dominio o IP pública del servidor QA para Caddy (`DOMAIN`).

### Variables de entorno

| Variable | Uso |
| :--- | :--- |
| `DATABASE_URL` | Conexión a PostgreSQL |
| `SESSION_SECRET` | Firma de cookies (32 bytes o más) |
| `PUBLIC_BASE_URL` | URL pública del sitio |
| `UPLOADS_DIR` | Carpeta de imágenes (por defecto `/data/uploads`) |
| `GEOCODER` | `nominatim` o `fake` (pruebas sin red) |
| `NOMINATIM_URL` | Por defecto `https://nominatim.openstreetmap.org` |
| `NOMINATIM_USER_AGENT` | Identificación exigida por Nominatim, con correo de contacto |
| `NOMINATIM_COUNTRYCODES` | Por defecto `cl` |
| `COOKIE_SECURE` | `true` detrás de HTTPS |
| `DOMAIN` | Dominio que usa Caddy |

## 3. Hoja de ruta

| Paso | Módulo | ID Feature | Qué hacer | Estado |
| :--- | :--- | :--- | :--- | :--- |
| `01` | `global` | N/A | Proyecto Node + TS, migraciones SQL, configuración, Docker Compose, Caddy | `HECHO` |
| `02` | `MOD-06` | `FEAT-01` | `VIEW-10` Entrar, `VIEW-18` Crear cuenta, sesiones, CSRF, bloqueo, guardia de `panel/*`, `Salir` | `HECHO` |
| `03` | `MOD-01` | `FEAT-01`, `FEAT-07` | `VIEW-11`, `VIEW-12`, `VIEW-13`, `VIEW-17`; slug; perfil público `VIEW-05`, `VIEW-06` | `HECHO` |
| `04` | `MOD-02` | `FEAT-02` | `VIEW-14` con la regla única del `#`; `VIEW-07` | `HECHO` |
| `05` | `MOD-03` | `FEAT-03` | `VIEW-15` con `sharp` y volumen; `VIEW-08` | `HECHO` |
| `06` | `MOD-04` | `FEAT-04` | Adaptador Nominatim con caché; `VIEW-16` con Leaflet; `VIEW-09` | `HECHO` |
| `07` | `MOD-05` | `FEAT-05`, `FEAT-06` | `VIEW-01` a `VIEW-04`: búsqueda por `#`, origen por localidad o navegador, orden y distancia con PostGIS | `HECHO` |
| `08` | `global` | N/A | Pruebas automáticas, datos semilla, verificación en navegador, `DEPLOY.md` | `HECHO` |

## 4. Despliegue en el servidor de prueba (QA)

```bash
git clone https://github.com/wika-labss/proyectos.git
cd proyectos/web/trabajamos-com/iterations/v1
cp .env.example .env        # completar DOMAIN, SESSION_SECRET, POSTGRES_PASSWORD, NOMINATIM_USER_AGENT
docker compose up -d --build
docker compose exec app npm run migrate
docker compose exec app npm run seed   # opcional: datos de prueba
```

Detalle, respaldos y restablecer contraseñas: `iterations/v1/DEPLOY.md`.

## 5. Verificación de pre-requisitos

- [x] Auditoría de Documentación: `audit_1_passed == true`
- [x] Auditoría de Módulos: `audit_2_passed == true`
- [x] Aprobación visual: `visual_approval_passed == true` (`04-html-design.md`)
- [x] Auditoría de Ensamblado: `audit_3_passed == true` (`audits/auditoria-ensamblado.md`)

`ready_for_construction: true` **solo en este archivo**, no en 04.
