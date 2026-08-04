# Entorno de Build

> Proyecto: **Vissius Control Remote** — Control remoto LAN para dispositivos Vissius

## Perfil de ejecución target

Marcar el perfil que aplica a esta iteración:

- [x] **DEV** — Expo Go (`npx expo start` + app Expo Go en dispositivo) — **target v1**
- [ ] **BUILD** — Nativo (`prebuild` + APK/IPA en dispositivo físico o emulador) — target v2
- [ ] **RELEASE** — EAS Build (publicación en stores)

> v1 usa perfil **DEV** con mock API. v2 migrará a BUILD para APK en dispositivo físico en red LAN.

---

## Entorno de desarrollo requerido

| Herramienta | Versión | Notas |
|-------------|---------|-------|
| Node.js | 20 LTS | Obligatorio |
| npm | 10+ | Incluido con Node |
| Git | 2.x+ | Control de versiones |
| JDK (Gradle) | **17** | Solo si perfil BUILD (v2+) |
| Android Studio | Latest stable | Solo si perfil BUILD Android |
| Android SDK | API 35 | compileSdk 35, minSdk 24 |
| Dispositivo Android | API 24+ | Expo Go para v1; físico en LAN para v2 |

### Configuración Android Studio (v2+)

- **Gradle JDK:** Java 17 (Eclipse Adoptium o JBR 17)
- **Proyecto a abrir:** `iterations/vN/android/` (no la raíz Expo)

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

### Dependencias del proyecto (Vissius Control Remote)

| Paquete | Versión | Motivo |
|---------|---------|--------|
| `expo-network` | `~7.0.0` | Detectar estado de red WiFi |
| `expo-haptics` | `~14.0.0` | Feedback vibratorio al enviar comandos |
| `expo-system-ui` | `~4.0.9` | Aplicar `userInterfaceStyle: dark` |
| `@react-native-async-storage/async-storage` | `1.23.1` | Persistir IP, preferencias, último dispositivo |
| `zustand` | `5.0.0` | Estado global (conexión, device status) |

---

## Configuración nativa (app.json)

Obligatorio si perfil BUILD o RELEASE (v2+):

```json
{
  "expo": {
    "name": "Vissius Control Remote",
    "slug": "vissius-control-remote",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "dark",
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
          },
          "ios": {
            "deploymentTarget": "15.1"
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
    },
    "ios": {
      "bundleIdentifier": "com.wika.vissiuscontrolremote"
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

### Perfil DEV (Expo Go) — v1

```bash
npm install
npx expo install --fix
npx expo-doctor
npx expo start
```

### Perfil BUILD (APK local) — v2

```bash
npm install
npx expo install --fix
npx expo-doctor
npx expo prebuild --platform android
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

### Perfil RELEASE (EAS)

```bash
npm install
npx expo install --fix
eas build --platform android
```

---

## Gates de verificación (bloqueantes)

### v1 (DEV)

| Gate | Comando | Resultado esperado |
|------|---------|-------------------|
| Dependencias | `npx expo-doctor` | 0 errores |
| TypeScript | `npx tsc --noEmit` | Exit code 0 |
| Metro | `npx expo start` | Arranca sin errores |
| Mock | Modo demo en app | Power/mode responden |

### v2 (BUILD) — adicional

| Gate | Comando | Resultado esperado |
|------|---------|-------------------|
| Prebuild | `npx expo prebuild --platform android` | Genera `android/` sin errores |
| APK debug | `cd android && ./gradlew assembleDebug` | BUILD SUCCESSFUL |

---

## Scripts estándar WIKA

Incluir en cada iteración BUILD (v2+):

| Script | Propósito |
|--------|-----------|
| `scripts/verify-build.sh` | Ejecuta todos los gates |
| `scripts/verify-build.bat` | Paridad Windows |
| `scripts/post-prebuild.js` | Fija Kotlin 1.9.25 post-prebuild |
| `reset-android.bat` | Regenera android/ limpio (Windows) |

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
