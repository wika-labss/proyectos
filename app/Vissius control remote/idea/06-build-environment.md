# Entorno de Build

> Proyecto: **Vissius Control Remote** — Mando remoto WiFi para TV con apps de streaming

## Perfil de ejecución target

Marcar el perfil que aplica a esta iteración:

- [ ] **DEV** — Expo Go (`npx expo start` + app Expo Go en dispositivo)
- [x] **BUILD** — Nativo (`prebuild` + APK release en dispositivo físico) — **target v3**
- [ ] **RELEASE** — EAS Build (publicación en stores)

> v3 requiere perfil **BUILD**: APK **release** autónomo + cleartext HTTP LAN.

---

## Entorno de desarrollo requerido

| Herramienta | Versión | Notas |
|-------------|---------|-------|
| Node.js | 20 LTS | Obligatorio |
| npm | 10+ | Incluido con Node |
| Git | 2.x+ | Control de versiones |
| JDK (Gradle) | **17** | **Obligatorio** para BUILD. **No usar JDK 21 ni 26** |
| Android Studio | Latest stable | Obligatorio para BUILD Android |
| Android SDK | API 35 | compileSdk 35, minSdk 24 |
| Dispositivo Android físico | API 24+ | **Obligatorio** — sideload del APK release |

### Configuración Android Studio

- **Gradle JDK:** Java 17 (Eclipse Adoptium o JBR 17 de Android Studio)
- **Proyecto a abrir:** `iterations/v3/android/` (no la raíz Expo)

### Configuración Windows (PowerShell)

```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"
```

---

## Manifiesto de dependencias

> Regla WIKA: todas las dependencias `expo-*` y `react-native-*` se instalan con `npx expo install`, nunca manualmente. Usar prefijo `~` (no `^`).

### Dependencias core (obligatorias — Expo SDK 52 + Expo Router)

| Paquete | Versión | Motivo |
|---------|---------|--------|
| `expo` | `~52.0.0` | Framework base |
| `expo-router` | `~4.0.0` | Navegación file-based + tabs |
| `expo-constants` | `~17.0.0` | Constantes de entorno |
| `expo-linking` | `~7.0.0` | Deep links |
| `expo-status-bar` | `~2.0.0` | Barra de estado |
| `expo-asset` | `~11.0.5` | Iconos, splash, assets |
| `expo-build-properties` | `~0.13.0` | Fijar Kotlin/JDK/SDK en build nativo |
| `react` | `18.3.1` | Core React |
| `react-native` | `0.76.9` | Core RN (versión validada SDK 52) |
| `react-native-safe-area-context` | `4.12.0` | Safe areas |
| `react-native-screens` | `~4.4.0` | Navegación nativa |

### Dependencias del proyecto (Vissius Control Remote)

| Paquete | Versión | Motivo |
|---------|---------|--------|
| `expo-network` | `~7.0.0` | Verificar conexión WiFi antes de emparejar |
| `expo-haptics` | `~14.0.0` | Feedback al pulsar botones del mando |
| `@react-native-async-storage/async-storage` | `1.23.1` | Persistir TV emparejada |
| `zustand` | `5.0.0` | Estado global (conexión TV, emparejamiento) |
| `react-native-tcp-socket` | `6.4.2` | TLS Android TV Remote (6466/6467) |
| `node-forge` | `1.3.1` | Certificados cliente emparejamiento Android TV |
| `protobufjs` | `7.4.0` | Mensajes protocolo Android TV |
| `crypto-js` | `4.2.0` | Hash PIN emparejamiento Android TV |
| `buffer` | `6.0.3` | Polyfill Buffer para protobuf/TLS |

---

## Configuración nativa (app.json)

Obligatorio para perfil BUILD:

```json
{
  "expo": {
    "name": "Vissius Control Remote",
    "slug": "vissius-control-remote",
    "version": "3.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "light",
    "scheme": "vissius-remote",
    "plugins": [
      "expo-router",
      "expo-asset",
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
      "package": "com.wika.vissiuscontrolremote",
      "permissions": [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE",
        "android.permission.ACCESS_WIFI_STATE"
      ]
    }
  }
}
```

