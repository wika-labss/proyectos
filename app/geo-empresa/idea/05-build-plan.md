---
id: "BUILD-001"
title: "Geo Empresa — Plan de construcción V1 seguridad de flota"
status: "BORRADOR"
version: "2.0.0"
owner: "Vissiuss / Arquitecto WIKA"
created_at: "2026-09-24"
updated_at: "2026-09-24"
audit_1_passed: false
audit_2_passed: false
visual_approval_passed: false
audit_3_passed: false
ready_for_construction: false
---

# [05] Plan de Construcción V1 (Build Plan)

> **Bloqueo:** Si `ready_for_construction: false`, queda prohibido crear o modificar código en `iterations/v1/src/`, `iterations/v1/app/` y `admin/v1/` (salvo este contrato documental).  
> **Activación:** `ready_for_construction: true` solo cuando los cuatro flags anteriores sean `true`, firmados por el arquitecto.  
> Un agente IA no activa estos flags.

## 1. Verificación de Pre-requisitos

- [ ] Auditoría de Documentación: `audit_1_passed == true` (`auditoria-documentacion.md`)
- [ ] Auditoría de Módulos: `audit_2_passed == true` (`auditoria-modulos.md`)
- [ ] Aprobación visual: `visual_approval_passed == true` (`04-application-design.md`)
- [ ] Auditoría de Ensamblado: `audit_3_passed == true` (`auditoria-ensamblado.md`)

Hoy los cuatro están en `false`. Este documento solo define el orden **post-gates**.

---

## 2. Alcance de la V1

**Features incluidas:** `FEAT-01` … `FEAT-11`  
**Features excluidas:** `FEAT-12`–`FEAT-16` (push, wipe, multi-tenant, iOS)  
**Módulos incluidos:** `MOD-01` … `MOD-11`

**Entregables de construcción (después del gate):**

- `iterations/v1/` — agente Expo SDK 52, package `com.wika.geoempresa`
- `admin/v1/` — panel Next.js + `@supabase/ssr`
- Apply remoto de `supabase/migrations/003_security_fleet.sql` (001/002 ya están en el contrato; 003 es el delta)

---

## 3. Cronograma de Ejecución (Build Schedule)

| Paso | Módulo | ID Feature | Archivos a crear / modificar | Tokens / estándares | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `01` | backend | FEAT-08–11 | Apply `003_security_fleet.sql` en `ugzprmopgmbjjxsbjmti`; seed `perfiles` TI (fuera del git) | RLS / RPCs | `PENDIENTE` |
| `02` | global agente | N/A | `iterations/v1/` scaffold (tower v1): `package.json` `~`, `app.json`, `scripts/verify-build.sh` | WIKA-ARCH-02, 03, 04 | `PENDIENTE` |
| `03` | MOD-03, 04, 05 | FEAT-03–05, 09 | `src/engine/fence.ts`, `deviceState.ts`, `geoApi.ts` + smokes | coding-standards | `PENDIENTE` |
| `04` | MOD-01, 06 | FEAT-01 | `app/register.tsx`, `src/modules/registration/` | theme.ts | `PENDIENTE` |
| `05` | MOD-07 | FEAT-06–08 | Expo module Kotlin + config plugin `device_admin.xml` | minSdk 24, Kotlin 1.9.25 | `PENDIENTE` |
| `06` | MOD-02, 08 | FEAT-02, 07, 08 | location-agent + command-agent | NFR-04 | `PENDIENTE` |
| `07` | UI agente | FEAT-06, 09 | `app/index.tsx` banners enrollment | `04` VIEW-02 | `PENDIENTE` |
| `08` | global panel | FEAT-10, 11 | `admin/v1/` Next.js, theme, auth | `@supabase/ssr` | `PENDIENTE` |
| `09` | MOD-09, 11 | FEAT-10 | flota, detalle, enrollment, comandos | `04` VIEW-03–06 | `PENDIENTE` |
| `10` | integración | FEAT-01–11 | BDD manual + `npm run verify` + APK release | WIKA-ARCH-05 | `PENDIENTE` |

---

## 4. Orden de Implementación y Justificación

1. **Schema/RPCs** — el agente y el panel no pueden mentir sobre columnas que no existen.
2. **Scaffold agente** — toolchain WIKA (tower) antes de nativo.
3. **Engine TS** — `shouldLock` / fence testeable sin Device Owner.
4. **Módulo Kotlin** — único I/O de `DevicePolicyManager`.
5. **Agentes background** — ping + poll despachan al nativo.
6. **UI agente** — no finge seguridad si no hay Owner.
7. **Panel** — Auth primero, luego flota/comandos.
8. **Verify + APK** — cierre; lab `dpm set-device-owner`.

---

## 5. Desglose por Fases

### Fase 1: Backend contrato

