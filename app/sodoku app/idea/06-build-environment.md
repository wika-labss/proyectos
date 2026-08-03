# Entorno de Build — Sodoku

## Perfil de ejecución target

- [ ] **DEV** — Expo Go
- [x] **BUILD** — Nativo (APK en Samsung / Android Studio)
- [ ] **RELEASE** — EAS Build

---

## Entorno de desarrollo requerido

| Herramienta | Versión | Notas |
|-------------|---------|-------|
| Node.js | 20 LTS | |
| JDK (Gradle) | **17** | Gradle JDK en Android Studio |
| Android Studio | Latest | Abrir `iterations/vN/android/` |
| Android SDK | API 35 | minSdk 24 |

---

## Manifiesto de dependencias (Expo SDK 52)

| Paquete | Versión | Motivo |
|---------|---------|--------|
| `expo` | `~52.0.0` | Framework |
| `expo-router` | `~4.0.0` | Navegación |
| `expo-constants` | `~17.0.0` | Constantes |
| `expo-linking` | `~7.0.0` | Deep links |
| `expo-status-bar` | `~2.0.0` | Status bar |
| `expo-asset` | `~11.0.5` | Assets (iconos, splash) |
| `expo-build-properties` | `~0.13.0` | Kotlin/JDK fijados |
| `react` | `18.3.1` | Core |
| `react-native` | `0.76.9` | Core RN |
| `react-native-safe-area-context` | `4.12.0` | Safe areas |
| `react-native-screens` | `~4.4.0` | Pantallas nativas |
| `@react-native-async-storage/async-storage` | `1.23.1` | Persistencia |
| `zustand` | `^5.0.0` | Estado global |

---

## Configuración nativa (app.json)

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
          }
        }
      ]
    ]
  }
}
```

En `android/gradle.properties` (post-prebuild):

```properties
android.kotlinVersion=1.9.25
```

---

## Gates de verificación v2

| Gate | Comando |
|------|---------|
| Dependencias | `npx expo-doctor` |
| TypeScript | `npx tsc --noEmit` |
| Metro | `npx expo start` |
| Prebuild | `npx expo prebuild --platform android` |
| APK | `cd android && ./gradlew assembleDebug` |

---

## Lecciones de v1

Ver `review.md` — v1 falló por dependencias incompletas y toolchain nativo no documentado. v2 debe cumplir todos los gates antes de cerrarse.
