# Horóscopo de Alan el Farmeador de aura — V1

App Android (Expo SDK 52) que registra nombre y fecha de nacimiento una sola vez, calcula el signo zodiacal y consulta el horóscopo del día desde Supabase Edge Function.

## Flujo

1. Splash **vissiuss** (4 segundos)
2. Registro (solo primera vez)
3. Home con horóscopo ordenado + refresh

## Comandos

```bash
npm install
npm start
npm run typecheck
npm run smoke
npm run apk
```

## API

`GET https://tljzwyfmyjylfqcpggzc.supabase.co/functions/v1/horoscopo?signo={slug}`

Variables en `.env`:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Requisitos build APK

- JDK 17
- Android SDK (`ANDROID_HOME`)
- Ver [BUILD-APK.md](./BUILD-APK.md)
