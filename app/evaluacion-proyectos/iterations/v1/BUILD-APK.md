# BUILD-APK — Evaluación Proyectos v1

## Requisitos

- Node 20 LTS
- JDK **17**
- Android SDK (API 35 / min 24)
- `ANDROID_HOME` o `android/local.properties`

```bash
cd app/evaluacion-proyectos/iterations/v1
npm install
npm run apk
```

APK: `evaluacion-proyectos-v1-release.apk`

```bash
adb install -r evaluacion-proyectos-v1-release.apk
```

El APK Release es autónomo (bundle embebido) — **no requiere Metro**.
