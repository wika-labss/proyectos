# Entorno de Build

> Template WIKA — Completar para cada proyecto. Copiar desde `templates/idea/` al crear un nuevo proyecto.

## Perfil de ejecución target

Marcar el perfil que aplica a esta iteración:

- [ ] **DEV** — Expo Go (`npx expo start` + app Expo Go en dispositivo)
- [ ] **BUILD** — Nativo (`prebuild` + APK/IPA en dispositivo físico o emulador)
- [ ] **RELEASE** — EAS Build (publicación en stores)

---

## Entorno de desarrollo requerido

| Herramienta | Versión | Notas |
|-------------|---------|-------|
| Node.js | 20 LTS | Obligatorio |
| npm | 10+ | Incluido con Node |
| Git | 2.x+ | Control de versiones |
| JDK (Gradle) | **17** | Solo si perfil BUILD o RELEASE. **No usar JDK 21 ni 26** |
| Android Studio | Latest stable | Solo si perfil BUILD Android |
| Android SDK | API 35 | compileSdk 35, minSdk 24 |
| Xcode | 15+ | Solo si perfil BUILD iOS (macOS) |

### Configuración Android Studio

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

### Dependencias del proyecto

<!-- Añadir dependencias específicas del proyecto -->

| Paquete | Versión | Motivo |
|---------|---------|--------|
| | | |

---

## Configuración nativa (app.json)

Obligatorio si perfil BUILD o RELEASE:

```json
{
  "expo": {
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
    ]
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

### Perfil DEV (Expo Go)

```bash
npm install
npx expo install --fix
npx expo-doctor
npx expo start
```

### Perfil BUILD (APK local)

```bash
npm install
npx expo install --fix
npx expo-doctor
npx expo prebuild --platform android
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

En terminal separada:

```bash
npx expo start
```

### Perfil RELEASE (EAS)

```bash
npm install
npx expo install --fix
eas build --platform android
eas build --platform ios
```

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
