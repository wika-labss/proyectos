---
id: "PROB-001"
title: "Scraping TA"
status: "APROBADO"
version: "1.0.0"
owner: "Vissiuss / Equipo WIKA"
created_at: "2026-08-27"
updated_at: "2026-08-27"
audit_1_passed: true
---

# [01] Definición del Problema, Alcance y Metas

> **Equivalencia de auditoría:** `audit_1_passed: true` requiere aprobación formal en `docs/auditoria-documentacion.md`.

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** `Scraping TA`
- **Repositorio de aplicación:** `proyectos/app/scraping-ta/`
- **Stakeholders clave:** Vissiuss (producto / ingeniería, dueño locales Tarragona), Arquitecto WIKA (gates)
- **Estado de gatekeeping:** `AUDIT_1_APROBADO`
- **Entregable V1:** Aplicación web (FastAPI + HTML), no APK

---

## 2. Definición del Problema y Justificación

- **¿Qué problema se intenta resolver?**  
  Tarragona opera el mismo menú en PedidosYa, Uber Eats, Rappi y Justo (tarragona.cl). El Partner Catalog / APIs de carga muestran lo que el local **sube**, no lo que el **cliente ve** (precio final, tachado, disponibilidad). Hace falta extraer productos, descripciones y precios de cliente desde las fuentes nativas de cada canal (JSON, no HTML reconstruido) y bajarlas a un Excel comparable.

- **Impacto actual / costo de oportunidad:**  
  Sin esa vista, no se detectan descuentos de marketplace, precios lista vs cliente, ni desvíos entre canales. Comparar a mano es lento y no escala a lun–vie. Un scrape mal hecho (retry loop, AI extract, HTML) gasta créditos ScrapingBee y produce datos falsos.

- **Análisis de brecha (Gap Analysis):**
  - **Estado actual (hoy):** Dumps Bee validados y parsers en una demo suelta; no hay proyecto WIKA, ni UI compartible con proceso documentado.
  - **Estado deseado (mañana):** App web localhost **Scraping TA**: token local, 4 URLs del mismo local, 1 request por canal, reintento manual, Excel `resumen` / `productos` / `comparacion`.

---

## 3. Matriz de Trazabilidad de Requerimientos (RTM Inicial)

| ID Problema | Descripción del Dolor | Impacto | ID Feature (`02-features.md`) | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `ERR-01` | No se ve el menú de cliente (vs catálogo partner) | `Alto` | `FEAT-03`, `FEAT-04` | `mod-bee`, `mod-parsers` |
| `ERR-02` | Precio cliente y precio lista no están unificados | `Alto` | `FEAT-04` | `mod-schema`, `mod-parsers` |
| `ERR-03` | No hay informe cruzado por canal del mismo local | `Alto` | `FEAT-05` | `mod-excel` |
| `ERR-04` | Retry automático gasta créditos Bee | `Alto` | `FEAT-03`, `FEAT-06` | `mod-bee`, `mod-jobs` |
| `ERR-05` | Si un canal falla hay que rehacer los cuatro | `Alto` | `FEAT-06` | `mod-jobs`, `mod-ui` |
| `ERR-06` | El token Bee no puede ir a git ni al chat | `Alto` | `FEAT-01` | `mod-token` |
| `ERR-07` | Un POST largo por túnel Cloudflare se corta (HTML 5xx) | `Medio` | `FEAT-08` | `mod-jobs`, `mod-ui` |

---

## 4. Audiencia y Casos de Uso Core

- **Usuarios principales:**
  - **Operador Tarragona / Vissiuss:** pegar URLs del mismo local, auditar lun–vie, bajar Excel, reintentar un canal si falló.
  - **Analista de precios:** leer `comparacion` como señal (no 1:1 si los locales no coinciden).
- **Fuera de alcance (Out of Scope explícito):**
  - APK / Expo / apps nativas de los marketplaces.
  - Partner Catalog API, login en apps, cookies replay.
  - Proxies gratis, bypass de Cloudflare a mano, APK reverse.
  - Retry loop automático.
  - Hosting productivo con token Bee público.
  - Comparación 1:1 entre malles distintos (Alameda vs Belloto vs Florida).

