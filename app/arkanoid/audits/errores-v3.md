# Catálogo de errores — Arkanoid V3

## Proyecto
Arkanoid

## Alcance
Todos los fallos registrados en el ciclo V3 (2026-09-06): arranque en dispositivo, audio Castillo, build Windows, git, instalación y avisos de Gradle.

## Evaluador
Arquitecto WIKA / Cloud Agent

## Contrato
`idea/` es la fuente de verdad. Este archivo es el RTM operativo de errores.  
IDs `ERR-V3-XX` mapean a Features en `idea/02-features.md`.

## Versión de código al cierre de este acta
`iterations/v3/` **3.0.3** (`versionCode` 4) — rama `cursor/arkanoid-v3-classic-eb2a`.

## Leyenda de estado

| Estado | Significado |
|--------|-------------|
| CERRADO | Corregido en código o script; no debe repetirse en 3.0.3+ |
| MITIGADO | Ya no tumba el camino crítico; el síntoma puede quedar como aviso |
| ABIERTO | Sigue pendiente de evidencia en dispositivo físico |
| AVISO | No es fallo; no bloquea el APK |

---

# 1. Arranque en dispositivo (Feature 01 / 15 / 24)

## ERR-V3-01 — Pantalla negra infinita

| | |
|---|---|
| **Síntoma** | El icono abre y se queda negro. No hay menú. |
| **Causa** | `_layout.tsx` hacía `if (!loaded) return <View negro />`. Si `useFonts` fallaba, `loaded` nunca pasaba a true. |
| **Impacto** | Alto — la app “no arranca”. |
| **Feature** | 01, 09 |
| **Estado** | CERRADO en 3.0.1 (`c2a5121`). 3.0.3 ya no carga fuentes en el layout. |
| **Fix** | No bloquear el árbol en la TTF. Menú con fuente del sistema. |

## ERR-V3-02 — Cierre al abrir (proceso muerto)

| | |
|---|---|
| **Síntoma** | Splash o negro y el proceso muere. A veces ~1 s después de abrir. |
| **Causa** | `expo-av` + `Sound.createAsync(require(mp3), { shouldPlay: true })` con ExoPlayer sobre **4,51 MB / 192 kbps / 188 s**. Pico PCM ≈ 33 MB. `try/catch` JS no cubre OOM/ANR nativo. El barrel `ambient-audio` reexportaba el manager: importar `clampVolume` cargaba `expo-av` en el primer frame. |
| **Impacto** | Alto — Feature 24 tumbaba Feature 01. |
| **Feature** | 24, 01 |
| **Estado** | MITIGADO en 3.0.3. El menú ya no importa `expo-av`. El loop se pide **después de Jugar**. Sideload 3.0.3 **ABIERTO**. |
| **Fix** | Encode runtime 64 kbps / 1,5 MB. MediaPlayer + URI. `ensureStarted()` solo al pulsar Jugar. Barrel sin `audioManager`. `largeHeap`. |
| **Acta** | `audits/auditoria-audio-arranque-v3.md` |

## ERR-V3-03 — SafeArea sin provider

| | |
|---|---|
| **Síntoma** | Insets 0 o crash `RNCSafeAreaProvider` si el nativo no está linkeado. |
| **Causa** | `SafeAreaView` en menú/partida sin `SafeAreaProvider`, o APK generado antes de añadir el módulo. |
| **Impacto** | Medio |
| **Feature** | 09, 11 |
| **Estado** | CERRADO. 3.0.3 no usa `SafeAreaView` en menú / how-to. |

## ERR-V3-04 — APK “nuevo” que sigue siendo 3.0.1

| | |
|---|---|
| **Síntoma** | `BUILD SUCCESSFUL` pero Ajustes muestra 3.0.1. La mejora de audio no va en el binario. |
| **Causa** | `expo prebuild` **sin** `--clean` reutiliza `android/`. `versionName` / `versionCode` se quedan en 3.0.1 / 2. |
| **Impacto** | Alto — se instala un APK viejo creyendo que es el arreglo. |
| **Feature** | 15 |
| **Estado** | CERRADO. `scripts/post-prebuild.js` sella versión desde `app.json`. 3.0.3 = `versionCode` 4. |

## ERR-V3-05 — Sideload no verificado en hardware

