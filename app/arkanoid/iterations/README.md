# Arkanoid — Iteraciones (V1 → V4)

Cada carpeta `vN/` es una **app Expo independiente** (propio `package.json`, `app.json`, APK).
Todas comparten el package Android `com.wika.arkanoid` → **desinstalar** antes de instalar otra versión.

Fuente de verdad del producto: [`../idea/`](../idea/).  
Auditorías WIKA: [`../audits/`](../audits/).  
Revisión consolidada: [`../review.md`](../review.md).  
Historial cronológico: [`HISTORIAL.md`](HISTORIAL.md).

## Línea evolutiva

```
V1 (clásico, 3 niveles)
 └─► V2 (+ jefe, /lose, /win)          ← histórico, no se reutiliza en V3/V4
      └─► V3 (clásico + 33 niveles + cápsulas + audio Castillo)
           └─► V4 (V3 sin MP3 ni expo-av)   ← recomendado si el arranque falla
```

## Comparativa rápida

| | V1 | V2 | V3 | V4 |
|---|:---:|:---:|:---:|:---:|
| Niveles | 3 | 4 (+ jefe) | 33 | 33 |
| Jefe / `/lose` / `/win` | No | **Sí** | No | No |
| Cápsulas Vaus (L–P) | No | No | **Sí** | **Sí** |
| UI 8-bit + fondo Castillo | No | No | **Sí** | **Sí** |
| Audio ambiente (MP3) | No | No | **Sí** | **No** |
| `expo-av` | No | No | Sí | No |
| High score (AsyncStorage) | `v1` | `v2` | `v3` | `v4` |
| Versión APK (`app.json`) | 1.0.0 | 1.0.0 | 3.0.3 | 4.0.0 |
| Rama Git | `cursor/arkanoid-v1-eb2a` | `cursor/arkanoid-v2-eb2a` | `cursor/arkanoid-v3-classic-eb2a` | `cursor/arkanoid-v4-silent-eb2a` |

## Por versión

| Versión | Carpeta | README | Build | Informe generación | Auditorías |
|---------|---------|--------|-------|-------------------|------------|
| **V1** | [`v1/`](v1/) | [README](v1/README.md) | [BUILD-APK](v1/BUILD-APK.md) | [generation-report](v1/generation-report.md) | [release-v1](../audits/auditoria-release-v1.md) |
| **V2** | [`v2/`](v2/) | [README](v2/README.md) | [BUILD-APK](v2/BUILD-APK.md) | [generation-report](v2/generation-report.md) | [release-v2](../audits/auditoria-release-v2.md) |
| **V3** | [`v3/`](v3/) | [README](v3/README.md) | [BUILD-APK](v3/BUILD-APK.md) | [generation-report](v3/generation-report.md) | [flujo-v3](../audits/flujo-wika-v3.md), [audio](../audits/auditoria-audio-arranque-v3.md), [errores](../audits/errores-v3.md) |
| **V4** | [`v4/`](v4/) | [README](v4/README.md) | [BUILD-APK](v4/BUILD-APK.md) | [generation-report](v4/generation-report.md) | [flujo-v4](../audits/flujo-wika-v4.md), [release-v4](../audits/auditoria-release-v4.md) |

## Cuál usar

| Objetivo | Versión |
|----------|---------|
| Probar el juego clásico mínimo | **V1** |
| Ver la rama experimental con jefe (histórico) | **V2** |
| Juego completo con música Castillo | **V3** (riesgo OOM en gama baja; ver [errores-v3](../audits/errores-v3.md)) |
| Juego completo **sin audio**, arranque más seguro | **V4** ← recomendado hoy |

## Build rápido (Windows)

```powershell
cd app\arkanoid\iterations\v4   # cambiar v1, v2, v3 o v4
npm install
npm run apk:win                 # V3/V4; V1/V2 usan npm run apk
```

Requisitos: JDK 17, Android SDK. Detalle en el `BUILD-APK.md` de cada versión.

## Reglas WIKA

- No mezclar código entre `vN/`; cada iteración es copia + delta.
- `idea/` define features; `iterations/` es código ejecutable + notas de build.
- `final/` solo cuando el arquitecto aprueba sideload (aún vacío).
