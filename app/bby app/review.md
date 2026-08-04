# Revisión — BBY Light v1

## Versión evaluada

**v1** — Primera iteración (`app/bby app/iterations/v1/`)

## Evaluador

Arquitecto WIKA / Cloud Agent

## Fecha

2026-08-04

---

## Diagnóstico general

La iteración v1 implementa la linterna gótica Android con flash, control de intensidad (PWM software), modo SOS Morse y UI según `04-design.md`. Tras **tres auditorías** (compilación, motores/hooks, runtime/build real) se identificaron **20 defectos** — 17 de código/infraestructura y 3 de entorno del desarrollador — todos documentados y corregidos en la rama `cursor/bby-app-v1-2c88` (PR #9).

**Estado actual:**

| Gate | Resultado |
|------|-----------|
| `npx tsc --noEmit` | ✅ exit 0 |
| `npx expo-doctor` | ✅ 18/18 |
| `npx expo prebuild --platform android` | ✅ (sin `RECORD_AUDIO`, Kotlin 1.9.25) |
| `npx expo export --platform android` | ✅ (933 módulos) |
| `./gradlew assembleRelease` | ⚠️ no verificado en cloud (sin Android SDK/JDK 17) |
| App en dispositivo físico | ⚠️ pendiente reinstalar APK release post-fix spinner |

**Causa raíz de los fallos más graves:** mezcla de supuestos incorrectos sobre APIs de `expo-camera` en Android, PWM mal acoplado al control del torch, y pipeline de build documentado para debug/Metro en lugar de APK release autónomo.

---

## Informe de errores y fixes (pre-v1)

### Auditoría 1 — Compilación y arquitectura

| # | Severidad | Error | Fix aplicado | Archivo(s) |
|---|-----------|-------|--------------|------------|
| 1 | 🔴 Crítico | PWM roto: cada tick de intensidad llamaba `setTorch()` que invocaba `stop()` y reiniciaba el ciclo | Separar `setTorchState` (interno, sin side-effects) de `setTorch` (público, detiene PWM antes de cambiar estado) | `TorchProvider.tsx`, `intensityController.ts` |
| 2 | 🟠 Alto | Permiso `RECORD_AUDIO` innecesario en el manifest Android | `recordAudioAndroid: false` en plugin `expo-camera` | `app.json` |
| 3 | 🟠 Alto | `cameraReady` dependía solo del permiso → montaba `CameraView` en dispositivos sin flash | `cameraReady = permissionGranted && isFlashAvailable` | `useFlashAvailability.ts` |
| 4 | 🟠 Alto | `local.properties` escrito antes de `prebuild` → prebuild borraba `android/` | Gate SDK movido **después** de prebuild en script de verificación | `scripts/verify-build.sh` |
| 5 | 🟡 Medio | Assets PNG inválidos bloqueaban prebuild | PNG generados válidos con Pillow | `assets/*.png` |
| 6 | 🟡 Medio | Faltaba `expo-env.d.ts` y paths en tsconfig | Añadidos según estándar Expo SDK 52 | `tsconfig.json` |
| 7 | 🟡 Medio | Faltaban scripts auxiliares de build Windows | Creados `reset-android.bat`, `local.properties.example` | `scripts/` |

**Commit:** `9d7a6fd` — Corregir inconsistencias arquitectónicas bby app v1  
**Commit:** `8e9d199` — Reparar pipeline de build y control de intensidad en bby app v1

---

### Auditoría 2 — Motores y hooks

| # | Severidad | Error | Fix aplicado | Archivo(s) |
|---|-----------|-------|--------------|------------|
| 8 | 🟠 Alto | SOS sin pausas inter-letra Morse (600 ms entre S→O→S) | `INTER_LETTER_GAP_MS = 400` añadido entre grupos (400 ms + 200 ms OFF final = 600 ms) | `sosPattern.ts` |
| 9 | 🟠 Alto | Control fragmentado: `setMode` directo desde UI, tres capas sin API única | `useTorch.enterSos / exitSos / shutdown` como API pública única | `useTorch.ts`, `index.tsx` |
| 10 | 🟡 Medio | `turnOn` con intensidad 0 dejaba estado incoherente (modo ON sin luz) | Bloqueado: slider a 0 apaga; botón principal eleva a 25% mínimo visible | `useTorch.ts` |
| 11 | 🟡 Medio | `markCameraUnavailable` no reseteaba `mode` → UI mostraba ON con flash caído | `setMode('off')` + apaga torch en `onMountError` | `useFlashAvailability.ts`, `TorchProvider.tsx` |
| 12 | 🟢 Bajo | Código muerto (`getSosCycleDurationMs`, `isTorchMounted`, `turnOff` PWM duplicado) | Eliminado | varios |
| 13 | 🟢 Bajo | Slider deshabilitado en modo OFF (no se podía preajustar intensidad) | Solo deshabilitado en modo SOS | `index.tsx` |

**Commit:** `e996c5b` — Unificar motores y hooks de linterna bby app v1  
**Commit:** `d56121f` — Actualizar documentación WIKA de bby app tras auditoria

---

### Auditoría 3 — Runtime y build real

| # | Severidad | Error | Fix aplicado | Archivo(s) |
|---|-----------|-------|--------------|------------|
| 14 | 🔴 Crítico | Slider: `fill` y `thumb` capturaban toques → salto a 0% y apagado involuntario | `pointerEvents="none"` en fill y thumb | `IntensitySlider.tsx` |
| 15 | 🟡 Medio | `AsyncStorage.write` en cada evento de arrastre del slider | Debounce 400 ms + flush en `shutdown` | `useTorch.ts` |
| 16 | 🟡 Medio | PWM con pulsos de 1 ms imposibles en React Native | Clamp `MIN_PULSE_MS = 4`; duty efectivo 20–80% | `intensityController.ts` |
| 17 | 🟡 Medio | Timer PWM huérfano al desmontar `TorchProvider` | Cleanup en `useEffect` (`instance.stop()`) | `TorchProvider.tsx` |
| 18 | 🔴 Crítico | APK debug requiere Metro → inútil en teléfono sin PC | Pipeline `assembleRelease` + scripts `build-apk.sh/.bat` | `scripts/` |
| 19 | 🟠 Alto | `build-apk.bat` no validaba versión de JDK | Valida `Java major === 17` antes de Gradle | `scripts/build-apk.bat` |
| 20 | 🔴 Crítico | **`CameraView.isAvailableAsync()` cuelga la app** — API `@platform web`, lanza `UnavailabilityError` en Android; `checking` queda `true` forever → spinner infinito | Eliminada la llamada; try/catch/finally garantiza salida del gate; asume flash con permiso concedido; degrada vía `onMountError` | `useFlashAvailability.ts` |

**Commit:** `52f398e` — Entregar APK release autonomo en bby app v1  
**Commit:** `f34e1c6` — Validar JDK 17 en build-apk.bat  
**Commit:** `997b02c` — Arreglar cuelgue en la pantalla de carga de bby app v1

---

### Problemas de entorno (no código — acción del desarrollador)

| # | Problema | Impacto | Solución |
|---|----------|---------|----------|
| E1 | Java 26 en PATH global | Gradle falla al compilar | Instalar JDK 17 (Temurin via `winget install EclipseAdoptium.Temurin.17.JDK`) |
| E2 | JBR de Android Studio es Java 21 | Script `.bat` rechaza major ≠ 17 | Usar JDK 17 explícito, no el JBR embebido |
| E3 | `ANDROID_HOME` y `adb` no en PATH | Build e instalación manual fallan | Setear por sesión antes de compilar |
| E4 | Copia local anterior a PR #8 | Faltaba script `apk:win` | Re-copiar desde rama actualizada |
| E5 | Copia local pre-fix spinner (#20) | App se queda cargando | Re-copiar, recompilar e reinstalar APK release |

**Comandos Windows (sesión de build):**

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"
cd "C:\dev\linterna bby-app"
npm install && npm run apk:win
adb install -r android\app\build\outputs\apk\release\app-release.apk
```

---

### Qué NO causó los fallos

- ❌ Versión de Android del teléfono de prueba
- ❌ Diseño gótico / paleta de colores
- ❌ Lógica Morse del patrón SOS (solo faltaban gaps inter-letra)
- ❌ Estructura TypeScript general (compila con `tsc` desde el inicio)

---

## Funcionalidad

- [x] Encender / apagar linterna (botón principal + toggle)
- [x] Control de intensidad 0–100% con PWM software
- [x] Modo SOS Morse `··· ——— ···` con pausas inter-letra correctas
- [x] Indicador de estado (OFF / ON / SOS)
- [x] Detección de hardware (permiso → asume flash; degrada con `onMountError`; pantalla fallback + Reintentar)
- [x] Persistencia de intensidad (debounce 400 ms)
- [x] Pantalla siempre encendida mientras torch/SOS activo
- [x] Feedback háptico
- [ ] **Verificado end-to-end en dispositivo físico** — bloqueado hasta reinstalar APK post-fix #20

**Observaciones:** Toda la lógica está implementada y los gates JS/Expo pasan. Falta confirmación en hardware real tras reinstalar el APK release.

---

## Calidad

- [x] Código modular (engine, stores, hooks, components)
- [x] TypeScript strict — `tsc --noEmit` exit 0
- [x] API única `useTorch` (enterSos, exitSos, shutdown, toggle, updateIntensity)
- [x] Sin código muerto post-auditoría 2
- [x] Dependencias pinneadas según manifiesto WIKA (`06-build-environment.md`)
- [x] Cleanup de timers PWM al desmontar
- [ ] Cobertura de tests automatizados — fuera de alcance v1

**Observaciones:** Calidad de código aceptable tras las tres auditorías. El PWM software tiene límites documentados (duty 20–80%).

---

## Diseño

- [x] Paleta gótica negro / morado / rojo implementada
- [x] Botones blancos con tipografía y espaciado según `04-design.md`
- [x] Fondo gótico (`GothicBackground`)
- [x] Slider, botón torch circular, botón SOS, indicador de estado
- [x] Pantalla de fallback cuando flash no disponible
- [ ] Validado en dispositivo real

**Observaciones:** UI implementada según spec. Pendiente validación visual en pantalla del teléfono.

---

## Build y dependencias (WIKA — obligatorio)

- [x] `npx expo-doctor` → 18/18 checks
- [x] `npx tsc --noEmit` → exit 0
- [x] Manifiesto de `06-build-environment.md` completo en `package.json`
- [x] `expo-asset` presente
- [x] `expo-build-properties` presente con Kotlin 1.9.25
- [x] Kotlin 1.9.25 fijado via plugin
- [x] Scripts validan JDK 17 (`.bat`) / advierten Java >17 (`.sh`)
- [x] Perfil RELEASE: `assembleRelease` con bundle JS embebido

### Build nativo

- [x] `npx expo prebuild --platform android` exitoso
- [ ] `./gradlew assembleRelease` → BUILD SUCCESSFUL (pendiente en máquina con SDK + JDK 17)
- [ ] App corre en dispositivo físico (pendiente reinstalar APK)

**Observaciones:** Pipeline release documentado en `scripts/build-apk.sh` y `scripts/build-apk.bat`. El cloud agent no dispone de Android SDK para verificar Gradle.

---

## Cumplimiento de requerimientos

| Requerimiento | Estado |
|---------------|--------|
| Solo Android | ✅ |
| Flash LED como linterna | ✅ (código) |
| Modo SOS Morse estándar | ✅ |
| Control de intensidad | ✅ (PWM software, límites documentados) |
| Diseño gótico | ✅ |
| Offline, sin backend | ✅ |
| APK autónomo en dispositivo | ⚠️ pipeline listo, pendiente build local |

---

## Veredicto

- [ ] Aprobado — generar versión final en `final/`
- [x] **Requiere validación en dispositivo — fixes aplicados, pendiente gate físico**

La v1 está **técnicamente completa** tras 20 fixes documentados. No se promueve a `final/` hasta confirmar en teléfono: encendido/apagado, SOS audible/visible, slider sin saltos, y pantalla fallback con Reintentar.

---

## Acciones requeridas antes de `final/`

1. **Re-copiar** el proyecto desde la rama `cursor/bby-app-v1-2c88` (incluye fix spinner #20)
2. **Configurar entorno:** JDK 17, `ANDROID_HOME`, `adb` en PATH
3. **Compilar APK release:** `npm run apk:win` (Windows) o `npm run apk` (Linux/macOS)
4. **Instalar y probar** en dispositivo físico:
   - Torch ON/OFF con botón principal
   - Slider de intensidad (sin saltos a 0%)
   - Modo SOS (patrón ··· ——— ··· reconocible)
   - Background → torch se apaga (`shutdown`)
   - Dispositivo sin flash → pantalla fallback + Reintentar
5. **Mergear PR #9** a `main` una vez validado en dispositivo
6. **Promover a `final/`** solo tras gate físico exitoso

---

## PRs relacionados

| PR | Estado | Contenido |
|----|--------|-----------|
| #6 | MERGED | Documentación WIKA inicial |
| #7 | MERGED | v1 completa + auditorías 1–2 |
| #8 | MERGED | APK release autónomo (`build-apk.sh/.bat`) |
| #9 | OPEN | Fix spinner infinito (#20) + validación JDK 17 (#19) |

---

## Lecciones WIKA (para futuros proyectos)

| Lección | Detalle |
|---------|---------|
| No usar `isAvailableAsync` en Android | Es `@platform web`; en Android lanza error y puede colgar el gate de carga |
| Separar estado interno de API pública en PWM | `setTorchState` vs `setTorch` evita reinicios del ciclo |
| `local.properties` después de prebuild | Prebuild borra `android/` si solo contiene ese archivo |
| APK debug ≠ APK usable | Target `assembleRelease` para dispositivos sin Metro |
| Validar JDK en scripts Windows | El PATH del usuario puede tener Java 21/26 incompatible con Gradle Expo |
| Documentar límites de PWM | Timers RN no confiables < 4 ms; duty saturado 20–80% |
