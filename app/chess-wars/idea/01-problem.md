---
id: "PROB-001"
title: "AI Chess Wars"
status: "AUDIT_1_APROBADO"
version: "1.1.0"
owner: "VISSIUSS / WIKA"
created_at: "2026-08-21"
updated_at: "2026-08-21"
audit_1_passed: true
---

# [01] Definición del Problema, Alcance y Metas

> **Equivalencia de auditoría:** `audit_1_passed: true` requiere aprobación formal en `docs/auditoria-documentacion.md` (copia en `audits/auditoria-documentacion.md`).  
> **Nota de versión:** v1.1 redefine el producto respecto al borrador clásico-only; la fuente de verdad es este `idea/`.

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** `AI Chess Wars`
- **Repositorio de aplicación:** `proyectos/app/chess-wars/`
- **Stakeholders clave:** Producto VISSIUSS; Arquitecto WIKA; Agente IA documentación
- **Estado de gatekeeping:** `READY_FOR_CONSTRUCTION` — contrato V1.1; implementación en `iterations/v2/`

---

## 2. Definición del Problema y Justificación

- **¿Qué problema se intenta resolver?**  
  El ajedrez móvil clásico es profundo pero **estático**: pocas decisiones fuera del tablero y poca progresión entre partidas. Los jugadores casuales y de estrategia en móvil buscan **partidas cortas** con profundidad táctica **y** capas de personalización (evoluciones, loadouts) sin perder la base del ajedrez. No existe en el portafolio WIKA un título que combine ajedrez + progresión RPG ligera offline.

- **Impacto actual / costo de oportunidad:**  
  Sin este producto se pierde un diferencial (“ajedrez evolutivo”) frente a clones de ajedrez puro; la visión completa (ranked, economía, eventos) no cabe en V1, pero la **mecánica central** sí debe validarse ya.

- **Análisis de brecha (Gap Analysis):**
  - **Estado actual (hoy):** Iteración clásica-only en `iterations/v1/` (superseded por esta definición); docs previas no reflejaban evoluciones/nodos/loadout.
  - **Estado deseado (mañana):** V1 offline instalable con **modo Clásico** (puristas) + **Evolutive Quick** (nodos de energía, XP de piezas, evoluciones limitadas, 1 loadout pasivo) vs IA.

### Visión de producto (contexto; no todo es V1)

Ajedrez reinventado en universo futurista: piezas que evolucionan, habilidades, zonas/nodos, loadouts, torneos y monetización **sin romper integridad competitiva**. V1 valida el núcleo jugable offline; ranked/IAP/eventos quedan fuera.

---

## 3. Matriz de Trazabilidad de Requerimientos (RTM Inicial)

| ID Problema | Descripción del Dolor | Impacto | ID Feature (`02-features.md`) | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `ERR-01` | Sin motor de ajedrez legal no hay base jugable | `Alto` | `FEAT-01` | `MOD-01` |
| `ERR-02` | Sin rival offline no hay partida corta | `Alto` | `FEAT-02` | `MOD-02` |
| `ERR-03` | Puristas necesitan modo sin evoluciones | `Alto` | `FEAT-03` | `MOD-01` / `MOD-05` |
| `ERR-04` | Sin nodos/XP/evolución el diferencial “Wars” no existe | `Alto` | `FEAT-04` | `MOD-03` |
| `ERR-05` | Sin loadout prepartida no hay decisión fuera del tablero | `Medio` | `FEAT-05` | `MOD-04` |
| `ERR-06` | Sin UI de tablero/HUD/habilidades no se juega | `Alto` | `FEAT-06` | `MOD-06` |
| `ERR-07` | Sin progresión local entre partidas no hay retención V1 | `Medio` | `FEAT-07` | `MOD-05` |
| `ERR-08` | Sin tutorial el jugador no entiende nodos/evoluciones | `Medio` | `FEAT-08` | `MOD-06` |

---

## 4. Audiencia y Casos de Uso Core

- **Usuarios principales:**
  - **Casual de ajedrez:** Partida rápida Clásica o Evolutive vs IA.
  - **Fan de estrategia/RPG ligero:** Captura nodos, sube XP de pieza, elige evolución y usa habilidad.
  - **Purista:** Modo Clásico sin nodos ni evoluciones.
  - **Jugador de sesiones cortas móviles:** Partida &lt; 15 min, offline.

- **Fuera de alcance (Out of Scope explícito V1):**
  - Arena Ranked / ELO / matchmaking online
  - Multijugador online o hotseat
  - Moneda premium (Núcleos), IAP, pase de temporada, tienda de packs, anuncios recompensados
  - Eventos temporales y tableros temáticos rotativos
  - Zonas de poder dinámicas por ronda (solo **nodos de energía estáticos** en V1)
  - Árbol completo 2–4 ramas por cada tipo de pieza
  - Evoluciones funcionales desbloqueables por moneda de tiempo largo (solo set V1 fijo)
  - iOS, backend, cuentas cloud
  - Pipeline `design-system/` V3+

---

## 5. Objetivo y Beneficios Esperados

- **Objetivo V1:** Entregar APK Android offline que demuestre el diferencial: **Clásico** + **Evolutive Quick** vs IA (Fácil/Media), con nodos de energía, XP de combate, evoluciones limitadas con cooldown/uso único, 1 loadout pasivo, progresión local mínima y tutorial corto.

