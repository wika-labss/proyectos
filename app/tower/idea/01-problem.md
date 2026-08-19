# Problema

## Nombre del proyecto

Tower

## Descripción

Crear un juego **Tower Defense** para Android, 100% offline: el jugador coloca **torres** en zonas permitidas de un mapa para detener **oleadas de enemigos** que siguen un camino hacia la base. Hay **15 niveles**, cada uno con un **mapa de diseño distinto**, y la dificultad y la cantidad/complejidad de oleadas **aumentan** a medida que se avanza. V1 incluye **exactamente 4 tipos de torres** con roles distintos (daño simple, área, ralentización, largo alcance).

## Usuarios

| Perfil | Necesidad |
|--------|-----------|
| Jugador casual Android | Abrir y jugar partidas por nivel sin tutorial largo |
| Fan de tower defense | Estrategia de colocación, 4 torres con roles claros, oleadas crecientes |
| Jugador de progresión | Completar 15 mapas distintos con dificultad escalada |
| Usuario offline | Jugar sin internet, sin anuncios ni login |
| Jugador de sesiones medias | Una partida = un nivel (varias oleadas); reintentar o continuar |

## Objetivo

Entregar V1 instalable (APK Release) de Tower Defense en Android con: 15 niveles/mapas visualmente distintos, oleadas que escalan en dificultad, 4 tipos de torres colocables en zonas del mapa, derrota si los enemigos alcanzan la base, victoria al superar todas las oleadas del nivel, y progresión local entre niveles.

## Beneficios esperados

- Género reconocible (TD) con reglas familiares.
- Progresión larga y medible: exactamente **15** niveles.
- Variedad visual: **cada mapa es distinto** (layout + atmósfera).
- Decisiones tácticas vía **4 torres** con roles complementarios.
- App ligera, offline y sin dependencias de backend.

## Restricciones

- **Plataforma:** Android (API 24+ / Android 7.0+) — **V1 solo Android**.
- **Conectividad:** 100% offline; sin backend, cuentas, rankings online ni anuncios.
- **Stack WIKA:** Expo SDK 52 + React Native; dependencias pinneadas (`~`); JDK 17 para BUILD.
- **Orientación:** Portrait (V1).
- **Contenido V1:** Exactamente **15** niveles; exactamente **4** tipos de torres; todos los mapas con diseño distinto.
- **Permisos:** Ningún permiso sensible en V1 (sin cámara, ubicación ni internet).
- **Tamaño:** < 40 MB instalado.
- **Entregable:** APK Release sideloadable **sin Metro**.
- **Fidelidad:** Género tower defense clásico (camino + zonas de construcción + oleadas); diseño original WIKA (sin clonar assets comerciales).

## Criterios de éxito

- [ ] Existen **15** niveles jugables; cada uno con mapa de diseño distinto (camino + zonas + look).
- [ ] Dificultad y oleadas **aumentan** con el número de nivel (más oleadas / enemigos / resistencia).
- [ ] El jugador puede colocar **4 tipos de torres** en zonas permitidas del mapa activo.
- [ ] Los enemigos siguen el camino; si alcanzan la base se pierde vida/base; a 0 → derrota del nivel.
- [ ] Superar todas las oleadas del nivel → victoria de nivel y desbloqueo del siguiente (local).
- [ ] Completar el nivel 15 → victoria de campaña.
- [ ] La app funciona 100% offline.
- [ ] El APK Release compila, se instala por sideload y corre sin PC/Metro.