- **Objetivo:** `003` aplicado; un usuario `perfiles.rol = ti`.
- **Criterio de parada:** RPCs responden en el SQL editor (agente con anon de prueba; TI con JWT).

### Fase 2: Engine y API agente (`MOD-03`–`MOD-05`)

- **Objetivo:** Contratos de `03-module-discovery.md`.
- **Regla:** Sin React en `src/engine/`.
- **Criterio:** `scripts/smoke-*.ts` pasan.

### Fase 3: Nativo policy (`MOD-07`)

- **Objetivo:** `lockNow`, `reboot`, token + `resetPasswordWithToken`, `isDeviceOwnerApp`.
- **Regla:** Manifest solo por config plugin.
- **Criterio:** Lab Owner: lock y reboot; sideload: fail seguro.

### Fase 4: UI agente + background (`MOD-01`, `02`, `06`, `08`)

- **Objetivo:** Registro, banners, ping 10 min, poll 30–60 s.
- **Regla:** Estilos vía `theme.ts`; 0% hex sueltos.

### Fase 5: Panel TI (`MOD-09`–`MOD-11`)

- **Objetivo:** Login, flota, aprobar, comandos, página enrollment.
- **Regla:** Sin `service_role` en el cliente; PIN no se re-lista.

### Fase 6: Verify y APK

- **Objetivo:** `npm run typecheck` + `npm run verify` + APK release.
- **Regla:** WIKA-ARCH-05. Checklist BDD de `02-features.md`.

---

## 6. Dependencias Externas

| Dependencia | Versión | Propósito |
| :--- | :--- | :--- |
| `expo` | `~52.x` | Framework agente |
| `react-native` | `~0.76.x` | Runtime |
| `expo-router` | `~4.x` | Navegación agente |
| `expo-dev-client` | `~5.x` | Prebuild / módulo nativo |
| `expo-location` | `~18.x` | GPS background |
| `@react-native-async-storage/async-storage` | `~1.23` | Store |
| Next.js | `~15` (pin `~`, no `^` en lockfile de criterio WIKA si se alinea) | Panel |
| `@supabase/ssr` | pin `~` | Auth panel |
| JDK | 17 | APK |
| Kotlin | 1.9.25 | `MOD-07` |
| minSdk | 24 | Android 7 |

Prohibido `^` en expo/react-native.

---

## 7. Estrategia de Pruebas

| Tipo | Alcance | Comando / método |
| :--- | :--- | :--- |
| Smoke engine | fence, deviceState, geoApi types | `npm run smoke` |
| Typecheck | agente + admin | `npm run typecheck` |
| Build gate | Export + prebuild + APK | `npm run verify` |
| SQL contrato | RPCs en proyecto staging/lab | SQL editor; no producción hasta gate |
| BDD lab Owner | Escenarios 1–6 de `01` | Teléfono factory reset |
| BDD sideload | Escenario 7 | APK sin `dpm` |

---

## 8. Riesgos Técnicos

| Riesgo | Probabilidad | Mitigación |
| :--- | :--- | :--- |
| Apply 003 sobre RPCs 002 ya existentes | Alta | `CREATE OR REPLACE`; probar en branch de Supabase |
| Prebuild no mergea receiver | Media | Config plugin + inspect de manifest post-prebuild |
| OEM mata background | Media | Foreground service documentado en implementación |
| Reset PIN API 24 vs 26+ | Media | Branch en `MOD-07` |
| Comando tarda hasta 60 s | Alta | Copy en panel: “se aplica en el próximo poll” |
| Scope creep (wipe, push, iOS) | Alta | Respetar out-of-scope de `01` |

---

## 9. Criterios de Aprobación V1

- [ ] Features `FEAT-01`–`FEAT-11` implementadas.
- [ ] `npm run verify` exitoso en el agente.
- [ ] APK release en `iterations/v1/`.
- [ ] Panel typecheck; login TI y un ciclo aprobar → lock → unlock_policy → reset_pin en lab Owner.
- [ ] `review.md` del arquitecto.
- [ ] Listo para `auditoria-release-v1.md`.

---

## 10. Checklist por Incremento (Quality Gate)

Antes de marcar un paso como `COMPLETADO`:

- [ ] 0% estilos hardcoded fuera de theme/tokens.
- [ ] Trazabilidad RTM (feature → módulo → archivo).
- [ ] Escenario BDD asociado verificado o N/A justificado (docs).
- [ ] Sin errores TypeScript ni linter bloqueante.
- [ ] Engine sin imports React / Android.

---

## 11. Cierre de Fase de Construcción

- **Revisado por (Arquitecto):** `________________________`
- **Fecha de finalización:** `YYYY-MM-DD`
- **ready_for_construction:** `false` → `true` solo al **inicio** de construcción, cuando §1 esté completo (solo arquitecto humano)
