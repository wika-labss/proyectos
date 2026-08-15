# BUILD-APK — Alvaro Snake v1

## Requisitos

- Node 20 LTS
- JDK **17** (no 21+)
- Android SDK (API 35 / min 24)
- `ANDROID_HOME` o `android/local.properties`

## Pasos

```bash
cd app/alvaro/iterations/v1
npm install
npm run smoke
npm run typecheck
npm run apk
```

APK: `android/app/build/outputs/apk/release/app-release.apk`

Instalar:

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

El APK Release es autónomo (bundle embebido) — **no requiere Metro**.
