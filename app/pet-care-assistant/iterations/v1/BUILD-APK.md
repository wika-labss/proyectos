# BUILD-APK.md — Pet Care Assistant v1

## Requisitos

- Node 20 LTS
- JDK **17** (no 21+)
- Android SDK (minSdk 24)

## Pasos

```bash
cd iterations/v1
npm install
npm run smoke
npm run typecheck
npm run apk
```

APK: `android/app/build/outputs/apk/release/app-release.apk`

Sideload: `adb install -r android/app/build/outputs/apk/release/app-release.apk`
