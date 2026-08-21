---
id: "BUILD-001"
title: "AI Chess Wars — Plan de Construcción V2 (contrato V1.1)"
status: "READY_FOR_CONSTRUCTION"
version: "1.1.0"
owner: "VISSIUSS / WIKA"
created_at: "2026-08-21"
updated_at: "2026-08-21"
audit_1_passed: true
audit_2_passed: true
visual_approval_passed: true
audit_3_passed: true
ready_for_construction: true
---

# [05] Plan de Construcción (Build Plan)

> **Importante:** El contrato de producto V1.1 **no** coincide con `iterations/v1/` (prototipo clásico + campaña).  
> La implementación del contrato actual va en **`iterations/v2/`**.  
> `ready_for_construction: true` habilita código en `iterations/v2/src/` y `iterations/v2/app/`.

## 1. Pre-requisitos

- [x] `audit_1_passed`
- [x] `audit_2_passed`
- [x] `visual_approval_passed`
- [x] `audit_3_passed`

---

## 2. Alcance

**Incluye:** `FEAT-01`–`FEAT-08`  
**Excluye:** `FEAT-09`+ (ranked, economía, eventos, zonas dinámicas, más ramas)  
**Módulos:** `MOD-01`–`MOD-06`  
**Carpeta destino:** `iterations/v2/`  
**Reuso:** Portar/adaptar engine de `iterations/v1` como base de `MOD-01`/`MOD-02`.

---

## 3. Cronograma

| Paso | Módulo | Feature | Archivos | Estado |
| :--- | :--- | :--- | :--- | :--- |
| 01 | global | N/A | Scaffold Expo en `iterations/v2/` (desde v1/tower) | `COMPLETADO` |
| 02 | MOD-01 | FEAT-01,03 | `chessEngine` + smoke Clásico | `COMPLETADO` |
| 03 | MOD-02 | FEAT-02 | `chessAi` | `COMPLETADO` |
| 04 | MOD-03 | FEAT-04 | evolution layer + smoke nodos/evo/habilidades | `COMPLETADO` |
| 05 | MOD-04 | FEAT-05 | loadout A/B | `COMPLETADO` |
| 06 | MOD-05 | FEAT-07 | meta-progress AsyncStorage | `COMPLETADO` |
| 07 | MOD-06 | FEAT-06,08 | theme + Home/Lobby/Prematch/Game/Result/Tutorial | `COMPLETADO` |
| 08 | integración | all | Flujos BDD Clásico vs Evolutive | `COMPLETADO` |
| 09 | release | N/A | typecheck + verify + APK | `PARCIAL` (smoke+typecheck+export OK; APK pendiente SDK) |

---

## 4. Orden

1. Scaffold v2  
2. Engine + AI (reuso v1)  
3. Evolution layer (nuevo)  
4. Loadout + meta  
5. UI flujo completo  
6. Verify / APK  

---

## 5. Fases

### Fase 1 — Setup + tokens (`04`)
Criterio: `typecheck` OK.

### Fase 2 — Engine + AI
Criterio: smoke Clásico; 0 fugas Wars.

### Fase 3 — Evolution + loadout
Criterio: smoke nodos, evolve, Dron/Fortaleza/Interceptor.

### Fase 4 — UI + verify
Criterio: BDD manual; `npm run verify` (APK si SDK disponible).

---

## 6. Dependencias

| Dep | Versión | Uso |
| :--- | :--- | :--- |
| expo | ~52.x | Framework |
| react-native | ~0.76.x | Runtime |
| expo-router | ~4.x | Nav |
| async-storage | ~1.23 / pin WIKA | Meta |

Sin Stockfish, sin IAP SDKs en V1.1.

---

## 7. Pruebas

| Tipo | Método |
| :--- | :--- |
| Smoke engine | `npm run smoke` |
| Smoke evolution | casos nodos/evo/habilidad |
| Typecheck | `tsc` |
| Clásico integrity | assert sin nodos en mode classic |
| Build | verify / apk |

---

## 8. Riesgos

| Riesgo | Mitigación |
| :--- | :--- |
| Scope creep visión completa | Respetar out-of-scope 01/02 |
| Acoplar evolución al engine base | MOD-03 decorador |
| Balance habilidades | 1 uso + coste 2 Energía |

---

## 9. Criterios de aprobación construcción

- [ ] Clásico jugable vs IA sin Wars
- [ ] Evolutive: nodos, XP, 3 evoluciones, loadout, tutorial
- [ ] Meta progress persistente
- [ ] smoke + typecheck + export OK
- [ ] APK Release (local) cuando SDK disponible

---

## 10. Checklist por incremento

- [ ] 0% hex fuera de theme  
- [ ] RTM feature→módulo→archivo  
- [ ] BDD asociado  
- [ ] Sin TS errors  

---

## 11. Cierre

- **ready_for_construction:** `true` (para `iterations/v2/`)
- **Al cerrar build:** `LISTO_PARA_AUDITORIA_RELEASE`

### RTM resumen

```text
ERR-01 → FEAT-01 → MOD-01 → VIEW-04 → Paso 02
ERR-02 → FEAT-02 → MOD-02 → VIEW-04 → Paso 03
ERR-03 → FEAT-03 → MOD-01/06 → play/classic → Pasos 02,07
ERR-04 → FEAT-04 → MOD-03 → VIEW-04 → Paso 04
ERR-05 → FEAT-05 → MOD-04 → VIEW-03 → Paso 05
ERR-06 → FEAT-06 → MOD-06 → VIEW-01..05 → Paso 07
ERR-07 → FEAT-07 → MOD-05 → meta → Paso 06
ERR-08 → FEAT-08 → MOD-06 → tutorial → Paso 07
```
