---
id: "BUILD-001"
title: "Plan de Construcción V1 — Scraping TA"
status: "APROBADO"
version: "1.0.0"
owner: "Vissiuss / Arquitecto WIKA"
created_at: "2026-08-27"
updated_at: "2026-08-27"
audit_1_passed: true
audit_2_passed: true
visual_approval_passed: true
audit_3_passed: true
ready_for_construction: true
---

# [05] Plan de Construcción V1 (Build Plan)

> **Bloqueo:** Si `ready_for_construction: false`, queda prohibido crear o modificar código en `iterations/v1/`.  
> **Activación:** `ready_for_construction: true` solo cuando los cuatro flags anteriores sean `true`.  
> **Entregable:** Aplicación web (no APK). Verify = `pytest` + `uvicorn` en `:8000`.

## 1. Verificación de Pre-requisitos

- [x] Auditoría de Documentación: `audit_1_passed == true` (`auditoria-documentacion.md`)
- [x] Auditoría de Módulos: `audit_2_passed == true` (`auditoria-modulos.md`)
- [x] Aprobación visual: `visual_approval_passed == true` (`04-application-design.md`)
- [x] Auditoría de Ensamblado: `audit_3_passed == true` (`auditoria-ensamblado.md`)

---

## 2. Alcance de la V1

**Features incluidas:** `FEAT-01` … `FEAT-08`  
**Features excluidas:** `FEAT-09+` (mismo mall forzado, auth, hosting fijo)  
**Módulos incluidos:** `MOD-01` … `MOD-10`

---

## 3. Cronograma de Ejecución (Build Schedule)

| Paso | Módulo | ID Feature | Archivos | Estado |
| :--- | :--- | :--- | :--- | :--- |
| `01` | global | N/A | `requirements.txt`, `.gitignore`, `pytest.ini` | COMPLETADO |
| `02` | `MOD-07` | `FEAT-04` | `schema.py` | COMPLETADO |
| `03` | `MOD-01` | `FEAT-01` | `token_store.py` | COMPLETADO |
| `04` | `MOD-02` | `FEAT-03` | `bee.py` (`scrape_once`) | COMPLETADO |
| `05` | `MOD-03`–`06` | `FEAT-04` | `parsers/*.py` | COMPLETADO |
| `06` | `MOD-08` | `FEAT-05` | `excel_report.py` | COMPLETADO |
| `07` | `MOD-09` | `FEAT-03`, `FEAT-07`, `FEAT-08` | `app.py` jobs | COMPLETADO |
| `08` | `MOD-09` | `FEAT-06` | `POST /api/audit/retry` | COMPLETADO |
| `09` | `MOD-10` | `FEAT-01`–`FEAT-08` | `static/index.html` | COMPLETADO |
| `10` | tests | `NFR-02` | `tests/test_parsers.py`, `tests/test_retry.py` | COMPLETADO |

---

## 4. Orden de Implementación y Justificación

1. Schema unificado (todo parser termina ahí).
2. Token + Bee (1 request).
3. Parsers con dumps reales (sin gastar Bee en CI).
4. Excel.
5. Jobs async (túnel).
6. UI + retry por canal.
7. Pytest.

---

## 5. Desglose por Fases

### Fase 1: Toolchain web

- Python 3.11+, venv, FastAPI, uvicorn, pytest.
- Criterio: `pip install -r requirements.txt`.

### Fase 2: Engine parsers (`MOD-03`–`07`)

- Sin UI. Tests con `/tmp/*-bee` si existen.
- Criterio: `pytest tests/test_parsers.py`.

### Fase 3: Orquestación y UI (`MOD-09`, `MOD-10`)

- Jobs + retry + página única.
- Criterio: Justo CDN end-to-end; retry mock sin Bee.

### Fase 4: Verify (cierre V1)

- `python -m pytest tests -q`
- `python -m uvicorn app:app --host 127.0.0.1 --port 8000`
- No APK. No `npm run verify`.

---

## 6. Dependencias Externas

| Dependencia | Versión | Propósito |
| :--- | :--- | :--- |
| `fastapi` | `>=0.115` | API |
| `uvicorn` | `>=0.32` | Servidor |
| `httpx` | `>=0.27` | Bee + CDN Justo |
| `openpyxl` | `>=3.1.5` | Excel |
| `pydantic` | `>=2.9` | Bodies |
| `pytest` | `>=8.3` | Tests |
| ScrapingBee | cuenta propia | Peya/Uber/Rappi |

---

## 7. Estrategia de Pruebas

| Tipo | Alcance | Comando / método |
| :--- | :--- | :--- |
| Parsers | Dumps nativos | `pytest tests/test_parsers.py` |
| Retry API | Mock `_run_one_channel` | `pytest tests/test_retry.py` |
| Justo live | CDN | `test_audit_job_polls_to_done` |
| BDD manual | VIEW-01 | Auditar Justo; Reintentar; bajar xlsx |

---

## 8. Riesgos Técnicos

| Riesgo | Probabilidad | Mitigación |
| :--- | :--- | :--- |
| Bee/Cloudflare | Alta | 1 request; retry manual |
| Túnel POST timeout | Alta | Job + poll |
| Scope APK | Media | Out-of-scope explícito |
| Token en git | Baja | `.gitignore` `.scrapingbee_key` |

---

## 9. Criterios de Aprobación V1

- [x] Features `FEAT-01`–`FEAT-08` implementadas.
- [x] `pytest tests -q` en verde.
- [x] App web en `:8000` (no APK).
- [x] `review.md` / `generation-report.md` en `iterations/v1/`.
- [x] Listo para `auditoria-release-v1.md`.

---

## 10. Checklist por Incremento (Quality Gate)

- [x] Trazabilidad RTM (feature → módulo → archivo).
- [x] Escenarios BDD Justo + retry verificados.
- [x] Token no commiteado.
- [x] CSS vía tokens `:root`.

---

## 11. Cierre de Fase de Construcción

- **Revisado por (Arquitecto):** `Vissiuss`
- **Fecha de finalización:** `2026-08-27`
- **ready_for_construction:** `true`
- **Estado cierre V1:** `LISTO_PARA_AUDITORIA_RELEASE`
