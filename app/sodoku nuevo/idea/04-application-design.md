# Diseño de Aplicación

## Objetivo

Definir cómo interactúan los módulos identificados para formar la aplicación Sodoku nuevo (Android, offline, 20 niveles).

---

## Arquitectura General

Aplicación móvil Android offline organizada por capacidades (módulos):

```text
[home-branding] → [level-progression] → [sudoku-board] ↔ [sudoku-engine]
                         ↓                      ↓
                  [local-storage] ←—————— [scoring]
                         ↓
                 [victory-feedback]
                         ↑
                    [app-theme] (transversal UI)
```

- **Capa de presentación:** home-branding, sudoku-board, victory-feedback, app-theme.
- **Capa de dominio:** sudoku-engine, level-progression, scoring.
- **Capa de persistencia:** local-storage.
- Sin backend ni servicios en red.

---

## Módulos Utilizados

V1 incluye todos los módulos descubiertos:

| Módulo | Rol en V1 |
|--------|-----------|
| sudoku-engine | Generación y validación |
| sudoku-board | Tablero interactivo |
| level-progression | 20 niveles + reinicio |
| scoring | Puntaje |
| local-storage | Persistencia |
| home-branding | Inicio + marca VISSIUSS |
| victory-feedback | Mensaje `muy bien culiaitoo` + `!`×nivel |
| app-theme | Blanco / negro / rojo-errores |

---

## Relaciones entre módulos

| Desde | Hacia | Relación |
|-------|-------|----------|
| sudoku-board | sudoku-engine | Valida cada movimiento; consulta completitud |
| level-progression | sudoku-engine | Solicita puzzle al iniciar/reiniciar nivel |
| level-progression | local-storage | Persiste desbloqueos y nivel actual |
| scoring | local-storage | Persiste puntaje |
| sudoku-board | scoring | Notifica aciertos/errores/victoria |
| sudoku-board | app-theme | Aplica colores (error = rojo) |
| home-branding | level-progression | Navega a niveles / continuar |
| victory-feedback | level-progression | Desbloquea siguiente; ofrece reinicio/avance |
| home-branding | app-theme | Fondo blanco, tipografía negra, logo |

No se definen dependencias circulares: el dominio no depende de la UI.

---

## Flujo principal de usuario

1. Abrir app → **home-branding** (marca de agua VISSIUSS).
2. Jugar / Continuar → lista o nivel actual (**level-progression**).
3. Entrar a nivel → **sudoku-engine** genera puzzle → **sudoku-board** muestra grilla.
4. Jugador coloca número → **sudoku-engine** valida → si error, **sudoku-board** pinta en rojo; **scoring** actualiza.
5. Completa tablero → **victory-feedback** muestra `muy bien culiaitoo` + N `!` → actualiza progreso/puntaje en **local-storage**.
6. Opción reiniciar en cualquier momento del nivel → **level-progression** regenera puzzle del mismo nivel.

---

## Navegación

| Pantalla | Módulos principales | Descripción |
|----------|---------------------|-------------|
| Inicio | home-branding, app-theme | Logo VISSIUSS, CTA jugar |
| Niveles | level-progression | 20 niveles, estados bloqueado/desbloqueado/completado |
| Juego | sudoku-board, sudoku-engine, scoring, level-progression | Tablero, puntaje, reinicio |
| Victoria | victory-feedback, scoring | Mensaje con `!`×nivel, avanzar/repetir |

Estados clave del juego: `idle`, `playing`, `errorHighlight`, `completed`, `resetting`.

---

## Riesgos de diseño

- Generación de puzzles lenta en dispositivos bajos → mitigar con generación asíncrona / límites por nivel.
- Confundir rojo con otros estados → regla estricta: rojo solo errores (`app-theme`).
- Pérdida de progreso → persistir en cada victoria y al pausar/cerrar (**local-storage**).
- Mensaje de victoria incorrecto → unit test de `!("!" * nivel)` en **victory-feedback**.
