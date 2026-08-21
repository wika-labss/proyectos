# Build APK — Horóscopo Alan V1

## Prerrequisitos

- Node 20+
- JDK **17** (`JAVA_HOME`)
- Android SDK 35 (`ANDROID_HOME`)

## Pasos

```bash
cd iterations/v1
npm install
npm run smoke
npm run typecheck
npm run apk
```

APK resultante:

`android/app/build/outputs/apk/release/app-release.apk`

## Variables de entorno

Copia `.env` o define:

```
EXPO_PUBLIC_SUPABASE_URL=https://tljzwyfmyjylfqcpggzc.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

La anon key es pública (client-side); no incluir secrets de sync.
