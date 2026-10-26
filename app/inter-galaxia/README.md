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

### Descarga del APK

| Método | Cuándo usarlo |
|--------|----------------|
| [GitHub Release](https://github.com/wika-labss/proyectos/releases/tag/inter-galaxia-preview-apk-2026-10-26) | Tienes sesión en GitHub con acceso a **wika-labss/proyectos** |
| [Link directo (sin login)](https://tmpfiles.org/dl/1793046712.a3496f5f848359a0/wRA3VfpCKr1K/inter-galaxia-debug.apk) | Probar en el celular ya; host temporal (~1 h) |
| [Gofile](https://gofile.io/d/0sKxQPVI) | Misma APK, página de descarga en el navegador |
| [Cursor Artifacts](https://cursor.com/agents/bc-935bb103-5fa0-40e9-8ef0-dfa5c26eccab) | Sesión en Cursor → `inter-galaxia-debug.apk` |

#### Por qué GitHub muestra **404**

`wika-labss/proyectos` es **privado**. GitHub responde **404** (no “acceso denegado”) si abres el release o el URL del asset **sin estar logueado** con un usuario del org. El APK **sí está** en el release `inter-galaxia-preview-apk-2026-10-26`; no es un link roto.

En PC con acceso al repo:

```bash
gh release download inter-galaxia-preview-apk-2026-10-26 -R wika-labss/proyectos -p inter-galaxia-debug.apk -D .
```

Para un link público estable (sin depender de hosts temporales), configurar `EXPO_TOKEN` y usar `eas build -p android --profile preview` (ver `iterations/v1/eas.json`).

## Build en VM

Ver `iterations/v1/scripts/build-apk.sh` (JDK 17, `ANDROID_HOME`, `newArchEnabled=false`).

## EAS (link público opcional)

Con `EXPO_TOKEN` en el entorno: `eas build -p android --profile preview` (`eas.json`).
