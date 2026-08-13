# Problema

## Nombre del proyecto

Sodoku nuevo

## Descripción

Se necesita una aplicación Android de Sudoku clásico 9×9, 100% offline, con exactamente 20 niveles progresivos. El jugador debe recibir aviso visual de errores, acumular puntaje, poder reiniciar el nivel y completar cada nivel con un mensaje de victoria de marca. La experiencia debe ser limpia (fondo blanco, tipografía y números negros) y mostrar en la pantalla de inicio la marca de agua VISSIUSS.

## Usuarios

- Jugadores casuales de Android que quieren partidas offline sin cuenta ni anuncios.
- Principiantes que necesitan feedback claro de errores (números en rojo).
- Jugadores que buscan progresión corta y medible en 20 niveles.
- Uso esperado: abrir la app → pantalla de inicio con marca VISSIUSS → elegir o continuar nivel → jugar el tablero 9×9 → completar nivel y ver mensaje de victoria → avanzar o reiniciar.

## Objetivo

Entregar una app Android de Sudoku 9×9 offline con 20 niveles, puntaje, aviso de errores en rojo, reinicio de nivel, identidad visual blanco/negro con marca VISSIUSS en inicio, y mensaje de ganador por nivel según la regla de signos de exclamación definida en `02-features.md`.

## Beneficios esperados

- Juego usable sin internet ni registro.
- Progresión clara en 20 niveles.
- Feedback inmediato de errores y puntaje.
- Identidad de marca VISSIUSS visible desde el inicio.
- Experiencia simple y legible (alto contraste blanco/negro).

## Restricciones

- **Tecnología:** v1 solo Android; tablero Sudoku clásico 9×9.
- **Infraestructura:** 100% offline; sin backend, sin nube, sin autenticación.
- **Operativas:** Progreso y puntaje persistidos en el dispositivo; reinicio de nivel disponible.
- **Seguridad / privacidad:** Sin permisos sensibles; sin envío de datos fuera del dispositivo.
- **Diseño (obligatorio v1):** Fondo blanco; letras negras; celdas con bordes negros; números negros; errores en rojo.
- **Marca:** Pantalla de inicio con marca de agua VISSIUSS; logo oficial en `idea/assets/vissiuss-logo.png`.

## Criterios de éxito

- Existe un tablero 9×9 jugable con 20 niveles.
- Los errores se muestran al jugador en rojo.
- Hay sistema de puntaje.
- La app funciona 100% offline.
- Se puede reiniciar el nivel en curso.
- La pantalla de inicio muestra marca de agua VISSIUSS (logo de compañía).
- Al ganar un nivel se muestra el mensaje de victoria con la cantidad de `!` igual al número de nivel.
- La UI cumple el esquema blanco / negro / rojo-solo-errores.
