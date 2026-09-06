# Problema

## Nombre del proyecto

Arkanoid

## Descripción

Crear un juego clásico de **Arkanoid / Breakout** para Android, 100% offline: el jugador controla una **pala** (paddle) en la parte inferior, rebota una **bola** y destruye **ladrillos** organizados en filas. Las reglas siguen el Arkanoid clásico: la bola rebota en paredes, pala y ladrillos; al romper todos los ladrillos se completa el nivel; al perder la bola se pierde una vida; con **3 vidas** y **game over** al agotarlas. El menú principal debe ser **intuitivo** con estética **futurista**; la partida mantiene un look **retro arcade**.

## Usuarios

| Perfil | Necesidad |
|--------|-----------|
| Jugador casual Android | Abrir y jugar Arkanoid en segundos, menú claro |
| Jugador nostálgico / retro | Experiencia fiel a las reglas clásicas |
| Jugador competitivo local | Superar su propio high score |
| Usuario offline | Jugar sin internet, sin anuncios ni login |
| Jugador de sesiones cortas | Partidas por nivel, reinicio inmediato |

## Objetivo

Entregar V1 instalable (APK Release) de Arkanoid en Android con: pala táctil, física de rebote clásica, ladrillos destructibles, 3 vidas, niveles, puntuación y high score local, menú futurista intuitivo y partida con diseño retro.

## Beneficios esperados

- Juego clásico reconocible, reglas familiares.
- Menú moderno/futurista fácil de navegar (Jugar, Continuar, High score, Salir/Créditos).
- Partida con atmósfera retro arcade (ladrillos, pala, bola).
- Progresión por niveles y score medible.
- App ligera, offline y sin dependencias de backend.

## Restricciones

- **Plataforma:** Android (API 24+ / Android 7.0+) — **V1 solo Android**.
- **Conectividad:** 100% offline; sin backend, cuentas, rankings online ni anuncios.
- **Stack WIKA:** Expo SDK 52 + React Native; dependencias pinneadas (`~`); JDK 17 para BUILD.
- **Orientación:** Portrait (V1).
- **Permisos:** Ningún permiso sensible en V1 (sin cámara, ubicación ni internet).
- **Tamaño:** < 25 MB instalado.
- **Entregable:** APK Release sideloadable **sin Metro**.
- **Fidelidad:** Reglas de juego = Arkanoid clásico. V1 = núcleo pala/bola/ladrillos. V3 añade las cápsulas Vaus clásicas (L E C S B D P). Sin jefe ni rutas dedicadas de derrota/victoria (eso fue un delta V2 retirado).

## Criterios de éxito

- [ ] Pala controlable por touch (arrastre horizontal); bola rebota según reglas clásicas.
- [ ] Ladrillos se destruyen al impacto; al limpiar el nivel se avanza o se gana.
- [ ] El jugador inicia cada partida/nivel con **3 vidas** (o las que restan al continuar).
- [ ] Perder la bola por abajo resta 1 vida; a 0 vidas → Game Over.
- [ ] Puntuación por ladrillos destruidos; high score local persistido.
- [ ] Menú principal intuitivo con diseño futurista; partida con diseño retro.
- [ ] La app funciona 100% offline.
- [ ] El APK Release compila, se instala por sideload y corre sin PC/Metro.

---

## Refinamiento V3 (cápsulas clásicas)

El problema original no cambia: Arkanoid Android offline, menú futurista, partida retro.

V3 **completa la fidelidad clásica** con las cápsulas que caen al romper ladrillos. No es un juego distinto ni un delta de jefe: es el mismo producto, con el núcleo Vaus documentado en Feature 23.

Fuente de verdad: `idea/02-features.md` → Feature 22 (sin delta V2) + Feature 23 (cápsulas).
