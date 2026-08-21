---
id: "BUILD-001"
title: "Chess Wars — Plan de Construcción V1"
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

**Estado actual:** Gates 1–3B aprobados; `ready_for_construction: true`.

---

## 2. Alcance de la V1

**Features incluidas:** `FEAT-01` … `FEAT-07`  
**Features excluidas:** `FEAT-08+` (tablas avanzadas, elegir bando, IA hard, resume mid-game)  
**Módulos incluidos:** `MOD-01` … `MOD-05`

---

## 3. Cronograma de Ejecución (Build Schedule)

| Paso | Módulo | ID Feature | Archivos a crear / modificar | Tokens / estándares | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `01` | `global` | N/A | `iterations/v1/` scaffold Expo (`package.json`, `app.json`, scripts verify) | WIKA-ARCH-02, 03 | `PENDIENTE` |
| `02` | `MOD-01` | `FEAT-01` | `src/engine/chessEngine.ts`, `types.ts`, smoke reglas | `coding-standards.md` | `PENDIENTE` |
| `03` | `MOD-02` | `FEAT-02` | `src/engine/chessAi.ts` Fácil/Media | engine puro | `PENDIENTE` |
| `04` | `MOD-03` | `FEAT-03` | `src/data/battles.ts` (10 batallas) | contrato 01 | `PENDIENTE` |
| `05` | `MOD-04` | `FEAT-06` | `src/modules/progress/` AsyncStorage | offline | `PENDIENTE` |
| `06` | `MOD-05` | `FEAT-07` | `theme.ts` + Home / Campaña / Cómo jugar | `04` tokens | `PENDIENTE` |
| `07` | `MOD-05` | `FEAT-04`, `FEAT-05` | `ChessBoard`, `GameScreen`, `ResultScreen` | board/legal/selected | `PENDIENTE` |
| `08` | `integración` | `FEAT-01`–`07` | Flujos BDD; campaña + rápida | BDD `02` | `PENDIENTE` |
| `09` | `release` | N/A | `npm run typecheck` + `verify` + APK | WIKA-ARCH-05 | `PENDIENTE` |

---

## 4. Orden de Implementación y Justificación

1. **Setup y toolchain** — base reproducible (`tower/iterations/v1/` o `chupalo joako/iterations/v1/`).
2. **Engine puro** — reglas FIDE básicas sin UI.
3. **IA** — solo movimientos legales; profundidad acotada.
4. **Data campaña + persistencia**.
5. **Theme y pantallas** — según wireframes `04`.
6. **Integración partida + resultados**.
7. **Verify + APK** — cierre V1.

---

## 5. Desglose por Fases

### Fase 1: Setup y Design Tokens

- **Objetivo:** Proyecto Expo SDK 52 con scripts WIKA y `theme.ts` desde tokens de `04`.
- **Referencia:** `proyectos/app/tower/iterations/v1/`
- **Criterio de parada:** `npm run typecheck` sin errores.

### Fase 2: Engine y AI (`MOD-01`, `MOD-02`)

- **Objetivo:** Contratos de `03-module-discovery.md`; smoke de movimientos, jaque, mate, enroque, al paso, promoción.
- **Regla:** Sin imports de React en `src/engine/`.
- **Criterio:** Smoke tests pasan; IA solo elige legales.

### Fase 3: Campaña y Persistencia (`MOD-03`, `MOD-04`)

- **Objetivo:** 10 batallas; unlock secuencial; restore offline.
- **Criterio:** Reinicio de app restaura `maxUnlockedBattle`.

### Fase 4: UI, Integración, Verify (`MOD-05`)

- **Objetivo:** Pantallas wireframe; partida táctil; APK release.
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

Sin Stockfish nativo, Unity/Godot/Phaser.

---

## 7. Estrategia de Pruebas

| Tipo | Alcance | Comando / método |
| :--- | :--- | :--- |
| Smoke engine | Movimientos, mate, ahogado, IA legal | `npm run smoke` |
| Typecheck | Proyecto completo | `npm run typecheck` |
| Build gate | Export + prebuild + APK | `npm run verify` |
| BDD manual | Escenarios `02-features.md` | Checklist QA |
| Campaña | Unlock 1→10 tras victorias | Smoke progreso |

---

## 8. Riesgos Técnicos

| Riesgo | Probabilidad | Mitigación |
| :--- | :--- | :--- |
| Prebuild Android falla | `Media` | Scripts verify de tower; Kotlin pin |
| Scope creep (variantes/IA hard) | `Alta` | Respetar out-of-scope `01` |
| Bugs de reglas especiales | `Alta` | Smoke posiciones canónicas |
| IA bloquea UI | `Media` | Profundidad acotada; yield en turno |

---

## 9. Criterios de Aprobación V1

- [ ] Features `FEAT-01`–`FEAT-07` implementadas.
- [ ] Motor FIDE básico + IA Fácil/Media.
- [ ] Campaña 10 batallas con unlock secuencial.
- [ ] Partida rápida y resultados.
- [ ] `npm run verify` exitoso; APK Release sin Metro.
- [ ] `review.md` completado por arquitecto.

---

## 10. Checklist por Incremento (Quality Gate)

Antes de marcar un paso como `COMPLETADO`:

- [ ] 0% estilos hardcoded fuera de theme/tokens.
- [ ] Trazabilidad RTM respetada (feature → módulo → archivo).
- [ ] Escenario BDD asociado verificado.
- [ ] Sin errores TypeScript ni linter bloqueante.

---

## 11. Cierre de Fase de Construcción

- **Revisado por (Arquitecto):** `________________________`
- **Fecha de finalización:** `YYYY-MM-DD`
- **ready_for_construction:** `true` (activado al pasar Gates 1–3B); al cerrar V1 → `LISTO_PARA_AUDITORIA_RELEASE`

### Trazabilidad RTM resumen

```text
ERR-01 → FEAT-01 → MOD-01 → VIEW-03 → Paso 02
ERR-02 → FEAT-02 → MOD-02 → VIEW-03 → Paso 03
ERR-03 → FEAT-03 → MOD-03 → VIEW-02 → Paso 04
ERR-04 → FEAT-04 → MOD-05 → VIEW-03 → Paso 07
ERR-05 → FEAT-05 → MOD-05 → VIEW-01/04/05 → Pasos 06–07
ERR-06 → FEAT-06 → MOD-04 → VIEW-02 → Paso 05
ERR-07 → FEAT-07 → MOD-05 → VIEW-01..05 → Paso 06
```
