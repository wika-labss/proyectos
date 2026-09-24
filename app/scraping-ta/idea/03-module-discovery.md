---
id: "MOD-001"
title: "Descubrimiento y Arquitectura de Módulos — Scraping TA"
status: "APROBADO"
version: "1.0.0"
owner: "Vissiuss / Arquitecto WIKA"
created_at: "2026-08-27"
updated_at: "2026-08-27"
audit_1_passed: true
audit_2_passed: true
---

# [03] Descubrimiento y Especificación de Arquitectura Modular

> **Pre-requisito:** `audit_1_passed: true` en `01-problem.md` y `02-features.md`.  
> **Equivalencia:** Auditoría de Módulos → `docs/auditoria-modulos.md`.

## 1. Identificación y Documentos Base

- **Nombre del Proyecto:** `Scraping TA`
- **Especificaciones base:** `01-problem.md` (`PROB-001`) | `02-features.md` (`FEAT-001`)
- **Estado de gatekeeping:** `AUDIT_2_APROBADO`

---

## 2. Matriz de Trazabilidad Modular (RTM 1:1)

| ID Módulo | ID Feature (`02-features.md`) | ID Problema (`01-problem.md`) | Nombre del Módulo | Tipo | Responsabilidad Principal |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `MOD-01` | `FEAT-01` | `ERR-06` | `mod-token` | lógica | Persistir token Bee fuera de git |
| `MOD-02` | `FEAT-03`, `FEAT-07` | `ERR-01`, `ERR-04` | `mod-bee` | integración | Un scrape ScrapingBee, sin retry |
| `MOD-03` | `FEAT-04` | `ERR-01`, `ERR-02` | `mod-peya` | parser | Menú nativo PedidosYa |
| `MOD-04` | `FEAT-04` | `ERR-01`, `ERR-02` | `mod-uber` | parser | catalogItems Uber + lista |
| `MOD-05` | `FEAT-04` | `ERR-01`, `ERR-02` | `mod-rappi` | parser | Store bus Rappi |
| `MOD-06` | `FEAT-04` | `ERR-01`, `ERR-02` | `mod-justo` | parser / CDN | Menú Justo tarragona.cl |
| `MOD-07` | `FEAT-04`, `FEAT-05` | `ERR-02`, `ERR-03` | `mod-schema` | engine | ProductRow / ChannelResult |
| `MOD-08` | `FEAT-05` | `ERR-03` | `mod-excel` | reportes | Workbook 3 hojas |
| `MOD-09` | `FEAT-02`, `FEAT-03`, `FEAT-06`, `FEAT-08` | `ERR-05`, `ERR-07` | `mod-jobs` | orquestación | Audit/retry async, persist runs |
| `MOD-10` | `FEAT-01`–`FEAT-08`, `FEAT-11` | `ERR-05` | `mod-ui` | presentación | Admin empresarial HTML |
| `MOD-11` | `FEAT-11` | `ERR-06` | `mod-auth` | seguridad | Sesión admin (cookie HMAC) |

---

## 3. Desglose de Arquitectura Modular

### Módulo `MOD-01`: Token

**Patrón:** Store de archivo  
**Ruta:** `iterations/v1/token_store.py`

#### Contrato

- **Entradas:** token string
- **Salidas:** `load_token()`, `token_configured()`
- **Dependencias:** filesystem `.scrapingbee_key`, env `SCRAPINGBEE_API_KEY`
- **Reutilizable:** Sí (otras apps Bee WIKA)

#### Reglas de aislamiento

- No loguear el token. No importar parsers.

---

### Módulo `MOD-02`: Bee

**Patrón:** Cliente HTTP único  
**Ruta:** `iterations/v1/bee.py`

#### Contrato

- **Entradas:** URL pública + token
- **Salidas:** JSON Bee (`body`, XHR, créditos)
- **Dependencias:** httpx, API ScrapingBee
- **Reutilizable:** Sí

#### Reglas

- `scrape_once` — prohibido loop. Params fijos stealth CL validados.

---

### Módulos `MOD-03`–`MOD-06`: Parsers

**Patrón:** Pure functions  
**Ruta:** `iterations/v1/parsers/{peya,uber,rappi,justo}.py`

| Módulo | Entrada | Salida |
| :--- | :--- | :--- |
| Peya | Bee XHR menú | `ChannelResult` |
| Uber | HTML `__REACT_QUERY_STATE__` | `ChannelResult` (dedupe uuid) |
| Rappi | Bee XHR store | `ChannelResult` |
| Justo | URL tarragona.cl → CDN GET | `ChannelResult` (0 Bee) |

**Reglas:** sin FastAPI, sin UI, testeables con dumps `/tmp`.

---

### Módulo `MOD-07`: Schema

**Ruta:** `iterations/v1/schema.py`  
Fila unificada: `platform, store, section, name, description, price_clp, price_original_clp, available, source_url, scraped_at, product_id`.

---

### Módulo `MOD-08`: Excel

**Ruta:** `iterations/v1/excel_report.py`  
Hojas `resumen`, `productos`, `comparacion` (nombre normalizado).

---

### Módulo `MOD-09`: Jobs

**Ruta:** `iterations/v1/app.py`  
`POST /api/audit`, `POST /api/audit/retry`, `GET /api/audit/{id}`, `GET /api/report/{id}.xlsx`. Hilos daemon; persist `runs/{id}.json|.xlsx`.

---

### Módulo `MOD-10`: UI

**Ruta:** `iterations/v1/static/index.html`  
Una vista. Poll JSON. Reintentar por `data-field`.

---

## 4. Grafo de Dependencias y Reglas de Importación

```text
[mod-ui HTML]
       │ fetch
       ▼
[mod-jobs FastAPI]
       │
       ├──► mod-token
       ├──► mod-bee ──► (Peya/Uber/Rappi)
       ├──► mod-justo (CDN)
       ├──► mod-peya / mod-uber / mod-rappi
       ├──► mod-schema
       └──► mod-excel
```

**Reglas:**

- Parsers no importan `app` ni UI.
- `mod-bee` no parsea menús.
- Sin ciclos. Sin React.

---

## 5. Matriz de Riesgos Arquitectónicos

| ID Módulo | Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- | :--- |
| `MOD-02` | Cloudflare / captcha | `Alto` | 1 request; error visible; retry manual |
| `MOD-04` | Uber cambia React Query | `Alto` | JSON-LD fallback; tests con dump |
| `MOD-09` | POST túnel timeout | `Alto` | Job + poll |
| `MOD-08` | Comparacion 1:1 falsa | `Medio` | Documentar señal; mismo local |

---

## 6. Evaluación de Reutilización WIKA

| Módulo | ¿Existe equivalente WIKA? | Decisión |
| :--- | :--- | :--- |
| `MOD-02` | No | Crear `mod-bee` (no hay cliente Bee en WIKA) |
| `MOD-03`–`06` | No | Parsers propios Chile delivery |
| `MOD-10` | design-system V3+ | Theme local CSS V1; no Expo |

---

## 7. Puerta de Enlace y Firma de Auditoría de Módulos

### Checklist

- [x] Toda feature obligatoria tiene al menos un módulo.
- [x] Sin módulos duplicados ni responsabilidades superpuestas.
- [x] Dependencias y riesgos documentados.
- [x] Reutilización WIKA evaluada.
- [x] Grafo sin ciclos.
- [x] `audits/auditoria-modulos.md` en estado `[APROBADO]`.

### Registro de visto bueno

- **Aprobado por (Arquitecto):** `Vissiuss`
- **Fecha:** `2026-08-27`
- **audit_2_passed:** `true`
