---
id: "WEB-PROB-001"
title: "[Definición del Problema Web]"
status: "BORRADOR"
version: "0.1.0"
owner: "[Responsable]"
created_at: "YYYY-MM-DD"
updated_at: "YYYY-MM-DD"
audit_1_passed: false
industry_type: ""
target_audience: ""
brand_tone: ""
---

# [01] Definición del Problema, Alcance y Metas (Web)

> **Equivalencia de auditoría:** `audit_1_passed: true` requiere aprobación formal en `docs/auditoria-documentacion.md`.  
> **Ruta del sitio:** `proyectos/web/{proyecto}/`.  
> El SKU comercial A/B **no** se clasifica aquí. Eso es el consultor (`docs/plan-de-negocio-web/`).

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** `[Ej. Landing oficios — WIKA]`
- **Repositorio de aplicación:** `proyectos/web/[nombre-proyecto]/`
- **Stakeholders clave:** `[Lista de involucrados y roles]`
- **Estado de gatekeeping:** `[PENDIENTE_AUDITORIA_DOCUMENTACION]`
- **industry_type (MOD-DIR):** `[b2b_saas | luxury_dtc | wellness | … ver standards/direction-matrix.yaml]`

---

## 2. Definición del Problema y Justificación

- **¿Qué problema se intenta resolver?**  
  `[Dolor actual: sin URL, Instagram no convierte, etc.]`

- **Impacto actual / costo de oportunidad:**  
  `[Consecuencias de no resolver el problema.]`

- **Análisis de brecha:**
  - **Estado actual:** `[Sin sitio / Wix / Instagram]`
  - **Estado deseado:** `[Visitante encuentra URL, entiende la oferta y contacta]`

---

## 3. Matriz de Trazabilidad de Requerimientos (RTM Inicial)

| ID Problema | Descripción del Dolor | Impacto | ID Feature (`02-features.md`) | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `ERR-01` | `[Ej. No existe URL para Ads]` | `Alto` | `FEAT-01` | `mod-[nombre]` |
| `ERR-02` | `[Ej. Contacto solo por DM]` | `Alto` | `FEAT-02` | `mod-[nombre]` |

---

## 4. Audiencia y Casos de Uso Core

- **Usuarios principales:**
  - **Rol 1:** `[Cliente final]` → **Necesidad:** `[Encontrar WhatsApp / pedir hora]`
  - **Rol 2:** `[Operador WIKA]` → **Necesidad:** `[Publicar y mantener]`

- **Fuera de alcance (Out of Scope explícito):**
  - `[Reservas, pagos, login de visitantes en v1]`

---

## 5. Objetivo y Beneficios Esperados

- **Objetivo:** `[Resultado medible al cerrar v1]`
- **Beneficios esperados:**
  - `[Beneficio 1]`

---

## 6. Criterios de Éxito en Formato BDD (Gherkin)

### Escenario 1: [Flujo principal]

- **Dado que** `[un visitante abre la URL]`
- **Cuando** `[completa el flujo principal de 02-features.md]`
- **Entonces** `[obtiene el resultado esperado sin errores bloqueantes]`

---

## 7. Restricciones

- **Técnicas:** `[Estático o con CMS del proyecto; hosting; un solo origen de HTML]`
- **Operativas:** `[Quién publica cambios; no copiar el plan comercial WIKA aquí]`
- **Seguridad:** `[Formulario, PII, sin secretos en el repo]`
