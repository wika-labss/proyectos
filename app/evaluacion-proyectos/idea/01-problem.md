---
id: "PROB-001"
title: "Evaluación Proyectos"
status: "APROBADO"
version: "1.0.0"
owner: "Vissiuss / Equipo WIKA"
created_at: "2026-09-11"
updated_at: "2026-09-11"
audit_1_passed: true
---

# [01] Definición del Problema, Alcance y Metas

> **Equivalencia de auditoría:** `audit_1_passed: true` requiere aprobación formal en `audits/auditoria-documentacion.md`.

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** `Evaluación Proyectos`
- **Repositorio de aplicación:** `proyectos/app/evaluacion-proyectos/`
- **Stakeholders clave:** Vissiuss (producto / ingeniería), evaluadores internos (Alan / Alvaro / Joaquin)
- **Estado de gatekeeping:** `AUDIT_1_APROBADO`

---

## 2. Definición del Problema y Justificación

- **¿Qué problema se intenta resolver?**  
  No hay un canal único para calificar los tres proyectos internos (Alan, Alvaro, Joaquin) en Funcionalidad, Diseño y Propuesta de negocio. Las notas se pierden en chat o no se guardan.

- **Impacto actual / costo de oportunidad:**  
  Sin persistencia no se puede comparar criterios ni auditar quién evaluó. Cada ronda de feedback se reabre desde cero.

- **Análisis de brecha (Gap Analysis):**
  - **Estado actual (hoy):** Sin app ni tabla de evaluaciones.
  - **Estado deseado (mañana):** App Android V1 con identidad por nombre, splash corporativo VISSIUSS y notas 1–5 persistidas vía API REST de Supabase.

---

## 3. Matriz de Trazabilidad de Requerimientos (RTM Inicial)

| ID Problema | Descripción del Dolor | Impacto | ID Feature (`02-features.md`) | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `ERR-01` | No hay entrada de marca ni espera controlada al abrir | `Medio` | `FEAT-01` | `mod-splash` |
| `ERR-02` | No se identifica al evaluador | `Alto` | `FEAT-02` | `mod-session` |
| `ERR-03` | Los tres proyectos no están a un toque | `Alto` | `FEAT-03` | `mod-projects`, `mod-eval-api` |
| `ERR-04` | No se puede puntuar Funcionalidad / Diseño / Negocio 1–5 | `Alto` | `FEAT-04` | `mod-scoring` |
| `ERR-05` | Las notas no viajan a una base de datos | `Alto` | `FEAT-05` | `mod-eval-api` |

---

## 4. Audiencia y Casos de Uso Core

- **Usuarios principales:**
  - **Evaluador interno:** pone su nombre, elige un proyecto, califica tres criterios, guarda.
  - **Vissiuss / arquitectura:** lee filas en el dashboard de Supabase (fuera de la UI).

- **Fuera de alcance (Out of Scope explícito):**
  - Auth real (email/password, OAuth)
  - Promedios o ranking en la app
  - APK release / iOS
  - Edición de catálogo de proyectos desde la UI

---

## 5. Objetivo y Beneficios Esperados

- **Objetivo:** Al cerrar V1, un evaluador completa splash → nombre → proyecto → tres notas y la fila existe en `eval_evaluations`.
- **Beneficios esperados:**
  - Feedback estructurado y trazable por nombre
  - Mismo look corporativo (negro / blanco / gris)

---

## 6. Criterios de Éxito en Formato BDD (Gherkin)

### Escenario 1: Guardar evaluación

- **Dado que** el usuario abrió la app y escribió su nombre
- **Cuando** califica un proyecto 1–5 en los tres criterios y pulsa Guardar
- **Entonces** la API acepta el upsert y vuelve al home sin crash

### Escenario 2: Splash corporativo

- **Dado que** se abre la app
- **Cuando** transcurren 5 segundos con barra de progreso
- **Entonces** se muestra el wordmark VISSIUSS sobre fondo negro y luego el login (o home si ya hay nombre)

---

## 7. Restricciones

- Expo SDK 52 + React Native 0.76.x + TypeScript; pins `~` en expo/react-native
- Lógica pura en `src/engine/` sin imports de React
- Tokens en `theme.ts`; 0% hex en pantallas
- Cliente solo con clave anon/publishable; RLS en `eval_*`
