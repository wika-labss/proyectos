---
id: "WEB-FEAT-001"
title: "[Features y Secciones Web]"
status: "BORRADOR"
version: "0.1.0"
owner: "[Responsable]"
created_at: "YYYY-MM-DD"
updated_at: "YYYY-MM-DD"
audit_1_passed: false
site_type: ""
---

# [02] Features, Secciones y CTAs (Web)

> **Gate 1:** este documento se aprueba **junto con** `01-problem.md`.  
> **Equivalencia:** Auditoría de Documentación → `docs/auditoria-documentacion.md`.  
> El Gate 2 (Auditoría de Módulos) **no** se registra aquí; vive en `03-module-discovery.md`.  
> `site_type` es técnico (`landing | multipage | cms`). El SKU comercial A/B lo escribe el consultor, no este gate.

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** `[Ej. Landing oficios — WIKA]`
- **Documento base:** `idea/01-problem.md` (ID: `WEB-PROB-001`)
- **site_type:** `[landing | multipage | cms]`
- **Estado de gatekeeping:** `[PENDIENTE_AUDITORIA_DOCUMENTACION]`

---

## 2. Matriz de Trazabilidad de Requerimientos (RTM 1:1)

| ID Feature | ID Problema (`01-problem.md`) | Nombre | Prioridad | Módulo Destino (`03`) |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-01` | `ERR-01` | `[Hero + CTA WhatsApp]` | `Crítica` | `mod-[nombre]` |
| `FEAT-02` | `ERR-02` | `[Formulario de contacto]` | `Alta` | `mod-[nombre]` |

---

## 3. Funcionalidades Obligatorias

### Feature `FEAT-01`: [Nombre]

**Descripción:** `[Qué hace y valor para el visitante]`

#### Escenario 1.1: Flujo exitoso

- **Dado que** `[condición inicial]`
- **Cuando** `[acción del visitante]`
- **Entonces** `[resultado observable]`

#### Escenario 1.2: Manejo de errores

- **Dado que** `[condición de fallo]`
- **Cuando** `[se intenta la acción]`
- **Entonces** `[comportamiento seguro; mensaje o estado fallback]`

---

## 4. Funcionalidades Deseables (v1.1+)

| ID Feature | Nombre | Prioridad | Notas |
| :--- | :--- | :--- | :--- |
| `FEAT-03` | `[Nombre]` | `Media` | `[Fuera de v1 si no cabe]` |

---

## 5. Fuera de Alcance

- `[Reservas, pagos, login de visitantes]`

---

## 6. NFRs

- **Performance:** `[LCP razonable en 4G]`
- **SEO mínimo:** `[title, OG, sitemap si aplica]`
- **Accesibilidad:** `[landmarks, labels en forms]`
