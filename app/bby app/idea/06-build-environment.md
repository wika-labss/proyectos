# Entorno de Build

> Proyecto: **bby app** — Linterna gótica Android

## Perfil de ejecución target

Marcar el perfil que aplica a esta iteración:

- [ ] **DEV** — Expo Go (`npx expo start` + app Expo Go en dispositivo)
- [x] **BUILD** — Nativo (`prebuild` + APK/IPA en dispositivo físico o emulador) — **target v1**
- [ ] **RELEASE** — EAS Build (publicación en stores)

> v1 requiere BUILD: el control del flash LED debe probarse en dispositivo Android físico con APK nativo.

---

## Entorno de desarrollo requerido

| Herramienta | Versión | Notas |
|-------------|---------|-------|
| Node.js | 20 LTS | Obligatorio |
| npm | 10+ | Incluido con Node |
| Git | 2.x+ | Control de versiones |
| JDK (Gradle) | **17** | Obligatorio para BUILD. **No usar JDK 21 ni 26** |
| Android Studio | Latest stable | Obligatorio para BUILD Android |
| Android SDK | API 35 | compileSdk 35, minSdk 24 |
| Dispositivo Android físico | API 24+ | **Obligatorio** — emulador no tiene flash LED real |

### Configuración Android Studio

- **Gradle JDK:** Java 17 (Eclipse Adoptium o JBR 17)
- **Proyecto a abrir:** `iterations/v1/android/` (no la raíz Expo)

---

## Manifiesto de dependencias

> Regla WIKA: todas las dependencias `expo-*` y `react-native-*` se instalan con `npx expo install`, nunca manualmente. Usar prefijo `~` (no `^`).

### Dependencias core (obligatorias — Expo SDK 52 + Expo Router)

| Paquete | Versión | Motivo |
|---------|---------|--------|
| `expo` | `~52.0.0` | Framework base |
| `expo-router` | `~4.0.0` | Navegación file-based |
| `expo-constants` | `~17.0.0` | Constantes de entorno |
| `expo-linking` | `~7.0.0` | Deep links |
| `expo-status-bar` | `~2.0.0` | Barra de estado |
| `expo-asset` | `~11.0.5` | Iconos, splash, assets |
| `expo-build-properties` | `~0.13.0` | Fijar Kotlin/JDK/SDK en build nativo |
| `react` | `18.3.1` | Core React |
| `react-native` | `0.76.9` | Core RN (versión validada SDK 52) |
| `react-native-safe-area-context` | `4.12.0` | Safe areas |
| `react-native-screens` | `~4.4.0` | Navegación nativa |

### Dependencias del proyecto (bby app)

| Paquete | Versión | Motivo |
|---------|---------|--------|
| `expo-camera` | `~16.0.0` | Control del flash LED (torch mode) |
| `expo-keep-awake` | `~14.0.0` | Mantener pantalla activa con linterna encendida |
| `expo-haptics` | `~14.0.0` | Feedback vibratorio al encender/apagar/SOS |
| `expo-system-ui` | `~4.0.9` | Requerido para que `userInterfaceStyle: dark` se aplique |
| `@react-native-async-storage/async-storage` | `1.23.1` | Persistir intensidad y preferencias |
| `zustand` | `5.0.0` | Estado global (mode, intensity) |

---

## Configuración nativa (app.json)

Obligatorio para perfil BUILD:

```json
{
  "expo": {
    "name": "BBY Light",
    "slug": "bby-light",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "dark",
    "plugins": [
      "expo-router",
      "expo-asset",
      [
        "expo-camera",
        {
          "cameraPermission": "Permite a BBY Light controlar el flash de tu teléfono.",
          "recordAudioAndroid": false
        }
      ],
      [
        "expo-build-properties",
        {
          "android": {
            "kotlinVersion": "1.9.25",
            "compileSdkVersion": 35,
            "targetSdkVersion": 34,
            "minSdkVersion": 24
          }
        }
      ]
    ],
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#0A0A0F"
      },
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.FLASHLIGHT"
      ],
      "package": "com.wika.bbylight"
    }
  }
}
```

### Matriz de compatibilidad Kotlin (Expo SDK 52)

| Kotlin | Compose Compiler | Estado |
|--------|------------------|--------|
| 1.9.24 | 1.5.14 | ✅ Válido |
| 1.9.25 | 1.5.15 | ✅ **Estándar WIKA** |
| Mezclados | — | ❌ **Prohibido** |

> Fijar siempre via `expo-build-properties`. No editar manualmente salvo emergencia.

En `android/gradle.properties` (post-prebuild):

```properties
android.kotlinVersion=1.9.25
```

---

## Pipeline de build

### Perfil BUILD (APK local) — target v1

Configurar el SDK **antes** de empezar:

```bash
export ANDROID_HOME="$HOME/Android/Sdk"   # o copiar scripts/local.properties.example
export JAVA_HOME=/ruta/al/jdk-17          # WIKA exige JDK 17
```

