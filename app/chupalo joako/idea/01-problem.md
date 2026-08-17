# Problema

## Nombre del proyecto

Chupalo joako

## Descripción

Crear un juego clásico de **Tetris** para Android, 100% offline: las piezas (tetrominós I, O, T, S, Z, J, L) caen sobre un pozo, el jugador las mueve y rota, y debe **completar líneas horizontales** para despejar el tablero. El look es **arcade de colores llamativos** (paleta saturada/neón, alto contraste). Existe un **sistema de puntos** por líneas y caídas; la **dificultad avanza según el puntaje** (más puntos → mayor nivel de gravedad / caída más rápida), no por un contador de líneas independiente.

## Usuarios

| Perfil | Necesidad |
|--------|-----------|
| Jugador casual Android | Abrir y jugar Tetris en segundos, controles táctiles claros |
| Jugador de arcade visual | Piezas y UI con colores saturados, fáciles de distinguir |
| Jugador competitivo local | Maximizar puntaje; sentir que el ritmo sube al sumar puntos |
| Usuario offline | Jugar sin internet, sin anuncios ni login |
| Jugador de sesiones cortas | Partida hasta top-out, reinicio inmediato, high score local |

## Objetivo

Entregar V1 instalable (APK Release) de Tetris en Android con: 7 tetrominós, rotación y movimiento táctil, limpieza de líneas, puntuación visible, **dificultad que escala con el puntaje**, paleta llamativa, high score local y game over al llenar el pozo.

## Beneficios esperados

- Juego clásico reconocible (Tetris / falling blocks).
- Feedback visual fuerte: cada pieza con color saturado distinto.
- Progresión medible: más puntos = más velocidad.
- Sesiones cortas, reinicio inmediato, high score persistido.
- App ligera, offline y sin dependencias de backend.

## Restricciones

- **Plataforma:** Android (API 24+ / Android 7.0+) — **V1 solo Android**.
- **Conectividad:** 100% offline; sin backend, cuentas, rankings online ni anuncios.
- **Stack WIKA:** Expo SDK 52 + React Native; dependencias pinneadas (`~`); JDK 17 para BUILD.
- **Orientación:** Portrait (V1).
- **Permisos:** Ningún permiso sensible en V1 (sin cámara, ubicación ni internet).
- **Tamaño:** < 25 MB instalado.
- **Entregable:** APK Release sideloadable **sin Metro**.
- **Fidelidad:** Género Tetris (pozo + 7 tetrominós + líneas). **No** clonar assets ni marca comercial Tetris®; diseño original WIKA.
- **Dificultad:** El nivel / gravedad se deriva del **puntaje de la partida**, no de un sistema de niveles desacoplado del score.

## Criterios de éxito

- [ ] Siete tetrominós distinguibles por forma y color llamativo.
- [ ] El jugador mueve, rota y deja caer piezas; las líneas completas se eliminan.
- [ ] El puntaje sube según reglas documentadas (líneas + drops).
- [ ] Al cruzar umbrales de puntaje, la pieza cae más rápido (dificultad por puntos).
- [ ] High score local persistido; visible en menú y Game Over.
- [ ] Game Over cuando una pieza no puede spawnear (top-out).
- [ ] Paleta saturada / neón; piezas nunca se confunden entre sí.
- [ ] La app funciona 100% offline.
- [ ] El APK Release compila, se instala por sideload y corre sin PC/Metro.
