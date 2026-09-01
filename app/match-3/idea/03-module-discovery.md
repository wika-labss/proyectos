---
id: "MOD-001"
title: "Match-3 América — Módulos V3"
status: "AUDIT_2_APROBADO"
version: "3.0.0"
owner: "VISSIUSS / WIKA"
created_at: "2026-08-21"
updated_at: "2026-09-01"
audit_1_passed: true
audit_2_passed: true
---

# [03] Arquitectura Modular V3

Código: `iterations/v3/`. MOD-01…10 de V2 + MOD-11 economía.

## RTM modular

| ID | Features | Nombre | Rol |
| :--- | :--- | :--- | :--- |
| `MOD-01` | FEAT-01,03,05,12 | match3-engine | Tablero, score, hint, end por moves |
| `MOD-02` | FEAT-05 | hint-timer | Idle 5s |
| `MOD-03` | FEAT-02 | levels-america | 50 configs |
| `MOD-04` | FEAT-04,10 | inventory | Regalos pares al azar |
| `MOD-05` | FEAT-06,13 | progress-store | `coins`, `countryCleared`, perfil, afinidad |
| `MOD-06` | FEAT-07,12,14 | screens | Home 3 bloques, Play timer, mapa Viajar, GameBoard VFX |
| `MOD-07` | FEAT-08 | profile | Nombre/preferencia/avatar |
| `MOD-08` | FEAT-09 | suitors | 20 pretendientes |
| `MOD-09` | FEAT-11 | affinity | Pareja única |
| `MOD-10` | FEAT-08 | avatars | 6 PNG 8-bit |
| `MOD-11` | FEAT-13 | economy | `coinsAwarded`, `travelCost` puro |

## MOD-05

Key `match3:v3:progress`. Campos nuevos: `coins` (default 1_000_000), `countryCleared: Record<CountryId, boolean>`. `applyVictory` no viaja. `travelToNextCountry()` exige 10/10 + saldo.

## MOD-11 `src/engine/economy.ts`

```text
coinsAwarded(remainingSec: number) -> 3..200
travelCost(hasPartner: boolean) -> 500 | 1000
canTravel(state) -> boolean
```

Sin React.

## Grafo

Screens → hint → match3Engine; screens → economy; progress-store → affinity + economy.

## Riesgos

Saldo de test 1e6 en producción de prueba (documentado). Viaje con pareja 1000. Timer y moves como fallos independientes.

## Visto bueno

`audit_2_passed: true` · 2026-09-01
