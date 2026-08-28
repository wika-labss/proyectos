---
id: "BUILD-001"
title: "Geo Empresa V1 Build Plan"
status: "APROBADO"
ready_for_construction: true
---

# [05] Plan de Construcción V1

## Stack

- Expo SDK 52, RN 0.76.x, TypeScript, expo-router
- Package: `com.wika.geoempresa`
- Backend: Supabase `ugzprmopgmbjjxsbjmti`

## Entregables

- [x] `iterations/v1/` app agente Android
- [x] Background location cada 5 min
- [x] Registro nombre + base GPS
- [x] PIN 1312 (test)
- [x] Reporte encendido/apagado inmediato
- [x] Guard modo avión (overlay + reporte)
- [x] Device Admin para desinstalación con PIN

## Verificación

```bash
cd iterations/v1
npm run typecheck
npm run smoke
npm run verify
```

## Limitaciones documentadas

- Bloqueo total modo avión / desinstalación requiere **Device Owner** (Android Enterprise). V1 usa Device Admin + overlay.
