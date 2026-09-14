---
id: "MOD-001"
title: "Ramon David — Módulos V1 (web)"
status: "EN_REVISION"
version: "1.0.0"
owner: "Vissiuss / Arquitecto WIKA"
created_at: "2026-09-07"
updated_at: "2026-09-07"
audit_1_passed: false
audit_2_passed: false
excepcion_web: true
---

# [03] Descubrimiento y Especificación de Arquitectura Modular

> **Pre-requisito:** `audit_1_passed: true` en `01-problem.md` y `02-features.md`.
> **EXCEPCIÓN WIKA-WEB:** No hay `src/engine/` TypeScript ni pantallas expo-router. Los módulos viven en Flask (`app.py`) y estáticos (`*.html`, `js/`, `css/`).

## 1. Identificación y Documentos Base

- **Nombre del Proyecto:** `Ramon David`
- **Especificaciones base:** `01-problem.md` (`PROB-001`) | `02-features.md` (`FEAT-001`)
- **Estado de gatekeeping:** `PENDIENTE_AUDITORIA_MODULOS`
- **Raíz V1:** `iterations/v1/`

---

## 2. Matriz de Trazabilidad Modular (RTM 1:1)

| ID Módulo | ID Feature (`02-features.md`) | ID Problema (`01-problem.md`) | Nombre del Módulo | Tipo | Responsabilidad Principal |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `MOD-01` | `FEAT-03` | `ERR-03` | `mod-catalog-store` | persist / lógica | Leer/escribir/sanitizar `products.json` |
| `MOD-02` | `FEAT-02` | `ERR-02` | `mod-catalog-api` | HTTP | `GET /api/products`; bloquear `/data/*` |
| `MOD-03` | `FEAT-06` | `ERR-06` | `mod-admin-auth` | auth | Login, sesión, CSRF, hash |
| `MOD-04` | `FEAT-03` | `ERR-03` | `mod-admin-crud` | HTTP + UI | CRUD `/admin/api/products` + HTML del panel |
| `MOD-05` | `FEAT-04` | `ERR-04` | `mod-uploads` | persist | Upload y borrado seguro de imágenes |
| `MOD-06` | `FEAT-01`, `FEAT-05` | `ERR-01`, `ERR-05` | `mod-public-site` | UI | `index`, `nosotros`, `contacto` + `js/main.js` |
| `MOD-07` | `FEAT-02` | `ERR-02` | `mod-catalog-ui` | UI | `productos.html` + `js/product.js` |
| `MOD-08` | `FEAT-01` | `ERR-01` | `mod-theme` | tokens | `css/main.css`, `css/componentes.css` |
| `MOD-10` | `FEAT-12` | — | `mod-meli` | HTTP + persist | OAuth, publicar ítems test, órdenes y notificaciones MeLi |

---

## 3. Desglose de Arquitectura Modular

### Módulo `MOD-01`: `mod-catalog-store`

**Patrón:** Persistencia + sanitizado  
**Ruta:** `iterations/v1/app.py` (`load_products`, `save_products`, `sanitize_product`, `slugify`) · `data/products.json`

#### Contrato

- **Entradas:** dict de producto (title, category, tables, …)
- **Salidas:** JSON atómico (`*.json.tmp` → replace)
- **Dependencias:** filesystem, lock de hilo
- **Reutilizable:** Sí (cualquier UI que hable el mismo schema)

#### Reglas de aislamiento

- No renderiza HTML. No conoce cookies.

---

### Módulo `MOD-02`: `mod-catalog-api`

**Patrón:** API pública de solo lectura  
**Ruta:** `app.py` `GET /api/products`, `GET /data/<path>` → 404

#### Contrato

- **Salidas:** `{ products: [{ id, ...campos }] }` ordenado por categoría/order/título
- **Dependencias:** MOD-01

---

### Módulo `MOD-03`: `mod-admin-auth`

**Patrón:** Sesión Flask  
**Ruta:** `app.py` (`is_logged_in`, `/admin/login`, `/admin/logout`, `require_admin_json`)

#### Contrato

- **Entradas:** username, password, csrf_token
- **Salidas:** `session["admin_user"]` o 401
- **Dependencias:** `werkzeug.security`, env `ADMIN_*`, `FLASK_SECRET_KEY`

---

### Módulo `MOD-04`: `mod-admin-crud`

**Patrón:** Admin HTML embebido + JSON API  
**Ruta:** `ADMIN_PAGE` / `LOGIN_PAGE` en `app.py`; `POST/PUT/DELETE /admin/api/products`

#### Contrato

- **UI:** sidebar por categoría, editor, preview
- **Dependencias:** MOD-01, MOD-03, MOD-05

