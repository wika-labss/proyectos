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

### Repo privado (`wika-labss/proyectos`)

Los links directos de GitHub **dan 404 sin sesión** en GitHub con acceso al repo. Opciones:

1. **Release (logueado en GitHub):**  
   https://github.com/wika-labss/proyectos/releases/tag/inter-galaxia-preview-apk-2026-10-26  
   → descargar `inter-galaxia-debug.apk`

2. **PC con GitHub CLI:**  
   `gh release download inter-galaxia-preview-apk-2026-10-26 -R wika-labss/proyectos -p inter-galaxia-debug.apk -D .`

3. **Cursor Cloud Agent** → run del agente → **Artifacts** → `inter-galaxia-debug.apk`  
   - https://cursor.com/agents/bc-935bb103-5fa0-40e9-8ef0-dfa5c26eccab

## Build en VM

Ver `iterations/v1/scripts/build-apk.sh` (JDK 17, `ANDROID_HOME`, `newArchEnabled=false`).

## EAS (link público opcional)

Con `EXPO_TOKEN` en el entorno: `eas build -p android --profile preview` (`eas.json`).
