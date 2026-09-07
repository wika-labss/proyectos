---
id: "FEAT-001"
title: "Ramon David — Features V1 (web)"
status: "EN_REVISION"
version: "1.0.0"
owner: "Vissiuss / Equipo WIKA"
created_at: "2026-09-07"
updated_at: "2026-09-07"
audit_1_passed: false
audit_2_passed: false
excepcion_web: true
---

# [02] Especificación de Características y Requerimientos Funcionales

> **Pre-requisito:** `audit_1_passed: true` en `01-problem.md` y este documento.
> **EXCEPCIÓN WIKA-WEB:** Features se validan en navegador (HTTP), no con APK / `npm run verify`.

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** `Ramon David`
- **Documento base:** `idea/01-problem.md` (ID: `PROB-001`)
- **Estado de gatekeeping:** `PENDIENTE_AUDITORIA_DOCUMENTACION`

---

## 2. Matriz de Trazabilidad de Requerimientos (RTM 1:1)

| ID Feature | ID Problema (`01-problem.md`) | Nombre de la Característica | Prioridad | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-01` | `ERR-01` | Sitio público (home + nav + footer) | `Crítica` | `mod-public-site` |
| `FEAT-02` | `ERR-02` | Catálogo con filtros, precios y medidas | `Crítica` | `mod-catalog-api`, `mod-catalog-ui` |
| `FEAT-03` | `ERR-03` | CRUD de productos y tablas en `/admin` | `Crítica` | `mod-admin-crud`, `mod-catalog-store` |
| `FEAT-04` | `ERR-04` | Subida de imagen de producto | `Alta` | `mod-uploads` |
| `FEAT-05` | `ERR-05` | Páginas Nosotros y Contacto | `Alta` | `mod-public-site` |
| `FEAT-06` | `ERR-06` | Login admin + sesión + CSRF | `Crítica` | `mod-admin-auth` |
| `FEAT-07` | `ERR-01` | Arranque local del servidor web | `Crítica` | `mod-web-serve` |

---

## 3. Funcionalidades Obligatorias

### Feature `FEAT-01`: Sitio público

**Descripción:** Home con hero, bloques de colección, beneficios y footer de Acolchados CD (dirección San José 5887, San Miguel; teléfono; Instagram).

#### Escenario 1.1: Happy Path

- **Dado que** `el servidor responde en el puerto configurado`
- **Cuando** `el visitante abre /`
- **Entonces** `ve marca CD, nav (Inicio, Nosotros, Productos, Precios, Contacto) y CTAs a catálogo/contacto`

#### Escenario 1.2: Error

- **Dado que** `el servidor no está corriendo`
- **Cuando** `se pide /`
- **Entonces** `no hay página; el smoke de 05 falla (no se finge contenido)`

---

### Feature `FEAT-02`: Catálogo público

**Descripción:** `productos.html` pide `GET /api/products`, filtra por categoría y muestra cards (título, descripción, precio desde, tablas en `<details>`).

#### Escenario 2.1: Happy Path

- **Dado que** `products.json tiene 19 ítems`
- **Cuando** `abre /productos.html`
- **Entonces** `el contador muestra 19 productos y los filtros (Sábanas, Plumones, …) recortan la grilla`

#### Escenario 2.2: Fallo de API

- **Dado que** `/api/products` no responde`
- **Cuando** `carga el catálogo`
- **Entonces** `muestra «No pudimos cargar el catálogo» sin romper el layout`

---

### Feature `FEAT-03`: Panel de precios (CRUD)

**Descripción:** Admin logueado crea, edita y borra productos (categoría, orden, descripción, colores, notas, tablas de precios/medidas). Persistencia atómica en `data/products.json`.

#### Escenario 3.1: Happy Path

- **Dado que** `hay sesión admin`
- **Cuando** `edita «Sábana 300 hilos» y guarda`
- **Entonces** `el JSON se actualiza y la preview del panel refleja título y tablas`

#### Escenario 3.2: Sin sesión

- **Dado que** `no hay cookie de admin`
- **Cuando** `POST /admin/api/products`
- **Entonces** `responde 401 y no escribe el archivo`

---

### Feature `FEAT-04`: Upload de imagen

**Descripción:** `POST /admin/api/uploads` acepta jpg/png/webp/gif ≤ 5 MB; guarda UUID en `uploads/`; al reemplazar o borrar, elimina el archivo anterior si coincide el patrón seguro.

#### Escenario 4.1: Happy Path

- **Dado que** `el admin elige un .webp válido`
- **Cuando** `sube la imagen`
- **Entonces** `recibe `{ url: "/uploads/<hex>.webp" }` y la ficha la muestra`

#### Escenario 4.2: Archivo inválido

