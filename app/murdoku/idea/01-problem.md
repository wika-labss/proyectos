---
id: "PROB-001"
title: "Murdoku"
status: "BORRADOR"
version: "1.0.0"
owner: "Vissiuss / Equipo WIKA"
created_at: "2026-08-24"
updated_at: "2026-08-24"
audit_1_passed: false
---

# [01] Definición del Problema, Alcance y Metas

> **Equivalencia de auditoría:** `audit_1_passed: true` requiere aprobación formal en `docs/auditoria-documentacion.md`.

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** `Murdoku`
- **Repositorio de aplicación:** `proyectos/app/murdoku/`
- **Stakeholders clave:** Vissiuss (producto / ingeniería), Arquitecto WIKA (gates), jugador casual Android (usuario final)
- **Estado de gatekeeping:** `PENDIENTE_AUDITORIA_DOCUMENTACION`

---

## 2. Definición del Problema y Justificación

- **¿Qué problema se intenta resolver?**  
  No existe en el portafolio WIKA un puzzle offline que reinvente el Sudoku con narrativa detectivesca: en lugar de números, el jugador organiza elementos del crimen (víctima, sospechosos, asesino) bajo reglas de unicidad. Los Sudokus clásicos (p. ej. Sodoku) cubren lógica numérica, pero no ambientación de misterio, habitaciones temáticas ni progresión por escenarios de investigación.

- **Impacto actual / costo de oportunidad:**  
  Se pierde un título diferenciado (misterio + lógica), reutilización del stack puzzle Expo/engine, y un puente temático entre puzzle puro y narrativa ligera. El jugador que busca “Sudoku con historia” no encuentra producto WIKA.

- **Análisis de brecha (Gap Analysis):**
  - **Estado actual (hoy):** App inexistente; solo scaffold con plantillas vacías. Existe Sodoku (números 9×9), no variante narrativa de crimen.
  - **Estado deseado (mañana):** V1 Android offline con motor de colocación (fila/columna — y regiones en tableros avanzados), piezas víctima/sospechosos/asesino, habitaciones temáticas desbloqueables, modos básico (4×4 / 6×6) y avanzado (9×9), y APK Release sin Metro.

---

## 3. Matriz de Trazabilidad de Requerimientos (RTM Inicial)

| ID Problema | Descripción del Dolor | Impacto | ID Feature (`02-features.md`) | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `ERR-01` | No hay motor de colocación tipo Sudoku con piezas de crimen (unicidad fila/columna) | `Alto` | `FEAT-01` | `mod-murdoku-engine` |
| `ERR-02` | No hay catálogo de elementos del crimen (víctima, sospechosos, asesino) distinguibles | `Alto` | `FEAT-02` | `mod-crime-pieces` |
| `ERR-03` | Sin tableros por dificultad (4×4 / 6×6 / 9×9) la curva de aprendizaje no existe | `Alto` | `FEAT-03` | `mod-board-sizes` |
| `ERR-04` | Sin habitaciones/escenarios no hay ambientación ni progresión espacial | `Alto` | `FEAT-04` | `mod-room-campaign` |
| `ERR-05` | Sin pistas/contexto narrativo ligero el misterio es solo skin vacío | `Medio` | `FEAT-05` | `mod-room-flavor` |
| `ERR-06` | Sin validación de conflicto (fila/columna/región) el jugador no recibe feedback | `Alto` | `FEAT-06` | `mod-murdoku-engine` |
| `ERR-07` | Sin progreso persistente se pierde el desbloqueo de habitaciones | `Alto` | `FEAT-07` | `mod-offline-progress` |
| `ERR-08` | Sin UI de investigación (tablero + piezas + habitación) no se puede jugar | `Alto` | `FEAT-08` | `mod-investigation-ui` |
| `ERR-09` | Sin APK Release instalable no hay entregable WIKA | `Alto` | `FEAT-09` | `mod-android-release` |

---

## 4. Audiencia y Casos de Uso Core

- **Usuarios principales:**
  - **Jugador casual Android:** Aprende la mecánica en tableros 4×4 / 6×6, partidas cortas offline.
  - **Fan de Sudoku / lógica:** Quiere la regla de unicidad con giro temático (personajes en lugar de números).
  - **Jugador de progresión:** Desbloquea habitaciones de la mansión (biblioteca → cocina → sótano → jardín…) con crímenes más complejos.
  - **Usuario offline:** Juega sin red, cuentas ni anuncios.

- **Fuera de alcance (Out of Scope explícito):**
  - iOS, web, multijugador, cuentas, backend, sync, ads, IAP.
  - Historia branching / novela visual completa / cutscenes largas.
  - Coartadas / reglas especiales por sospechoso (retos especiales → V1.1+).
  - Generación procedural ilimitada de puzzles (V1 usa catálogo fijo de escenarios).
  - Design-system V3+ formal; tokens locales en V1.
  - Audio narrativo / voz en off (deseable post-V1).

---

