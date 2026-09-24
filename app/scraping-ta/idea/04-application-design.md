---
id: "DES-001"
title: "Diseño de Aplicación — Scraping TA"
status: "APROBADO"
version: "1.0.0"
owner: "Vissiuss / Arquitecto WIKA"
created_at: "2026-08-27"
updated_at: "2026-08-27"
audit_1_passed: true
audit_2_passed: true
visual_approval_passed: true
audit_3_passed: true
---

# [04] Diseño de Aplicación, Navegación y Aprobación Visual

> **Pre-requisito:** `audit_2_passed: true` en `03-module-discovery.md`.  
> **Gate visual:** `visual_approval_passed: true` requiere visto bueno del arquitecto/stakeholder.  
> **Equivalencia:** Auditoría de Ensamblado (parte visual) → `docs/auditoria-ensamblado.md`.

## 1. Identificación y Antecedentes

- **Nombre del Proyecto:** `Scraping TA`
- **Documentos base:** `01-problem.md` | `02-features.md` | `03-module-discovery.md`
- **Estado de gatekeeping:** `ENSAMBLADO_APROBADO`
- **Navegación:** `/login` + `/admin` (no expo-router)

---

## 2. Arquitectura General

Páginas HTML servidas por FastAPI (`login.html`, `admin.html`). El browser habla JSON con `/api/*`. Los parsers y Bee corren en el servidor. Theme local: variables CSS Vissiuss (navy + oro) en `:root` (V1.1; design-system repo queda para V3+).

---

## 3. Módulos Utilizados en V1

| ID Módulo | Nombre | Rol en V1 |
| :--- | :--- | :--- |
| `MOD-01` | `mod-token` | Guardar / leer token |
| `MOD-02` | `mod-bee` | Scrape stealth CL |
| `MOD-03`–`06` | parsers | JSON nativo |
| `MOD-07` | `mod-schema` | Filas unificadas |
| `MOD-08` | `mod-excel` | .xlsx |
| `MOD-09` | `mod-jobs` | Audit / retry / poll |
| `MOD-10` | `mod-ui` | Vista única |

---

## 4. Relaciones entre Módulos

```text
UI → POST /api/token | /api/audit | /api/audit/retry | GET /api/audit/{id} | GET report
Jobs → Bee/CDN → parsers → schema → persist JSON+xlsx
UI poll → tabla canales + botones Reintentar
```

---

## 5. Flujo Principal de Usuario

```text
[Token] → [4 URLs] → [Auditar] → [poll running] → [tabla + xlsx]
                              ↘ [Reintentar canal] → [poll] → [xlsx actualizado]
```

Estados: idle, queued, running (`step` por canal), done, error. Canal: ok / error / omitido.

---

## 6. Navegación (web, no expo-router)

| Ruta | Pantalla | Módulos | Feature |
| :--- | :--- | :--- | :--- |
| `/login` | `VIEW-02` Acceso admin | `MOD-11` | `FEAT-11` |
| `/` · `/admin` | `VIEW-03` Consola Vissiuss | `MOD-10` + API | `FEAT-01`–`FEAT-08`, `FEAT-11` |
| `/api/health` | JSON | `MOD-09` | ops |
| `/api/login` `/api/logout` `/api/me` | sesión | `MOD-11` | `FEAT-11` |
| `/api/targets` | URLs persistidas | `MOD-10` | `FEAT-02` |
| `/api/reports` | lista de runs | `MOD-08`, `MOD-09` | `FEAT-05` |
| `/api/token` | JSON | `MOD-01` | `FEAT-01` |
| `/api/audit` | JSON job | `MOD-09` | `FEAT-03`, `FEAT-08` |
| `/api/audit/retry` | JSON job | `MOD-09` | `FEAT-06` |
| `/api/audit/{id}` | JSON job | `MOD-09` | `FEAT-08` |
| `/api/report/{id}.xlsx` | archivo | `MOD-08` | `FEAT-05` |

