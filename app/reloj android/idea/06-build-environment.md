# Entorno de Build

> Proyecto: **reloj android** — Reloj digital retro con widget Android

## Perfil de ejecución target

Marcar el perfil que aplica a esta iteración:

- [ ] **DEV** — Expo Go (`npx expo start` + app Expo Go en dispositivo)
- [x] **BUILD** — Nativo (`prebuild` + APK en dispositivo físico o emulador) — **target v1**
- [ ] **RELEASE** — EAS Build (publicación en stores)

> v1 requiere BUILD: el widget Android es nativo y **no funciona en Expo Go**. Se debe generar APK con `prebuild`.

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
| Dispositivo Android físico | API 24+ | **Recomendado** — para probar widget en launcher real |

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

### Dependencias del proyecto (reloj android)

| Paquete | Versión | Motivo |
|---------|---------|--------|
| `react-native-android-widget` | `0.15.1` | Widget de pantalla de inicio Android |
| `expo-font` | `~13.0.0` | Cargar fuente DSEG7 Classic |
| `expo-keep-awake` | `~14.0.0` | Modo reloj de mesa (pantalla activa) |
| `expo-haptics` | `~14.0.0` | Feedback al cambiar ajustes |
| `expo-system-ui` | `~4.0.9` | Aplicar `userInterfaceStyle: dark` |
| `@react-native-async-storage/async-storage` | `1.23.1` | Persistir preferencias (app + widget) |
| `zustand` | `5.0.0` | Estado global |

> `react-native-android-widget` se instala con: `npm install react-native-android-widget@0.15.1` (no via expo install).

---

## Configuración nativa (app.json)

Obligatorio para perfil BUILD:

```json
{
  "expo": {
    "name": "Reloj Retro",
    "slug": "reloj-android",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "dark",
    "plugins": [
      "expo-router",
      "expo-asset",
      [
        "react-native-android-widget",
        {
          "fonts": ["./assets/fonts/DSEG7Classic-Bold.ttf"],
          "widgets": [
            {
              "name": "RetroClockWidget",
              "label": "Reloj Retro",
              "minWidth": "250dp",
              "minHeight": "110dp",
              "targetCellWidth": 4,
              "targetCellHeight": 2,
              "description": "Reloj digital retro en tu pantalla de inicio",
              "previewImage": "./assets/widget-preview/retro-clock.png",
              "updatePeriodMillis": 1800000
            }
          ]
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
          },
          "ios": {
            "deploymentTarget": "15.1"
          }
        }
      ]
    ],
    "android": {
      "package": "com.wika.relojandroid",
      "adaptiveIcon": {
        "backgroundColor": "#0D0D0D"
      }
    }
  }
}
```

### Entry point custom (package.json)

El widget requiere registrar el task handler en el entry point:

```json
{
  "main": "index.ts"
}
```

### Matriz de compatibilidad Kotlin (Expo SDK 52)

| Kotlin | Compose Compiler | Estado |
|--------|------------------|--------|
| 1.9.24 | 1.5.14 | ✅ Válido |
| 1.9.25 | 1.5.15 | ✅ **Estándar WIKA** |
| Mezclados | — | ❌ **Prohibido** |

En `android/gradle.properties` (post-prebuild):

```properties
android.kotlinVersion=1.9.25
```

---

## Pipeline de build

### Perfil DEV (Expo Go) — No aplicable v1

> El widget no funciona en Expo Go. Usar BUILD para probar widget.

### Perfil BUILD (APK local)

```bash
npm install
npm install react-native-android-widget@0.15.1
npx expo install --fix
npx expo-doctor
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

En terminal separada (desarrollo con hot reload):

```bash
npx expo start --dev-client
```

### Perfil RELEASE (EAS)

```bash
npm install
npx expo install --fix
eas build --platform android
```

---

## Gates de verificación (bloqueantes)

Ninguna iteración se considera completa sin pasar:

| Gate | Comando | Resultado esperado |
|------|---------|-------------------|
| Dependencias | `npx expo-doctor` | 0 errores |
| TypeScript | `npx tsc --noEmit` | Exit code 0 |
| Bundle JS | `npx expo export --platform android` | Sin errores |
| Prebuild | `npx expo prebuild --platform android` | Genera `android/` + widget provider |
| APK release | `cd android && ./gradlew assembleRelease` | BUILD SUCCESSFUL |
| Widget manual | Añadir widget en launcher | Muestra hora retro |
| App manual | Abrir app en dispositivo | Reloj actualiza cada segundo |

---

## Scripts estándar WIKA

Incluir en cada iteración:

| Script | Propósito |
|--------|-----------|
| `scripts/verify-build.sh` | Ejecuta todos los gates |
| `scripts/reset-android.bat` | Regenera android/ limpio (Windows) |

---

## Assets requeridos

| Asset | Ruta | Notas |
|-------|------|-------|
| Fuente DSEG7 | `assets/fonts/DSEG7Classic-Bold.ttf` | Licencia SIL Open Font; display 7 segmentos |
| Preview widget | `assets/widget-preview/retro-clock.png` | Captura o mock del widget para selector Android |
| Icono app | `assets/icon.png` | 1024×1024, estilo retro |
| Splash | `assets/splash.png` | Fondo `#0D0D0D` |

---

## Principios WIKA aplicables

| ID | Principio |
|----|-----------|
| WIKA-ARCH-01 | La documentación es contrato de build |
| WIKA-ARCH-02 | Versiones pinneadas (`~`), nunca flotantes (`^`) en expo/react-native |
| WIKA-ARCH-03 | Perfil DEV vs BUILD explícito — v1 = BUILD |
| WIKA-ARCH-04 | Toolchain nativo documentado y fijado via expo-build-properties |
| WIKA-ARCH-05 | Gates de verificación obligatorios antes de cerrar iteración |
| WIKA-ARCH-06 | Preferir starter WIKA validado sobre generación de infra desde cero |
