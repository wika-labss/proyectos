---
id: "FEAT-001"
title: "Especificación de Requerimientos — Evaluación Proyectos"
status: "APROBADO"
version: "1.0.0"
owner: "Vissiuss / Equipo WIKA"
created_at: "2026-09-11"
updated_at: "2026-09-11"
audit_1_passed: true
audit_2_passed: true
---

# [02] Especificación de Características y Requerimientos Funcionales

> **Pre-requisito:** `audit_1_passed: true` en `01-problem.md` y este documento.

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** `Evaluación Proyectos`
- **Documento base:** `idea/01-problem.md` (ID: `PROB-001`)
- **Estado de gatekeeping:** `AUDIT_1_APROBADO`

---

## 2. Matriz de Trazabilidad de Requerimientos (RTM 1:1)

| ID Feature | ID Problema (`01-problem.md`) | Nombre de la Característica | Prioridad | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-01` | `ERR-01` | Splash VISSIUSS 5 s con barra | `Crítica` | `mod-splash` |
| `FEAT-02` | `ERR-02` | Login solo con nombre | `Crítica` | `mod-session` |
| `FEAT-03` | `ERR-03` | Home con tres proyectos | `Crítica` | `mod-projects`, `mod-eval-api` |
| `FEAT-04` | `ERR-04` | Calificar 1–5 en tres criterios | `Crítica` | `mod-scoring` |
| `FEAT-05` | `ERR-05` | Guardar evaluación vía API | `Crítica` | `mod-eval-api` |

---

## 3. Funcionalidades Obligatorias

### Feature `FEAT-01`: Splash corporativo

**Descripción:** Primera pantalla: wordmark VISSIUSS, letras sobrias, barra de progreso de 5 segundos.

#### Escenario 1.1: Flujo exitoso

- **Dado que** el usuario abre la app
- **Cuando** la barra llega al 100% en 5 s
- **Entonces** navega a login si no hay nombre, o a home si ya hay sesión local

### Feature `FEAT-02`: Login por nombre

**Descripción:** Un campo de texto; el nombre se persiste en AsyncStorage y viaja en cada evaluación.

#### Escenario 2.1: Happy path

- **Dado que** el splash terminó y no hay nombre
- **Cuando** escribe un nombre de 2–80 caracteres y continúa
- **Entonces** entra al home

#### Escenario 2.2: Validación

- **Dado que** el nombre está vacío o tiene 1 carácter
- **Cuando** pulsa Continuar
- **Entonces** no navega y muestra error con token `error`

### Feature `FEAT-03`: Home de proyectos

**Descripción:** Lista Proyecto Alan, Proyecto Alvaro, Proyecto Joaquin desde `GET /rest/v1/eval_projects`.

#### Escenario 3.1: Happy path

- **Dado que** hay nombre de evaluador
- **Cuando** carga el home
- **Entonces** se ven las tres cards y cada una abre el detalle

### Feature `FEAT-04`: Scoring 1–5

**Descripción:** En cada proyecto, tres bloques: Funcionalidad, Diseño, Propuesta de negocio. Botones 1–5.

#### Escenario 4.1: Selección

- **Dado que** está en el detalle
- **Cuando** elige un valor 1–5 por criterio
- **Entonces** el valor queda marcado y habilita Guardar al completar los tres

### Feature `FEAT-05`: Persistencia API

**Descripción:** Upsert a `eval_evaluations` (unique nombre + proyecto). La UI no lee ni muestra promedios.

#### Escenario 5.1: Guardado

- **Dado que** los tres scores son 1–5
- **Cuando** pulsa Guardar
- **Entonces** `POST` con `resolution=merge-duplicates` responde 2xx y vuelve al home

#### Escenario 5.2: Red

- **Dado que** la API falla
- **Cuando** intenta guardar
- **Entonces** muestra error y no crashea

---

## 4. Funcionalidades Deseables (V1.1+)

| ID Feature | Nombre | Prioridad | Notas |
| :--- | :--- | :--- | :--- |
| `FEAT-06` | Promedios en UI | `Baja` | Fuera de V1 |
| `FEAT-07` | Auth real | `Baja` | Fuera de V1 |
| `FEAT-08` | Proyecto Supabase dedicado | `Media` | Bloqueado por límite Free de 2 proyectos |

---

## 5. Fuera de Alcance

- Promedios / ranking
- Email, OAuth, magic link
- iOS, web como producto (web solo para preview de desarrollo)
- APK release en este ciclo
