# Problema

## Nombre del proyecto

Alvaro

## Descripción

Crear un juego clásico de **Snake** para Android, 100% offline: la serpiente se mueve por una grilla, come pelotitas y **crece con cada una**, el jugador tiene **3 vidas**, y el **puntaje máximo se calcula según el tiempo vivo**. El objetivo es una experiencia simple, clara y jugable en una sola sesión, sin cuentas ni red.

## Usuarios

| Perfil | Necesidad |
|--------|-----------|
| Jugador casual Android | Abrir y jugar Snake en segundos, sin tutorial largo |
| Jugador competitivo local | Superar su propio máximo de puntaje (tiempo vivo) |
| Usuario offline | Jugar sin internet, sin anuncios ni login |
| Jugador de sesiones cortas | Partidas rápidas con 3 vidas y reinicio inmediato |

## Objetivo

Entregar V1 instalable (APK Release) de Snake en Android con: crecimiento por pelotita comida, sistema de 3 vidas, score/high-score basado en tiempo vivo, controles táctiles claros y persistencia local del máximo puntaje.

## Beneficios esperados

- Juego clásico reconocible, fácil de entender.
- Progresión tangible: la serpiente crece al comer.
- Reto medible: maximizar tiempo vivo (puntaje).
- Tolerancia a errores con 3 vidas antes del game over.
- App ligera, offline y sin dependencias de backend.

## Restricciones

- **Plataforma:** Android (API 24+ / Android 7.0+) — **V1 solo Android**.
- **Conectividad:** 100% offline; sin backend, cuentas, rankings online ni anuncios.
- **Stack WIKA:** Expo SDK 52 + React Native; dependencias pinneadas (`~`); JDK 17 para BUILD.
- **Orientación:** Portrait (recomendado V1).
- **Permisos:** Ningún permiso sensible en V1 (sin cámara, ubicación ni internet).
- **Tamaño:** < 25 MB instalado.
- **Entregable:** APK Release sideloadable **sin Metro**.

## Criterios de éxito

- [ ] La serpiente se mueve en grilla y cambia de dirección con controles táctiles.
- [ ] Cada pelotita comida aumenta la longitud de la serpiente en +1 segmento.
- [ ] El jugador inicia cada partida con **3 vidas**.
- [ ] Al chocar (borde o consigo misma) se pierde 1 vida; a 0 vidas → Game Over.
- [ ] El puntaje se calcula por **tiempo vivo** (acumulado mientras la partida está activa).
- [ ] Se persiste y muestra el **máximo puntaje** histórico local.
- [ ] La app funciona 100% offline.
- [ ] El APK Release compila, se instala por sideload y corre sin PC/Metro.