| | |
|---|---|
| **Síntoma** | El arquitecto reporta “no arranca” tras instalar. No hay `adb logcat`. |
| **Causa** | Falta evidencia de ciclo de vida en dispositivo (Auditoría 2 / Feature 15). Mezcla de APK 3.0.0–3.0.2 y el mismo package `com.wika.arkanoid` que V1/V2. |
| **Impacto** | Alto — bloquea `final/`. |
| **Feature** | 15 |
| **Estado** | **ABIERTO**. Hay que desinstalar, instalar **3.0.3**, confirmar versión en Ajustes y decir si el menú (ARKANOID / JUGAR) se ve. |
| **Acta** | `audits/auditoria-release-v3.md` |

---

# 2. Audio Castillo (Feature 24)

## ERR-V3-06 — MP3 de catálogo no apto para móvil

| | |
|---|---|
| **Síntoma** | Decode nativo caro al primer `createAsync`. |
| **Causa** | `recursos/audio/arkanoid-ambient-castle.mp3` = 4,51 MB, 192 kbps, stereo 44.1 kHz, 3:08. |
| **Impacto** | Alto en API 24+ de poca RAM. |
| **Feature** | 24 |
| **Estado** | CERRADO en runtime. Catálogo **intact** (pieza original). Runtime `ambient-castle.mp3` = 1,50 MB / 64 kbps. Techo smoke: 2 MB. |

## ERR-V3-07 — `expo-av` en el grafo de arranque

| | |
|---|---|
| **Síntoma** | El proceso muere aunque el menú “aún no tocara play”. |
| **Causa** | `import { audioManager, clampVolume } from '.../ambient-audio'` evalúa `audioManager.ts` → `import { Audio } from 'expo-av'`. Delay de 700–1200 ms solo retrasaba el crash. |
| **Impacto** | Alto |
| **Feature** | 24, 01 |
| **Estado** | CERRADO en 3.0.3. `index.ts` no reexporta el manager. `ensureStarted` es dinámico y solo se llama tras Jugar. |

## ERR-V3-08 — Typecheck `import()` dinámico

| | |
|---|---|
| **Síntoma** | `TS1323: Dynamic imports are only supported when --module is es2020+`. |
| **Causa** | `expo/tsconfig.base` no define `module`; el default no admite `import()`. |
| **Impacto** | Bajo — rompe el gate `npm run typecheck`. |
| **Feature** | 15 |
| **Estado** | CERRADO. `tsconfig.json` → `"module": "esnext"`. |

## ERR-V3-09 — Feature 18 SFX beep

| | |
|---|---|
| **Síntoma** | No hay beep al rebote / ladrillo / vida. |
| **Causa** | Fuera de alcance V3 (deseable). |
| **Impacto** | Bajo |
| **Feature** | 18 |
| **Estado** | ABIERTO (no bloquea V3). |

---

# 3. Build Windows (Feature 15)

## ERR-V3-10 — `npm run apk` en PowerShell

| | |
|---|---|
| **Síntoma** | El script bash no corre en cmd/PowerShell. |
| **Causa** | `apk` = `bash scripts/build-apk.sh`. |
| **Fix** | `npm run apk:win` → `scripts\build-apk.bat`. |
| **Estado** | CERRADO |

## ERR-V3-11 — Prompt `PS C:\...>` pegado como comando

| | |
|---|---|
| **Síntoma** | PowerShell ejecuta `Get-Process` (alias `ps`) o falla el parseo. |
| **Causa** | El prompt no es parte del comando. |
| **Estado** | CERRADO (documentado). Pegar desde `cd` / `$env:` / `npm`. |

## ERR-V3-12 — JDK 21 / 22+ en `JAVA_HOME`

| | |
|---|---|
| **Síntoma** | Gradle de Expo 52 / RN 0.76 falla o avisa incompatibilidad. |
| **Causa** | Contrato WIKA: JDK **17**. |
| **Estado** | CERRADO en script. `apk:win` exige `version "17` y busca `Eclipse Adoptium\jdk-17*`. |

## ERR-V3-13 — `JAVA_HOME` con espacios (`Program Files`)

| | |
|---|---|
| **Síntoma** | El parser viejo partía la ruta; `java.exe` “no existe”. |
| **Causa** | Comillas mal puestas al leer la versión. |
| **Estado** | CERRADO (`81e9592`). `java.exe` entre comillas + archivo temporal. |

