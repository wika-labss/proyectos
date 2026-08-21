---
id: "PROB-001"
title: "Match-3 América"
status: "AUDIT_1_APROBADO"
version: "1.0.0"
owner: "VISSIUSS / WIKA"
created_at: "2026-08-21"
updated_at: "2026-08-21"
audit_1_passed: true
---

# [01] Definición del Problema, Alcance y Metas

> **Equivalencia de auditoría:** `audit_1_passed: true` requiere aprobación formal en `docs/auditoria-documentacion.md` (copia en `audits/auditoria-documentacion.md`).

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** `Match-3 América`
- **Repositorio de aplicación:** `proyectos/app/match-3/`
- **Stakeholders clave:** Producto VISSIUSS; Arquitecto WIKA; Agente IA documentación
- **Estado de gatekeeping:** `AUDIT_1_APROBADO` — listo para auditoría de módulos

---

## 2. Definición del Problema y Justificación

- **¿Qué problema se intenta resolver?**  
  No existe en el ecosistema WIKA un juego Match-3 Android offline con progresión por países de América, inventario de recompensas y ayudas de usabilidad (hint idle + pánico). Los jugadores casuales necesitan un puzzle corto, claro y con meta de viaje continental.

- **Impacto actual / costo de oportunidad:**  
  Sin este producto no hay título Match-3 en el portafolio; se pierde reutilización del patrón niveles/inventario ya validado en Sudoku y del stack Expo/engine puro.

- **Análisis de brecha (Gap Analysis):**
  - **Estado actual (hoy):** App inexistente; solo docs de otros juegos (Sudoku, Tetris, Tower).
  - **Estado deseado (mañana):** V1 documentada y luego construible: tablero 8×10, 5 países × 10 niveles, puntos mínimos, recompensas e inventario, hint a 5s y botón pánico.

---

## 3. Matriz de Trazabilidad de Requerimientos (RTM Inicial)

| ID Problema | Descripción del Dolor | Impacto | ID Feature (`02-features.md`) | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `ERR-01` | No hay motor Match-3 jugable offline (swap, match, cascada) | `Alto` | `FEAT-01` | `MOD-01` |
| `ERR-02` | No hay campaña por países de América con 10 niveles cada uno | `Alto` | `FEAT-02` | `MOD-03` |
| `ERR-03` | Sin umbral de puntos el avance de nivel es arbitrario | `Alto` | `FEAT-03` | `MOD-01` |
| `ERR-04` | Sin inventario/recompensas no hay meta de colección ni unlock de país | `Alto` | `FEAT-04` | `MOD-04` |
| `ERR-05` | Jugador se queda bloqueado sin movimientos o sin idea de jugada | `Alto` | `FEAT-05` | `MOD-01` |
| `ERR-06` | Sin home/mapa/persistencia el progreso se pierde entre sesiones | `Alto` | `FEAT-06` | `MOD-05` |
| `ERR-07` | Sin identidad visual de viaje por América la app no tiene mundo | `Medio` | `FEAT-07` | `MOD-06` |

---

## 4. Audiencia y Casos de Uso Core

- **Usuarios principales:**
  - **Jugador casual Android:** Partidas cortas offline; hint si duda 5s.
  - **Jugador de progresión:** Completar 5 países (50 niveles) y coleccionar recompensas.
  - **Jugador bloqueado:** Usa botón pánico para reshuffle cuando no hay jugadas.

- **Fuera de alcance (Out of Scope explícito):**
  - Más de 5 países; boosters permanentes; obstáculos (hielo/cadena); IAP; ads; login/backend; iOS; multijugador; design-system V3+ formal.

---

## 5. Objetivo y Beneficios Esperados

- **Objetivo:** Definir y (tras gates) entregar V1 instalable: Match-3 8×10, México→Colombia→Perú→Brasil→Argentina (10 niveles/país), dificultad fácil/media oculta, inventario, hint 5s, pánico 1×/nivel, unlock por puntos y por recompensas (≥3 ítems para nuevo país).

- **Beneficios esperados:**
  - Progresión clara por mapa de América.
  - Motivación por colección (8 tipos de recompensa).
  - Menos abandonos por tablero muerto (pánico + hint).
  - Motor testeable reutilizable en futuros puzzles WIKA.

