---
id: "PROB-001"
title: "Match-3 América"
status: "AUDIT_1_APROBADO"
version: "2.0.0"
owner: "VISSIUSS / WIKA"
created_at: "2026-08-21"
updated_at: "2026-09-01"
audit_1_passed: true
---

# [01] Definición del Problema, Alcance y Metas

> **Equivalencia de auditoría:** `audit_1_passed: true` requiere aprobación formal en `docs/auditoria-documentacion.md` (copia en `audits/auditoria-documentacion.md`).  
> **Nota de versión:** V2 añade perfil, pretendientes y afinidad sobre el Match-3 V1. Implementación en `iterations/v2/`.

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** `Match-3 América`
- **Repositorio de aplicación:** `proyectos/app/match-3/`
- **Stakeholders clave:** Producto VISSIUSS; Arquitecto WIKA; Agente IA documentación
- **Estado de gatekeeping:** `READY_FOR_CONSTRUCTION` — contrato V2; implementación en `iterations/v2/`

---

## 2. Definición del Problema y Justificación

- **¿Qué problema se intenta resolver?**  
  La V1 entrega Match-3 offline por países, pero el inventario es colección pasiva y no hay identidad del jugador ni meta social. Falta un perfil (nombre, preferencia, avatar), un elenco de pretendientes por país y un sistema de regalos/afinidad que motive a completar niveles pares.

- **Impacto actual / costo de oportunidad:**  
  Sin V2 el viaje por América no tiene capa relacional; los regalos no tienen destino y no hay razón de colección más allá del unlock de país.

- **Análisis de brecha (Gap Analysis):**
  - **Estado actual (hoy):** `iterations/v1/` jugable: tablero 8×10, 5 países × 10 niveles, 1 recompensa por cada victoria, inventario visual, sin perfil ni pretendientes.
  - **Estado deseado (mañana):** V2 instalable: onboarding en Home (nombre + preferencia + avatar 8-bit), 4 pretendientes/país, regalos cada 2 niveles, dar regalos con afinidad y estados de relación.

---

## 3. Matriz de Trazabilidad de Requerimientos (RTM Inicial)

| ID Problema | Descripción del Dolor | Impacto | ID Feature (`02-features.md`) | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `ERR-01` | No hay motor Match-3 jugable offline (swap, match, cascada) | `Alto` | `FEAT-01` | `MOD-01` |
| `ERR-02` | No hay campaña por países de América con 10 niveles cada uno | `Alto` | `FEAT-02` | `MOD-03` |
| `ERR-03` | Sin umbral de puntos el avance de nivel es arbitrario | `Alto` | `FEAT-03` | `MOD-01` |
| `ERR-04` | Recompensas en cada nivel diluyen inventario y no alimentan relaciones | `Alto` | `FEAT-04`, `FEAT-10` | `MOD-04` |
| `ERR-05` | Jugador se queda bloqueado sin movimientos o sin idea de jugada | `Alto` | `FEAT-05` | `MOD-01` |
| `ERR-06` | Sin home/mapa/persistencia el progreso se pierde entre sesiones | `Alto` | `FEAT-06` | `MOD-05` |
| `ERR-07` | Sin identidad visual de viaje por América la app no tiene mundo | `Medio` | `FEAT-07` | `MOD-06` |
| `ERR-08` | Sin perfil el jugador no tiene nombre, preferencia ni retrato | `Alto` | `FEAT-08` | `MOD-07`, `MOD-10` |
| `ERR-09` | Sin pretendientes por país no hay destino social del viaje | `Alto` | `FEAT-09` | `MOD-08` |
| `ERR-10` | Regalos en cada nivel no marcan cadencia de colección | `Alto` | `FEAT-10` | `MOD-04` |
| `ERR-11` | Sin afinidad/estados de relación los regalos no tienen consecuencia | `Alto` | `FEAT-11` | `MOD-09` |

---