- **Dado que** `el archivo no es imagen permitida o supera 5 MB`
- **Cuando** `intenta subir`
- **Entonces** `400 o 413; no se escribe un path arbitrario`

---

### Feature `FEAT-05`: Nosotros y Contacto

**Descripción:** Historia de marca y formulario de contacto (nombre, email, interés, mensaje). V1 confirma en cliente; **no** envía correo.

#### Escenario 5.1: Happy Path

- **Dado que** `el visitante completa el formulario`
- **Cuando** `envía`
- **Entonces** `ve mensaje de gracias y el form se limpia (sin backend de mail)`

---

### Feature `FEAT-06`: Autenticación admin

**Descripción:** `/admin` redirige a login. Usuario/hash por env (`ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `FLASK_SECRET_KEY`). CSRF en el POST de login. Sesión 8 h.

#### Escenario 6.1: Happy Path

- **Dado que** `credenciales válidas`
- **Cuando** `envía el formulario de login`
- **Entonces** `entra al panel y ve la lista de productos`

#### Escenario 6.2: Credencial inválida

- **Dado que** `usuario o clave incorrectos, o CSRF inválido`
- **Cuando** `intenta entrar`
- **Entonces** `401 con mensaje; no se crea `admin_user``

---

### Feature `FEAT-07`: Servidor web local

**Descripción:** `python app.py --host 0.0.0.0 --port 5003` sirve estáticos + API. Pensado para túnel (cloudflared) o LAN.

#### Escenario 7.1: Happy Path

- **Dado que** `hay Python 3.11+ y requirements instalados`
- **Cuando** `arranca app.py`
- **Entonces** `GET / y GET /api/products responden 200`

---

## 4. Funcionalidades Deseables (V1.1+)

| ID Feature | Nombre | Prioridad | Notas |
| :--- | :--- | :--- | :--- |
| `FEAT-08` | Sync Supabase `ramon-david` | `Alta` | Una sola fuente; hoy JSON ≠ tablas remotas |
| `FEAT-09` | Envío real de contacto | `Media` | Email / ticket |
| `FEAT-10` | Deploy producción (gunicorn + HTTPS) | `Alta` | Sustituye servidor de desarrollo Flask |
| `FEAT-11` | Auth fuerte / 2FA admin | `Media` | Reemplazar default `cambiar123` |

---

## 5. Fuera de Alcance

- Expo, React Native, APK, expo-router, `npm run typecheck`.
- Pipeline `design-system/` (V3+).
- Pagos, carrito, inventario, cuentas de cliente.
- iOS nativo / store.

---

## 6. Requerimientos No Funcionales (NFRs) Medibles

| ID NFR | Categoría | Criterio aceptable | Método de validación |
| :--- | :--- | :--- | :--- |
| `NFR-01` | **Arranque** | Home + `/api/products` 200 en &lt; 5 s tras `app.py` | `curl` / smoke |
| `NFR-02` | **Catálogo** | 19 productos V1 listables y filtrables | UI + JSON |
| `NFR-03` | **Seguridad admin** | CRUD y upload exigen sesión | 401 sin cookie |
| `NFR-04` | **Offline visitante** | Sitio **requiere** servidor local/red; no es PWA | Documentado (N/A offline-first) |
| `NFR-05` | **Fidelidad visual** | Tokens `:root` de `css/main.css` | `04-application-design.md` |
| `NFR-06` | **Pins** | Flask/Werkzeug con `~=` | `requirements.txt` |

---

## 7. Mapeo de UI y Componentes

| Componente UI | Pantalla / Vista | Tokens (`04` / `css/main.css`) | Estado |
| :--- | :--- | :--- | :--- |
| Header / brand CD | Todas públicas | `--teal`, header `#151716` | Implementado |
| Hero slider | Home | `--serif`, overlay | Implementado |
| `catalog-card` | Productos | `--paper`, `--ink` | Implementado |
| Login card | `/admin/login` | `--paper`, `--teal` | Implementado |
| Editor + preview | `/admin` | tokens admin embebidos en `app.py` | Implementado |

---

## 8. Puerta de Enlace y Firma de Auditoría de Documentación

### Checklist

- [x] Frontmatter YAML vinculado a `PROB-001`.
- [x] RTM 1:1 con IDs `ERR-XX`.
- [x] Escenarios BDD por feature obligatoria.
- [x] NFRs web (sin APK).
- [x] Deseables y fuera de alcance diferenciados.
- [ ] `audits/auditoria-documentacion.md` en estado `APROBADO`.

### Registro de visto bueno

- **Aprobado por (Arquitecto):** `________________________`
- **Fecha:** `YYYY-MM-DD`
- **audit_1_passed:** `false` → `true` al aprobar
