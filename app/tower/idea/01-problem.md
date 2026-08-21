# Problema

## Nombre del proyecto

Tower

## Descripción

Crear un juego **Tower Defense** para Android, 100% offline: el jugador coloca **4 tipos de torres** en zonas del mapa para detener oleadas. **V2** corrige alcances de V1 (todas las torres deben poder golpear desde cualquier pad), añade fase de **preparación** antes de la 1ª oleada, permite colocar torres **antes / entre / durante** oleadas, mejora la distinción visual de torres, y amplía la campaña a **25 niveles** (mapas distintos) con dificultad escalada.

## Usuarios

| Perfil | Necesidad |
|--------|-----------|
| Jugador casual Android | Preparar defensa antes de empezar; UI clara de torres |
| Fan de tower defense | Colocar en prep, entre oleadas y durante combate |
| Jugador de progresión | 25 mapas distintos con dificultad creciente |
| Usuario offline | Sin red / anuncios / login |

## Objetivo

Entregar V2 instalable (APK Release) con: 25 mapas distintos, 4 torres siempre con alcance útil a path, colocación en preparación + entre oleadas + durante oleada, identidad visual clara por torre, oleadas escaladas, campaña local.

## Beneficios esperados

- Ningún pad “muerto” (todas las torres alcanzan el camino).
- Estrategia previa a la oleada (fase preparación).
- Refuerzos tácticos mid-wave y entre waves.
- Campaña más larga (25 niveles).

## Restricciones

- **Plataforma:** Android only (API 24+).
- **Offline** 100%; Expo SDK 52; JDK 17 BUILD.
- **25** niveles; **4** torres; mapas con diseño distinto.
- Contrato de alcance: `dist(pad, path) ≤ rango mínimo de torre` (Cañón).
- Entregable: APK Release **sin Metro**.

## Criterios de éxito

- [ ] 25 niveles jugables, mapas distintos.
- [ ] Desde cualquier pad, las 4 torres pueden alcanzar el path.
- [ ] Colocación en preparación, entre oleadas y durante oleada.
- [ ] Torres visualmente distinguibles (forma/color/etiqueta).
- [ ] Dificultad/oleadas escalan con el nivel.
- [ ] APK Release sideloadable sin Metro.
