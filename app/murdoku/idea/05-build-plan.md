---
id: "BUILD-001"
title: "Plan de Construcción V1 — Murdoku"
status: "APROBADO"
version: "1.0.0"
owner: "Vissiuss / Arquitecto WIKA"
created_at: "2026-08-24"
updated_at: "2026-08-24"
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

---

## 2. Alcance de la V1

**Features incluidas:** `FEAT-01` … `FEAT-09`  
**Features excluidas:** `FEAT-10`+ (coartadas, hint, notes, procedural, audio, dossier)  
**Módulos incluidos:** `MOD-01` … `MOD-08`  
**Contenido mínimo:** 4 habitaciones (Biblioteca, Cocina, Sótano, Jardín); tamaños 4×4, 6×6, 9×9.

---

## 3. Cronograma de Ejecución (Build Schedule)

| Paso | Módulo | ID Feature | Archivos a crear / modificar | Tokens / estándares | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `01` | `global` / `MOD-08` | `FEAT-09` | `package.json`, `app.json`, `scripts/verify-build.sh`, `scripts/build-apk.sh`, `scripts/smoke-v1.ts` | WIKA-ARCH-02, 03 | `PENDIENTE` |
| `02` | `MOD-03` | `FEAT-03` | `src/engine/boardSizes.ts` | coding-standards | `PENDIENTE` |
| `03` | `MOD-02` | `FEAT-02` | `src/engine/crimePieces.ts` | coding-standards | `PENDIENTE` |
| `04` | `MOD-01` | `FEAT-01`, `FEAT-06` | `src/engine/murdokuEngine.ts`, `types.ts`, `validate.ts` | coding-standards | `PENDIENTE` |
| `05` | `MOD-05` | `FEAT-05` | `src/engine/roomFlavor.ts` / `src/content/rooms.ts` | content | `PENDIENTE` |
| `06` | `MOD-04` | `FEAT-04` | `src/engine/roomCampaign.ts` + puzzles givens/solution | coding-standards | `PENDIENTE` |
| `07` | `MOD-06` | `FEAT-07` | `src/storage/offlineProgress.ts` | AsyncStorage | `PENDIENTE` |
| `08` | `theme` | `FEAT-08` | `src/constants/theme.ts` | `04-application-design.md` | `PENDIENTE` |
| `09` | `MOD-07` | `FEAT-08` | `app/index.tsx`, `app/map.tsx`, `app/case/[roomId].tsx` | theme tokens | `PENDIENTE` |
| `10` | `MOD-07` | `FEAT-01`–`06` | `app/play/[roomId].tsx`, `CrimeBoard`, `PieceTray` | theme + BDD | `PENDIENTE` |
| `11` | `MOD-07` | `FEAT-04` | `app/victory/[roomId].tsx` | theme | `PENDIENTE` |
| `12` | `integración` | todas | hooks/provider, smoke puzzles únicos | BDD `02-features.md` | `PENDIENTE` |
| `13` | `MOD-08` | `FEAT-09` | `npm run typecheck` + `verify` + APK | WIKA-ARCH-05 | `PENDIENTE` |

---

## 4. Orden de Implementación y Justificación

1. **Setup y toolchain** — base reproducible (`tower` / `match-3` v1).
2. **Geometría + piezas + engine** — lógica testeable sin UI.
3. **Campaña + flavor + puzzles** — contenido V1 con `validatePuzzle`.
4. **Persistencia** — unlock entre sesiones.
5. **Theme + pantallas** — según wireframes de `04`.
6. **Verify + APK** — cierre de iteración.

---

## 5. Desglose por Fases

### Fase 1: Setup y Design Tokens

- **Objetivo:** Expo SDK 52, scripts WIKA, `theme.ts` noir mansion, package `com.wika.murdoku`.
- **Referencia:** `proyectos/app/tower/iterations/v1/` y `match-3/iterations/v1/`
- **Criterio de parada:** `npm run typecheck` sin errores.

### Fase 2: Engine y contenido (`MOD-01`–`05`)

- **Objetivo:** Contratos de `03-module-discovery.md`; 4 puzzles con solución única.
- **Regla:** Sin React en `src/engine/`.
- **Criterio:** Smoke engine + `validatePuzzle` por room pasan.

### Fase 3: UI y navegación (`MOD-07`) + persistencia (`MOD-06`)

- **Objetivo:** Home → mapa → intro → play → victory; unlock persistente.
- **Regla:** Estilos vía theme; 0% hex sueltos; celdas ≥ 44 dp.

### Fase 4: Verify y APK (`MOD-08`)

- **Objetivo:** BDD de `02-features.md` verificables; APK release.
- **Regla:** `npm run verify` exitoso.

---

## 6. Dependencias Externas

| Dependencia | Versión | Propósito |
| :--- | :--- | :--- |
| `expo` | `~52.x` | Framework |
| `react-native` | `~0.76.x` | Runtime |
| `expo-router` | `~4.x` | Navegación |
| `@react-native-async-storage/async-storage` | `~1.x` / pin WIKA | Progreso offline |
| `typescript` | `~5.x` | Tipado |

Sin otras SDKs de red, ads o analytics.

---

## 7. Estrategia de Pruebas

| Tipo | Alcance | Comando / método |
| :--- | :--- | :--- |
| Smoke engine | conflictos, solve, tamaños, sets | `npm run smoke` |
| Validate puzzles | solución única por room | smoke / script |
| Typecheck | proyecto | `npm run typecheck` |
| Build gate | export + prebuild + APK | `npm run verify` |
| BDD manual | escenarios `02-features.md` | Checklist QA |

---

## 8. Riesgos Técnicos

| Riesgo | Probabilidad | Mitigación |
| :--- | :--- | :--- |
| Prebuild Android falla | `Media` | `post-prebuild.js` / scripts tower |
| Scope creep (coartadas, novela) | `Alta` | Out-of-scope 01/02; FEAT-10+ diferidas |
| Puzzle inválido en catálogo | `Media` | Gate smoke antes de UI |
| 9×9 UX en móvil | `Media` | Layout + touch targets en 04 |

---

## 9. Criterios de Aprobación V1

- [ ] Features `FEAT-01`–`FEAT-09` implementadas.
- [ ] ≥ 4 habitaciones jugables con unlock secuencial.
- [ ] Tableros 4×4, 6×6 y 9×9 presentes en la campaña.
- [ ] `npm run verify` exitoso.
- [ ] APK release en `iterations/v1/`.
- [ ] `review.md` por arquitecto.
- [ ] Listo para `auditoria-release-v1.md`.

---

## 10. Checklist por Incremento (Quality Gate)

Antes de marcar un paso como `COMPLETADO`:

- [ ] 0% estilos hardcoded fuera de theme/tokens.
- [ ] Trazabilidad RTM (feature → módulo → archivo).
- [ ] Escenario BDD asociado verificado.
- [ ] Sin errores TypeScript ni linter bloqueante.

---

## 11. Cierre de Fase de Construcción

- **Revisado por (Arquitecto):** `________________________`
- **Fecha de finalización:** `YYYY-MM-DD`
- **ready_for_construction:** activar solo al inicio de build tras gates; al cerrar V1 → `LISTO_PARA_AUDITORIA_RELEASE`
