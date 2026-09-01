---
id: "BUILD-001"
title: "Match-3 América — Plan de Construcción V2"
status: "READY_FOR_CONSTRUCTION"
version: "2.0.0"
owner: "VISSIUSS / WIKA"
created_at: "2026-08-21"
updated_at: "2026-09-01"
audit_1_passed: true
audit_2_passed: true
visual_approval_passed: true
audit_3_passed: true
ready_for_construction: true
---

# [05] Plan de Construcción V2 (Build Plan)

> **Importante:** La implementación del contrato V2 va en **`iterations/v2/`**.  
> Queda prohibido modificar `iterations/v1/`.  
> `ready_for_construction: true` habilita código en `iterations/v2/src/` y `iterations/v2/app/`.

## 1. Verificación de Pre-requisitos

- [x] Auditoría de Documentación: `audit_1_passed == true`
- [x] Auditoría de Módulos: `audit_2_passed == true`
- [x] Aprobación visual: `visual_approval_passed == true`
- [x] Auditoría de Ensamblado: `audit_3_passed == true`

**Estado actual:** Gates 1–3B aprobados; construcción V2 autorizada.

---

## 2. Alcance de la V2

**Features incluidas:** `FEAT-01` … `FEAT-11`  
**Features excluidas:** `FEAT-12+` (arte regalos/mapa/elenco, más países, boosters)  
**Módulos incluidos:** `MOD-01` … `MOD-10`  
**Carpeta destino:** `iterations/v2/`  
**Reuso:** Portar engine y pantallas de `iterations/v1/` como base.

---

## 3. Cronograma de Ejecución (Build Schedule)

| Paso | Módulo | ID Feature | Archivos | Tokens / estándares | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `01` | `global` | N/A | Scaffold `iterations/v2/` desde v1 (sin APK) | WIKA-ARCH-02 | `PENDIENTE` |
| `02` | `MOD-01` | `FEAT-01`, `FEAT-03`, `FEAT-05` | Portar `match3Engine.ts` | engine puro | `PENDIENTE` |
| `03` | `MOD-10` | `FEAT-08` | 6 PNG 8-bit + `avatars.ts` | theme | `PENDIENTE` |
| `04` | `MOD-08`/`MOD-09` | `FEAT-09`, `FEAT-11` | `suitors.ts`, `affinity.ts`, smoke | umbrales 01 | `PENDIENTE` |
| `05` | `MOD-04`/`MOD-05`/`MOD-07` | `FEAT-04`, `FEAT-08`, `FEAT-10` | progress v2: perfil, cadencia, lifetime | storage key v2 | `PENDIENTE` |
| `06` | `MOD-06` | `FEAT-07`, `FEAT-08` | Home onboarding + avatar grid | `04` VIEW-06 | `PENDIENTE` |
| `07` | `MOD-06` | `FEAT-09`, `FEAT-11` | `/suitors`, `/suitors/[id]` | `relation.*` | `PENDIENTE` |
| `08` | `integración` | `FEAT-01`–`11` | Play mensaje de regalo par; mapa lifetime | BDD `02` | `PENDIENTE` |
| `09` | `verify` | N/A | `npm run typecheck` + `smoke` | WIKA-ARCH-05 | `PENDIENTE` |

---

## 4. Orden de Implementación y Justificación

1. Copiar V1 → V2 (sin APK LFS).
2. Avatares 8-bit y catálogo.
3. Engine afinidad + data pretendientes.
4. Persistencia perfil / regalos pares / lifetime.
5. UI Home y Pretendientes.
6. Smoke + typecheck.

---

## 5. Desglose por Fases

### Fase 1: Scaffold y tokens

- Copiar Expo SDK 52; `theme.ts` + tokens `relation.*` / `slot.*`.
- Criterio: typecheck del port.

### Fase 2: Engines y data (`MOD-01`, `MOD-08`–`10`)

