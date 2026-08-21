---
id: "MOD-001"
title: "Horóscopo Alan — Módulos V1"
status: "APROBADO"
version: "1.0.0"
audit_2_passed: true
---

# [03] Module Discovery

| Módulo | Ruta | Responsabilidad |
|--------|------|-----------------|
| `mod-zodiac-engine` | `src/engine/zodiac.ts` | Resolver signo desde fecha nacimiento |
| `mod-horoscope-api` | `src/engine/horoscopeApi.ts` | Fetch Edge Function Supabase |
| `mod-user-profile` | `src/modules/user-profile/` | Load/save perfil AsyncStorage |
| `mod-network-guard` | `src/hooks/useNetworkStatus.ts` | Estado de conectividad |
| `mod-horoscope-ui` | `app/home.tsx`, `src/components/` | Presentación ordenada |
| `mod-splash` | `app/splash.tsx`, `VissiussSplash.tsx` | Splash 4s |
| `mod-register` | `app/register.tsx` | Formulario registro |

## Dependencias

```
mod-splash → mod-user-profile → mod-register | mod-horoscope-ui
mod-horoscope-ui → mod-zodiac-engine, mod-horoscope-api, mod-network-guard
```
