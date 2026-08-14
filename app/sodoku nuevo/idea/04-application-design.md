# 04 — Diseño de aplicación

## Proyecto
Sodoku nuevo — Android (Expo / React Native)

## Versión
V3

## Objetivo
Ensamblar los módulos de `03-module-discovery.md` en una experiencia coherente: 100 niveles, recompensas, inventario, home con botones de acción e información, y paleta Pinki Cute.

---

## 1. Arquitectura de pantallas

```
Home
├── [Jugar] ──────────────► Game (nivel actual 1..100)
│                              └── Victoria → reward roll → Inventory update → siguiente nivel
├── [Inventario] ─────────► Inventory (lista de regalos ganados)
├── [Puntaje] ────────────► Score / resumen de puntaje
├── [Histórico] ──────────► History (niveles completados)
└── [Regalos] ────────────► resumen count / atajo a Inventario
```

**Regla de producto:** en ninguna pantalla se muestra “fácil”, “medio”, “easy” ni “medium”.

---

## 2. Flujo principal (jugador)

1. Abre app → **Home** (marca VISSIUSS + paleta Pinki Cute).
2. Toca **Jugar** → tablero del nivel actual (solo número de nivel).
3. Completa sudoku válido → pantalla victoria + mensaje + **regalo aleatorio** (`regalo N`).
4. El regalo se agrega al **inventario** automáticamente.
5. Avanza al siguiente nivel (o fin de campaña si nivel 100).
6. Desde Home puede abrir **Inventario** (solo ver regalos disponibles) o botones de info.

---

## 3. Modelo de datos (conceptual)

```ts
type RewardName =
  | "regalo 1" | "regalo 2" | "regalo 3" | "regalo 4"
  | "regalo 5" | "regalo 6" | "regalo 7" | "regalo 8";

type GameState = {
  currentLevel: number;          // 1..100
  completedLevels: number[];
  score: number;
  inventory: RewardName[];       // regalos ganados (disponibles)
  giftsWonCount: number;         // = inventory.length (o derivado)
};

// Solo interno — NUNCA UI
type InternalDifficulty = "easy" | "medium";
// level % 2 === 1 → easy; level % 2 === 0 → medium
```

---

## 4. Contratos entre módulos

| Emisor | Evento / dato | Consumidor |
|--------|---------------|------------|
| `level-progression` | `levelCompleted(levelId)` | `rewards`, `local-score`, `offline-progress` |
| `rewards` | `rewardGranted(name)` | `inventory`, UI victoria |
| `inventory` | `listGifts()`, `countGifts()` | Home (botón Regalos), pantalla Inventario |
| `local-score` | `score`, `giftsWonCount` | Home botones info |
| `offline-progress` | hydrate / persist | todos los anteriores |
| `sudoku-engine` | puzzle / validate | Game screen |
| `hint-system` | hintsRemaining | Game screen |

---

## 5. UI — Home (V3)

### Botones de acción
| Botón | Destino | Estilo |
|-------|---------|--------|
| **Jugar** | Game | Primario (`#FF69B4` / accent) |
| **Inventario** | Inventory | Secundario / outline pink |

### Botones de información
| Botón | Contenido mostrado |
|-------|-------------------|
| **Puntaje** | Score histórico / actual |
| **Histórico** | Niveles completados / lista |
| **Regalos** | Número de regalos ganados |

### Branding
- Marca **VISSIUSS** visible como señal fuerte en Home
- Fondo / atmósfera según `imagenes/` (rosa suave, no flat blanco puro)
- Tipografía expresiva (no Inter/Roboto por defecto si el stack lo permite; si Expo limita, documentar fuente elegida)

---

## 6. UI — Inventario

- Título: Inventario
- Lista de regalos **disponibles** (los ganados)
- Cada ítem muestra el nombre literal: `regalo 1`, etc.
- Sin botones de usar / vender / eliminar
- Empty state: mensaje corto si no hay regalos aún
- CTA secundario: volver / ir a Jugar

---

## 7. UI — Juego / Victoria

- Tablero 9×9; error en rojo; reset; 3 pistas (V2)
- Solo label de nivel: `Nivel N` (sin dificultad)
- Victoria: mensaje + nombre del regalo obtenido + continuar

---

## 8. Diseño visual — fuente de verdad

| Recurso | Ubicación |
|---------|-----------|
| Paleta Pinki Cute | `imagenes/diseño ui.md` |
| Referencia consolidada | `imagenes/PALETA.md` |
| Moodboards / refs | `imagenes/*.png` |

**Tokens principales:**
- Soft Pink `#FFB6D5`
- Hot Pink `#FF69B4`
- Soft Purple `#D291FF`
- Deep Purple `#8A2BE2`
- Soft Black `#1A1A1A`
- Soft White `#FFF0F6`

---

## 9. Persistencia

- AsyncStorage (o equivalente Expo)
- Claves versionadas `sodoku:v3:*` para evitar colisión con V2
- Migración opcional V2→V3: conservar score/progreso y mapear nivel ≤20; inventario inicia vacío si no existía

---

## 10. Criterios de aceptación de diseño

- [ ] Home muestra exactamente: Jugar, Inventario, Puntaje, Histórico, Regalos
- [ ] Dificultad nunca visible
- [ ] Al ganar nivel aparece uno de `regalo 1`…`regalo 8`
- [ ] Inventario solo lista regalos ganados
- [ ] Paleta alineada a `imagenes/`
- [ ] Offline completo

---

## Criterio de salida — Diseño V3

- [x] Pantallas y flujos definidos
- [x] Contratos entre módulos
- [x] Modelo de datos
- [x] Paleta referenciada desde `imagenes/`
- [x] Auditoría de ensamblado V3 (`audits/auditoria-ensamblado-v3.md` — APROBADO)
