---
id: "FEAT-001"
title: "Especificación de Requerimientos — Scraping TA"
status: "APROBADO"
version: "1.0.0"
owner: "Vissiuss / Equipo WIKA"
created_at: "2026-08-27"
updated_at: "2026-08-27"
audit_1_passed: true
audit_2_passed: true
---

# [02] Especificación de Características y Requerimientos Funcionales

> **Pre-requisito:** `audit_1_passed: true` en `01-problem.md` y este documento.  
> **Equivalencia:** Auditoría de Documentación → `docs/auditoria-documentacion.md`.

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** `Scraping TA`
- **Documento base:** `idea/01-problem.md` (ID: `PROB-001`)
- **Estado de gatekeeping:** `AUDIT_1_APROBADO`

---

## 2. Matriz de Trazabilidad de Requerimientos (RTM 1:1)

| ID Feature | ID Problema (`01-problem.md`) | Nombre de la Característica | Prioridad | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-01` | `ERR-06` | Guardar token ScrapingBee local | `Crítica` | `mod-token`, `mod-ui` |
| `FEAT-02` | `ERR-01` | Pegar 4 URLs; vacío = omitir | `Crítica` | `mod-ui`, `mod-jobs` |
| `FEAT-03` | `ERR-01`, `ERR-04` | Auditar en serie, 1 request por URL | `Crítica` | `mod-bee`, `mod-jobs` |
| `FEAT-04` | `ERR-01`, `ERR-02` | Parsers nativos Peya / Uber / Rappi / Justo | `Crítica` | `mod-parsers`, `mod-schema` |
| `FEAT-05` | `ERR-03` | Excel resumen / productos / comparacion | `Crítica` | `mod-excel` |
| `FEAT-06` | `ERR-04`, `ERR-05` | Reintentar un canal (1 click = 1 request) | `Crítica` | `mod-jobs`, `mod-ui` |
| `FEAT-07` | `ERR-04` | Estimar créditos Bee antes de auditar | `Alta` | `mod-jobs`, `mod-ui` |
| `FEAT-08` | `ERR-07` | Job en background + poll de estado | `Alta` | `mod-jobs`, `mod-ui` |

---

## 3. Funcionalidades Obligatorias

### Feature `FEAT-01`: Token ScrapingBee local

**Descripción:** El operador pega el token, se guarda en `.scrapingbee_key` (gitignored) o env `SCRAPINGBEE_API_KEY`. Justo/tarragona.cl no lo necesita.

#### Escenario 1.1: Flujo exitoso

- **Dado que** `no hay token o se rota`
- **Cuando** `pega un token ≥ 8 caracteres y pulsa Guardar`
- **Entonces** `la UI muestra token configurado y Peya/Uber/Rappi pueden auditarse`

#### Escenario 1.2: Manejo de errores

- **Dado que** `no hay token`
- **Cuando** `intenta auditar o reintentar Peya/Uber/Rappi`
- **Entonces** `HTTP 400 pidiendo el token; Justo CDN sigue permitido`

---

### Feature `FEAT-02`: Cuatro URLs del local

**Descripción:** Campos PedidosYa, Uber Eats, Rappi, Justo. Vacío se salta.

#### Escenario 2.1: Happy path

- **Dado que** `hay al menos una URL`
- **Cuando** `pulsa Auditar`
- **Entonces** `solo se consultan los canales con URL`

#### Escenario 2.2: Sin URLs

- **Dado que** `los cuatro campos están vacíos`
- **Cuando** `pulsa Auditar`
- **Entonces** `400: pega al menos una URL`

---

### Feature `FEAT-03`: Auditoría serial, un request

**Descripción:** Peya/Uber/Rappi vía ScrapingBee stealth CL (1 GET, ~75 créditos). Justo tarragona.cl vía CDN (0). Sin loop.

#### Escenario 3.1: Happy path

- **Dado que** `hay token y URLs`
- **Cuando** `corre la auditoría`
- **Entonces** `los canales Bee van en serie y cada uno hace un solo scrape`

#### Escenario 3.2: Error de canal

- **Dado que** `Bee/Cloudflare/parser falla`
- **Cuando** `termina ese canal`
- **Entonces** `se muestra el error, no se reintenta solo; los otros canales siguen`

---

### Feature `FEAT-04`: Parsers de JSON nativo

**Descripción:** Extraer nombre, descripción, `price_clp`, `price_original_clp` desde JSON nativo, no HTML.

| Canal | Fuente | Cliente | Lista |
| :--- | :--- | :--- | :--- |
| PedidosYa | XHR `/v2/niles/partners/{id}/menus` | `price.finalPrice` | `price.originalPrice` |
| Uber Eats | `__REACT_QUERY_STATE__` → `getStoreV1` → `catalogItems` | `price / 100` | `priceTagline.accessibilityText` “discounted from CLP …” |
| Rappi | XHR `restaurants-bus/store/id/{id}` | `discounts[].price` si `apply_to_user`, si no `price` | `real_price` |
| Justo | CDN webdata | `availabilityAt.finalPrice` | `availabilityAt.basePrice` |

Uber: JSON-LD es fallback sin tachado. Deduplicar por `uuid`.

#### Escenario 4.1: Uber lista

- **Dado que** `el HTML trae catalogItems con priceTagline`
- **Cuando** `corre el parser Uber`
- **Entonces** `productos en promo tienen price_original_clp > price_clp`

---

### Feature `FEAT-05`: Informe Excel

**Descripción:** Tras un run `done`, descargar `.xlsx` con hojas `resumen`, `productos`, `comparacion` (cruce por nombre normalizado; señal, no 1:1).

#### Escenario 5.1: Happy path

- **Dado que** `el run terminó`
- **Cuando** `pulsa Descargar .xlsx`
- **Entonces** `recibe un xlsx válido (PK…)`

---

### Feature `FEAT-06`: Reintento manual por canal

**Descripción:** Botón Reintentar junto a cada URL y en cada fila de resultados. `POST /api/audit/retry`. Fusiona al `run_id` y regenera Excel.

#### Escenario 6.1: Happy path

- **Dado que** `hay un run terminado y una URL de Justo`
- **Cuando** `pulsa Reintentar Justo`
- **Entonces** `el mismo run_id queda done con Justo actualizado y 0 créditos extra Bee`

#### Escenario 6.2: Run en curso

- **Dado que** `el run está queued/running`
- **Cuando** `se llama retry`
- **Entonces** `HTTP 409`

---

### Feature `FEAT-07`: Estimación de créditos

**Descripción:** 75 × (Peya + Uber + Rappi + Justo no-tarragona). Justo tarragona.cl = 0.

---

### Feature `FEAT-08`: Job asíncrono

**Descripción:** `POST /api/audit` encola un hilo; la UI hace poll a `GET /api/audit/{run_id}` para que el túnel no corte el POST.

#### Escenario 8.1

- **Dado que** `la auditoría tarda más de unos segundos`
- **Cuando** `el túnel no espera el POST`
- **Entonces** `el front no parsea HTML como JSON; espera status done/error`

---

## 4. Funcionalidades Deseables (V1.1+)

| ID Feature | Nombre | Prioridad | Notas |
| :--- | :--- | :--- | :--- |
| `FEAT-09` | Forzar mismo local (validar mall) | `Media` | Fuera de V1 |
| `FEAT-10` | Histórico de runs en UI | `Baja` | Hoy `runs/` en disco |
| `FEAT-11` | Auth admin + consola empresarial | `Alta` | V1.1: login, páginas a scrapear, informes |
| `FEAT-12` | Hosting fijo (no trycloudflare) | `Media` | Carpeta `deploy/` (Docker + Caddy + `vissiuss.com`). No está en producción hasta DNS/VPS. |

---

## 5. Fuera de Alcance

- APK, Expo, login en marketplaces, Partner API.
- Proxies gratis, bypass Cloudflare, reverse de APK.
- Retry loop automático.
- Comparar URLs de locales distintos como si fueran 1:1.

---

## 6. Requerimientos No Funcionales (NFRs) Medibles

| ID NFR | Categoría | Criterio aceptable | Método de validación |
| :--- | :--- | :--- | :--- |
| `NFR-01` | **Costo** | 1 Bee call / URL; Justo CDN 0 | Logs `credits_used`; tests retry mock |
| `NFR-02` | **Tests** | Parsers + retry sin gastar Bee | `python -m pytest tests -q` |
| `NFR-03` | **Seguridad** | Token gitignored | `.gitignore` + `token_store` |
| `NFR-04` | **Serie** | Canales Bee no en paralelo | `app.py` job loop |
| `NFR-05` | **Túnel** | POST audit no bloquea minutos | job queued + poll |
| `NFR-06` | **UI** | Tokens CSS documentados en 04 | Revisión visual |

---

## 7. Mapeo de UI y Componentes

| Componente UI | Vista | Tokens (`04-application-design.md`) | Estado |
| :--- | :--- | :--- | :--- |
| Login admin | VIEW-02 | `--bg`, `--brand` | V1.1 |
| Páginas a scrapear + preview | VIEW-03 | `--card`, `--accent` | V1.1 |
| Informes + descargar xlsx | VIEW-03 | `--brand`, `--line` | V1.1 |
| Token / ajustes | VIEW-03 | `--accent` | V1.1 |

Rutas web: `/login`, `/admin`. Sin expo-router.

---

## 8. Puerta de Enlace y Firma de Auditoría de Documentación

### Checklist

- [x] Frontmatter YAML vinculado a `PROB-001`.
- [x] RTM 1:1 con IDs `ERR-XX` de `01-problem.md`.
- [x] Escenarios BDD por feature obligatoria.
- [x] NFRs con métricas verificables.
- [x] Deseables y fuera de alcance diferenciados.
- [x] `audits/auditoria-documentacion.md` en estado `[APROBADO]`.

### Registro de visto bueno

- **Aprobado por (Arquitecto):** `Vissiuss`
- **Fecha:** `2026-08-27`
- **audit_1_passed:** `true`