---

## 7. Consumo de Tokens y Theme

Hex **solo** en `:root` de `static/admin.html` y `static/login.html`. Componentes usan `var(--…)`.

### Tokens clave V1.1 — familia Vissiuss enterprise

| Token semántico | Uso | Valor |
| :--- | :--- | :--- |
| `--bg` | Fondo consola | `#0B1220` |
| `--bg-elevated` | Header / nav | `#121A2B` |
| `--ink` | Texto principal | `#F4F7FB` |
| `--muted` | Hints, labels | `#93A0B5` |
| `--card` | Paneles | `#172033` |
| `--line` | Bordes | `#2A3548` |
| `--accent` | CTA | `#C9A227` |
| `--accent-dark` | Hover CTA | `#A6861C` |
| `--brand` | Wordmark Vissiuss | `#E8D48B` |
| `--ok` | Status listo | `#3D9B6E` |
| `--warn` | Avisos | `#D97706` |
| `--danger` | Errores | `#C2413B` |

Alineados a semántica WIKA `background` / `text` / `accent` / `surface` (familia local “navy + oro Vissiuss”).

---

## 8. Matriz Preview Visual vs Componentes de Código

| ID Vista | ID Módulo | Componente / Pantalla | Tokens | Referencia |
| :--- | :--- | :--- | :--- | :--- |
| `VIEW-02` | `MOD-11` | Login Vissiuss | `--bg`, `--brand` | ASCII §9 |
| `VIEW-03` | `MOD-10` | Páginas a scrapear + iframe | `--card`, `--accent` | ASCII §9 |
| `VIEW-03` | `MOD-10` | Informes + Descargar .xlsx | `--brand` | |
| `VIEW-03` | `MOD-10` | Ajustes token | `--accent` | |

---

## 9. Layout Visual (wireframe / ASCII)

```text
┌ login ──────────────────────────────────────────────────┐
│ VISSIUSS                                                │
│ Admin Scraping TA     [usuario] [clave] [Entrar]        │
└─────────────────────────────────────────────────────────┘
┌ admin ──────────────────────────────────────────────────┐
│ VISSIUSS  Scraping TA                      admin [Salir]│
├ nav ─────┬──────────────────────────────────────────────┤
│ Páginas  │  4 cards URL · preview iframe · extraídos    │
│ Informes │  tabla runs · [Descargar .xlsx]              │
│ Ajustes  │  token Bee                                   │
└──────────┴──────────────────────────────────────────────┘
```

---

## 10. Riesgos de Diseño

| Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- |
| Una página densa en móvil | `Medio` | Inputs 100%; Reintentar nowrap; viewport meta |
| Status se confunde con botón Auditar | `Bajo` | Texto en `#audit-status`, no en el botón |
| Theme local vs design-system V3+ | `Bajo` | Migrar tokens en V3+ si se profesionaliza |

---

## 11. Puerta de Enlace — Aprobación Visual y Ensamblado

### Checklist aprobación visual (Gate 3A)

- [x] Navegación y flujo principal definidos.
- [x] Todos los módulos V1 incorporados sin huérfanos.
- [x] Tokens/theme documentados.
- [x] Wireframe revisado por arquitecto.
- [x] Sin dependencias circulares.

### Checklist auditoría de ensamblado (Gate 3B)

- [x] `05-build-plan.md` coherente con este diseño.
- [x] Estrategia de build web (uvicorn, no APK).
- [x] `audits/auditoria-ensamblado.md` en estado `[APROBADO]`.

### Registro de visto bueno

- **Aprobación visual (Arquitecto / Stakeholder):** `Vissiuss`
- **Fecha visual:** `2026-08-27`
- **visual_approval_passed:** `true`

- **Aprobación ensamblado (Arquitecto):** `Vissiuss`
- **Fecha ensamblado:** `2026-08-27`
- **audit_3_passed:** `true`
