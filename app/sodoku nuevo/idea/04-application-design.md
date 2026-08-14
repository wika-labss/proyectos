# Diseño de Aplicación

## Objetivo

Definir cómo interactúan los módulos para Sodoku nuevo V2 (Android, offline, 20 niveles, puzzles validados, pistas ×3, home con progreso).

---

## Arquitectura General

```text
[home-branding] → [level-progression] → [sudoku-board] ↔ [sudoku-engine]
       ↓                   ↓                   ↓              ↑
 [scoring/histórico] [local-storage]         [hints] ─────────┘
       ↓
[victory-feedback]
       ↑
  [app-theme]
```

---

## Módulos Utilizados (V2)

| Módulo | Rol |
|--------|-----|
| sudoku-engine | Generación + **validatePuzzle (solución única)** |
| sudoku-board | Tablero |
| hints | 3 pistas por nivel |
| level-progression | 20 niveles + reinicio |
| scoring | Puntaje + histórico |
| local-storage | Persistencia |
| home-branding | VISSIUSS + iconos puntaje/histórico/completados |
| victory-feedback | Mensaje con `!`×nivel |
| app-theme | Blanco / negro / rojo-errores |

---

## Relaciones entre módulos

| Desde | Hacia | Relación |
|-------|-------|----------|
| sudoku-board | sudoku-engine | Valida movimientos / completitud |
| hints | sudoku-engine | Lee solución para revelar celda |
| hints | sudoku-board | Aplica valor y fija celda |
| level-progression | sudoku-engine | Puzzle al iniciar/reiniciar (**solo si validatePuzzle OK**) |
| home-branding | scoring / level-progression / local-storage | Muestra puntaje, histórico, completados |
| victory-feedback | level-progression | Desbloqueo + registro histórico |

Sin dependencias circulares dominio→UI.

---

## Flujo principal de usuario

1. Home VISSIUSS con iconos: puntaje, histórico, completados → Jugar.
2. Selección de nivel (20).
3. Generar puzzle → **validar solución única** → tablero.
4. Jugar / error en rojo / **pista (máx 3)** / reiniciar.
5. Victoria → mensaje + histórico local actualizado.

---

## Navegación

| Pantalla | Descripción |
|----------|-------------|
| Inicio | VISSIUSS + iconos puntaje / histórico / completados + Jugar |
| Histórico | Lista local de victorias (nivel, puntaje, fecha) |
| Niveles | 20 niveles con estado |
| Juego | Tablero, puntaje, pistas restantes, reinicio |
| Victoria | `muy bien culiaitoo` + `!`×nivel |

Estados: `idle`, `playing`, `errorHighlight`, `hinting`, `completed`, `resetting`.

---

## Riesgos de diseño

- Puzzles sin solución / multi-solución → gate `validate:levels` bloqueante en V2.
- Generación lenta → aceptar más pistas iniciales si mantiene unicidad.
- Agotar pistas → UI deshabilitada clara.
- Histórico crece → limitar a N entradas recientes en local storage.
