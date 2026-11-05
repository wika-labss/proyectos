---
id: "PROB-001"
title: "[Nombre del Proyecto]"
status: "BORRADOR"
version: "1.0.0"
owner: "[Nombre del Responsable / Equipo]"
created_at: "YYYY-MM-DD"
updated_at: "YYYY-MM-DD"
audit_1_passed: false
solution_type: "mobile_app"
delivery_channels:
  - android
project_mode: "construction"
---

# [01] Definición del Problema, Alcance y Metas

> **Equivalencia de auditoría:** `audit_1_passed: true` requiere aprobación formal en `docs/auditoria-documentacion.md`.

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** `[Ej. Tower Defense - WIKA]`
- **Repositorio de aplicación:** `proyectos/app/[nombre-proyecto]/`
- **Stakeholders clave:** `[Lista de involucrados y roles]`
- **Estado de gatekeeping:** `[PENDIENTE_AUDITORIA_DOCUMENTACION]`

---

## 2. Definición del Problema y Justificación

- **¿Qué problema se intenta resolver?**  
  `[Descripción precisa del dolor actual o ineficiencia detectada.]`

- **Impacto actual / costo de oportunidad:**  
  `[Consecuencias de no resolver el problema.]`

- **Análisis de brecha (Gap Analysis):**
  - **Estado actual (hoy):** `[Proceso manual / app inexistente / UX inconsistente]`
  - **Estado deseado (mañana):** `[Solución funcional V1 alineada a estándares WIKA]`

---

## 3. Matriz de Trazabilidad de Requerimientos (RTM Inicial)

| ID Problema | Descripción del Dolor | Impacto | ID Feature (`02-features.md`) | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `ERR-01` | `[Ej. No existe juego funcional offline]` | `Alto` | `FEAT-01` | `mod-[nombre]` |
| `ERR-02` | `[Ej. Progreso no persiste entre sesiones]` | `Medio` | `FEAT-02` | `mod-[nombre]` |

---

## 4. Audiencia y Casos de Uso Core

- **Usuarios principales:**
  - **Rol 1:** `[Ej. Jugador casual]` → **Necesidad:** `[Jugar sin conexión]`
  - **Rol 2:** `[Completar si aplica]`

- **Fuera de alcance (Out of Scope explícito):**
  - `[Lo que NO se resolverá en V1]`
  - `[Ej. Sin login, sin backend, sin ads en V1]`

---

## 5. Objetivo y Beneficios Esperados

- **Objetivo:** `[Resultado medible al cerrar V1]`
- **Beneficios esperados:**
  - `[Beneficio 1]`
  - `[Beneficio 2]`

---

## 6. Criterios de Éxito en Formato BDD (Gherkin)

### Escenario 1: [Nombre del escenario clave]

- **Dado que** `[el usuario abre la app en Android]`
- **Cuando** `[ejecuta el flujo principal definido en 02-features.md]`
- **Entonces** `[obtiene el resultado esperado sin errores bloqueantes]`

### Escenario 2: [Validación de estándares — si hay UI significativa]

- **Dado que** `[se renderizan componentes visuales]`
- **Cuando** `[el agente compile la interfaz]`
- **Entonces** `[los estilos consumen tokens de standards/design-system.md o theme documentado en 04-application-design.md]`

> **Nota:** Proyectos sin UI significativa (ej. utilidades mínimas) pueden marcar este escenario como N/A en auditoría.

---

## 7. Matriz de Restricciones Técnicas y Operativas

| Categoría | Restricción / Límite | Impacto | Estándar asociado |
| :--- | :--- | :--- | :--- |
| **Tiempo** | `[Fecha límite V1]` | `Bloqueante` | `ROADMAP.md` |
| **Tecnología** | `Expo SDK 52, RN 0.76.x, TypeScript` | `Alto` | `standards/coding-standards.md` |
| **Plataforma V1** | `Android APK release sin Metro` | `Alto` | WIKA-ARCH-03 |
| **Diseño / UX** | `[Tokens base / theme local / N/A]` | `[Alto / N/A]` | `standards/design-system.md` |
| **Seguridad** | `[Offline-first / sin datos sensibles]` | `[Medio]` | `standards/coding-standards.md` |
| **Librerías prohibidas** | `[Listar paquetes no autorizados]` | `Bloqueante` | WIKA-ARCH-02 |

---

## 8. Supuestos y Riesgos

- **Supuestos clave:** `[Ej. Dispositivo Android 7+, sin dependencia de backend]`
- **Riesgos identificados:** `[Ej. Complejidad de prebuild nativo]`
- **Plan de mitigación:** `[Ej. Usar scripts verify-build de iteración WIKA de referencia]`

---

## 9. Puerta de Enlace y Firma de Auditoría de Documentación

### Checklist de criterios de aceptación

- [ ] YAML frontmatter completado (`id`, `status`, `owner`, fechas).
- [ ] Problemas `ERR-XX` mapeados a `FEAT-XX` y módulos sugeridos en RTM.
- [ ] Criterios de éxito en formato BDD (Dado / Cuando / Entonces).
- [ ] Out-of-scope explícito documentado.
- [ ] Restricciones técnicas alineadas a `standards/coding-standards.md`.
- [ ] Auditoría registrada en `audits/auditoria-documentacion.md` con resultado `[APROBADO]`.

### Registro de visto bueno

- **Aprobado por (Arquitecto):** `________________________`
- **Fecha de aprobación:** `YYYY-MM-DD`
- **audit_1_passed:** `false` → cambiar a `true` al aprobar
