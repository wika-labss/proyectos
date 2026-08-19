# 03 — Descubrimiento de módulos

## Proyecto
Tower — Tower Defense Android (Expo / React Native)

## Versión de documentación
V1

## Objetivo de esta etapa
Traducir `02-features.md` en módulos reutilizables con responsabilidades claras, entradas/salidas y dependencias. Priorizar **motor puro** (path, oleadas, combate, economía) testable y separado de UI. Separar **catálogo de 15 mapas** y **4 torres** como datos/reglas explícitas.

---

## Inventario de módulos (V1)

| Módulo | Tipo | Estado V1 | Justificación |
|--------|------|-----------|---------------|
| `map-catalog` | data | **Nuevo** | 15 mapas distintos (path, pads, paleta, metadata) |
| `path-system` | core | **Nuevo** | Waypoints, progreso enemigo sobre el path |
| `build-zones` | core | **Nuevo** | Pads construibles; ocupación por torre |
| `tower-types` | core | **Nuevo** | Definición de las 4 torres (stats, costos, reglas) |
| `tower-combat` | core | **Nuevo** | Targeting, disparo, splash, slow |
| `enemy-types` | core | **Nuevo** | Grunt / Runner / Tank / Boss |
| `wave-system` | core | **Nuevo** | Secuencia de oleadas por nivel + escalado |
| `economy` | core | **Nuevo** | Oro: ingreso por kill, gasto por torre |
| `base-lives` | core | **Nuevo** | Vidas de base; derrota a 0 |
| `level-campaign` | core | **Nuevo** | 15 niveles, desbloqueo, victoria campaña |
| `td-engine` | core | **Nuevo** | Orquestación pura del tick de partida |
| `game-loop` | core | **Nuevo** | Estados de UI-partida, pausa, transiciones |
| `offline-progress` | infra | **Nuevo** | Persistencia maxUnlockedLevel / campaignComplete |
| `tower-placement-ui` | ui | **Nuevo** | Selección de torre + tap en pad |
| `battlefield-view` | ui | **Nuevo** | Render mapa, enemigos, torres, proyectiles |
| `tower-screens` | ui | **Nuevo** | Menú, selector, HUD, victoria/derrota |
| `android-release` | infra | Reutilizar patrón WIKA | Pipeline APK Release Expo SDK 52 |

---

## Módulos — detalle

### `map-catalog` (nuevo)

**Responsabilidad:** Fuente de verdad de los **15** mapas: id, nombre, waypoints del path, pads `{id,x,y}`, bounds, tokens visuales (paleta / motif).

**API conceptual:**
```
getMap(levelIndex: 0..14): MapDefinition
listMaps(): MapMeta[]
```

**Regla:** ningún `MapDefinition` comparte el mismo layout de path+pads ni la misma paleta dominante.

**Reutilizable:** Sí (otros TD / editores).

---

### `path-system` (nuevo)

**Responsabilidad:** Avance de enemigos a lo largo de waypoints; detectar llegada a base.

**API conceptual:**
```
createTraveler(path, speed): Traveler
stepTraveler(t, dt): { traveler, reachedBase }
progress01(t): number  // 0..1 para targeting “más avanzado”
```

**Dependencias:** consume `MapDefinition.path` de `map-catalog`.

---

### `build-zones` (nuevo)

**Responsabilidad:** Pads libres/ocupados; validar colocación.

**API conceptual:**
```
canBuild(padId, towers): boolean
occupy(padId, towerId)
free(padId)
```

---

### `tower-types` (nuevo)

**Responsabilidad:** Stats de T1–T4 (costo, daño, cadencia, alcance, splashRadius?, slowFactor?).

**API conceptual:**
```
getTowerType(id: "archer"|"cannon"|"frost"|"sniper"): TowerTypeDef
listTowerTypes(): TowerTypeDef[]  // length === 4
```

**Reutilizable:** Sí.

---

### `tower-combat` (nuevo)

**Responsabilidad:** Elegir objetivo (más avanzado en path dentro de rango), aplicar daño / splash / slow, cooldowns.

**API conceptual:**
```
selectTarget(tower, enemies): Enemy | null
tryFire(tower, enemies, nowMs): CombatEvents
applySplash(center, radius, enemies, damage)
applySlow(enemy, factor, durationMs)
```

**Dependencias:** `tower-types`, `path-system` (progress), `enemy-types`.

