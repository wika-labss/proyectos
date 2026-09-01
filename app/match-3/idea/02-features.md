---
id: "FEAT-001"
title: "Match-3 América — Características V3"
status: "AUDIT_1_APROBADO"
version: "3.0.0"
owner: "VISSIUSS / WIKA"
created_at: "2026-08-21"
updated_at: "2026-09-01"
audit_1_passed: true
audit_2_passed: true
---

# [02] Especificación de Características V3

> Destino: `iterations/v3/`.

## 1. Identificación

Contrato V3 sobre V2 (perfil, pretendientes, afinidad). Gatekeeping `AUDIT_1_APROBADO`.

## 2. RTM

| ID Feature | ERR | Nombre | Prioridad | Módulo |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-01` | `ERR-01` | Motor Match-3 8×10 | `Crítica` | `MOD-01` |
| `FEAT-02` | `ERR-02` | Campaña 5×10; viaje por monedas | `Crítica` | `MOD-03`, `MOD-11` |
| `FEAT-03` | `ERR-03` | Umbral minScore | `Crítica` | `MOD-01` |
| `FEAT-04` | `ERR-04` | Inventario regalos (no unlock país) | `Crítica` | `MOD-04` |
| `FEAT-05` | `ERR-05` | Hint + pánico | `Crítica` | `MOD-01` |
| `FEAT-06` | `ERR-06` | Persistencia | `Crítica` | `MOD-05` |
| `FEAT-07` | `ERR-07` | Theme | `Alta` | `MOD-06` |
| `FEAT-08` | `ERR-08` | Perfil | `Crítica` | `MOD-07` |
| `FEAT-09` | `ERR-09` | Pretendientes | `Crítica` | `MOD-08` |
| `FEAT-10` | `ERR-10` | Regalos azar niveles pares | `Crítica` | `MOD-04` |
| `FEAT-11` | `ERR-11` | Afinidad | `Crítica` | `MOD-09` |
| `FEAT-12` | `ERR-12` | Timer 2:30 + dificultad HUD | `Crítica` | `MOD-01`, `MOD-06` |
| `FEAT-13` | `ERR-13` | Monedas y viaje 500/1000 | `Crítica` | `MOD-11` |
| `FEAT-14` | `ERR-14` | Home 3 bloques + VFX tablero | `Alta` | `MOD-06` |

## 3. Features nuevas / modificadas

### FEAT-02 (mod): Viaje

Completar 10 niveles **no** abre el país. Botón Viajar: 10/10 + `travelCost` (500, o 1000 si `partnerId`).

### FEAT-04 (mod): Inventario

Solo colección/regalos. Unlock de país ya no usa `rewardsGranted`.

### FEAT-12: Timer y dificultad visible

Countdown 150 s. HUD muestra Fácil/Media, minScore, tiempo. Timeout con score insuficiente → derrota.

### FEAT-13: Economía

`coinsAwarded(remainingSec)` clamp 3–200. Seed `1_000_000`. `travelCost(hasPartner)`.

### FEAT-14: Home y VFX

Tres bloques animados: identidad (avatar+nombre+país), CTAs, monedas. Tablero: swap/pop/caída/refill animados.

### FEAT-10: Regalos al azar

Pool 1–8 en niveles pares (sin cambio de cadencia).

## 4. Deseables (arte diferido)

| ID | Nombre |
| :--- | :--- |
| `FEAT-15` | Sprites 8 regalos |
| `FEAT-16` | Mapa ilustrado |
| `FEAT-17` | Retratos 20 pretendientes |

## 5. Fuera de alcance

IAP; DS pipeline arte; tocar v1/v2; ruptura pareja.

## 6. NFRs

Smoke economía + typecheck v3; engine sin React; 0% hex fuera de theme.

## 7. Visto bueno

`audit_1_passed: true` · 2026-09-01 · WIKA Lead QA