## 4. Audiencia y Casos de Uso Core

- **Usuarios principales:**
  - **Jugador casual Android:** Partidas cortas offline; hint si duda 5s; onboarding breve en Home.
  - **Jugador de progresión:** Completar 5 países (50 niveles) y coleccionar regalos para pretendientes.
  - **Jugador relacional:** Elige preferencia, regala a 2 hombres y/o 2 mujeres por país, sube afinidad.
  - **Jugador bloqueado:** Usa botón pánico para reshuffle cuando no hay jugadas.

- **Fuera de alcance (Out of Scope explícito):**
  - Más de 5 países; boosters permanentes; obstáculos (hielo/cadena); IAP; ads; login/backend; iOS; multijugador; design-system V3+ formal.
  - Cambiar nombre o preferencia después del primer guardado.
  - Ruptura de pareja / segunda pareja o matrimonio simultáneo.
  - Arte de regalos, mapa ilustrado y retratos de los 20 pretendientes (diferido V2.1).

---

## 5. Objetivo y Beneficios Esperados

- **Objetivo:** Entregar V2 en `iterations/v2/`: Match-3 8×10, campaña América, perfil (nombre + preferencia + avatar 8-bit), 20 pretendientes, regalos en niveles pares, afinidad con pareja única y etiquetas espejo.

- **Beneficios esperados:**
  - Identidad del jugador en Home.
  - Meta relacional por país desbloqueado.
  - Cadencia clara de regalos (cada 2 niveles).
  - Motor de afinidad testeable y reutilizable.

---

## 6. Criterios de Éxito en Formato BDD (Gherkin)

### Escenario 1: Completar nivel y desbloquear el siguiente

- **Dado que** el jugador está en el nivel N de un país desbloqueado
- **Cuando** alcanza `score >= minScore` del nivel y completa el objetivo
- **Entonces** se desbloquea el nivel N+1 (si existe) y, si N es par (2/4/6/8/10), se otorga 1 recompensa aleatoria al inventario

### Escenario 2: Desbloquear país siguiente

- **Dado que** el jugador completó los 10 niveles del país actual y tiene ≥ 3 regalos **ganados** (lifetime)
- **Cuando** vuelve al mapa de países
- **Entonces** el siguiente país en orden queda jugable (independiente de cuántos regalos haya entregado)

### Escenario 3: Hint idle y pánico

- **Dado que** hay al menos un movimiento válido y no hay input durante 5 segundos
- **Cuando** vence el idle timer
- **Entonces** se destaca un swap sugerido; si no hay movimientos válidos o se pulsa pánico (1 uso/nivel), el tablero se reshufflea con ≥1 jugada válida

### Escenario 4: Onboarding de perfil

- **Dado que** no hay perfil persistido
- **Cuando** el jugador abre Home, escribe un nombre, elige preferencia y un avatar 8-bit
- **Entonces** el perfil se guarda una vez y Home muestra saludo + retrato; no se vuelve a pedir nombre ni preferencia

### Escenario 5: Dar regalo y afinidad

- **Dado que** el jugador tiene un ítem en inventario y un pretendiente de un país desbloqueado
- **Cuando** entrega un regalo cuyo slot coincide (p. ej. recompensa 1 → Hombre 1)
- **Entonces** se consumen el ítem y se suman +10 de afinidad; si el slot no coincide, +2

### Escenario 6: Pareja única

- **Dado que** un pretendiente alcanza 120 de afinidad y no hay `partnerId`
- **Cuando** se aplica ese regalo
- **Entonces** queda como pareja única; otro personaje a 120 se etiqueta amorio y a 200 infidelidad culposa

### Escenario 7: Estándares visuales

- **Dado que** se renderizan pantallas Home, Mapa, Partida, Inventario y Pretendientes
- **Cuando** el agente compile la interfaz
- **Entonces** los estilos consumen tokens del theme documentado en `04-application-design.md` (0% hex sueltos en componentes)

