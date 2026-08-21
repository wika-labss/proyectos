---
id: "PROB-001"
title: "Chess Wars"
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

- **Nombre del Proyecto:** `Chess Wars`
- **Repositorio de aplicación:** `proyectos/app/chess-wars/`
- **Stakeholders clave:** Producto VISSIUSS; Arquitecto WIKA; Agente IA documentación
- **Estado de gatekeeping:** `READY_FOR_CONSTRUCTION` — Gates 1–3B aprobados

---

## 2. Definición del Problema y Justificación

- **¿Qué problema se intenta resolver?**  
  No existe en el portafolio WIKA un juego de **ajedrez Android offline** con identidad propia (“Wars”): partida rápida vs IA y **campaña de batallas** secuenciales. Los jugadores casuales necesitan ajedrez jugable sin red, con reglas claras y progresión de dificultad.

- **Impacto actual / costo de oportunidad:**  
  Sin este título no hay producto de estrategia por turnos clásico en el portafolio; se pierde reutilización del patrón engine puro + campaña (Tower, Match-3, Tetris) y del stack Expo/APK.

- **Análisis de brecha (Gap Analysis):**
  - **Estado actual (hoy):** App inexistente; plantillas WIKA vacías en `idea/`.
  - **Estado deseado (mañana):** V1 documentada y construible: motor de ajedrez FIDE básico, IA fácil/media, campaña Wars de 10 batallas, persistencia offline, APK Release sin Metro.

---

## 3. Matriz de Trazabilidad de Requerimientos (RTM Inicial)

| ID Problema | Descripción del Dolor | Impacto | ID Feature (`02-features.md`) | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `ERR-01` | No hay motor de ajedrez (movimientos legales, jaque, mate, tablas) | `Alto` | `FEAT-01` | `MOD-01` |
| `ERR-02` | Sin rival jugable offline no hay partida | `Alto` | `FEAT-02` | `MOD-02` |
| `ERR-03` | Sin campaña “Wars” no hay progresión de batallas | `Alto` | `FEAT-03` | `MOD-03` |
| `ERR-04` | Sin UI de tablero/selección el jugador no puede mover | `Alto` | `FEAT-04` | `MOD-05` |
| `ERR-05` | Sin home/cómo jugar/resultados la UX está incompleta | `Medio` | `FEAT-05` | `MOD-05` |
| `ERR-06` | Sin persistencia el progreso de campaña se pierde | `Alto` | `FEAT-06` | `MOD-04` |
| `ERR-07` | Sin identidad visual “Wars” el producto no se diferencia | `Medio` | `FEAT-07` | `MOD-05` |

---

## 4. Audiencia y Casos de Uso Core

- **Usuarios principales:**
  - **Jugador casual Android:** Partida rápida vs IA en minutos, offline.
  - **Jugador de progresión:** Completar las 10 batallas de la campaña Wars.
  - **Jugador que aprende:** Consulta “Cómo jugar” y ve casillas legales resaltadas.

- **Fuera de alcance (Out of Scope explícito):**
  - Multijugador online / local hotseat
  - Reloj de tiempo competitivo (blitz/bullet)
  - Aperturas / libros de apertura / análisis post-partida profundo
  - IA “hard” / motor tipo Stockfish nativo
  - iOS, ads, IAP, login, backend
  - Variantes (Chess960, 3-check, etc.)
  - Pipeline `design-system/` V3+

---

## 5. Objetivo y Beneficios Esperados

- **Objetivo:** Definir y (tras gates) entregar V1 instalable: ajedrez con reglas FIDE básicas, jugador siempre Blancas, IA Fácil/Media, campaña Wars (10 batallas), partida rápida, persistencia local, theme estratégico documentado.

- **Beneficios esperados:**
  - Título de estrategia clásico en el portafolio WIKA.
  - Motor de ajedrez puro reutilizable (`src/engine/`).
  - Progresión clara vía campaña Wars.
  - Sesiones offline sin dependencias de red.

---

