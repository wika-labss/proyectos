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
          "cameraPermission": "Permite a BBY Light controlar el flash de tu teléfono."
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

```bash
cd "app/bby app/iterations/v1"
npm install
npx expo install --fix
npx expo-doctor
npx expo prebuild --platform android
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

Instalar en dispositivo físico:

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

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
| Dependencias | `npx expo-doctor` | 0 errores |
| TypeScript | `npx tsc --noEmit` | Exit code 0 |
| Metro | `npx expo start` | Arranca sin errores |
| Prebuild | `npx expo prebuild --platform android` | Genera `android/` sin errores |
| APK debug | `cd android && ./gradlew assembleDebug` | BUILD SUCCESSFUL |
| Prueba física | Instalar APK en dispositivo Android | Flash enciende/apaga, SOS parpadea |

---

## Scripts estándar WIKA

Incluir en cada iteración:

| Script | Propósito |
|--------|-----------|
| `scripts/verify-build.sh` | Ejecuta todos los gates |
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
