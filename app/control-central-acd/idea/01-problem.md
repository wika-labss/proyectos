---
id: "PROB-001"
title: "Control Central ACD"
status: "APROBADO"
version: "1.0.0"
owner: "Vissiuss / Equipo WIKA"
created_at: "2026-08-25"
updated_at: "2026-08-25"
audit_1_passed: true
---

# [01] Definición del Problema, Alcance y Metas

> **Equivalencia de auditoría:** `audit_1_passed: true` requiere aprobación formal en `docs/auditoria-documentacion.md`.

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** `Control Central ACD`
- **Repositorio de aplicación:** `proyectos/app/control-central-acd/`
- **Stakeholders clave:** Vissiuss (producto / ingeniería), Arquitecto WIKA (gates), equipo de propuestas (usuario final)
- **Estado de gatekeeping:** `AUDIT_1_APROBADO`

---

## 2. Definición del Problema y Justificación

- **¿Qué problema se intenta resolver?**  
  El equipo de propuestas necesita consultar el histórico de licitaciones L1/LE/LP de Mercado Público (rubro, estado, montos, quién ganó y con qué oferta) para armar ofertas futuras. Hoy los datos viven en Postgres (`mercado-publico`) alimentado por ingest, pero no hay una API propia ni una app que los consulte. Preguntar directo a ChileCompra desde el cliente expone el ticket, no usa el histórico ya cargado y se cae si su API está caída.

- **Impacto actual / costo de oportunidad:**  
  No se puede filtrar por rubro ni ver estados en un tablero. El ganador y el acta existen en BD para un subconjunto de adjudicadas, pero no hay perfil de propuesta ganadora. Cada consulta ad-hoc a SQL o al portal pierde tiempo y no escala al crecimiento diario del ingest.

- **Análisis de brecha (Gap Analysis):**
  - **Estado actual (hoy):** Histórico en Supabase (`wdpvlmuescstqnliorkx`), cron de ingest activo, sin app ni RPCs de consulta para UI.
  - **Estado deseado (mañana):** App Android V1 que habla **solo** con la API propia (RPCs `consultar_*` sobre Postgres). Tablero, listado con estados, perfil de ganador y CTA al acta. ChileCompra queda en el ingest; la web queda documentada como V1.1.

---

## 3. Matriz de Trazabilidad de Requerimientos (RTM Inicial)

| ID Problema | Descripción del Dolor | Impacto | ID Feature (`02-features.md`) | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `ERR-01` | No hay consulta propia del histórico (fecha, rubro, tipo) | `Alto` | `FEAT-01` | `mod-mp-query`, `mod-mp-api` |
| `ERR-02` | No se ve el volumen por rubro ni por estado | `Alto` | `FEAT-02` | `mod-resumen`, `mod-charts` |
| `ERR-03` | No se listan licitaciones ni sus estados | `Alto` | `FEAT-03` | `mod-licitaciones` |
| `ERR-04` | No se sabe quién ganó ni con qué oferta | `Alto` | `FEAT-04` | `mod-ganador` |
| `ERR-05` | El acta de adjudicación no está a un toque | `Alto` | `FEAT-05` | `mod-ganador` |
| `ERR-06` | El filtro no sobrevive al giro de pantalla / relanzar | `Medio` | `FEAT-06` | `mod-filters-store` |

---

## 4. Audiencia y Casos de Uso Core

- **Usuarios principales:**
  - **Analista de propuestas:** filtrar por rubro y fechas, ver el tablero, abrir adjudicadas y copiar precio/ítems del ganador.
  - **Usuario en terreno (Android):** consultar estados y abrir el acta pública sin notebook.
- **Fuera de alcance (Out of Scope explícito):**
  - Página web (V1.1: mismas RPCs, tabla densa).
  - iOS, login / cuentas, multi-usuario.
  - Llamadas a `api.mercadopublico.cl` desde la app; ticket ChileCompra en el cliente.
  - Ingest, backfill, órdenes de compra, ranking de proveedores, parseo del PDF del acta.
  - Cargar ficha on-demand contra ChileCompra desde un botón.