---

## 7. Matriz de Restricciones Técnicas y Operativas

| Categoría | Restricción / Límite | Impacto | Estándar asociado |
| :--- | :--- | :--- | :--- |
| **Tecnología** | Expo SDK 52, RN 0.76.x, TypeScript; versiones `~` | `Alto` | `standards/coding-standards.md` |
| **Plataforma V2** | Android APK release sin Metro | `Alto` | WIKA-ARCH-03 |
| **Tablero** | Exactamente 8 columnas × 10 filas; 5 gemas | `Bloqueante` | idea/ |
| **Campañas** | Exactamente 5 países × 10 niveles = 50 | `Bloqueante` | idea/ |
| **Dificultad** | Solo fácil/media, oculta al jugador | `Alto` | idea/ |
| **Diseño / UX** | Theme local “América / viaje” en `04` | `Alto` | `standards/design-system.md` |
| **Seguridad** | Offline-first; perfil local sin backend | `Medio` | `standards/coding-standards.md` |
| **Librerías prohibidas** | Unity/Godot/Phaser; `^` en expo/RN | `Bloqueante` | WIKA-ARCH-02 |
| **Código producción** | Destino `iterations/v2/` | `Bloqueante` | `.cursorrules` |
| **Iteración** | Prohibido modificar `iterations/v1/` | `Bloqueante` | versión superior |

### Umbrales V2 (fuente de verdad)

| Regla | Valor |
| :--- | :--- |
| Puntos mínimos nivel fácil | `minScore = 800 + (índiceLocal × 50)` índiceLocal 0..9 |
| Puntos mínimos nivel media | `minScore = 1200 + (índiceLocal × 75)` |
| Movimientos | Fácil 25 / Media 20 |
| Recompensas para nuevo país | ≥ 3 regalos **ganados** (lifetime `rewardsGranted`) |
| Cadencia de regalos | Solo al ganar niveles pares 2, 4, 6, 8, 10 |
| Hint idle | 5 s sin jugada |
| Pánico | Reshuffle; 1 uso por nivel |
| Países (orden) | México → Colombia → Perú → Brasil → Argentina |
| Dificultad interna | Por país: niveles impares = fácil, pares = media |
| Pretendientes | 2 hombres + 2 mujeres por país; unlock = país unlock |
| Afinidad | 50 amigos / 69 ligue / 120 pareja / 200 matrimonio |
| Espejo post-pareja | 50 amigos / 69 ligue / 120 amorio / 200 infidelidad culposa |
| Delta regalo | Slot coincidente +10; otro slot +2 |
| Avatares jugador | 6 retratos 8-bit (3 hombres, 3 mujeres) |

### Fórmula de puntos

- Match3 = 10×n; Match4 = 20×n; Match5+ = 50×n
- Combo cascada ×1.5 por cadena consecutiva
- Victoria de nivel solo si `score >= minScore` (y movimientos no agotados en derrota)

### Mapa de regalos → slot (por país al que se entrega)

| Recompensa | Slot preferido |
| :--- | :--- |
| 1, 5 | `h1` Hombre 1 |
| 2, 6 | `h2` Hombre 2 |
| 3, 7 | `m1` Mujer 1 |
| 4, 8 | `m2` Mujer 2 |

---

## 8. Supuestos y Riesgos

- **Supuestos clave:** Dispositivo Android 7+ (API 24+); sin red; 5 gemas bastan; el jugador elige avatar entre 6 PNG locales.
- **Riesgos identificados:** Entregar todos los regalos antes de unlock; arte de elenco pendiente; pareja sticky sin ruptura.
- **Plan de mitigación:** Unlock por `rewardsGranted` no inventario; placeholders de elenco documentados; `partnerId` inmutable en V2.

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
- **Fecha de aprobación:** `2026-09-01`
- **audit_1_passed:** `true`
