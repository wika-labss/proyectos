---
id: "BUILD-002"
title: "Geo Empresa V2 Build Plan"
status: "APROBADO"
ready_for_construction: true
---

# [05] Plan de Construcción V2

## Stack

- Expo SDK 52, RN 0.76.x, TypeScript, expo-router
- Package: `com.wika.geoempresa` (mismo que v1 para reemplazo APK en flota)
- Backend: Supabase `ugzprmopgmbjjxsbjmti`
- Versión app: **2.0.0** en `iterations/v2/`

## Entregables

- [x] `iterations/v2/` app agente Android
- [x] Registro único por `device_fingerprint` (Android ID)
- [x] Histórico Supabase selectivo (solo anomalías)
- [x] Splash vissiuss post-registro; sin pantalla monitor en flujo normal
- [x] Security lock (RN + nativo) con PIN 1312
- [x] Migración Supabase `v2_registro_unico_y_historial_anomalias`
- [x] `DEVICE-OWNER.md`, `DS-IMPLEMENTATION.md`

## Verificación

```bash
cd iterations/v2
npm run typecheck
npm run smoke
bash scripts/build-apk.sh
```

## Limitaciones documentadas

- Bloqueo total Home requiere **Device Owner** (Android Enterprise). Flota legacy: overlay + actividad nativa.
- PIN `1312` es test; producción debería usar config remota en V2.1.
- Apagado físico no dispara lock inmediato; se reporta al encender.
