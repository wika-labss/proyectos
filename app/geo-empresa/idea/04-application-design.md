---
id: "DESIGN-001"
title: "Geo Empresa V1 — Diseño"
status: "APROBADO"
version: "1.0.0"
visual_approval_passed: true
audit_3_passed: true
---

# [04] Diseño de Aplicación V1

## Pantallas

| ID | Pantalla | Descripción |
|----|----------|-------------|
| VIEW-01 | Registro | Solo campo **nombre**; GPS fija coordenadas base |
| VIEW-02 | Monitor | Estado mínimo en background; notificación persistente |

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

1. Registro → permisos ubicación **Siempre** + batería + Device Admin
2. Inicia agente background (ping 5 min)
3. Monitor oculto; overlay si modo avión

## PIN test default

`1312` — desactivar admin / detener monitoreo
