# Auditoría de Release — Arkanoid V3

## Proyecto
Arkanoid

## Versión evaluada
`iterations/v3/` — 2026-09-06

## Evaluador
Arquitecto WIKA / Cloud Agent

## Etapa WIKA
Auditoría 2 (la solución funciona).  
Referencia de ciclo: `wika-fundaments/workflows/application-lifecycle.md` (Etapa 5).  
`docs/auditoria-2.md` no existe en fundamentos; se aplica la checklist de Release del portafolio (mismo patrón V1 / Sudoku / Alvaro).

## Entradas
- `idea/01`–`05` (contrato vigente V3)
- Auditoría 1 V3 **APROBADA** (`auditoria-documentacion-v3.md`, `auditoria-modulos-v3.md`, `auditoria-ensamblado-v3.md`)
- Código `app/arkanoid/iterations/v3/`
- `iterations/v3/generation-report.md`
- Evidencia de gates en este entorno (2026-09-06)

---

# Validaciones

## Compilación

- [x] `npm run typecheck` (`tsc --noEmit`) PASSED
- [x] Dependencias Expo SDK 52 / RN 0.76.9 / `expo-av` ~15.0.2 / `expo-font` ~13.0.4
- [x] `npx expo export --platform android` PASSED (962 modules; Press Start 2P + Castillo PNG + `ambient-castle.mp3`)
- [ ] APK Release (`npm run apk`) — este entorno tiene OpenJDK **21** y **no** `ANDROID_HOME`. El contrato exige JDK **17**.

## Arquitectura

- [x] Motor puro separado de UI (`src/engine/*` vs `app/` + `components/`)
- [x] `brick-field` carga `LEVEL_LAYOUTS`; `level-progress` no conoce ladrillos
- [x] `vaus-capsules` no cuenta vidas; el loop consume `extraLife`
- [x] `ambient-audio` no importa el engine
- [x] Sin módulo `boss` en V3
- [x] Rutas reales: `app/index.tsx`, `app/game.tsx`, `app/how-to.tsx`. No existen `lose.tsx` ni `win.tsx`
- [x] Package `com.wika.arkanoid` version `3.0.0`; portrait; minSdk 24

## Funcionalidad (código vs `idea/02`)

- [x] Pala táctil, launch, rebote por zona (smoke: wall / paddle / brick)
- [x] Ladrillos `normal` (1 hit) y `hard` (2 hits)
- [x] 3 vidas; 0 → overlay Game Over
- [x] `LEVEL_COUNT === 33` y `LEVEL_LAYOUTS.length === 33`
- [x] Tutorial 1–6 solo normal; hard desde el 7; nivel 33 todo hard
- [x] Hits no bajan más de 12 respecto del pico (smoke)
- [x] `onLevelCleared(31)` → next 32; `onLevelCleared(32)` → `victory`
- [x] Score 100 / 200; high score `arkanoid:v3:highScore`
- [x] Overlays Level Clear / Game Over / Victory (no `/lose` `/win`)
- [x] Cápsulas L E C S B D P (smoke de cada una + exclusividad L/E/C/S/D)
- [x] Ambiente: `resolveAmbientTheme` / `parseStoredTheme` siempre `castle` + `ambient-castle.mp3`
- [x] HowTo: `33 NIVELES`; HUD: `LV {n}`
- [x] Offline (AsyncStorage; sin red en `app.json`)
- [ ] Feature 15 APK sideload en dispositivo físico
- [ ] Feature 18 SFX beep — deseable, no bloquea V3

## Runtime

- [x] Sin permisos sensibles en `app.json`
- [x] Orientación portrait
- [ ] Ciclo de vida en hardware (sideload sin Metro) — no ejecutado aquí
- [ ] Audio Castillo audible en dispositivo — no ejecutado aquí (el bundle sí empaqueta el MP3)

---

# Evidencia de gates (este entorno)

| Gate | Resultado |
|------|-----------|
| `npm run smoke` | PASSED — classic + 33 levels + cápsulas + castle only; no boss |
| `npm run typecheck` | PASSED |
| `expo export --platform android` | PASSED — 962 modules |
| JDK local | 21 (no cumple JDK 17 del contrato) |
| Android SDK | ausente |
| `npm run apk` | no ejecutado |

---

# Resultado

## REQUIERE CORRECCIONES

La **construcción de código V3 está completa** frente a Features 06/17 y 22–24 (smoke + typecheck + export).  
El **APK Release no fue producido ni validado en dispositivo** (JDK 17 + SDK local), igual que V1.

Esto **no** abre una V4 por sí solo. Cierra Feature 15 y re-ejecuta esta auditoría.

Para cerrar Release en máquina local:

```bash
cd app/arkanoid/iterations/v3
# JDK 17 en PATH
npm install
npm run apk
```

Sideload del APK y validar: LV 1 tutorial, cápsulas, Castillo en loop, overlay Victory al limpiar el 33 (o Break en el último).

---

# Siguiente paso

APK local → re-auditar Release → **APROBADO** → `final/` + visto del arquitecto.