> `userInterfaceStyle: light` — paleta fija `#F7B9AD` / `#E83A17`.

### Matriz de compatibilidad Kotlin (Expo SDK 52)

| Kotlin | Compose Compiler | Estado |
|--------|------------------|--------|
| 1.9.24 | 1.5.14 | ✅ Válido |
| 1.9.25 | 1.5.15 | ✅ **Estándar WIKA** |
| Mezclados | — | ❌ **Prohibido** |

En `android/gradle.properties` (post-prebuild via `scripts/post-prebuild.js`):

```properties
android.kotlinVersion=1.9.25
```

---

## Pipeline de build

### Perfil BUILD (APK release) — v3

```bash
npm install
npx expo install --fix
npx expo-doctor
npm run apk          # Linux/macOS
# npm run apk:win    # Windows
```

Pipeline interno (`scripts/build-apk.sh`):

```bash
npx expo prebuild --platform android
node scripts/post-prebuild.js
# android/local.properties ← después de prebuild (ANDROID_HOME)
cd android && ./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

Instalar en teléfono:

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

> El APK **release** lleva el bundle JS embebido (Hermes). Funciona sin PC ni servidor Metro.

### Perfil DEV (opcional — solo desarrollo UI)

```bash
npx expo start
```

Expo Go no es el entregable v1; solo sirve para iterar UI con hot reload.

---

## Gates de verificación (bloqueantes)

Ninguna iteración v3 se considera completa sin pasar:

| Gate | Comando | Resultado esperado |
|------|---------|-------------------|
| Dependencias | `npx expo-doctor` | 0 errores |
| TypeScript | `npx tsc --noEmit` | Exit code 0 |
| Bundle JS | `npx expo export --platform android` | Export OK |
| Prebuild | `npx expo prebuild --platform android` | Genera `android/` sin errores |
| Kotlin | `scripts/post-prebuild.js` | `android.kotlinVersion=1.9.25` |
| APK release | `./gradlew assembleRelease` | BUILD SUCCESSFUL |
| Autonomía | APK instalado, PC apagado | App abre y funciona |
| Paleta UI | Inspección en dispositivo | `#F7B9AD`/`#E83A17`, botones negro/blanco |

---

## Scripts estándar WIKA

Incluir en `iterations/v3/`:

| Script | Propósito |
|--------|-----------|
| `scripts/verify-build.sh` | Ejecuta todos los gates (Linux/macOS) |
| `scripts/verify-build.bat` | Paridad Windows |
| `scripts/build-apk.sh` | Genera APK release (Linux/macOS) |
| `scripts/build-apk.bat` | Genera APK release (Windows) |
| `scripts/post-prebuild.js` | Fija Kotlin 1.9.25 post-prebuild |
| `scripts/reset-android.bat` | Regenera `android/` limpio (Windows) |
| `scripts/local.properties.example` | Plantilla SDK path |

### package.json scripts

```json
{
  "scripts": {
    "verify": "bash scripts/verify-build.sh",
    "verify:win": "scripts\\verify-build.bat",
    "apk": "bash scripts/build-apk.sh",
    "apk:win": "scripts\\build-apk.bat",
    "prebuild:android": "expo prebuild --platform android && node scripts/post-prebuild.js"
  }
}
```

---

## Principios WIKA aplicables

| ID | Principio |
|----|-----------|
| WIKA-ARCH-01 | La documentación es contrato de build |
| WIKA-ARCH-02 | Versiones pinneadas (`~`), nunca flotantes (`^`) |
| WIKA-ARCH-03 | Perfil BUILD explícito en v3 |
| WIKA-ARCH-04 | Toolchain nativo documentado via expo-build-properties |
| WIKA-ARCH-05 | Gates de verificación obligatorios antes de cerrar iteración |
| WIKA-ARCH-06 | APK release autónomo como entregable, no Expo Go |