---

### `enemy-types` (nuevo)

**Responsabilidad:** Definición HP, speed, rewardGold, baseDamage de Grunt/Runner/Tank/Boss.

---

### `wave-system` (nuevo)

**Responsabilidad:** Definir por nivel la lista de oleadas (composiciones) y el escalado de HP/conteo.

**API conceptual:**
```
getWaves(levelIndex): Wave[]
spawnWave(wave, multipliers): EnemySpawn[]
```

**Regla:** oleadas y dificultad **aumentan** con `levelIndex` (contrato Feature 04).

---

### `economy` (nuevo)

**Responsabilidad:** Oro de la run del nivel.

**API conceptual:**
```
startLevel(gold): Economy
trySpend(cost): boolean
reward(kill): void
```

---

### `base-lives` (nuevo)

**Responsabilidad:** Vidas de base (inicial 20); restar por leak; `defeat` a 0.

**API conceptual:**
```
onLeak(enemyType): { lives, defeated }
```

---

### `level-campaign` (nuevo)

**Responsabilidad:** Índice 1..15, desbloqueo, victoria de campaña.

**API conceptual:**
```
isUnlocked(level, maxUnlocked): boolean
onLevelWon(level, maxUnlocked): { maxUnlocked, campaignComplete }
```

---

### `td-engine` (nuevo)

**Responsabilidad:** Estado puro de una partida de nivel: torres, enemigos, proyectiles, oleada actual; `step(dt)`.

**Entradas:** map, waves, tower placements, dt.

**Salidas:** nuevo estado; eventos `enemyKilled` | `enemyLeaked` | `waveCleared` | `levelWon` | `levelLost`.

**Dependencias:** path, build-zones, tower-combat, wave-system, economy, base-lives.

**No conoce:** React, AsyncStorage, navegación.

---

### `game-loop` (nuevo)

**Responsabilidad:** Estados de experiencia y coordinación UI ↔ engine.

**Estados:**
```
menu → levelSelect → playing ⇄ paused
                   → waveBreak → playing
                   → levelVictory → levelSelect | next
                   → defeat → retry | levelSelect
                   → campaignVictory
```

---

### `offline-progress` (nuevo)

**Responsabilidad:** Persistir progreso de campaña.

**API conceptual:**
```
load(): Promise<{ maxUnlockedLevel, campaignComplete }>
save(state): Promise<void>
```

**Clave sugerida:** `tower:v1:campaign`

**Dependencias:** AsyncStorage (Expo).

---

### `tower-placement-ui` (ui)

**Responsabilidad:** Barra de 4 torres, selección, highlight de pads, tap para construir si hay oro.

---

### `battlefield-view` (ui)

**Responsabilidad:** Dibujar mapa (path, pads, decor), enemigos, torres, rangos, proyectiles, HUD.

---

### `tower-screens` (ui)

**Responsabilidad:** Menú (marca **Tower**), selector 15 niveles, victoria/derrota/campaña, cómo jugar, pausa.

---

### `android-release` (infra)

**Responsabilidad:** Build APK Release según estándar WIKA (Expo 52, JDK 17, verify-build).

---

## Qué NO es módulo en V1

| Idea | Motivo |
|------|--------|
| Tower upgrades | Deseable |
| Dual path AI | Un path por mapa en V1 |
| Online meta | Offline-first |
| Editor de mapas in-game | Datos estáticos en `map-catalog` |
| Audio engine complejo | Deseable |

---

## Orden de construcción sugerido (módulos)

1. `map-catalog` (15 mapas distintos) + `path-system` + `build-zones`
2. `enemy-types` + `wave-system` (escalado 15 niveles)
3. `tower-types` + `tower-combat` + `economy` + `base-lives`
4. `td-engine` (puro + tests)
5. `level-campaign` + `offline-progress`
6. `game-loop` + `battlefield-view` + `tower-placement-ui` + `tower-screens`
7. `android-release` (APK)

---

## Criterio de salida — Descubrimiento V1

- [x] Módulos identificados con responsabilidad única
- [x] 15 mapas + 4 torres + oleadas escaladas cubiertos
- [x] Motor puro separado de UI
- [x] Dependencias explícitas
- [x] Fuera de alcance claro
- [x] Auditoría de módulos (`audits/auditoria-modulos.md` — APROBADO)
