# BUILD-APK — Murdoku v1

## Requisitos

- Node 20 LTS
- JDK **17** (no 21+)
- Android SDK (API 35 / min 24)
- `ANDROID_HOME` o `android/local.properties`

## Pasos

```bash
cd app/murdoku/iterations/v1
npm install
npm run smoke
npm run typecheck
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=$HOME/Android/Sdk
npm run apk
```

APK: `android/app/build/outputs/apk/release/app-release.apk`

Package: `com.wika.murdoku`
