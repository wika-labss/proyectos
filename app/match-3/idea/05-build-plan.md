---
id: "BUILD-001"
title: "Match-3 América — Plan de Construcción V3"
status: "READY_FOR_CONSTRUCTION"
version: "3.0.0"
owner: "VISSIUSS / WIKA"
created_at: "2026-08-21"
updated_at: "2026-09-01"
audit_1_passed: true
audit_2_passed: true
visual_approval_passed: true
audit_3_passed: true
ready_for_construction: true
---

# [05] Plan de Construcción V3

Destino exclusivo `iterations/v3/`. Prohibido modificar v1/v2.

## Alcance

FEAT-01–14. Excluye FEAT-15–17 (arte). Módulos MOD-01–11.

## Cronograma

| Paso | Módulo | Estado |
| :--- | :--- | :--- |
| 01 Scaffold v2→v3 | global | `COMPLETADO` |
| 02 economy.ts + progress coins | MOD-11,05 | `COMPLETADO` |
| 03 Play timer + payout | MOD-06,01 | `COMPLETADO` |
| 04 Home 3 bloques + mapa Viajar | MOD-06 | `COMPLETADO` |
| 05 GameBoard VFX | MOD-06,01 | `COMPLETADO` |
| 06 smoke + typecheck | verify | `COMPLETADO` |

## Criterios

- Timer 2:30; dificultad visible; payout 3–200
- Viaje 10/10 + 500/1000; seed 1e6
- Home 3 bloques; gemas con desplazamiento
- `npm run smoke` y `typecheck`

`ready_for_construction: true` — 2026-09-01
