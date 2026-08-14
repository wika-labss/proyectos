# Problema

## Nombre del proyecto

Sodoku nuevo

## Descripción

Se necesita una aplicación Android de Sudoku clásico 9×9, 100% offline, con exactamente 20 niveles progresivos. El jugador debe recibir aviso visual de errores, acumular puntaje, poder reiniciar el nivel, usar pistas limitadas y completar cada nivel con un mensaje de victoria de marca. La experiencia debe ser limpia (fondo blanco, tipografía y números negros), mostrar en la pantalla de inicio la marca de agua VISSIUSS, y exponer en home el puntaje, histórico local y niveles completados.

## Usuarios

- Jugadores casuales de Android que quieren partidas offline sin cuenta ni anuncios.
- Principiantes que necesitan feedback claro de errores (números en rojo) y hasta 3 pistas por nivel.
- Jugadores que buscan progresión corta y medible en 20 niveles, con historial local visible.
- Uso esperado: abrir la app → home VISSIUSS (puntaje / histórico / completados) → niveles → jugar 9×9 → pista/reinicio → victoria.

## Objetivo

Entregar una app Android de Sudoku 9×9 offline con 20 niveles **siempre solucionables (solución única validada)**, puntaje, errores en rojo, 3 pistas por nivel, reinicio, home con marca VISSIUSS e indicadores de progreso local, y mensaje de ganador por nivel según `02-features.md`.

## Beneficios esperados

- Juego usable sin internet ni registro.
- Progresión clara en 20 niveles con puzzles confiables.
- Feedback inmediato (errores, pistas, puntaje).
- Home informativa (puntaje, histórico, completados).
- Identidad VISSIUSS y UI blanco/negro legible.

## Restricciones

- **Tecnología:** Android; tablero Sudoku clásico 9×9.
- **Infraestructura:** 100% offline; sin backend, sin nube, sin autenticación.
- **Motor:** Todo puzzle generado debe tener **exactamente una solución**; se valida antes de entregar al jugador.
- **Operativas:** Progreso, puntaje e histórico persistidos localmente; reinicio y 3 pistas por nivel.
- **Seguridad / privacidad:** Sin permisos sensibles; sin envío de datos fuera del dispositivo.
- **Diseño:** Fondo blanco; letras negras; celdas con bordes negros; números negros; errores en rojo.
- **Marca:** Home con marca de agua VISSIUSS; logo en `idea/assets/vissiuss-logo.png`.
- **Entregable:** APK Release sideload **sin Metro**.

## Criterios de éxito

- Tablero 9×9 jugable con 20 niveles.
- Cada nivel genera/usa un puzzle con solución única verificada.
- Errores en rojo; 3 pistas por nivel.
- Puntaje e histórico local visibles en home (iconos).
- Home muestra niveles completados.
- Offline, reinicio, victoria `muy bien culiaitoo` + `!`×nivel.
- APK Release instalable sin Metro.
