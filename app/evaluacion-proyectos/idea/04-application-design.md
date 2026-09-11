---
id: "DES-001"
title: "Diseño de Aplicación — Evaluación Proyectos"
status: "APROBADO"
version: "1.0.0"
owner: "Vissiuss / Arquitecto WIKA"
created_at: "2026-09-11"
updated_at: "2026-09-11"
audit_1_passed: true
audit_2_passed: true
visual_approval_passed: true
audit_3_passed: true
---

# [04] Diseño de Aplicación, Navegación y Aprobación Visual

> **Gate visual:** `visual_approval_passed: true` — brief del arquitecto 2026-09-11 (negro, blanco, gris, wordmark VISSIUSS).

## 1. Identificación y Antecedentes

- **Nombre del Proyecto:** `Evaluación Proyectos`
- **Documentos base:** `01-problem.md` | `02-features.md` | `03-module-discovery.md`
- **Estado de gatekeeping:** `APROBACION_VISUAL_OK`

---

## 2. Arquitectura General

expo-router Stack. Engine puro + módulo de sesión. Theme único. Red solo en `evalApi.ts`.

---

## 3. Módulos Utilizados en V1

| ID Módulo | Nombre | Rol en V1 |
| :--- | :--- | :--- |
| `MOD-01` | `mod-scoring` | Validación y payload |
| `MOD-02` | `mod-eval-api` | REST Supabase |
| `MOD-03` | `mod-session` | Nombre local |
| `MOD-04` | `mod-splash` | Carga 5 s |
| `MOD-05` | `mod-ui` | Login / home / detalle |

---

## 4. Relaciones entre Módulos

Splash lee sesión al terminar. Login escribe sesión. Home pide proyectos (API). Detalle arma payload (engine) y upsert (API).

---

## 5. Flujo Principal de Usuario

```text
[/ splash 5s] → [/login] → [/home] → [/proyecto/:slug] → Guardar → [/home]
```

Estados: loading (splash, home fetch, guardar), success, error, empty (sin proyectos).

---

## 6. Navegación (expo-router)

| Ruta | Pantalla | Módulos | Feature |
| :--- | :--- | :--- | :--- |
| `/` | Splash VISSIUSS | `MOD-04` | `FEAT-01` |
| `/login` | Nombre | `MOD-03`, `MOD-05` | `FEAT-02` |
| `/home` | Tres proyectos | `MOD-02`, `MOD-05` | `FEAT-03` |
| `/proyecto/[slug]` | Scoring 1–5 | `MOD-01`, `MOD-02`, `MOD-05` | `FEAT-04`, `FEAT-05` |

---

## 7. Consumo de Tokens y Theme

Archivo: `iterations/v1/src/constants/theme.ts`

| Token semántico | Uso en app | Valor |
| :--- | :--- | :--- |
| `background` | Fondo app | `#000000` |
| `surface` | Cards | `#0A0A0A` |
| `text` | Texto principal | `#FFFFFF` |
| `textMuted` | Secundario | `#A3A3A3` |
| `border` | Bordes | `#6B6B6B` |
| `accent` | CTA / selección | `#FFFFFF` |
| `error` | Validación | `#C4C4C4` |
| `spacing.md` | Padding | `16` |
| `radius.sm` | Bordes cards | `4` |

Wordmark: `VISSIUSS`, `letterSpacing` amplio, `fontWeight` 300–400, mayúsculas. Scores: celdas numeradas 1–5, no estrellas. CTA: botón borde gris / relleno blanco.

---

## 8. Wireframe textual

**Splash:** wordmark centrado; barra fina gris bajo el logo; fill blanco 0→100% en 5 s.

**Login:** título «Identificación»; input borde gris; Continuar.

**Home:** título «Proyectos»; tres cards a ancho completo.

**Detalle:** título del proyecto; tres filas de criterio + 1–5; Guardar al pie.

---

## 9. Aprobación visual

`visual_approval_passed: true` — especificación directa del arquitecto (Vissiuss), 2026-09-11.
