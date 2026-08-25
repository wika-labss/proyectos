---
id: "BUILD-001"
title: "Plan de Construcción V1 — Control Central ACD"
status: "APROBADO"
version: "1.0.0"
owner: "Vissiuss / Arquitecto WIKA"
created_at: "2026-08-25"
updated_at: "2026-08-25"
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

API propia (`consultar_*` en `wdpvlmuescstqnliorkx`) es dependencia de datos; se aplica en el mismo ciclo V1 **antes** de pintar pantallas contra red.

---

## 2. Alcance de la V1

**Features incluidas:** `FEAT-01` … `FEAT-08`  
**Features excluidas:** `FEAT-09+` (web, ranking, OC, parseo acta)  
**Módulos incluidos:** `MOD-01` … `MOD-09`

Package: `com.wika.controlcentralacd`. Portrait. Red requerida para datos; offline no crashea.

---

## 3. Cronograma de Ejecución (Build Schedule)

| Paso | Módulo | ID Feature | Archivos a crear / modificar | Tokens / estándares | Estado | Vista |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `00` | API | FEAT-01–05 | RPCs Supabase `consultar_*` | SECURITY INVOKER + GRANT anon | PENDIENTE | — |
| `01` | global / MOD-09 | FEAT-08 | package.json, app.json, scripts verify/apk | WIKA-ARCH-02, 03, 06 | PENDIENTE | — |
| `02` | MOD-07 | N/A | `src/constants/theme.ts` | 04 dashboard | PENDIENTE | — |
| `03` | MOD-01 | FEAT-01 | `src/engine/filters.ts` | coding-standards | PENDIENTE | — |
| `04` | MOD-02 | FEAT-01 | `src/engine/acdApi.ts` | NFR-05 | PENDIENTE | — |
| `05` | MOD-03/04/05 | FEAT-02–05 | `resumen.ts`, `licitaciones.ts`, `ganador.ts` | mappers | PENDIENTE | — |
| `06` | MOD-06 | FEAT-06 | `src/modules/filters-store/` | AsyncStorage | PENDIENTE | — |
| `07` | integración | FEAT-01 | `FiltersProvider.tsx` | frontera UI↔engine | PENDIENTE | — |
| `08` | MOD-07/08 | FEAT-02 | `app/index.tsx`, `BarChart.tsx` | VIEW-01 | PENDIENTE | VIEW-01 |
| `09` | MOD-07 | FEAT-03 | `app/licitaciones/index.tsx` | VIEW-02 | PENDIENTE | VIEW-02 |
| `10` | MOD-07 | FEAT-04–07 | `app/licitaciones/[codigo]*` | VIEW-03, VIEW-04 | PENDIENTE | VIEW-03/04 |
| `11` | integración | BDD | `scripts/smoke-v1.ts` | NFR-01 | PENDIENTE | — |
| `12` | MOD-09 | FEAT-08 | typecheck + verify | WIKA-ARCH-05 | PENDIENTE | — |

---

## 4. Orden de Implementación y Justificación

1. **RPCs** — la UI no puede mentir con mocks de ChileCompra.
2. **Scaffold tower** — scripts APK.
3. **Engine + acdApi** — smoke sin UI.
4. **Theme + pantallas** — wireframe 04.
5. **Verify** — typecheck/smoke; APK si hay JDK 17.

---

## 5. Desglose por Fases

### Fase 0: API propia

- **Objetivo:** `consultar_rubros`, `consultar_estados`, `consultar_resumen`, `consultar_licitaciones`, `consultar_ganador`.
- **Criterio:** SQL smoke `1035-20-LE26` con ganador y acta.

### Fase 1: Setup y tokens

- **Referencia:** `proyectos/app/tower/iterations/v1/`
- **Env:** `EXPO_PUBLIC_SUPABASE_URL=https://wdpvlmuescstqnliorkx.supabase.co` + anon **mercado-publico**.

### Fase 2: Engine

- Sin React en `src/engine/`.
- Smoke: serializar filtros, mapper resumen, flags ganador.

### Fase 3: UI

- Tokens; 0% hex en componentes.
- `Linking.openURL` para acta/ficha.

### Fase 4: Verify y APK

- `npm run typecheck`, `npm run smoke`, `npm run verify` (JDK 17).

---

## 6. Dependencias Externas

| Dependencia | Versión | Propósito |
| :--- | :--- | :--- |
| `expo` | `~52.0.0` | Framework |
| `react-native` | `0.76.9` | Runtime |
| `expo-router` | `~4.0.0` | Navegación |
| `expo-linking` | `~7.0.0` | Acta / ficha |
| `expo-network` | `~7.0.0` | Offline banner |
| `@react-native-async-storage/async-storage` | `1.23.1` | Filtros |
| Postgres RPCs | `wdpvlmuescstqnliorkx` | API propia |

Sin `@supabase/supabase-js` (fetch a `/rest/v1/rpc/` como horóscopo). Sin chart libs.

---

## 7. Estrategia de Pruebas

| Tipo | Alcance | Comando / método |
| :--- | :--- | :--- |
| Smoke engine | Filtros + mappers | `npm run smoke` |
| SQL | `consultar_ganador('1035-20-LE26')` | MCP / SQL |
| Typecheck | Proyecto | `npm run typecheck` |
| Build gate | Export + prebuild + APK | `npm run verify` |
| BDD manual | 02-features | Checklist QA |

---

## 8. Riesgos Técnicos

| Riesgo | Probabilidad | Mitigación |
| :--- | :--- | :--- |
| Prebuild Android falla | Media | `post-prebuild.js` Kotlin pin |
| APK sin JDK 17 en el agente | Alta | typecheck+smoke como gate mínimo; verify si hay SDK |
| Scope creep (web/OC) | Alta | Out-of-scope de 01 |
| Anon key incorrecta | Media | Config mercado-publico, no horóscopo |

---

## 9. Criterios de Aprobación V1

- [ ] Features `FEAT-01`–`FEAT-08` implementadas.
- [ ] Cero `api.mercadopublico.cl` en `iterations/v1`.
- [ ] `npm run smoke` y `npm run typecheck` exitosos.
- [ ] APK release si el entorno lo permite.
- [ ] Listo para `auditoria-release-v1.md`.

---

## 10. Checklist por Incremento (Quality Gate)

Antes de marcar un paso como `[COMPLETADO]`:

- [ ] 0% estilos hardcoded fuera de theme/tokens.
- [ ] Trazabilidad RTM respetada.
- [ ] Escenario BDD asociado verificado.
- [ ] Sin errores TypeScript bloqueantes.

---

## 11. Cierre de Fase de Construcción

- **Revisado por (Arquitecto):** `Vissiuss`
- **Fecha de finalización:** `2026-08-25`
- **ready_for_construction:** `true`
