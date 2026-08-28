---
id: "DESIGN-002"
title: "Geo Empresa V2 — Diseño"
status: "APROBADO"
version: "2.0.0"
visual_approval_passed: true
audit_3_passed: true
---

# [04] Diseño de Aplicación V2

## Pantallas

| ID | Pantalla | Descripción |
|----|----------|-------------|
| VIEW-01 | Registro | Solo campo **nombre**; GPS fija coordenadas base; fingerprint `android-{ANDROID_ID}` |
| VIEW-02 | Splash vissiuss | Logo corporativo ~3 s; minimiza app a background |
| VIEW-03 | Security lock | Overlay full-screen; PIN `1312`; motivo (fuera de radio / avión / apagado) |

## Theme (`src/constants/theme.ts`)

| Token | Valor |
|-------|-------|
| background | `#0F172A` |
| surface | `#1E293B` |
| primary | `#2563EB` |
| success | `#22C55E` |
| danger | `#EF4444` |
| text | `#F8FAFC` |

## Flujo

1. Sin registro local → **Registro** (permisos ubicación Siempre + batería + Device Admin + overlay)
2. RPC `registrar_dispositivo` (único por fingerprint) → agente background
3. **Splash vissiuss** → `moveAppToBackground`
4. Reapertura → splash → background (sin pantalla monitor)
5. Anomalía (fuera 120 m, avión, apagado) → **SecurityLockOverlay** + actividad nativa; PIN desbloquea 15 min

## PIN test default

`1312` — desbloquear lock screen (snooze). Device Owner opcional para bloqueo total Home (ver `DEVICE-OWNER.md`).
