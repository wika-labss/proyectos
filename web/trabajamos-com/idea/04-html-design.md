---
id: "WEB-HTML-001"
title: "[Diseño HTML y Aprobación Visual]"
status: "BORRADOR"
version: "0.1.0"
owner: "[Responsable]"
created_at: "YYYY-MM-DD"
updated_at: "YYYY-MM-DD"
visual_approval_passed: false
audit_3_passed: false
construction_phase_complete: false
direction_skill: ""
---

# [04] HTML Estructural, Wireframes y Aprobación Visual

> **Pre-requisito:** `audit_2_passed: true` en `03-module-discovery.md`.  
> **Gate visual:** `visual_approval_passed: true` requiere visto bueno del arquitecto/stakeholder.  
> **Equivalencia:** Auditoría de Ensamblado → `docs/auditoria-ensamblado.md`.  
> El flag `audit_2_passed` **no** vive aquí (es el Gate 2 de módulos).  
> `ready_for_construction` vive en `05-build-plan.md`, no aquí.

## 1. Identificación y Antecedentes

- **Nombre del Proyecto:** `[Ej. Landing oficios — WIKA]`
- **Documentos base:** `01-problem.md` | `02-features.md` | `03-module-discovery.md` | `05-build-plan.md`
- **Estado de gatekeeping:** `[PENDIENTE_APROBACION_VISUAL]`

`direction_skill` debe coincidir con `MOD-DIR` en `03-module-discovery.md`.

---

## 2. Mapa de vistas (VIEW-XX)

| ID Vista | Ruta / ancla | Módulos | Feature |
| :--- | :--- | :--- | :--- |
| `VIEW-01` | `/` `#hero` | `MOD-01` | `FEAT-01` |
| `VIEW-02` | `/` `#contacto` | `MOD-02` | `FEAT-02` |

---

## 3. Flujo principal

```text
[Hero] → [Secciones] → [CTA / Form] → [Éxito o WhatsApp]
```

Estados: loading (si aplica), success, error, empty.

---

## 4. HTML semántico (Fase 1)

Describir landmarks (`header`, `main`, `nav`, `footer`), headings y labels de forms. **Sin** look final.

- [ ] `ready_for_construction` se activa en **05**, tras Gate 3A + 3B
- [ ] `construction_phase_complete` cuando el HTML de `iterations/vN/` cumple este documento
- [ ] Fase 2 (taste-skill) **prohibida** hasta `construction_phase_complete: true`

---

## 5. Aprobación

- **Gate 3A** `visual_approval_passed` — wireframe / estructura.
- **Gate 3B** `audit_3_passed` — ensamblado 03+04+05.
- **Fase 1** `ready_for_construction` — flag en `05-build-plan.md`.