## ERR-V3-14 — Expo resuelve `node_modules` del padre

| | |
|---|---|
| **Síntoma** | `Failed to resolve plugin for module "expo-font"`. |
| **Causa** | `npx expo` subía a `C:\Alvaro proyectos\node_modules` en vez de `iterations\v3`. |
| **Estado** | CERRADO (`08f8013`). `apk:win` llama `node_modules\.bin\expo.cmd` local y hace `npm install` en v3 si falta `expo-font`. |

## ERR-V3-15 — `ANDROID_HOME` / `sdk.dir`

| | |
|---|---|
| **Síntoma** | Gradle no encuentra el SDK. |
| **Causa** | Variable vacía o `local.properties` ausente. |
| **Estado** | CERRADO. El `.bat` usa `%LOCALAPPDATA%\Android\Sdk` y escribe `android\local.properties`. Ruta confirmada: `C:\Users\Usuario\AppData\Local\Android\Sdk`. |

## ERR-V3-16 — Aviso `NODE_ENV` en `:expo-constants:createExpoConfig`

| | |
|---|---|
| **Síntoma** | `The NODE_ENV environment variable is required but was not specified.` |
| **Causa** | Gradle llama el config plugin sin `NODE_ENV`. Expo sigue. |
| **Estado** | **AVISO**. No falla el APK. `BUILD SUCCESSFUL` es válido. |

## ERR-V3-17 — Aviso `[CXX5304]` SDK XML v4 vs v3

| | |
|---|---|
| **Síntoma** | `This version only understands SDK XML versions up to 3 but an SDK XML file of version 4 was encountered.` |
| **Causa** | Android Studio y command-line/NDK de fechas distintas. |
| **Estado** | **AVISO**. No bloquea `assembleRelease`. |

---

# 4. Git y carpeta de trabajo

## ERR-V3-18 — `iterations/v3` no está en `main`

| | |
|---|---|
| **Síntoma** | En `main` solo hay `.gitkeep` bajo iterations. |
| **Causa** | V3 vive en `cursor/arkanoid-v3-classic-eb2a`. |
| **Estado** | CERRADO (operativo). `git checkout` + `git pull` de esa rama. |

## ERR-V3-19 — `git checkout` bloqueado por cambios locales

| | |
|---|---|
| **Síntoma** | Checkout rechazado por `iterations/v1/package.json` sucio. |
| **Causa** | Cambios locales sin commit. |
| **Fix** | `git stash` y checkout. |
| **Estado** | CERRADO (operativo). |

## ERR-V3-20 — `git fetch origin` no trae la rama

| | |
|---|---|
| **Síntoma** | La rama V3 no aparece en local. |
| **Causa** | Fetch sin refspec. |
| **Fix** | `git fetch origin cursor/arkanoid-v3-classic-eb2a:cursor/arkanoid-v3-classic-eb2a` o `git pull origin cursor/arkanoid-v3-classic-eb2a`. |
| **Estado** | CERRADO (operativo). |

## ERR-V3-21 — Carpeta equivocada

| | |
|---|---|
| **Síntoma** | Se abre `app\alvaro\iterations` (snake) y no hay V3 de Arkanoid. |
| **Causa** | El juego está en `app\arkanoid\iterations\v3`. |
| **Estado** | CERRADO (operativo). |

---

# 5. Instalación (`adb` / sideload)

## ERR-V3-22 — `adb.exe: no devices/emulators found`

| | |
|---|---|
| **Síntoma** | `adb uninstall` / `adb install` fallan. El daemon arranca en `tcp:5037` pero la lista está vacía. |
| **Causa** | No hay móvil en Depuración USB, o el USB está en “Solo carga”, o no se aceptó el RSA. **No es fallo de Gradle.** El APK ya existe. |
| **Impacto** | Medio — bloquea instalar por cable. |
| **Feature** | 15 |
| **Estado** | MITIGADO. Instalar copiando el APK a Descargas. Doc en `BUILD-APK.md`. |

## ERR-V3-23 — `adb unauthorized`

| | |
|---|---|
| **Síntoma** | `adb devices` muestra `unauthorized`. |
| **Causa** | Falta el diálogo “¿Permitir depuración USB?”. |
| **Estado** | MITIGADO (documentado). Aceptar RSA; `adb kill-server` + `adb devices`. |

