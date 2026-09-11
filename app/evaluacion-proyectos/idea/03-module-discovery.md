---
id: "MOD-001"
title: "Descubrimiento y Arquitectura de Módulos — Evaluación Proyectos"
status: "APROBADO"
version: "1.0.0"
owner: "Vissiuss / Arquitecto WIKA"
created_at: "2026-09-11"
updated_at: "2026-09-11"
audit_1_passed: true
audit_2_passed: true
---

# [03] Descubrimiento y Especificación de Arquitectura Modular

> **Pre-requisito:** `audit_1_passed: true` en `01-problem.md` y `02-features.md`.

## 1. Identificación y Documentos Base

- **Nombre del Proyecto:** `Evaluación Proyectos`
- **Especificaciones base:** `01-problem.md` (`PROB-001`) | `02-features.md` (`FEAT-001`)
- **Estado de gatekeeping:** `AUDIT_2_APROBADO`

---

## 2. Matriz de Trazabilidad Modular (RTM 1:1)

| ID Módulo | ID Feature (`02-features.md`) | ID Problema (`01-problem.md`) | Nombre del Módulo | Tipo | Responsabilidad Principal |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `MOD-01` | `FEAT-04`, `FEAT-05` | `ERR-04`, `ERR-05` | `mod-scoring` | `engine / lógica` | Validar scores 1–5 y armar payload |
| `MOD-02` | `FEAT-03`, `FEAT-05` | `ERR-03`, `ERR-05` | `mod-eval-api` | `engine / I/O` | GET proyectos y POST evaluaciones |
| `MOD-03` | `FEAT-02` | `ERR-02` | `mod-session` | `persistencia` | Nombre en AsyncStorage |
| `MOD-04` | `FEAT-01` | `ERR-01` | `mod-splash` | `UI` | Wordmark + barra 5 s |
| `MOD-05` | `FEAT-02`–`FEAT-05` | `ERR-02`–`ERR-05` | `mod-ui` | `UI` | Login, home, detalle, tokens |

---

## 3. Desglose de Arquitectura Modular

### Módulo `MOD-01`: mod-scoring

**Patrón:** Pure engine  
**Ruta:** `src/engine/validation.ts`, `src/engine/payload.ts`

#### Contrato

- **Entradas:** nombre, slug/id, tres enteros
- **Salidas:** payload válido o error de validación
- **Dependencias:** ninguna
- **Reutilizable:** Sí

#### Reglas de aislamiento

- No importa React
- Scores estrictamente 1–5; nombre trim 2–80

### Módulo `MOD-02`: mod-eval-api

**Patrón:** Repository HTTP  
**Ruta:** `src/engine/evalApi.ts`

#### Contrato

- **Entradas:** config URL + anon key, payload
- **Salidas:** lista de proyectos / void en upsert
- **Dependencias:** `fetch`, PostgREST

#### Reglas de aislamiento

- Único I/O de red
- No importa React

### Módulo `MOD-03`: mod-session

**Patrón:** Feature module  
**Ruta:** `src/modules/session/`

- AsyncStorage key `evaluacion.evaluatorName`
- Engine no conoce AsyncStorage

### Módulo `MOD-04`: mod-splash

**Ruta:** `app/index.tsx`, `src/components/Wordmark.tsx`, `ProgressBar.tsx`

### Módulo `MOD-05`: mod-ui

**Ruta:** `app/login.tsx`, `app/home.tsx`, `app/proyecto/[slug].tsx`, `src/components/`, `src/constants/theme.ts`

---

## 4. Grafo de Dependencias y Reglas de Importación

```text
[app/ screens — expo-router]
       │
       ▼ consume
[MOD-05 UI / MOD-04 splash]
       │
       ▼
[MOD-03 session]  [MOD-01 scoring]  [MOD-02 eval-api]
```

Prohibido: engine importando UI o AsyncStorage.
