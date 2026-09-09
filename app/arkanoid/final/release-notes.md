# Release notes — Arkanoid V1

## Versión
1.0.0 · package `com.wika.arkanoid` · Expo SDK 52

## Fecha
2026-08-15

## Funcionalidades

- Menú futurista (hero Arkanoid, CTA Jugar, Cómo jugar, high score)
- Partida retro: pala, bola, ladrillos (normal / hard), rebotes clásicos
- 3 vidas · 3 niveles · score 100/200 · high score local
- Pausa · Level Clear · Game Over · Victory
- 100% offline

## Gates

| Gate | Resultado |
|------|-----------|
| smoke | PASSED |
| typecheck | PASSED |
| expo export | PASSED |
| assembleRelease (APK) | PASSED |

## APK

Generado en cloud: `app-release.apk` (~61 MB).

Local (Windows):

```text
C:\Alvaro proyectos\proyectos\app\arkanoid\iterations\v1\android\app\build\outputs\apk\release\app-release.apk
```

Ver `iterations/v1/BUILD-APK.md`.

## Consideraciones

- Sideload en dispositivo físico cierra la etapa Demo.
- Sin Metro: el bundle va embebido en el APK Release.