## ERR-V3-24 — Mismo package que V1/V2

| | |
|---|---|
| **Síntoma** | Se instala “encima” y corre el binario viejo, o los datos chocan. |
| **Causa** | `applicationId` = `com.wika.arkanoid` en V1, V2 y V3. |
| **Estado** | MITIGADO. Desinstalar siempre antes de un APK nuevo. |

---

# 6. Contrato y deuda (no son crashes de esta sesión)

## ERR-V3-25 — APK &gt; 25 MB

| | |
|---|---|
| **Síntoma** | `idea/01` pide &lt; 25 MB. El Release Expo 52 pesa ~64–68 MB. |
| **Causa** | Runtime RN/Hermes + nativos. El MP3 ya no es el culpable principal (1,5 MB). |
| **Estado** | ABIERTO (contrato V1 vs realidad Expo). No bloquea jugar. |

## ERR-V3-26 — Permiso `RECORD_AUDIO` en el manifiesto

| | |
|---|---|
| **Síntoma** | El APK declara `RECORD_AUDIO` aunque no se graba. |
| **Causa** | Plugin `expo-av` por defecto. `microphonePermission: false` en `app.json` no siempre se aplica si `android/` se reutiliza. |
| **Estado** | ABIERTO (no bloquea arranque). Limpieza nativa pendiente en prebuild limpio. |

## ERR-V3-27 — Typecheck / smoke / export

| | |
|---|---|
| **Síntoma** | Ninguno en 3.0.3. |
| **Estado** | CERRADO. `npm run typecheck` y `npm run smoke` PASSED (33 niveles, cápsulas, política MediaPlayer + gesto). |

---

# Resumen

| ID | Título | Estado |
|----|--------|--------|
| ERR-V3-01 | Pantalla negra (`useFonts`) | CERRADO |
| ERR-V3-02 | Proceso muerto al abrir (expo-av / MP3) | MITIGADO (sideload ABIERTO) |
| ERR-V3-03 | SafeArea | CERRADO |
| ERR-V3-04 | APK sellado 3.0.1 | CERRADO |
| ERR-V3-05 | Sideload 3.0.3 en hardware | **ABIERTO** |
| ERR-V3-06 | MP3 192 kbps | CERRADO (runtime) |
| ERR-V3-07 | expo-av en el primer frame | CERRADO |
| ERR-V3-08 | TS1323 import() | CERRADO |
| ERR-V3-09 | SFX beep | ABIERTO (no bloquea) |
| ERR-V3-10 | `apk` vs `apk:win` | CERRADO |
| ERR-V3-11 | Prompt `PS` pegado | CERRADO |
| ERR-V3-12 | JDK ≠ 17 | CERRADO |
| ERR-V3-13 | JAVA_HOME con espacios | CERRADO |
| ERR-V3-14 | expo-font / Expo del padre | CERRADO |
| ERR-V3-15 | ANDROID_HOME | CERRADO |
| ERR-V3-16 | NODE_ENV | AVISO |
| ERR-V3-17 | CXX5304 | AVISO |
| ERR-V3-18 | v3 no está en main | CERRADO |
| ERR-V3-19 | checkout sucio | CERRADO |
| ERR-V3-20 | fetch sin refspec | CERRADO |
| ERR-V3-21 | carpeta `alvaro` vs `arkanoid` | CERRADO |
| ERR-V3-22 | adb sin dispositivo | MITIGADO |
| ERR-V3-23 | adb unauthorized | MITIGADO |
| ERR-V3-24 | package V1/V2/V3 | MITIGADO |
| ERR-V3-25 | APK &gt; 25 MB | ABIERTO |
| ERR-V3-26 | RECORD_AUDIO | ABIERTO |
| ERR-V3-27 | gates tsc/smoke | CERRADO |

---

# Qué falta para cerrar ERR-V3-05

1. `git pull` + `npm run apk:win` (o el artefacto `arkanoid-v3-3-0-3.apk`).
2. Desinstalar `com.wika.arkanoid`.
3. Instalar el APK (Descargas, sin adb si hace falta).
4. Ajustes → Arkanoid = **3.0.3**.
5. Foto o nota: menú visible (ARKANOID / JUGAR). Si sigue en negro, `adb logcat *:E` y versión de Android.