---

## 5. Objetivo y Beneficios Esperados

- **Objetivo:** Entregar V1 instalable (APK Release, Android) que consulta **solo** la API propia sobre la BD `mercado-publico`: filtros, tablero, listado con estados, perfil de ganador (ítems + % estimado) y CTA de acta/ficha como URLs devueltas por la API.
- **Beneficios esperados:**
  - Una fuente de verdad (Postgres) desacoplada de la API de ChileCompra en tiempo de consulta.
  - Lectura gráfica del histórico que ya crece día a día.
  - Perfil de la propuesta ganadora usable para armar ofertas, con acta a un toque cuando existe en BD.

---

## 6. Criterios de Éxito en Formato BDD (Gherkin)

### Escenario 1: Consultar histórico por filtros

- **Dado que** `el usuario abre Control Central ACD en Android con red`
- **Cuando** `aplica fecha, rubro y tipo y abre el tablero y el listado`
- **Entonces** `los números y filas salen de las RPCs consultar_* sobre Postgres, sin llamar a api.mercadopublico.cl`

### Escenario 2: Perfil de ganador y acta

- **Dado que** `existe la licitación 1035-20-LE26 con adjudicación en BD`
- **Cuando** `abre el perfil de ganador`
- **Entonces** `ve RUT, ítems, monto y CTA Descargar acta si hay url_acta; si no hay ganador en BD el botón de perfil no se ofrece`

### Escenario 3: Tokens visuales

- **Dado que** `se renderizan componentes visuales`
- **Cuando** `el agente compile la interfaz`
- **Entonces** `los estilos consumen tokens de theme.ts documentado en 04-application-design.md`

---

## 7. Matriz de Restricciones Técnicas y Operativas

| Categoría | Restricción / Límite | Impacto | Estándar asociado |
| :--- | :--- | :--- | :--- |
| **Tecnología** | `Expo SDK 52, RN 0.76.x, TypeScript` | `Alto` | `standards/coding-standards.md` |
| **Plataforma V1** | `Android APK release sin Metro` | `Alto` | WIKA-ARCH-03 |
| **Backend** | Solo RPCs `consultar_*` en `wdpvlmuescstqnliorkx`; anon JWT | `Bloqueante` | API propia |
| **Diseño / UX** | Theme local dashboard; touch ≥ 44 dp | `Alto` | `standards/design-system.md` |
| **Seguridad** | Sin ticket MP; sin service_role; ingest no ejecutable por anon | `Alto` | coding-standards |
| **Librerías prohibidas** | Sin librería de charts; barras con `View` | `Medio` | WIKA-ARCH-02 |
| **Package** | `com.wika.controlcentralacd` | `Alto` | WIKA-ARCH-04 |

---

## 8. Supuestos y Riesgos

- **Supuestos clave:** El ingest diario sigue corriendo. Rubro/ganador/acta solo existen donde `detalle_completo`. Anon key de `mercado-publico` (no horóscopo) está disponible para la app.
- **Riesgos identificados:** Muchas adjudicadas sin ficha → `tiene_ganador=false`. Red inestable. APK requiere JDK 17.
- **Plan de mitigación:** UI con estado `partial`; mensaje sin red; scripts `verify-build` de tower.

---

## 9. Puerta de Enlace y Firma de Auditoría de Documentación

### Checklist de criterios de aceptación

- [x] YAML frontmatter completado (`id`, `status`, `owner`, fechas).
- [x] Problemas `ERR-XX` mapeados a `FEAT-XX` y módulos sugeridos en RTM.
- [x] Criterios de éxito en formato BDD (Dado / Cuando / Entonces).
- [x] Out-of-scope explícito documentado.
- [x] Restricciones técnicas alineadas a `standards/coding-standards.md`.
- [x] Auditoría registrada en `audits/auditoria-documentacion.md` con resultado `[APROBADO]`.

### Registro de visto bueno

- **Aprobado por (Arquitecto):** `Vissiuss`
- **Fecha de aprobación:** `2026-08-25`
- **audit_1_passed:** `true`
