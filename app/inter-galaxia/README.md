# Inter Galaxia

App Android (Expo) para el DT: plantilla por categoría, nóminas, formaciones, fechas y pagos (mock hasta API BD).

## Código

```bash
cd app/inter-galaxia/iterations/v1
npm install
npm start   # Expo Go + mock
```

## APK de prueba (UI)

Generado en **Cloud Agent** (no en la PC local del DT):

1. Ejecutar `scripts/build-apk.sh` en la VM, o descargar el artefacto del run.
2. Archivo: **`inter-galaxia-debug.apk`** (~62 MB, `arm64-v8a`, debug, mock).

Runs con APK publicado:

- [Inter Galaxia APK build](https://cursor.com/agents/bc-1d5075d2-1b33-5da6-bc18-aa9bec356784) — sección **Artifacts**
- [Football club app design](https://cursor.com/agents/bc-935bb103-5fa0-40e9-8ef0-dfa5c26eccab) — sección **Artifacts**

## Build en VM

Ver `iterations/v1/scripts/build-apk.sh` (JDK 17, `ANDROID_HOME`, `newArchEnabled=false`).

## EAS (link público opcional)

Con `EXPO_TOKEN` en el entorno: `eas build -p android --profile preview` (`eas.json`).
