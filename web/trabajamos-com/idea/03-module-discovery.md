---
id: "WEB-MOD-001"
title: "[Descubrimiento de Módulos Web]"
status: "BORRADOR"
version: "0.1.0"
owner: "[Responsable]"
created_at: "YYYY-MM-DD"
updated_at: "YYYY-MM-DD"
audit_1_passed: false
audit_2_passed: false
---

# [03] Descubrimiento y Especificación de Módulos (Web)

> **Pre-requisito:** `audit_1_passed: true` en `01-problem.md` y `02-features.md`.  
> **Equivalencia:** Auditoría de Módulos → `docs/auditoria-modulos.md`.  
> `audit_2_passed` se activa **solo en este documento**, no en 01/02/04.

## 1. Identificación y Documentos Base

- **Nombre del Proyecto:** `[Ej. Landing oficios — WIKA]`
- **Especificaciones base:** `01-problem.md` (`WEB-PROB-001`) | `02-features.md` (`WEB-FEAT-001`)
- **Estado de gatekeeping:** `[PENDIENTE_AUDITORIA_MODULOS]`

---

## 2. Matriz de Trazabilidad Modular (RTM 1:1)

| ID Módulo | ID Feature (`02`) | ID Problema (`01`) | Nombre | Tipo | Responsabilidad |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `MOD-01` | `FEAT-01` | `ERR-01` | `mod-[hero]` | `sección` | `[Hero + CTA]` |
| `MOD-02` | `FEAT-02` | `ERR-02` | `mod-[contacto]` | `formulario` | `[Form + validación]` |

---

## 3. Desglose de Arquitectura Modular

### Módulo `MOD-01`: [Nombre]

**Ruta prevista:** `iterations/vN/` (secciones HTML)

#### Contrato

- **Entradas:** `[Props / contenido]`
- **Salidas:** `[CTA, eventos]`
- **Dependencias:** `[Ninguna / MOD-02]`
- **Reutilizable:** `Sí / No`

---

## 4. Resolución de dirección visual (taste-skill) — MOD-DIR

Resolver `direction_skill` usando `standards/direction-matrix.yaml`. No inventar un cuarto skill de dirección.

```yaml
mod_id: MOD-DIR
industry_type: ""              # enum — definido en 01-problem
business_model: ""             # opcional — de 02-features
direction_skill: ""            # minimalist-ui | high-end-visual-design | industrial-brutalist-ui
direction_rationale: ""
direction_locked: true
allowed_phase2_skills:
  - design-taste-frontend
  - redesign-existing-projects
forbidden_phase2_skills:
  - image-to-code
```

`direction_locked: true` al aprobar Gate 2. Cambiar de dirección exige reabrir la auditoría de módulos.