- **Beneficios esperados:**
  - Validar fun de evoluciones sin romper reglas base.
  - Separar claramente Clásico vs Evolutive (integridad para puristas).
  - Base técnica (engine + capa evolutiva) reutilizable hacia V2 (ranked/economía).

---

## 6. Criterios de Éxito en Formato BDD (Gherkin)

### Escenario 1: Modo Clásico

- **Dado que** el jugador elige Clásico
- **Cuando** juega una partida vs IA
- **Entonces** aplican reglas FIDE básicas **sin** nodos, XP ni evoluciones

### Escenario 2: Nodo y evolución en Evolutive Quick

- **Dado que** el jugador está en Evolutive Quick y tiene ≥2 Energía y una pieza con XP umbral
- **Cuando** elige evolucionar esa pieza a una rama V1 disponible
- **Entonces** la pieza cambia de tipo evolucionado, gasta Energía y obtiene su habilidad (uso limitado)

### Escenario 3: Habilidad con límite

- **Dado que** un peón evolucionó a Dron
- **Cuando** activa teletransporte corto
- **Entonces** se mueve según reglas de la habilidad y no puede reutilizarla en esa partida (V1: 1 uso)

### Escenario 4: Loadout prepartida

- **Dado que** el jugador abre prepartida Evolutive
- **Cuando** selecciona exactamente 1 pasiva de las 2 disponibles
- **Entonces** esa pasiva aplica durante la partida

### Escenario 5: Estándares visuales

- **Dado que** se renderizan Home, Lobby, Prepartida, Tablero y Postpartida
- **Cuando** el agente compile la UI
- **Entonces** los estilos consumen tokens de `04-application-design.md` (0% hex sueltos)

---

## 7. Matriz de Restricciones Técnicas y Operativas

| Categoría | Restricción / Límite | Impacto | Estándar asociado |
| :--- | :--- | :--- | :--- |
| **Tecnología** | Expo SDK 52, RN 0.76.x, TypeScript; `~` | `Alto` | `standards/coding-standards.md` |
| **Plataforma V1** | Android APK release sin Metro | `Alto` | WIKA-ARCH-03 |
| **Conectividad** | 100% offline | `Bloqueante` | idea/ |
| **Bando** | Jugador = Blancas siempre | `Alto` | idea/ |
| **IA** | Solo Fácil / Media (sin Stockfish nativo) | `Alto` | idea/ |
| **Evoluciones V1** | Set cerrado (ver contrato abajo) | `Bloqueante` | idea/ |
| **Anti P2W** | Sin compras; sin ventajas de pago | `Alto` | visión producto |
| **Código** | `iterations/v1/` clásico queda histórico; nueva construcción en `iterations/v2/` tras gates | `Alto` | `.cursorrules` |

### Contrato de producto V1 (fuente de verdad)

| Regla | Valor V1 |
| :--- | :--- |
| Tablero | 8×8 |
| Modos | `classic` \| `evolutive_quick` |
| Nodos de energía | Exactamente **4** casillas fijas (c3, f3, c6, f6); al mover/capturar en el nodo: +1 Energía (máx. 5) |
| XP de combate | +2 al capturar; +1 al ocupar nodo; umbral evolución = **3 XP** por pieza |
| Coste evolución | **2 Energía**; **máx. 1 evolución por pieza por partida** |
| Evoluciones jugables V1 | Peón→Dron (teleport ≤2 casillas ortogonales, 1 uso); Torre→Fortaleza (inmune a captura durante el siguiente turno rival, 1 uso); Caballo→Interceptor (salto de caballo extra inmediato, 1 uso) |
| Sin evolución V1 | Alfil, Dama, Rey (pueden ganar XP pero no evolucionan) |
| Loadouts (elegir 1) | `A`: +1 Energía inicial · `B`: +1 XP extra por captura |
| IA Clásico/Evolutive | Fácil / Media |
| Progresión meta | Contador local: partidas jugadas, victorias, flag tutorial visto |
| Reloj | Sin reloj competitivo |

---

## 8. Supuestos y Riesgos

- **Supuestos:** Android 7+; el jugador acepta Blancas; tutorial basta para nodos/evolución.
- **Riesgos:** Balance de habilidades rotas; complejidad UI en tablero pequeño; motor clásico + capa evolutiva acoplados.
- **Mitigación:** Habilidades 1 uso + coste Energía; smoke de reglas + evoluciones; engine base puro + módulo evolutivo separado; V2 para ranked/economía.

---

## 9. Puerta de Enlace y Firma de Auditoría de Documentación

### Checklist de criterios de aceptación

- [x] YAML frontmatter completado.
- [x] `ERR-XX` mapeados a `FEAT-XX` y módulos.
- [x] BDD de éxito.
- [x] Out-of-scope explícito (visión completa vs V1).
- [x] Restricciones alineadas a coding-standards.
- [x] Auditoría en `audits/auditoria-documentacion.md` → APROBADO.

### Registro de visto bueno

- **Aprobado por (Arquitecto):** `WIKA Lead QA / agente auditoría`
- **Fecha de aprobación:** `2026-08-21`
- **audit_1_passed:** `true`
