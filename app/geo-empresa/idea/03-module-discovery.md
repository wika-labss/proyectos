---
id: "MOD-001"
title: "Geo Empresa — Módulos V1"
status: "APROBADO"
version: "1.0.0"
owner: "Vissiuss / Equipo WIKA"
created_at: "2026-08-27"
updated_at: "2026-08-27"
audit_1_passed: true
audit_2_passed: true
---

# [03] Arquitectura Modular

## RTM Módulos

| ID Módulo | Feature | Nombre | Tipo | Ruta |
|-----------|---------|--------|------|------|
| MOD-01 | FEAT-01 | mod-registration | UI + persist | `app/register.tsx`, `src/modules/registration/` |
| MOD-02 | FEAT-02 | mod-location-agent | service | `src/modules/location-agent/` |
| MOD-03 | FEAT-03 | mod-fence-engine | engine | `src/engine/fence.ts` |
| MOD-04 | FEAT-04 | mod-device-state | engine | `src/engine/deviceState.ts` |
| MOD-05 | FEAT-01–05 | mod-api | client | `src/engine/geoApi.ts` |
| MOD-06 | FEAT-02 | mod-registration-store | persist | `src/modules/registration/store.ts` |

---

## MOD-05: mod-api

Cliente HTTP a Supabase RPC (patrón WIKA, sin SDK pesado en engine):

| RPC | Método | Uso |
|-----|--------|-----|
| `registrar_dispositivo` | POST `/rest/v1/rpc/registrar_dispositivo` | Una vez |
| `reportar_ubicacion` | POST `/rest/v1/rpc/reportar_ubicacion` | Background |
| `obtener_dispositivo` | POST `/rest/v1/rpc/obtener_dispositivo` | Consulta local |

**Env:** `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Proyecto: `https://ugzprmopgmbjjxsbjmti.supabase.co`

---

## MOD-03: mod-fence-engine

Pure TypeScript (validación client-side opcional; fuente de verdad = Postgres):

```typescript
export function isInsideFence(distanceM: number, radiusM: number): boolean {
  return distanceM <= radiusM;
}
```

---

## Backend (Supabase)

Ver `supabase/README.md` en este proyecto.
