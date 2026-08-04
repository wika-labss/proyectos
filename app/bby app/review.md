# Revisión — BBY Light

## Versión evaluada

**v2** — Re-versionado WIKA (`app/bby app/iterations/v2/`)

Parte de v1 mergeada en `main` (PR #9). v2 incorpora ajustes WIKA de templates y re-ejecuta el ciclo de auditorías desde cero.

## Evaluador

Arquitecto WIKA / Cloud Agent

## Fecha

2026-08-04

---

## Historial de iteraciones

| Iteración | Estado | Notas |
|-----------|--------|-------|
| v1 | Cerrada (mergeada) | 20 fixes en 3 auditorías — ver sección histórica al final |
| **v2** | **En curso** | Generación ✅ · Auditoría 1 ✅ · Auditoría 2 ✅ |

---

## Generación de código (v2) — `05-prompt-ia.md`

Ciclo WIKA: **generar código → auditorías**. La iteración v2 se implementó siguiendo el orden de `05-prompt-ia.md`:

| Paso | Entregable | Estado |
|------|------------|--------|
| 1 | Config (`package.json`, `app.json`, `tsconfig.json`) | ✅ |
| 2 | `src/constants/theme.ts` | ✅ tokens góticos según `04-design.md` |
| 3 | `src/types/index.ts` | ✅ TorchMode, SosStep, TorchController |
| 4 | `src/engine/sosPattern.ts` + `intensityController.ts` | ✅ |
| 5 | `src/stores/torchStore.ts` | ✅ |
| 6 | Hooks (`useTorch`, `useSosPattern`, `useFlashAvailability`, `TorchProvider`) | ✅ |
| 7 | `src/utils/storage.ts` | ✅ debounce vía `useTorch` |
| 8 | Componentes UI góticos (5) | ✅ |
| 9 | `app/index.tsx` + `app/_layout.tsx` | ✅ pantalla única |
| 10 | `npx expo install --fix` + `npx expo-doctor` | ✅ 18/18 |
| 11 | Prebuild + gates de build | ✅ (Gradle release pendiente en cloud) |

**Restricciones cumplidas en generación:**

- UI solo usa `useTorch` (no `setMode` ni `TorchController` en pantallas)
- Sin `CameraView.isAvailableAsync()`
- Gate de carga con `try/catch/finally`
- PWM con `MIN_PULSE_MS = 4`, duty 20–80%
- Slider con `pointerEvents="none"` en fill/thumb
- Cleanup torch en `AppState` background + unmount

---

## Auditoría 1 — Compilación y arquitectura (v2)

### Resumen

v2 se generó copiando el código corregido de v1 y alineando la documentación WIKA al target v2. La auditoría 1 **no encontró regresiones** en los 7 puntos originales ni en los gates WIKA ampliados.

| Gate | Comando | Resultado v2 |
|------|---------|--------------|
| Manifiesto deps | vs `06-build-environment.md` | ✅ completo, sin `^` en expo/rn |
| Dependencias | `npx expo-doctor` | ✅ 18/18 |
| TypeScript | `npx tsc --noEmit` | ✅ exit 0 |
| Bundle JS | `npx expo export --platform android` | ✅ 933 módulos, 2.53 MB |
| Prebuild | `npx expo prebuild --platform android` | ✅ sin errores |
| Manifest | Sin `RECORD_AUDIO` | ✅ ausente |
| Kotlin | `post-prebuild.js` | ✅ 1.9.25 en gradle.properties |
| Assets PNG | `assets/*.png` | ✅ PNG válidos 1024×1024 / 1284×2778 |
| APK release | `./gradlew assembleRelease` | ⚠️ pendiente (sin SDK/JDK 17 en cloud) |

---

### Checklist auditoría 1 (7 puntos originales)

| # | Punto | v2 | Evidencia |
|---|-------|----|-----------|
| 1 | PWM: `setTorchState` interno vs `setTorch` público | ✅ | `TorchProvider.tsx` L21–46, `intensityController.ts` usa `setTorchState` |
| 2 | Sin permiso `RECORD_AUDIO` | ✅ | `app.json` → `recordAudioAndroid: false`; manifest sin RECORD_AUDIO |
| 3 | `cameraReady = permiso && isFlashAvailable` | ✅ | `useFlashAvailability.ts` L71–72 |
| 4 | `local.properties` **después** de prebuild | ✅ | `verify-build.sh` L35–51, `build-apk.sh` |
| 5 | Assets PNG válidos | ✅ | PNG RGB 8-bit verificados con `file` |
| 6 | `expo-env.d.ts` + tsconfig paths | ✅ | presentes |
| 7 | Scripts auxiliares de build | ✅ | `reset-android.bat`, `local.properties.example`, **nuevo** `verify-build.bat` |

**Resultado auditoría 1:** ✅ **APROBADA**

---

## Auditoría 2 — Motores y hooks (v2)

### Resumen

Auditoría ejecutada **después de la generación de código**, según ciclo WIKA. Se revisaron motores puros (`engine/`), hooks de control y acoplamiento UI ↔ hardware.

| Gate | Resultado v2 |
|------|--------------|
| Patrón SOS Morse completo | ✅ (fix aplicado — ver #8) |
| API única `useTorch` | ✅ |
| Intensidad 0 coherente | ✅ |
| Reset mode en fallback | ✅ |
| Sin código muerto | ✅ |
| Slider habilitado en OFF | ✅ |
| Timers con cleanup | ✅ |
| Debounce AsyncStorage | ✅ |

---

### Checklist auditoría 2 (6 puntos)

| # | Severidad | Error potencial | v2 | Fix / evidencia |
|---|-----------|-----------------|----|-----------------|
| 8 | 🟠 Alto | SOS sin pausa inter-letra (600 ms) o pausa entre ciclos incorrecta | ✅ fix | `CYCLE_PAUSE` corregido de 1000 → **1200 ms** (`02-features.md`); gaps inter-letra `INTER_LETTER_GAP_MS = 400` ya presentes → ciclo **6800 ms**, 21 pasos |
| 9 | 🟠 Alto | Control fragmentado (`setMode` / `TorchController` desde UI) | ✅ | `app/index.tsx` solo usa `useTorch`; `setMode` restringido a hooks internos |
| 10 | 🟡 Medio | `turnOn` con intensidad 0 → estado incoherente | ✅ | `MIN_ON_INTENSITY = 25` en `useTorch.ts` L11–72 |
| 11 | 🟡 Medio | `markCameraUnavailable` no resetea `mode` | ✅ | `useFlashAvailability.ts` L66–68 + `TorchProvider.onMountError` apaga torch |
| 12 | 🟢 Bajo | Código muerto (`getSosCycleDurationMs`, `isTorchMounted`, etc.) | ✅ | Ausente en v2 |
| 13 | 🟢 Bajo | Slider deshabilitado en OFF | ✅ | `disabled={mode === 'sos'}` en `index.tsx` L81 |

**Resultado auditoría 2:** ✅ **APROBADA** — continuar con auditoría 3 (runtime/build real).

---

### Fix aplicado en auditoría 2

| Archivo | Cambio |
|---------|--------|
| `src/engine/sosPattern.ts` | `CYCLE_PAUSE`: 1000 → 1200 ms (alineado con `02-features.md`) |
| `idea/02-features.md` | Ciclo documentado: 6600 → 6800 ms; referencias v1 → v2 |

---

| # | Mejora | Motivo | Archivo(s) |
|---|--------|--------|------------|
| M1 | Gate `expo export` en pipeline de verificación | WIKA: `tsc` no detecta imports rotos en runtime | `scripts/verify-build.sh`, `verify-build.bat` |
| M2 | Script `verify-build.bat` para Windows | Paridad con template WIKA (Sodoku v2) | `scripts/verify-build.bat`, `package.json` → `verify:win` |
| M3 | `verify-build` target `assembleRelease` (no debug) | Entregable v2 es APK autónomo, no Metro | `scripts/verify-build.sh` |
| M4 | Docs WIKA apuntan a `iterations/v2/` | Re-versionado formal | `idea/03-architecture.md`, `05-prompt-ia.md`, `06-build-environment.md` |
| M5 | Versión app `2.0.0` | Coherencia semver iteración | `package.json`, `app.json` |

### Mejoras WIKA aplicadas en v2 (no presentes en v1)

### Pendiente post-auditoría 2

1. Ejecutar **Auditoría 3** — runtime/build real (dispositivo físico, APK release)
2. `./gradlew assembleRelease` en máquina con JDK 17 + Android SDK

---

- [x] Encender / apagar linterna
- [x] Control de intensidad PWM software
- [x] Modo SOS Morse con gaps inter-letra
- [x] Indicador de estado OFF / ON / SOS
- [x] Detección hardware + fallback + Reintentar
- [x] Persistencia intensidad (debounce 400 ms)
- [ ] Verificado end-to-end en dispositivo físico

---

## Calidad (v2)

- [x] TypeScript strict — exit 0
- [x] API única `useTorch`
- [x] Dependencias pinneadas WIKA
- [x] Cleanup timers PWM al desmontar
- [x] Gates WIKA ampliados (export + verify:win)

---

## Build y dependencias (v2)

- [x] `npx expo-doctor` → 18/18
- [x] `npx tsc --noEmit` → exit 0
- [x] `npx expo export --platform android` → OK
- [x] `expo-build-properties` + Kotlin 1.9.25
- [x] Scripts: verify, verify:win, apk, apk:win
- [ ] `./gradlew assembleRelease` → BUILD SUCCESSFUL
- [ ] App en dispositivo físico

---

## Veredicto v2

- [ ] Aprobado — generar versión final en `final/`
- [x] **Auditoría 2 aprobada — continuar auditoría 3**

---

## Acciones requeridas

1. Ejecutar auditoría 3 (runtime + build real en dispositivo)
2. Compilar APK release en Windows con JDK 17:
   ```powershell
   npm run apk:win
   adb install -r android\app\build\outputs\apk\release\app-release.apk
   ```

---

## Histórico v1 (referencia)

La iteración v1 pasó por 3 auditorías con **20 defectos corregidos**. Resumen:

| Auditoría | Errores | Destacados |
|-----------|---------|------------|
| 1 — Compilación | #1–#7 | PWM roto, RECORD_AUDIO, prebuild borraba android/ |
| 2 — Motores/hooks | #8–#13 | SOS gaps, API fragmentada, slider OFF bloqueado |
| 3 — Runtime/build | #14–#20 | Slider saltaba a 0%, spinner infinito (`isAvailableAsync`) |

Detalle completo en commits `9d7a6fd` → `997b02c` (PRs #7–#9).

---

## Lecciones WIKA (acumuladas v1 + v2)

| Lección | Detalle |
|---------|---------|
| No usar `isAvailableAsync` en Android | `@platform web` — cuelga el gate de carga |
| Separar `setTorchState` de `setTorch` | Evita reiniciar PWM en cada tick |
| `local.properties` después de prebuild | Prebuild borra android/ malformado |
| APK debug ≠ entregable | Target `assembleRelease` |
| Gate `expo export` obligatorio | Detecta imports rotos que `tsc` no ve |
| Validar JDK 17 en scripts Windows | PATH del usuario puede tener Java 21/26 |
| `verify-build.bat` en proyectos BUILD | Paridad Windows/Linux en gates WIKA |