---

## 5. Objetivo y Beneficios Esperados

- **Objetivo:** Entregar V1 web en `http://127.0.0.1:8000` que extrae vista cliente de Peya / Uber / Rappi / Justo, 1 request por URL (Bee ~75 créditos; Justo CDN = 0), Excel descargable, reintento manual por canal.
- **Beneficios esperados:**
  - Precio cliente y lista en un schema único.
  - Costo predecible lun–vie: 225 créditos/día (3 Bee × 75), Justo 0.
  - Un click = un request; no se quema el saldo Bee.

---

## 6. Criterios de Éxito en Formato BDD (Gherkin)

### Escenario 1: Auditar Justo sin gastar Bee

- **Dado que** `el operador abre Scraping TA en el navegador`
- **Cuando** `pega https://www.tarragona.cl/pedir y pulsa Auditar o Reintentar`
- **Entonces** `obtiene decenas de productos con precio cliente y lista, créditos usados = 0`

### Escenario 2: Reintento de un canal

- **Dado que** `ya existe un run con al menos un canal`
- **Cuando** `pulsa Reintentar en PedidosYa / Uber / Rappi / Justo`
- **Entonces** `se hace 1 request de ese canal, se fusiona al mismo run y se regenera el .xlsx`

### Escenario 3: Token no se commitea

- **Dado que** `el operador pega un token ScrapingBee y guarda`
- **Cuando** `se lista git`
- **Entonces** `.scrapingbee_key` está gitignored y no aparece en el repo`

---

## 7. Matriz de Restricciones Técnicas y Operativas

| Categoría | Restricción / Límite | Impacto | Estándar asociado |
| :--- | :--- | :--- | :--- |
| **Plataforma V1** | Aplicación web FastAPI + HTML, no APK | `Bloqueante` | Entregable web WIKA |
| **Tecnología** | Python 3.11+, FastAPI, uvicorn, openpyxl, pytest | `Alto` | coding-standards (adaptado web) |
| **Bee** | `render_js + stealth_proxy + country_code=cl + json_response + wait=8000`; 1 request; serie | `Bloqueante` | idea/03 |
| **Justo** | CDN `webdatacdn.getjusto.com`; tarragona.cl = 0 créditos | `Alto` | idea/03 |
| **Diseño / UX** | Theme local CSS en una página; tokens en `04-application-design.md` | `Medio` | design-system V1 |
| **Seguridad** | Token solo `.scrapingbee_key` o `SCRAPINGBEE_API_KEY`; nunca en git | `Bloqueante` | coding-standards |
| **Librerías prohibidas** | Sin APK reverse, sin Cloudflare bypass, sin proxies públicos | `Bloqueante` | WIKA-ARCH |

---

## 8. Supuestos y Riesgos

- **Supuestos clave:** URLs públicas de menú del mismo local. Token Bee válido. Justo Tarragona usa `websiteId=hPy8jxhEz4yWPb8qr`.
- **Riesgos identificados:** Cloudflare/captcha en Bee → error visible, 75 créditos gastados. Túnel trycloudflare efímero. JSON nativo de Peya/Uber/Rappi puede cambiar.
- **Plan de mitigación:** 1 request + reintento manual; jobs en background; parsers con dumps `/tmp` en tests.

---

## 9. Puerta de Enlace y Firma de Auditoría de Documentación

### Checklist de criterios de aceptación

- [x] YAML frontmatter completado (`id`, `status`, `owner`, fechas).
- [x] Problemas `ERR-XX` mapeados a `FEAT-XX` y módulos sugeridos en RTM.
- [x] Criterios de éxito en formato BDD (Dado / Cuando / Entonces).
- [x] Out-of-scope explícito documentado.
- [x] Restricciones técnicas alineadas (web, no Expo APK).
- [x] Auditoría registrada en `audits/auditoria-documentacion.md` con resultado `[APROBADO]`.

### Registro de visto bueno

- **Aprobado por (Arquitecto):** `Vissiuss`
- **Fecha de aprobación:** `2026-08-27`
- **audit_1_passed:** `true`
