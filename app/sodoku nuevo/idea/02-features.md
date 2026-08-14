# Funcionalidades

## Funcionalidades obligatorias

### Feature 01 — Tablero Sudoku 9×9

Grilla 9×9 interactiva (fijas + editables). Estilo visual según `imagenes/` (Pinki Cute).

### Feature 02 — 100 niveles progresivos (V3)

Exactamente **100 niveles**. Nivel 1 desbloqueado; completar desbloquea el siguiente. Rejugables una vez desbloqueados.

El jugador **solo ve el número de nivel** y avanza. **No se muestra** etiqueta de dificultad.

### Feature 03 — Aviso de errores

Conflictos fila/columna/bloque se muestran como error (color de error de la paleta `imagenes/`).

### Feature 04 — Puntaje

Puntaje acumulado persistente. En home se accede mediante **botón informativo de puntaje**.

### Feature 05 — 100% offline

Sin backend, sin cuentas, sin APIs de puzzles.

### Feature 06 — Reinicio de nivel

Reiniciar el nivel en curso regenerando puzzle válido.

### Feature 07 — Home VISSIUSS + acciones V3

Pantalla principal con marca VISSIUSS y:

**Botones de acción (únicos disponibles para jugar/gestionar):**

| Botón | Acción |
|-------|--------|
| Jugar | Ir a niveles / continuar |
| Inventario | Ver regalos disponibles |

**Botones informativos:**

| Botón | Información |
|-------|-------------|
| Puntaje | Puntaje total |
| Histórico | Historial local de victorias |
| Regalos | Número de regalos ganados (total en inventario) |

### Feature 08 — Mensaje de ganador

`muy bien culiaitoo` + un `!` por número de nivel (1–100).

### Feature 09 — Identidad visual Pinki Cute (V3)

Fuente de verdad: carpeta del proyecto `imagenes/`.

- Spec: `imagenes/diseño ui.md`
- Referencias: `imagenes/image.png`, `imagenes/ChatGPT Image 14 ago 2026, 11_13_38.png`
- Paleta (resumen):

| Token | Hex | Uso |
|-------|-----|-----|
| Rosa Claro | `#FFB6D5` | Fondo |
| Rosa Fuerte | `#FF69B4` | Acentos / botones |
| Lila Claro | `#D291FF` | Secundario |
| Morado | `#8A2BE2` | Activos |
| Negro Suave | `#1A1A1A` | Texto fuerte / números |
| Rosa Muy Claro | `#FFF0F6` | Superficies |

Errores: tono alto contraste compatible (rojo o rosa saturado definido en tokens de implementación, no usado para otros estados).

### Feature 10 — Persistencia local

Progreso (100 niveles), puntaje, histórico, inventario de regalos y partida activa.

### Feature 11 — Motor solución única

Todo puzzle: exactamente una solución. Gate `validate:levels` para 1–100.

### Feature 12 — Pistas: 3 por nivel

3 pistas por partida de nivel; reinicio restaura a 3.

### Feature 13 — Dificultad oculta fácil/media alternada (V3)

Internamente:

| Niveles | Dificultad interna |
|---------|-------------------|
| Impares (1,3,5,…) | Fácil |
| Pares (2,4,6,…) | Media |

**No se muestra** al jugador. Solo completar y avanzar.

### Feature 14 — Sistema de recompensas (V3)

Al completar un nivel se otorga **al azar** exactamente uno de:

```text
regalo 1
regalo 2
regalo 3
regalo 4
regalo 5
regalo 6
regalo 7
regalo 8
```

- Nombres literales obligatorios.
- Selección uniforme aleatoria entre los 8.
- El regalo se agrega al inventario inmediatamente.

### Feature 15 — Sistema de inventario (V3)

- Almacena regalos ganados (conteo por tipo y/o lista).
- **Solo visualización** de regalos disponibles.
- Sin canje, venta, crafting ni borrado en V3.
- Acceso desde botón **Inventario** en home.

---

## Funcionalidades deseables

### Feature 16 — Temporizador

### Feature 17 — Deshacer

### Feature 18 — Notas / candidatos

### Feature 19 — Animación al recibir regalo

---

## Fuera de alcance

- iOS
- Online / rankings / cuentas / anuncios
- Mostrar dificultad al jugador
- Canje o uso consumible de regalos
- Más de 8 tipos de regalo o nombres distintos
- Backend
