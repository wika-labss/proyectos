---
id: "DES-001"
title: "Match-3 América — Diseño V3"
status: "READY_FOR_CONSTRUCTION"
version: "3.0.0"
owner: "VISSIUSS / WIKA"
created_at: "2026-08-21"
updated_at: "2026-09-01"
audit_1_passed: true
audit_2_passed: true
visual_approval_passed: true
audit_3_passed: true
---

# [04] Diseño de Aplicación V3

Código: `iterations/v3/`. Persistencia `match3:v3:progress`.

## Flujo

```text
Home 3 bloques → Mapa (Viajar) → Niveles → Partida 2:30
Home → Pretendientes / Inventario
Victoria → monedas 3–200 [+ regalo si par]
```

## VIEW-01 Home

```text
┌─────────────────────────────────────┐
│ BLOQUE 1 identidad                  │
│  [8bit]  {nombre}                   │
│  País: México                       │
├─────────────────────────────────────┤
│ BLOQUE 2 CTAs                       │
│  [Jugar] [Pretendientes]            │
│  [Inventario]                       │
├─────────────────────────────────────┤
│ BLOQUE 3 economía                   │
│  Monedas: 1 000 000                 │
└─────────────────────────────────────┘
```

Entrada: slide/fade de los 3 bloques.

## VIEW-02 Mapa

Lista países. Bloqueado muestra costo 500 o 1000. CTA **Viajar** si el actual está `countryCleared` y hay saldo.

## VIEW-04 Partida

HUD: País · Nivel · **Fácil|Media** · Score/minScore · Mov · **2:30** · Pánico. Tablero con swap/pop/caída.

## Tokens

Reusar V2 `theme.ts`. Hex solo ahí.

## Visto bueno

`visual_approval_passed: true` · `audit_3_passed: true` · 2026-09-01
