# BUILD-APK — Arkanoid v4

## Requisitos

- Node 20 LTS
- JDK **17** (no 21+)
- Android SDK (API 35 / min 24)
- `ANDROID_HOME` o `android/local.properties`

## Pasos

```bash
cd app/arkanoid/iterations/v4
npm install
npm run smoke
npm run typecheck
npm run apk
```

APK: `apk/arkanoid-v4-release.apk` (también en `android/app/build/outputs/apk/release/app-release.apk` tras `npm run apk`)

Instalar:

```bash
adb install -r apk/arkanoid-v4-release.apk
```

El APK Release es autónomo (bundle embebido) — **no requiere Metro**.