Pipeline completo (equivale a `npm run verify`):

```bash
cd "app/bby app/iterations/v1"
npm install
npx expo install --fix
npx expo-doctor
npx expo prebuild --platform android
node scripts/post-prebuild.js
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

> **Orden obligatorio:** `local.properties` se escribe **después** de `expo prebuild`.
> Si el directorio `android/` solo contiene `local.properties`, prebuild lo considera un
> proyecto malformado, lo borra y Gradle falla con `SDK location not found`.

### APK autónomo (entregable v1)

El APK **debug** no sirve como entregable: carga el bundle JS desde el servidor Metro, así que
sin `npx expo start` en la misma red la app muestra pantalla roja. El entregable es el APK
**release**, que lleva el bundle Hermes embebido y arranca sin PC.

| Variante | Bundle JS | Necesita Metro | Uso |
|----------|-----------|----------------|-----|
| `assembleDebug` | Remoto | Sí | Desarrollo con hot reload |
| `assembleRelease` | Embebido en el APK | **No** | **Entregable: instalar y usar en el teléfono** |

```bash
npm run apk        # Linux/macOS/Git Bash
npm run apk:win    # Windows (CMD/PowerShell)
```

El script encadena prebuild, `post-prebuild.js`, escritura de `local.properties` y
`gradlew assembleRelease`. Resultado:

```text
android/app/build/outputs/apk/release/app-release.apk
```

Instalar en el dispositivo:

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

O copiar el `.apk` al teléfono y abrirlo con **Instalar apps desconocidas** habilitado.

### Firma

`expo prebuild` genera `android/app/debug.keystore` y el buildType `release` lo reutiliza. Eso
basta para instalar por sideload, pero **no sirve para publicar en Play Store**: allí hace falta
un keystore propio y un `signingConfig` dedicado. Fuera de alcance en v1 (perfil RELEASE/EAS).

### Nota sobre `package.json`

`expo prebuild` reescribe la sección `scripts` y reinserta `"ios": "expo run:ios"` aunque
solo se prebuilde Android. El script se mantiene en el repo para que el árbol de git quede
limpio tras cada build; **el target de v1 sigue siendo Android únicamente**.

### Perfil DEV (Expo Go) — referencia

```bash
npm install
npx expo install --fix
npx expo-doctor
npx expo start
```

> Nota: el torch puede no funcionar correctamente en Expo Go. Usar BUILD para validación real.

---

## Gates de verificación (bloqueantes)

Ninguna iteración se considera completa sin pasar:

| Gate | Comando | Resultado esperado |
|------|---------|-------------------|
| Toolchain | `java -version` | JDK 17 |
| Dependencias | `npx expo-doctor` | 0 errores |
| TypeScript | `npx tsc --noEmit` | Exit code 0 |
| Bundle JS | `npx expo export --platform android` | Empaqueta sin errores de import |
| Prebuild | `npx expo prebuild --platform android` | Genera `android/` sin errores |
| SDK | `android/local.properties` o `ANDROID_HOME` | Ruta válida al SDK |
| APK release | `cd android && ./gradlew assembleRelease` | BUILD SUCCESSFUL |
| Autonomía | Instalar el APK release con el PC apagado | La app arranca sin Metro |
| Prueba física | Usar la app en dispositivo Android | Flash enciende/apaga, SOS parpadea |

> `npx expo export` se añade como gate porque `tsc` no detecta imports rotos en tiempo de
> ejecución; el bundle sí.

---

## Scripts estándar WIKA

Incluir en cada iteración:

| Script | Propósito |
|--------|-----------|
| `scripts/verify-build.sh` | Ejecuta todos los gates en orden (`npm run verify`) |
| `scripts/build-apk.sh` | Genera el APK release autónomo (`npm run apk`) |
| `scripts/build-apk.bat` | Igual, para Windows (`npm run apk:win`) |
| `scripts/post-prebuild.js` | Fija Kotlin 1.9.25 tras cada prebuild |
| `scripts/reset-android.bat` | Regenera `android/` limpio (Windows) |
| `scripts/local.properties.example` | Plantilla de ruta del SDK |

---

## Principios WIKA aplicables

| ID | Principio |
|----|-----------|
| WIKA-ARCH-01 | La documentación es contrato de build |
| WIKA-ARCH-02 | Versiones pinneadas (`~`), nunca flotantes (`^`) en expo/react-native |
| WIKA-ARCH-03 | Perfil DEV vs BUILD explícito en cada iteración |
| WIKA-ARCH-04 | Toolchain nativo documentado y fijado via expo-build-properties |
| WIKA-ARCH-05 | Gates de verificación obligatorios antes de cerrar iteración |
| WIKA-ARCH-06 | Preferir starter WIKA validado sobre generación de infra desde cero |