---

## 6. Criterios de Éxito en Formato BDD (Gherkin)

### Escenario 1: Completar nivel y desbloquear el siguiente

- **Dado que** el jugador está en el nivel N de un país desbloqueado
- **Cuando** alcanza `score >= minScore` del nivel y completa el objetivo
- **Entonces** se otorga 1 recompensa aleatoria al inventario y se desbloquea el nivel N+1 (si existe en el país)

### Escenario 2: Desbloquear país siguiente

- **Dado que** el jugador completó los 10 niveles del país actual y tiene ≥ 3 recompensas en inventario
- **Cuando** vuelve al mapa de países
- **Entonces** el siguiente país en orden queda jugable

### Escenario 3: Hint idle y pánico

- **Dado que** hay al menos un movimiento válido y no hay input durante 5 segundos
- **Cuando** vence el idle timer
- **Entonces** se destaca un swap sugerido; si no hay movimientos válidos o se pulsa pánico (1 uso/nivel), el tablero se reshufflea con ≥1 jugada válida

### Escenario 4: Estándares visuales

- **Dado que** se renderizan pantallas Home, Mapa, Partida e Inventario
- **Cuando** el agente compile la interfaz
- **Entonces** los estilos consumen tokens del theme documentado en `04-application-design.md` (0% hex sueltos en componentes)

---

## 7. Matriz de Restricciones Técnicas y Operativas

| Categoría | Restricción / Límite | Impacto | Estándar asociado |
| :--- | :--- | :--- | :--- |
| **Tecnología** | Expo SDK 52, RN 0.76.x, TypeScript; versiones `~` | `Alto` | `standards/coding-standards.md` |
| **Plataforma V1** | Android APK release sin Metro | `Alto` | WIKA-ARCH-03 |
| **Tablero** | Exactamente 8 columnas × 10 filas; 5 gemas | `Bloqueante` | idea/ |
| **Campañas** | Exactamente 5 países × 10 niveles = 50 | `Bloqueante` | idea/ |
| **Dificultad** | Solo fácil/media, oculta al jugador | `Alto` | idea/ |
| **Diseño / UX** | Theme local “América / viaje” en `04` | `Alto` | `standards/design-system.md` |
| **Seguridad** | Offline-first; sin datos sensibles | `Medio` | `standards/coding-standards.md` |
| **Librerías prohibidas** | Unity/Godot/Phaser; `^` en expo/RN | `Bloqueante` | WIKA-ARCH-02 |
| **Código producción** | Prohibido hasta `ready_for_construction: true` | `Bloqueante` | `.cursorrules` |

### Umbrales V1 (fuente de verdad)

| Regla | Valor |
| :--- | :--- |
| Puntos mínimos nivel fácil | `minScore = 800 + (índiceLocal × 50)` índiceLocal 0..9 |
| Puntos mínimos nivel media | `minScore = 1200 + (índiceLocal × 75)` |
| Movimientos | Fácil 25 / Media 20 |
| Recompensas para nuevo país | ≥ 3 ítems en inventario |
| Hint idle | 5 s sin jugada |
| Pánico | Reshuffle; 1 uso por nivel |
| Países (orden) | México → Colombia → Perú → Brasil → Argentina |
| Dificultad interna | Por país: niveles impares = fácil, pares = media |

### Fórmula de puntos

- Match3 = 10×n; Match4 = 20×n; Match5+ = 50×n
- Combo cascada ×1.5 por cadena consecutiva
- Victoria de nivel solo si `score >= minScore` (y movimientos no agotados en derrota)

---

## 8. Supuestos y Riesgos

- **Supuestos clave:** Dispositivo Android 7+ (API 24+); sin dependencia de red; 5 gemas bastan para densidad en 8×10.
- **Riesgos identificados:** Tablero sin jugadas frecuentes; balance de `minScore` vs movimientos; hint molesto si el timer no se cancela bien.
- **Plan de mitigación:** `hasValidMoves` + reshuffle pánico; smoke tests de engine; hint se cancela al tocar/mover; tunear `minScore` en data de niveles.

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

- **Aprobado por (Arquitecto):** `WIKA Lead QA / agente auditoría`
- **Fecha de aprobación:** `2026-08-21`
- **audit_1_passed:** `true`
