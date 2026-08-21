---
id: "BUILD-001"
title: "Horóscopo Alan — Build Plan V1"
status: "APROBADO"
version: "1.0.0"
audit_3_passed: true
ready_for_construction: true
---

# [05] Build Plan

## Stack

- Expo SDK 52, React Native 0.76, TypeScript, expo-router
- AsyncStorage, expo-network, datetimepicker

## Variables de entorno

```
EXPO_PUBLIC_SUPABASE_URL=https://tljzwyfmyjylfqcpggzc.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key del dashboard Supabase>
```

## Comandos

```bash
cd iterations/v1
npm install
npm run typecheck
npm run smoke
npm run verify   # requiere Android SDK + JDK 17
```

## RTM Build

| Paso | Entregable |
|------|------------|
| 1 | idea/01–05 + audits |
| 2 | engine zodiac + horoscopeApi |
| 3 | splash, register, home |
| 4 | smoke-v1.ts (fechas límite signos) |
| 5 | APK release |

## BDD escenario principal

1. Usuario abre app → splash vissiuss 4s
2. Primera vez → registro nombre + fecha → signo calculado → home
3. Segunda vez → splash → home directo
4. Home muestra horóscopo ordenado; pull refresh actualiza
5. Sin red → mensaje claro, sin crash
