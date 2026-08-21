---
id: "BUILD-001"
title: "Match-3 América — Plan de Construcción V1"
status: "READY_FOR_CONSTRUCTION"
version: "1.0.0"
owner: "VISSIUSS / WIKA"
created_at: "2026-08-21"
updated_at: "2026-08-21"
audit_1_passed: true
audit_2_passed: true
visual_approval_passed: true
audit_3_passed: true
ready_for_construction: true
---

# [05] Plan de Construcción V1 (Build Plan)

> **Bloqueo:** Si `ready_for_construction: false`, queda prohibido crear o modificar código en `iterations/v1/src/` y `iterations/v1/app/`.  
> **Activación:** `ready_for_construction: true` solo cuando los cuatro flags anteriores sean `true`.

## 1. Verificación de Pre-requisitos

- [x] Auditoría de Documentación: `audit_1_passed == true` (`auditoria-documentacion.md`)
- [x] Auditoría de Módulos: `audit_2_passed == true` (`auditoria-modulos.md`)
- [x] Aprobación visual: `visual_approval_passed == true` (`04-application-design.md`)
- [x] Auditoría de Ensamblado: `audit_3_passed == true` (`auditoria-ensamblado.md`)

**Estado actual:** Gates 1–3B aprobados; `ready_for_construction: true` — construcción V1 autorizada.

---

## 2. Alcance de la V1

**Features incluidas:** `FEAT-01` … `FEAT-07`  
**Features excluidas:** `FEAT-08+` (más países, boosters, pánico extra)  
**Módulos incluidos:** `MOD-01` … `MOD-06`

---

## 3. Cronograma de Ejecución (Build Schedule)

| Paso | Módulo | ID Feature | Archivos a crear / modificar | Tokens / estándares | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `01` | `global` | N/A | `iterations/v1/` scaffold Expo (`package.json`, `app.json`, scripts verify) | WIKA-ARCH-02, 03 | `COMPLETADO` |
| `02` | `MOD-01` | `FEAT-01`, `FEAT-03` | `src/engine/match3Engine.ts`, `types.ts`, smoke | `coding-standards.md` | `COMPLETADO` |
| `03` | `MOD-01` | `FEAT-05` | `findHintMove`, `hasValidMoves`, `reshuffle` | engine puro | `COMPLETADO` |
| `04` | `MOD-03` | `FEAT-02` | `src/data/countries.ts`, `levels.ts` (50 niveles) | umbrales 01-problem | `COMPLETADO` |
| `05` | `MOD-05` | `FEAT-06` | `src/modules/progress/` AsyncStorage | offline | `COMPLETADO` |
| `06` | `MOD-04` | `FEAT-04` | `src/modules/inventory/` + unlock país (≥3) | pool 1–8 | `COMPLETADO` |
| `07` | `MOD-06` | `FEAT-07` | `theme.ts` + Home / Mapa / Niveles / Inventario | `04` tokens | `COMPLETADO` |
| `08` | `MOD-02`/`MOD-06` | `FEAT-05` | `PlayScreen`, `useIdleHint`, botón pánico | hint/danger | `COMPLETADO` |
| `09` | `integración` | `FEAT-01`–`07` | Flujos BDD; persistencia E2E | BDD `02` | `COMPLETADO` |
| `10` | `release` | N/A | `npm run typecheck` + `verify` + APK | WIKA-ARCH-05 | `COMPLETADO` |

---

## 4. Orden de Implementación y Justificación

1. **Setup y toolchain** — base reproducible (`tower/iterations/v1/` como referencia).
2. **Engine puro** — tablero 8×10, match, score, hint, reshuffle sin UI.
3. **Data América** — 5 países × 10 niveles con `minScore` y moves.
4. **Persistencia + inventario** — unlock nivel/país.
5. **Theme y pantallas** — según wireframes `04`.
6. **Play + hint + pánico** — integración motor/UI.
7. **Verify + APK** — cierre V1.

---

## 5. Desglose por Fases

### Fase 1: Setup y Design Tokens

- **Objetivo:** Proyecto Expo SDK 52 con scripts WIKA y `theme.ts` desde tokens de `04`.
- **Referencia:** `proyectos/app/tower/iterations/v1/`
- **Criterio de parada:** `npm run typecheck` sin errores.

### Fase 2: Engine y Data (`MOD-01`, `MOD-03`)

