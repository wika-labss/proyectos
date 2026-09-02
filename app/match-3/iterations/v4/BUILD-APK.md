# BUILD-APK — Match-3 América v4

## Requisitos

- Node 20 LTS
- JDK **17** (no 21+)
- Android SDK (API 35 / min 24)
- `ANDROID_HOME` o `android/local.properties`

## Pasos

```bash
cd app/match-3/iterations/v4
npm install
npm run smoke
npm run typecheck
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=$HOME/Android/Sdk
npm run apk
```

APK: `android/app/build/outputs/apk/release/app-release.apk`

Copia publicada: `final/match-3-america-v4-release.apk` y `iterations/v4/match-3-america-v4-release.apk`

El APK Release es autónomo (bundle embebido) — **no requiere Metro**.

Package: `com.wika.match3` · versionName `4.0.0` · versionCode `4`
