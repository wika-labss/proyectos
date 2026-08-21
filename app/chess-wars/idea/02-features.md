---
id: "FEAT-001"
title: "[Especificación de Requerimientos y Características]"
status: "BORRADOR"
version: "1.0.0"
owner: "[Nombre del Responsable / Equipo]"
created_at: "YYYY-MM-DD"
updated_at: "YYYY-MM-DD"
audit_1_passed: false
audit_2_passed: false
---

# [02] Especificación de Características y Requerimientos Funcionales

> **Pre-requisito:** `audit_1_passed: true` en `01-problem.md` y este documento.  
> **Equivalencia:** Auditoría de Documentación → `docs/auditoria-documentacion.md`.

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** `[Ej. Tower Defense - WIKA]`
- **Documento base:** `idea/01-problem.md` (ID: `PROB-001`)
- **Estado de gatekeeping:** `[PENDIENTE_AUDITORIA_DOCUMENTACION]`

---

## 2. Matriz de Trazabilidad de Requerimientos (RTM 1:1)

| ID Feature | ID Problema (`01-problem.md`) | Nombre de la Característica | Prioridad | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-01` | `ERR-01` | `[Ej. Iniciar partida offline]` | `Crítica` | `mod-[nombre]` |
| `FEAT-02` | `ERR-02` | `[Ej. Guardar progreso local]` | `Alta` | `mod-[nombre]` |

---

## 3. Funcionalidades Obligatorias

### Feature `FEAT-01`: [Nombre]

**Descripción:** `[Qué hace y valor para el usuario]`

#### Escenario 1.1: Flujo exitoso (Happy Path)

- **Dado que** `[condición inicial]`
- **Cuando** `[acción del usuario o sistema]`
- **Entonces** `[resultado observable]`

#### Escenario 1.2: Manejo de errores

- **Dado que** `[condición de fallo posible]`
- **Cuando** `[se intenta la acción]`
- **Entonces** `[comportamiento seguro sin crash; mensaje o estado fallback]`

---

### Feature `FEAT-02`: [Nombre]

**Descripción:** `[Explicación concisa]`

#### Escenario 2.1: Validación de entrada

- **Dado que** `[entrada inválida o vacía]`
- **Cuando** `[el usuario confirma]`
- **Entonces** `[bloqueo de acción y feedback visual con token error si aplica UI]`

---

## 4. Funcionalidades Deseables (V1.1+)

| ID Feature | Nombre | Prioridad | Notas |
| :--- | :--- | :--- | :--- |
| `FEAT-03` | `[Nombre]` | `Media` | `[Fuera de V1 si no cabe en build plan]` |

---

## 5. Fuera de Alcance

- `[Funcionalidad explícitamente excluida]`
- `[Ej. Multijugador, iOS, monetización]`

---

## 6. Requerimientos No Funcionales (NFRs) Medibles

| ID NFR | Categoría | Criterio aceptable | Método de validación |
| :--- | :--- | :--- | :--- |
| `NFR-01` | **Rendimiento** | Engine smoke tests pasan en &lt; 30s | `npm run verify` |
| `NFR-02` | **Build** | APK release compila sin Metro | `scripts/build-apk.sh` |
| `NFR-03` | **Fidelidad visual** | 100% tokens documentados (si UI) | Revisión en `04-application-design.md` |
| `NFR-04` | **Offline** | Flujo principal sin red | Prueba manual / smoke test |

---

## 7. Mapeo de UI y Componentes (si aplica)

| Componente UI | Pantalla / Vista | Tokens (`standards/design-system.md`) | Estado mockup |
| :--- | :--- | :--- | :--- |
| `[Ej. PrimaryButton]` | `[Home]` | `accent`, `spacing.md` | `[PENDIENTE / N/A]` |
| `[Ej. GameBoard]` | `[Play]` | `surface`, `border` | `[PENDIENTE]` |

> Proyectos sin UI significativa: marcar sección N/A y continuar con lógica/engine.

---

## 8. Puerta de Enlace y Firma de Auditoría de Documentación

### Checklist

- [ ] Frontmatter YAML vinculado a `PROB-001`.
- [ ] RTM 1:1 con IDs `ERR-XX` de `01-problem.md`.
- [ ] Escenarios BDD por feature obligatoria.
- [ ] NFRs con métricas verificables.
- [ ] Deseables y fuera de alcance diferenciados.
- [ ] `audits/auditoria-documentacion.md` en estado `[APROBADO]`.

### Registro de visto bueno

- **Aprobado por (Arquitecto):** `________________________`
- **Fecha:** `YYYY-MM-DD`
- **audit_1_passed:** `false` → `true` al aprobar