## 6. Criterios de Éxito en Formato BDD (Gherkin)

### Escenario 1: Partida rápida vs IA

- **Dado que** el jugador elige Partida rápida y dificultad Fácil o Media
- **Cuando** mueve piezas legales hasta jaque mate o tablas
- **Entonces** la partida termina con resultado victoria / derrota / tablas y puede volver al Home

### Escenario 2: Campaña Wars — avanzar batalla

- **Dado que** la batalla N está desbloqueada (N=1 al inicio)
- **Cuando** el jugador gana esa batalla contra la IA configurada
- **Entonces** se desbloquea la batalla N+1 (hasta 10) y el progreso se persiste

### Escenario 3: Movimientos legales y jaque

- **Dado que** es el turno del jugador
- **Cuando** selecciona una pieza propia
- **Entonces** solo se permiten casillas legales; no puede dejar al rey en jaque; la IA responde con un movimiento legal

### Escenario 4: Estándares visuales

- **Dado que** se renderizan Home, Campaña, Partida y Cómo jugar
- **Cuando** el agente compile la interfaz
- **Entonces** los estilos consumen tokens del theme documentado en `04-application-design.md` (0% hex sueltos en componentes)

---

## 7. Matriz de Restricciones Técnicas y Operativas

| Categoría | Restricción / Límite | Impacto | Estándar asociado |
| :--- | :--- | :--- | :--- |
| **Tecnología** | Expo SDK 52, RN 0.76.x, TypeScript; versiones `~` | `Alto` | `standards/coding-standards.md` |
| **Plataforma V1** | Android APK release sin Metro | `Alto` | WIKA-ARCH-03 |
| **Reglas** | FIDE básicas: movimientos, captura, jaque, mate, ahogado, enroque, doble paso, al paso, promoción a dama | `Bloqueante` | idea/ |
| **Bando** | Jugador = Blancas siempre en V1 | `Alto` | idea/ |
| **IA** | Solo Fácil / Media (profundidad/heurística acotada) | `Alto` | idea/ |
| **Campaña** | Exactamente 10 batallas secuenciales | `Bloqueante` | idea/ |
| **Diseño / UX** | Theme local “Wars / estrategia” en `04` | `Alto` | `standards/design-system.md` |
| **Seguridad** | Offline-first; sin datos sensibles | `Medio` | `standards/coding-standards.md` |
| **Librerías prohibidas** | Stockfish nativo; Unity/Godot; `^` en expo/RN | `Bloqueante` | WIKA-ARCH-02 |
| **Código producción** | Prohibido hasta `ready_for_construction: true` | `Bloqueante` | `.cursorrules` |

### Contrato de producto V1 (fuente de verdad)

| Regla | Valor |
| :--- | :--- |
| Tablero | 8×8 estándar |
| Jugador | Siempre Blancas |
| IA Fácil | Profundidad 1–2 / heurística material + aleatoriedad leve |
| IA Media | Profundidad 2–3 / material + movilidad |
| Campaña Wars | 10 batallas; B1–B4 Fácil; B5–B10 Media |
| Victoria batalla | Jaque mate al rey negro **o** rendición IA N/A — solo mate/tablas/derrota |
| Tablas | Ahogado, insuficiencia material básica (K vs K, K+B vs K, K+N vs K), repetición 3× opcional V1.1 |
| Promoción | Solo a Dama en V1 |
| Persistencia | Batalla máxima desbloqueada + victorias campaña |

---

## 8. Supuestos y Riesgos

- **Supuestos clave:** Dispositivo Android 7+ (API 24+); sin red; jugador conoce o aprende reglas básicas vía “Cómo jugar”.
- **Riesgos identificados:** Complejidad del motor (enroque / al paso / jaque); IA lenta en JS; UX de selección táctil en tablero pequeño.
- **Plan de mitigación:** Engine puro + smoke tests de reglas; profundidad IA acotada; casillas táctiles grandes + highlights; referencia starter `tower` / `chupalo joako` para toolchain.

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
