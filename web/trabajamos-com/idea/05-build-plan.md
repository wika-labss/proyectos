---
id: "WEB-BUILD-001"
title: "[Plan de Construcción Web]"
status: "BORRADOR"
version: "0.1.0"
owner: "[Responsable]"
created_at: "YYYY-MM-DD"
updated_at: "YYYY-MM-DD"
audit_1_passed: false
audit_2_passed: false
visual_approval_passed: false
audit_3_passed: false
ready_for_construction: false
---

# [05] Plan de Construcción

> **Bloqueo:** Si `ready_for_construction: false`, queda prohibido crear o modificar HTML de producción en `iterations/vN/`.  
> **Activación:** `ready_for_construction: true` solo cuando `audit_1_passed`, `audit_2_passed`, `visual_approval_passed` y `audit_3_passed` sean `true`.  
> El SKU comercial A/B **no** se decide aquí. Eso es `negocio/informe-estado-negocio.md`.

## 1. Origen y hosting (del sitio)

| Capa | Qué usa este proyecto |
|------|------------------------|
| HTML | `[estático / con CMS del proyecto]` |
| Hosting | `[Workers / otro — decisión técnica del sitio, no del plan comercial]` |
| Form / mail | `[sí/no]` |

---

## 2. Dependencias

- [ ] Contenido listo (textos, fotos, CTA)
- [ ] Formulario o WhatsApp según `02-features.md`
- [ ] OG / title según 02 NFRs

---

## 3. Hoja de ruta

| Paso | Módulo | ID Feature | Qué hacer | Estado |
| :--- | :--- | :--- | :--- | :--- |
| `01` | `global` | N/A | Contenido listo | `[PENDIENTE]` |
| `02` | `MOD-01` | `FEAT-01` | Hero + bloques según 04 | `[PENDIENTE]` |
| `03` | `MOD-02` | `FEAT-02` | Form / WhatsApp | `[PENDIENTE]` |

---

## 4. Verificación de pre-requisitos

- [ ] Auditoría de Documentación: `audit_1_passed == true`
- [ ] Auditoría de Módulos: `audit_2_passed == true`
- [ ] Aprobación visual: `visual_approval_passed == true` (`04-html-design.md`)
- [ ] Auditoría de Ensamblado: `audit_3_passed == true`

`ready_for_construction: true` **solo en este archivo**, no en 04.
