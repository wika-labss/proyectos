---
id: "PROB-001"
title: "Match-3 América"
status: "AUDIT_1_APROBADO"
version: "3.0.0"
owner: "VISSIUSS / WIKA"
created_at: "2026-08-21"
updated_at: "2026-09-01"
audit_1_passed: true
---

# [01] Definición del Problema, Alcance y Metas

> **Nota de versión:** V3 añade timer 2:30, dificultad visible, economía de monedas para viajar y Home en 3 bloques animados. Código en `iterations/v3/`.

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** `Match-3 América`
- **Repositorio de aplicación:** `proyectos/app/match-3/`
- **Stakeholders clave:** Producto VISSIUSS; Arquitecto WIKA
- **Estado de gatekeeping:** `READY_FOR_CONSTRUCTION` — contrato V3; `iterations/v3/`

---

## 2. Definición del Problema y Justificación

- **¿Qué problema se intenta resolver?**  
  V2 desbloquea países con regalos lifetime; no hay reloj, ni monedas de viaje, ni presión de tiempo. El Home no muestra país/monedas y el tablero teleporta gemas sin desplazamiento.

- **Estado actual:** `iterations/v2/` con perfil, pretendientes, afinidad, unlock por 10 niveles + ≥3 regalos ganados.
- **Estado deseado:** V3: timer 2:30, payout 3–200 monedas, viaje 10 niveles + 500/1000, Home 3 bloques, VFX de tablero.

---

## 3. Matriz RTM

| ID Problema | Descripción | Impacto | Feature | Módulo |
| :--- | :--- | :--- | :--- | :--- |
| `ERR-01` | Motor Match-3 | `Alto` | `FEAT-01` | `MOD-01` |
| `ERR-02` | Campaña 5 países | `Alto` | `FEAT-02` | `MOD-03` |
| `ERR-03` | Umbral de puntos | `Alto` | `FEAT-03` | `MOD-01` |
| `ERR-04` | Inventario de regalos | `Alto` | `FEAT-04`, `FEAT-10` | `MOD-04` |
| `ERR-05` | Tablero muerto | `Alto` | `FEAT-05` | `MOD-01` |
| `ERR-06` | Persistencia | `Alto` | `FEAT-06` | `MOD-05` |
| `ERR-07` | Identidad visual | `Medio` | `FEAT-07` | `MOD-06` |
| `ERR-08` | Perfil | `Alto` | `FEAT-08` | `MOD-07`, `MOD-10` |
| `ERR-09` | Pretendientes | `Alto` | `FEAT-09` | `MOD-08` |
| `ERR-10` | Cadencia regalos | `Alto` | `FEAT-10` | `MOD-04` |
| `ERR-11` | Afinidad | `Alto` | `FEAT-11` | `MOD-09` |
| `ERR-12` | Sin timer ni dificultad visible | `Alto` | `FEAT-12` | `MOD-01`, `MOD-06` |
| `ERR-13` | Viaje no usa monedas | `Alto` | `FEAT-13` | `MOD-11`, `MOD-05` |
| `ERR-14` | Home/tablero sin bloques ni VFX | `Medio` | `FEAT-14` | `MOD-06` |

---

## 4. Audiencia y fuera de alcance

Mismos usuarios V2. Fuera de alcance: IAP reales (1e6 es seed de test); pipeline DS arte regalos/mapa/elenco; ruptura de pareja; modificar `v1/` o `v2/`.

---

## 5. Objetivo

Entregar V3 en `iterations/v3/`: Home (avatar, nombre, país, monedas, 3 CTAs), timer 2:30, dificultad visible, viaje por monedas (10 niveles + 500/1000), payout 3–200, VFX de gemas.

---

## 6. BDD

### Escenario: Timer

- **Dado que** el jugador está en partida
- **Cuando** el countdown llega a 0 y `score < minScore`
- **Entonces** el nivel se pierde

### Escenario: Payout

- **Dado que** gana con `remainingSec` en [0, 150]
- **Cuando** se aplica victoria
- **Entonces** recibe `clamp(round(3 + 197 * remainingSec / 150), 3, 200)` monedas

### Escenario: Viaje

- **Dado que** completó 10 niveles del país actual
- **Cuando** pulsa Viajar con saldo ≥ 500 (o ≥ 1000 si hay `partnerId`)
- **Entonces** se descuenta el costo y se desbloquea el siguiente país; si faltan niveles o saldo, no viaja

### Escenario: Home

- **Dado que** hay perfil
- **Cuando** abre Home
- **Entonces** ve avatar, nombre, país actual, monedas y botones Jugar / Pretendientes / Inventario en 3 bloques

---

## 7. Umbrales V3

| Regla | Valor |
| :--- | :--- |
| Timer | 150 s (2:30) |
| minScore fácil | `800 + i×50` |
| minScore media | `1200 + i×75` |
| Movimientos | 25 fácil / 20 media |
| Dificultad | visible; impar fácil, par media |
| Payout | 3–200 según tiempo restante |
| Viaje | 10/10 + 500; 1000 si pareja |
| Seed test | `coins = 1_000_000` |
| Storage | `match3:v3:progress` |
| Regalos | azar 1–8 en niveles pares |
| Afinidad | umbrales V2 intactos |

Victoria: `score >= minScore` y tiempo > 0. Derrota: tiempo 0 o movimientos 0 sin umbral.

---

## 8. Puerta de Enlace

- [x] YAML, RTM, BDD, out-of-scope, auditoría `audits/auditoria-documentacion.md` APROBADO.

- **Aprobado por:** `WIKA Lead QA / agente auditoría` · `2026-09-01` · `audit_1_passed: true`