- Afinidad pura; 20 suitors; 6 avatares.
- Criterio: smoke afinidad + cadencia.

### Fase 3: Persistencia (`MOD-04`, `MOD-05`, `MOD-07`)

- Profile, giveGift, rewardsGranted.
- Criterio: unlock país con inventario 0 si lifetime ≥ 3.

### Fase 4: UI y verify (`MOD-02`, `MOD-06`)

- Onboarding, grid avatares, ficha, dar regalo.
- 0% hex fuera de theme; `npm run typecheck`.

---

## 6. Dependencias Externas

| Dependencia | Versión | Propósito |
| :--- | :--- | :--- |
| `expo` | `~52.x` | Framework |
| `react-native` | `~0.76.x` | Runtime |
| `expo-router` | `~4.x` | Navegación |
| `typescript` | `~5.x` | Tipado |
| `@react-native-async-storage/async-storage` | pin V1 | Persistencia |

Sin Unity/Godot/Phaser.

---

## 7. Estrategia de Pruebas

| Tipo | Alcance | Comando / método |
| :--- | :--- | :--- |
| Smoke engine | Match + afinidad + cadencia + unlock lifetime | `npm run smoke` |
| Typecheck | Proyecto v2 | `npm run typecheck` |
| BDD | Escenarios `02-features.md` | Checklist QA / UI |

---

## 8. Riesgos Técnicos

| Riesgo | Probabilidad | Mitigación |
| :--- | :--- | :--- |
| Scope creep arte mapa/elenco | `Alta` | FEAT-12–14 diferidos |
| Save V1 mezclado | `Media` | Key distinta v2 |
| APK no generado en este incremento | `Media` | typecheck+smoke como gate de código; APK opcional |

---

## 9. Criterios de Aprobación V2

- [ ] Features `FEAT-01`–`FEAT-11` implementadas en `iterations/v2/`.
- [ ] Onboarding nombre + preferencia + 6 avatares 8-bit.
- [ ] 20 pretendientes; filtro preferencia; unlock por país.
- [ ] Regalos solo niveles pares; +10/+2; pareja única y espejo.
- [ ] Unlock país por `rewardsGranted >= 3`.
- [ ] `npm run typecheck` y `npm run smoke` OK.
- [ ] Sideload / APK no bloquean el cierre de código si verify APK no está disponible en el entorno.

---

## 10. Checklist por Incremento (Quality Gate)

Antes de marcar un paso `COMPLETADO`:

- [ ] 0% estilos hardcoded fuera de theme/tokens.
- [ ] Trazabilidad RTM (feature → módulo → archivo).
- [ ] Escenario BDD asociado verificado.
- [ ] Sin errores TypeScript bloqueantes.

---

## 11. Cierre de Fase de Construcción

- **Revisado por (Arquitecto):** `WIKA Lead QA / agente auditoría`
- **Fecha de activación construcción:** `2026-09-01`
- **ready_for_construction:** `true` — destino `iterations/v2/`

### Trazabilidad RTM resumen

```text
ERR-01 → FEAT-01 → MOD-01 → VIEW-04 → Paso 02
ERR-02 → FEAT-02 → MOD-03 → VIEW-02/03 → Paso 01
ERR-03 → FEAT-03 → MOD-01 → VIEW-04 → Paso 02
ERR-04/10 → FEAT-04/10 → MOD-04 → VIEW-05 → Paso 05
ERR-05 → FEAT-05 → MOD-01/02 → VIEW-04
ERR-06 → FEAT-06 → MOD-05/06 → VIEW-01
ERR-07 → FEAT-07 → MOD-06 → VIEW-01..08
ERR-08 → FEAT-08 → MOD-07/10 → VIEW-06 → Pasos 03, 06
ERR-09 → FEAT-09 → MOD-08 → VIEW-07 → Paso 04
ERR-11 → FEAT-11 → MOD-09 → VIEW-08 → Paso 04
```
