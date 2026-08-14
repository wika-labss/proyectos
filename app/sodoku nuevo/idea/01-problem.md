# Problema

## Nombre del proyecto

Sodoku nuevo

## Descripción

Aplicación Android de Sudoku 9×9 100% offline con **100 niveles** de dificultad fácil/media alternada (oculta al jugador). Al completar un nivel se otorga al azar uno de ocho regalos (`regalo 1` … `regalo 8`), almacenados en inventario local. La home ofrece botones **Jugar** e **Inventario**, y botones informativos de puntaje, histórico y cantidad de regalos. El diseño visual sigue la paleta e imágenes de `imagenes/` (estilo Pinki Cute).

## Usuarios

- Jugadores casuales Android offline.
- Jugadores que quieren progresión larga (100 niveles) sin ver etiquetas de dificultad.
- Jugadores motivados por colección de regalos en inventario.
- Uso: home → Jugar / Inventario / puntaje / histórico / regalos → completar niveles → recibir regalo.

## Objetivo

Entregar V3 con 100 niveles (fácil/media alternados, ocultos), recompensas aleatorias, inventario de regalos, home con botones Jugar e Inventario e info de puntaje/histórico/regalos, motor de puzzles con solución única, y UI según `imagenes/`.

## Beneficios esperados

- Más contenido (100 niveles).
- Motivación por colección (8 tipos de regalos).
- Home clara (acciones vs información).
- Identidad visual Pinki Cute documentada en `imagenes/`.

## Restricciones

- **Plataforma:** Android; offline; sin backend/cuentas/anuncios.
- **Niveles:** Exactamente 100; dificultad fácil/media alternada **sin mostrarse** al jugador.
- **Motor:** Solución única obligatoria (`validatePuzzle`).
- **Regalos:** Solo nombres `regalo 1` … `regalo 8`; otorgamiento aleatorio al completar nivel.
- **Inventario:** Solo visualización de regalos disponibles (sin tienda/canje en V3).
- **Diseño:** Fuente de verdad visual = carpeta `imagenes/` (paleta + referencias UI).
- **Entregable:** APK Release sin Metro.

## Criterios de éxito

- 100 niveles jugables con avance secuencial.
- Dificultad alterna fácil/media sin UI de dificultad.
- Cada victoria otorga 1 regalo aleatorio (1–8) al inventario.
- Inventario muestra solo regalos disponibles.
- Home: botones Jugar e Inventario; botones info puntaje, histórico, nº regalos.
- Diseño alineado a `imagenes/diseño ui.md` y assets de referencia.