## 5. Objetivo y Beneficios Esperados

- **Objetivo:** Entregar V1 instalable (APK Release, Android, 100% offline) de **Murdoku**: puzzle de investigación donde el jugador coloca víctima, sospechosos y asesino en una cuadrícula sin repetir personaje en la misma fila o columna (y en regiones en modos avanzados), con habitaciones temáticas desbloqueables y modos básico / avanzado.
- **Beneficios esperados:**
  - Diferenciación clara vs Sudoku numérico clásico.
  - Curva de aprendizaje (4×4 → 6×6 → 9×9).
  - Progresión por habitaciones con atmósfera detectivesca.
  - Motor puro reutilizable para futuras variantes puzzle WIKA.

---

## 6. Criterios de Éxito en Formato BDD (Gherkin)

### Escenario 1: Resolver un caso en habitación y desbloquear la siguiente

- **Dado que** `el jugador abre Murdoku en Android y tiene desbloqueada la Biblioteca`
- **Cuando** `coloca correctamente todas las piezas del crimen sin conflictos de fila/columna (y región si aplica) y confirma la solución`
- **Entonces** `el escenario se marca resuelto, se desbloquea la siguiente habitación y el progreso persiste al reabrir la app`

### Escenario 2: Feedback de conflicto al colocar

- **Dado que** `hay un sospechoso ya colocado en la fila 2`
- **Cuando** `el jugador intenta colocar el mismo sospechoso en otra celda de la fila 2`
- **Entonces** `la app marca conflicto visual (token error), no acepta la jugada inválida como solución final y no crashea`

### Escenario 3: Validación de estándares visuales

- **Dado que** `se renderizan home, mapa de habitaciones y tablero de investigación`
- **Cuando** `el agente compile la interfaz`
- **Entonces** `los estilos consumen tokens del theme documentado en 04-application-design.md (0% hex sueltos en componentes)`

---

## 7. Matriz de Restricciones Técnicas y Operativas

| Categoría | Restricción / Límite | Impacto | Estándar asociado |
| :--- | :--- | :--- | :--- |
| **Tiempo** | V1 documentada y construible tras gates; sin fecha de store | `Medio` | `ROADMAP.md` |
| **Tecnología** | `Expo SDK 52, RN 0.76.x, TypeScript` | `Alto` | `standards/coding-standards.md` |
| **Plataforma V1** | `Android APK release sin Metro` | `Alto` | WIKA-ARCH-03 |
| **Diseño / UX** | Theme local “noir mansion” en `04-application-design.md` | `Alto` | `standards/design-system.md` |
| **Seguridad** | Offline-first; sin datos sensibles ni red | `Alto` | `standards/coding-standards.md` |
| **Librerías prohibidas** | `^` en expo/react-native; backend; ads SDK | `Bloqueante` | WIKA-ARCH-02 |
| **Permisos** | Ningún permiso sensible en V1 | `Alto` | WIKA-ARCH-04 |
| **Package** | `com.wika.murdoku` | `Medio` | coding-standards |
| **Orientación** | Portrait | `Medio` | design-system mobile-first |
| **Tamaño** | < 40 MB instalado | `Medio` | WIKA-ARCH-03 |
| **Contenido V1** | ≥ 4 habitaciones; tamaños 4×4, 6×6 y 9×9; catálogo cerrado de piezas | `Alto` | este documento |

---

## 8. Supuestos y Riesgos

- **Supuestos clave:** Dispositivo Android 7+ (API 24); el jugador entiende Sudoku básico o aprende con 4×4; V1 usa puzzles predefinidos con solución única; iconografía de piezas suficiente sin assets 3D.
- **Riesgos identificados:** Confundir “solo fila/columna” con Sudoku completo (regiones); scope creep hacia novela visual; puzzles sin solución única; tablero 9×9 ilegible en pantallas pequeñas.
- **Plan de mitigación:** Documentar reglas por tamaño en `02-features.md`; out-of-scope narrativo explícito; `validatePuzzle` con solución única en engine; layout adaptativo y celdas táctiles ≥ 44 dp; starter `tower/iterations/v1` / `match-3` para toolchain.

---

## 9. Puerta de Enlace y Firma de Auditoría de Documentación

### Checklist de criterios de aceptación

- [x] YAML frontmatter completado (`id`, `status`, `owner`, fechas).
- [x] Problemas `ERR-XX` mapeados a `FEAT-XX` y módulos sugeridos en RTM.
- [x] Criterios de éxito en formato BDD (Dado / Cuando / Entonces).
- [x] Out-of-scope explícito documentado.
- [x] Restricciones técnicas alineadas a `standards/coding-standards.md`.
- [ ] Auditoría registrada en `audits/auditoria-documentacion.md` con resultado `[APROBADO]`.

### Registro de visto bueno

- **Aprobado por (Arquitecto):** `________________________`
- **Fecha de aprobación:** `YYYY-MM-DD`
- **audit_1_passed:** `false` → cambiar a `true` al aprobar
