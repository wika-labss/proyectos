# Features

# Metadata

| Campo | Valor |
|---------|---------|
| Proyecto | Sodoku Android |
| Autor | WIKA |
| Fecha | 2026-08-13 |
| Estado | Draft |

---

# Resumen

Aplicación Android de Sudoku clásico 9×9, 100% offline, con exactamente 20 niveles de dificultad creciente, teclado numérico táctil, validación en partida, pistas limitadas, temporizador, guardado local del progreso y pantallas de selección, victoria, ajustes y estadísticas básicas.

---

# Funcionalidades Obligatorias

## Tablero Sudoku 9×9

Grilla interactiva con celdas fijas (pistas iniciales) y celdas editables. Selección táctil de celda y colocación de números.

---

## 20 niveles progresivos

Exactamente 20 niveles con dificultad escalable de fácil a experto. El nivel 1 inicia desbloqueado; completar un nivel desbloquea el siguiente. Los niveles desbloqueados pueden rejugarse libremente.

---

## Generación de puzzles

Cada partida de un nivel genera un puzzle válido con **una sola solución**, calibrado a la dificultad del nivel (sin puzzles hardcodeados como única fuente).

---

## Entrada de números

Teclado numérico táctil (1–9) ubicado en la zona inferior para uso con una sola mano; selección previa de celda vacía o editable.

---

## Validación en tiempo real

Resaltar errores y conflictos en fila, columna o cuadrante 3×3 sin terminar la partida de forma punitiva (sin “game over” por error).

---

## Sistema de pistas

Revelar un número correcto en una celda, con límite por partida según tramo de niveles (ver reglas de negocio).

---

## Deshacer / Rehacer

Historial de movimientos del jugador durante la partida activa.

---

## Temporizador

Cronómetro por partida con registro de mejor tiempo por nivel cuando corresponda.

---

## Guardado automático

Persistencia local de partida en curso, niveles desbloqueados/completados y preferencias entre sesiones.

---

## Pantalla de selección de niveles

Lista o grilla de 20 niveles con estado bloqueado / desbloqueado / completado.

---

## Detección de victoria

Confirmación al completar el puzzle correctamente, con opción de avanzar al siguiente nivel o repetir.

---

## Borrado de celda

Permitir limpiar el valor de una celda editable (no fija).

---

# Funcionalidades Deseables

Funcionalidades positivas si el tiempo lo permite; no bloquean el cumplimiento mínimo de v1:

- **Modo notas / candidatos** — Marcar posibles números en una celda (modo lápiz).
- **Resaltar relacionados** — Al seleccionar un número o celda, resaltar ocurrencias y/o fila-columna-cuadrante.
- **Modo oscuro / claro** — Tema visual intercambiable.
- **Estadísticas** — Partidas jugadas, ganadas, tiempo promedio, racha.
- **Efectos de sonido** — Feedback auditivo silenciable (colocar, error, victoria).
- **Animaciones de victoria** — Celebración visual al completar un nivel.
- **Feedback háptico** — Vibración breve en acciones clave.

---

# Reglas de Negocio

- El tablero es Sudoku clásico 9×9 (filas, columnas y bloques 3×3 con dígitos 1–9 sin repetición).
- Cada puzzle generado debe tener **exactamente una solución**.
- Existen **exactamente 20 niveles**; no más ni menos en v1.
- El nivel 1 está desbloqueado al instalar; el nivel N+1 se desbloquea al completar el N.
- Los niveles desbloqueados pueden rejugarse sin límite.
- Las celdas fijas (pistas iniciales) no son editables.
- Los errores se señalan visualmente; no eliminan la partida ni reinician el nivel automáticamente.
- Límites de pistas por partida:
  - Niveles 1–10: máximo **3** pistas
  - Niveles 11–16: máximo **2** pistas
  - Niveles 17–20: máximo **1** pista
- Sin cuenta de usuario: todo el progreso es local al dispositivo.
- Sin red obligatoria: la app debe ser jugable sin internet.
- Sin anuncios ni compras en v1.

### Progresión de los 20 niveles

| Nivel | Dificultad | Pistas iniciales | Técnicas requeridas |
|-------|------------|------------------|---------------------|
| 1–4   | Fácil      | 42–46            | Lógica directa (naked singles) |
| 5–8   | Fácil+     | 38–41            | Singles ocultos básicos |
| 9–12  | Medio      | 32–37            | Pares desnudos, intersecciones |
| 13–16 | Difícil    | 26–31            | X-Wing básico, cadenas simples |
| 17–20 | Experto    | 20–25            | Técnicas avanzadas, mínimas pistas |

---

# Fuera de Alcance

Funcionalidades que **NO** deben desarrollarse en esta versión (v1):

- Soporte iOS u otras plataformas
- Multijugador o partidas online
- Rankings globales / leaderboards
- Cuentas de usuario / autenticación
- Monetización (anuncios, compras in-app)
- Variantes de Sudoku (Killer, Hyper, Samurai)
- Modo diario con puzzle compartido globalmente
- Backend o sincronización en la nube
- Integraciones sociales o compartir resultados online

---

# Restricciones Funcionales

- **Técnicas:** Entregable Android; funcionamiento offline; persistencia solo local.
- **Operativas:** Usable en dispositivo físico; progreso no debe perderse al cerrar la app de forma normal.
- **Seguridad / privacidad:** No solicitar permisos sensibles; no enviar datos de juego fuera del dispositivo; sin PII.

---

# Resultado Esperado

Al finalizar este documento cualquier persona o agente IA debe poder responder:

1. ¿Qué debe hacer la aplicación?
2. ¿Qué funcionalidades son obligatorias?
3. ¿Qué funcionalidades son opcionales?
4. ¿Qué queda fuera de esta versión?