- **Objetivo:** Contratos de `03-module-discovery.md`; smoke de swap/match/hint/reshuffle; 50 configs de nivel.
- **Regla:** Sin imports de React en `src/engine/`.
- **Criterio:** Smoke tests pasan; `hasValidMoves` / `reshuffle` garantizan ≥1 jugada.

### Fase 3: Persistencia e Inventario (`MOD-04`, `MOD-05`)

- **Objetivo:** Progreso, scores, histórico, recompensas; regla ≥3 ítems + 10 niveles → país siguiente.
- **Criterio:** Reinicio de app restaura estado.

### Fase 4: UI, Hint, Pánico, Verify (`MOD-02`, `MOD-06`)

- **Objetivo:** Pantallas wireframe; idle 5s; botón pánico 1×/nivel; APK release.
- **Regla:** 0% hex fuera de `theme.ts`; `npm run verify` OK.

---

## 6. Dependencias Externas

| Dependencia | Versión | Propósito |
| :--- | :--- | :--- |
| `expo` | `~52.x` | Framework |
| `react-native` | `~0.76.x` | Runtime |
| `expo-router` | `~4.x` | Navegación |
| `typescript` | `~5.x` | Tipado |
| `@react-native-async-storage/async-storage` | `~2.x` | Persistencia |

Sin Unity/Godot/Phaser.

---

## 7. Estrategia de Pruebas

| Tipo | Alcance | Comando / método |
| :--- | :--- | :--- |
| Smoke engine | Match, score, hint, reshuffle | `npm run smoke` |
| Typecheck | Proyecto completo | `npm run typecheck` |
| Build gate | Export + prebuild + APK | `npm run verify` |
| BDD manual | Escenarios `02-features.md` | Checklist QA |
| Unlock rules | Nivel por minScore; país por 10+≥3 rewards | Smoke progreso |

---

## 8. Riesgos Técnicos

| Riesgo | Probabilidad | Mitigación |
| :--- | :--- | :--- |
| Prebuild Android falla | `Media` | Scripts verify de tower; Kotlin pin |
| Scope creep (boosters/países) | `Alta` | Respetar out-of-scope `01` |
| Tablero sin jugadas | `Media` | Auto-detect + pánico / reshuffle |
| minScore imposible | `Media` | Fórmulas documentadas + smoke balance |

---

## 9. Criterios de Aprobación V1

- [ ] Features `FEAT-01`–`FEAT-07` implementadas.
- [ ] Tablero 8×10; 5 países × 10 niveles; fácil/media oculta.
- [ ] Hint 5s y pánico 1×/nivel funcionan.
- [ ] Unlock nivel por `minScore`; unlock país por 10 niveles + ≥3 recompensas.
- [x] APK Release sin Metro generado (`assembleRelease`).
- [x] `audits/auditoria-release-v1.md` registrado.
- [ ] Sideload en dispositivo físico / `review.md` arquitecto.

---

## 10. Checklist por Incremento (Quality Gate)

Antes de marcar un paso como `COMPLETADO`:

- [ ] 0% estilos hardcoded fuera de theme/tokens.
- [ ] Trazabilidad RTM respetada (feature → módulo → archivo).
- [ ] Escenario BDD asociado verificado.
- [ ] Sin errores TypeScript ni linter bloqueante.

---

## 11. Cierre de Fase de Construcción

- **Revisado por (Arquitecto):** `WIKA Lead QA / agente auditoría`
- **Fecha de activación construcción:** `2026-08-21`
- **ready_for_construction:** `true` — al cerrar V1 → `LISTO_PARA_AUDITORIA_RELEASE`

### Trazabilidad RTM resumen

```text
ERR-01 → FEAT-01 → MOD-01 → VIEW-04 → Pasos 02–03, 08
ERR-02 → FEAT-02 → MOD-03 → VIEW-02/03 → Paso 04
ERR-03 → FEAT-03 → MOD-01 → VIEW-04 → Pasos 02, 09
ERR-04 → FEAT-04 → MOD-04 → VIEW-05 → Paso 06
ERR-05 → FEAT-05 → MOD-01/02 → VIEW-04 → Pasos 03, 08
ERR-06 → FEAT-06 → MOD-05/06 → VIEW-01 → Pasos 05, 07
ERR-07 → FEAT-07 → MOD-06 → VIEW-01..05 → Paso 07
```