---

### Módulo `MOD-05`: `mod-uploads`

**Patrón:** Store de archivos  
**Ruta:** `POST /admin/api/uploads`, `delete_upload_file`, dir `uploads/`

#### Contrato

- Extensiones whitelist; nombre `[0-9a-f]{32}.ext`; max 5 MB
- No borra paths fuera de `uploads/`

---

### Módulo `MOD-06`: `mod-public-site`

**Patrón:** Páginas estáticas  
**Ruta:** `index.html`, `nosotros.html`, `contacto.html`, `js/main.js`

#### Contrato

- Nav compartida; slider home; form contacto (cliente)

---

### Módulo `MOD-07`: `mod-catalog-ui`

**Patrón:** UI de catálogo  
**Ruta:** `productos.html`, `js/product.js`

#### Contrato

- Consume solo `/api/products`. Filtro `?categoria=`

---

### Módulo `MOD-08`: `mod-theme`

**Patrón:** Tokens CSS  
**Ruta:** `css/main.css` `:root`, `css/componentes.css`

#### Contrato

- Tokens: `--ink`, `--muted`, `--paper`, `--cream`, `--teal`, `--line`, `--serif`, `--sans`

---

### Módulo `MOD-09`: `mod-web-serve`

**Patrón:** Proceso HTTP  
**Ruta:** `app.py` `main()`, `Flask(static_folder=PROJECT_ROOT)`

#### Contrato

- Default `--host 0.0.0.0 --port 5003` (túnel/LAN). `--open` opcional.

---

### Módulo `MOD-10`: `mod-meli`

**Patrón:** Integración HTTP + token store  
**Ruta:** `iterations/v1/mod_meli.py` · `admin_meli.html` · rutas `/admin/meli`, `/oauth/callback`, `/meli/notifications`

#### Contrato

- **Entradas:** producto del catálogo (MOD-01), OAuth code, notificaciones MeLi
- **Salidas:** ítem MeLi (`meli.item_id` en el producto), listado de órdenes
- **Dependencias:** MOD-03 (panel), MOD-01 (catálogo), env `MELI_*`
- En `MELI_TEST_MODE=1` fuerza título de prueba y categoría sábanas MLC

---

## 4. Grafo de Dependencias y Reglas de Importación

```text
[navegador]
    │
    ├─ páginas públicas ──► MOD-06, MOD-08
    │         │
    │         └─ /api/products ──► MOD-02 ──► MOD-01
    │
    └─ /admin ──► MOD-03 ──► MOD-04 ──► MOD-01
                         └──► MOD-05
                         └──► MOD-10 (MeLi)
[proceso]
    MOD-09 sirve todo
```

**Reglas:**

- Sin ciclos: UI pública no escribe JSON; solo MOD-04/05/10 escriben.
- `/data/` no es descargable.
- No hay capa Expo. Equivalente web a `src/engine/` = funciones de MOD-01 en `app.py`.

---

## 5. Matriz de Riesgos Arquitectónicos

| ID Módulo | Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- | :--- |
| `MOD-01` | JSON corrupto / race | `Alto` | lock + write atómico |
| `MOD-03` | Credenciales default en túnel | `Alto` | env hash; no commitear secretos reales |
| `MOD-04` | HTML/JS gigante dentro de `app.py` | `Medio` | Extraer templates en v2 |
| `MOD-01` vs Supabase | Dos catálogos | `Alto` | V1.1 elige una fuente (`FEAT-08`) |

---

## 6. Evaluación de Reutilización WIKA

| Módulo | ¿Existe equivalente WIKA? | Decisión |
| :--- | :--- | :--- |
| `MOD-01`–`09` | No (stack móvil) | **Crear nuevo** — excepción web |
| Theme | `standards/design-system.md` (móvil) | Theme local V1; no forzar tokens Expo |
| Admin Supabase | `app/ramon-david` en rama catálogo | Fuera de V1; documentado como V1.1 |

---

## 7. Puerta de Enlace y Firma de Auditoría de Módulos

### Checklist

- [x] Toda feature obligatoria tiene al menos un módulo.
- [x] Sin módulos duplicados de responsabilidad.
- [x] Dependencias y riesgos documentados.
- [x] Reutilización WIKA evaluada (excepción web).
- [x] Grafo sin ciclos.
- [ ] `audits/auditoria-modulos.md` en estado `APROBADO`.

### Registro de visto bueno

- **Aprobado por (Arquitecto):** `________________________`
- **Fecha:** `YYYY-MM-DD`
- **audit_2_passed:** `false` → `true` al aprobar
