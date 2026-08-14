# 03 — Descubrimiento de módulos

## Proyecto
Sodoku nuevo — Android (Expo / React Native)

## Versión de documentación
V3

## Objetivo de esta etapa
Traducir `02-features.md` en módulos reutilizables. V3 **agrega** módulos nuevos (`rewards`, `inventory`) y **extiende** módulos existentes (`level-progression`, `home-branding`, `local-score`, `offline-progress`). No se reescribe el motor Sudoku desde cero.

---

## Inventario de módulos (V3)

| Módulo | Tipo | Estado V3 | Justificación |
|--------|------|-----------|---------------|
| `sudoku-engine` | core | Reutilizar (V2) | Motor + unicidad; sin cambio de reglas |
| `level-progression` | core | Extender | 20 → **100** niveles; dificultad interna easy/medium alternada, **oculta** |
| `rewards` | core | **Nuevo** | Regalo aleatorio `regalo 1`…`regalo 8` al completar nivel |
| `inventory` | core | **Nuevo** | Almacenar y listar regalos ganados (solo visualización) |
| `local-score` | core | Extender | Score + contador de regalos ganados |
| `offline-progress` | infra | Extender | Persistencia de progreso 100 niveles + inventario + score |
| `home-branding` | ui | Extender | Botones jugar / inventario / puntaje / histórico / regalos; paleta Pinki Cute |
| `history-list` | ui | Reutilizar/extender | Pantalla historial (desde V2) |
| `hint-system` | ui | Reutilizar | 3 pistas por nivel (V2) |
| `android-release` | infra | Reutilizar | Pipeline APK Release |

---

## Módulos nuevos — detalle

### `rewards` (nuevo)

**Propósito:** Entregar un regalo aleatorio al completar un nivel.

**API conceptual:**
```
rollReward(): "regalo 1" | "regalo 2" | ... | "regalo 8"
onLevelComplete(levelId): RewardEvent
```

**Reglas:**
- Nombres literales exactamente: `regalo 1` … `regalo 8`
- Selección uniforme al azar (cada uno con probabilidad 1/8)
- Se dispara **una vez** por nivel completado exitosamente
- Emite evento consumible por `inventory` y por UI de victoria

**Dependencias:** `level-progression` (señal de victoria)

**No depende de:** red, compras, anuncios

---

### `inventory` (nuevo)

**Propósito:** Almacenar regalos ganados y permitir **solo visualización**.

**API conceptual:**
```
addGift(name: RewardName): void
listGifts(): RewardName[]   // disponibles / ganados
countGifts(): number
```

**Reglas:**
- Solo se visualizan regalos disponibles (los ganados)
- No hay canje, uso, eliminación ni tienda en V3
- Persistencia local vía `offline-progress`

**Dependencias:** `rewards` (entrada), `offline-progress` (persistencia)

**UI:** pantalla Inventario accesible desde Home → botón **Inventario**

---

## Módulos extendidos — detalle

### `level-progression` (extender)

| Antes (V2) | V3 |
|------------|-----|
| 20 niveles | **100 niveles** |
| Dificultad fija/no documentada como alternancia | Alternancia interna: impar = easy, par = medium |
| Jugador ve solo número de nivel | Jugador **nunca** ve etiqueta de dificultad |

**API conceptual:**
```
getLevel(n: 1..100): Level
getInternalDifficulty(n): "easy" | "medium"  // solo interno / generación
isDifficultyVisibleToPlayer(): false
advanceOnWin(n): n+1 | completed
```

**Dependencias:** `sudoku-engine`, `offline-progress`, `rewards` (al ganar)

---

### `home-branding` (extender)

**Home V3 — botones de acción:**
1. **Jugar** → pantalla de juego / nivel actual
2. **Inventario** → pantalla inventario

**Home V3 — botones de información:**
1. **Puntaje** → score actual / histórico de puntaje
2. **Histórico** → niveles completados / historial
3. **Regalos** (número de regalos ganados) → resumen o enlace a inventario

**Diseño:** paleta **Pinki Cute** documentada en `imagenes/diseño ui.md` y `imagenes/PALETA.md`.

---

### `local-score` (extender)

- Mantener score por aciertos
- Agregar **contador de regalos ganados** (`giftsWonCount`)
- Exponer ambos para botones de información en Home

---

### `offline-progress` (extender)

Persistir:
- `currentLevel` (1–100)
- `completedLevels[]`
- `score`
- `inventory: RewardName[]`
- `giftsWonCount`
- (opcional) historial de partidas

---

## Módulos reutilizados sin cambio de contrato

| Módulo | Nota |
|--------|------|
| `sudoku-engine` | Validación unicidad V2 se mantiene; generar/validar pack de 100 |
| `hint-system` | 3 pistas por nivel |
| `history-list` | Pantalla historial |
| `android-release` | `npm run build:apk` / `verify-build` |

---

## Qué NO es módulo nuevo en V3

| Idea descartada / diferida | Motivo |
|----------------------------|--------|
| Tienda / canje de regalos | Fuera de alcance; inventario solo visualiza |
| Mostrar dificultad al jugador | Explícitamente prohibido |
| Niveles hard / expert | Solo easy/medium internos |
| Online / cuentas | Offline-first |
| Ads / IAP | No |

---

## Orden de construcción sugerido (módulos)

1. Extender `level-progression` → pack 100 + dificultad interna oculta  
2. Nuevo `rewards` → `rollReward()`  
3. Nuevo `inventory` → store + UI lista  
4. Extender `offline-progress` → persistir inventario + progreso 100  
5. Extender `home-branding` → botones Jugar / Inventario / info  
6. Extender `local-score` → contador regalos  
7. Validar pack 100 con `validate:levels`  
8. Release APK  

---

## Criterio de salida — Descubrimiento V3

- [x] Módulos nuevos identificados: `rewards`, `inventory`
- [x] Módulos a extender listados con delta V2→V3
- [x] Dependencias explícitas
- [x] Fuera de alcance claro
- [x] Auditoría de módulos V3 (`audits/auditoria-modulos-v3.md` — APROBADO)
