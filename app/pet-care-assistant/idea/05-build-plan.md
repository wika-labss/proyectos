---
id: "BUILD-001"
title: "Plan de Construcción V1 — Pet Care Assistant"
status: "APROBADO"
version: "1.0.0"
owner: "Vissiuss / Arquitecto WIKA"
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

---

## 2. Alcance de la V1

**Features incluidas:** `FEAT-01` … `FEAT-12`  
**Features excluidas:** `FEAT-13+` (push, medicación horaria, fotos, GPS, sync, export PDF)  
**Módulos incluidos:** `MOD-01` … `MOD-10`

Package: `com.wika.petcareassistant`. Portrait. Offline. Sin permisos sensibles.

---

## 3. Cronograma de Ejecución (Build Schedule)

| Paso | Módulo | ID Feature | Archivos a crear / modificar | Tokens / estándares | Estado | Vista |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `01` | `global` / `MOD-10` | `FEAT-12` | `package.json`, `app.json`, `scripts/verify-build.sh`, `scripts/build-apk.sh` | WIKA-ARCH-02, 03, 06 (starter tower) | `PENDIENTE` | — |
| `02` | `MOD-09` | N/A | `src/constants/theme.ts` | `04` warm-care | `PENDIENTE` | — |
| `03` | `MOD-01` | `FEAT-01`, `FEAT-09` | `src/engine/petProfile.ts`, `types.ts` | coding-standards | `PENDIENTE` | — |
| `04` | `MOD-03` | `FEAT-03` | `src/engine/stoolScale.ts` | catálogo 6 códigos | `PENDIENTE` | — |
| `05` | `MOD-02` | `FEAT-02`, `03`, `04`, `11` | `src/engine/careEvents.ts` | validaciones BDD | `PENDIENTE` | — |
| `06` | `MOD-04` | `FEAT-05` | `src/engine/healthStatus.ts` | síntomas catálogo | `PENDIENTE` | — |
| `07` | `MOD-06` | `FEAT-07` | `src/engine/preventiveCalendar.ts` | dueStatus 14 días | `PENDIENTE` | — |
| `08` | `MOD-05` | `FEAT-06`, `FEAT-10` | `src/engine/dayHistory.ts` | día local YYYY-MM-DD | `PENDIENTE` | — |
| `09` | `MOD-07` | todas | `src/engine/index.ts` | orquestación + cascade delete | `PENDIENTE` | — |
| `10` | `MOD-08` | `FEAT-08` | `src/modules/offline-store/` | AsyncStorage `petcare:v1:state` | `PENDIENTE` | — |
| `11` | `integración` | `FEAT-08` | `src/hooks/CareProvider.tsx` | frontera UI↔engine | `PENDIENTE` | — |
| `12` | `MOD-09` | `FEAT-01`, `09`, `10` | `app/index.tsx`, `app/pets/*`, `src/components/` | VIEW-01, 02, 03, 10 | `PENDIENTE` | `VIEW-01`–`10` |
| `13` | `MOD-09` | `FEAT-02`–`05`, `11` | `app/log/*.tsx` | VIEW-04–07, 11 | `PENDIENTE` | `VIEW-04`–`07`, `11` |
| `14` | `MOD-09` | `FEAT-06`, `07` | `app/history.tsx`, `app/preventive.tsx` | VIEW-08, 09 | `PENDIENTE` | `VIEW-08`, `VIEW-09` |
| `15` | `integración` | BDD | `scripts/smoke-v1.ts` | NFR-01, NFR-05 | `PENDIENTE` | — |
| `16` | `MOD-10` | `FEAT-12` | verify + APK | WIKA-ARCH-05 | `PENDIENTE` | — |

---

## 4. Orden de Implementación y Justificación

1. **Setup y toolchain** — clonar estructura de `proyectos/app/tower/iterations/v1/` (WIKA-ARCH-06).
2. **Theme** — tokens warm-care antes de cualquier pantalla.
3. **Engine puro** — perfil → heces → eventos → salud → preventivos → histórico → orquestador; smoke sin UI.
4. **Store + provider** — persistencia y rehidratación.
5. **Pantallas expo-router** — home, logs, histórico, ficha, preventivos según wireframe 04.
6. **Verify + APK** — cierre de iteración.

---

## 5. Desglose por Fases

### Fase 1: Setup y Design Tokens

- **Objetivo:** Expo SDK 52 + Router + TypeScript + scripts WIKA + `theme.ts`.
- **Referencia:** `proyectos/app/tower/iterations/v1/`
- **Criterio de parada:** `npm run typecheck` sin errores.

### Fase 2: Engine y Módulos de Lógica (`MOD-01`–`MOD-07`)

- **Objetivo:** Contratos de `03-module-discovery.md`.
- **Regla:** Sin imports de React en `src/engine/`.
- **Criterio:** Smoke tests:
  - edad desde `birthDate`
  - comida/baño/paseo/nota con `petId`
  - baño heces sin consistencia → error
  - aislamiento multi-mascota
  - `getDay(petId, date)` ordena por hora
  - enfermo sin síntomas → error
  - vacuna `soon` / `overdue`
  - delete mascota cascade

### Fase 3: UI y Navegación (`MOD-09`)

- **Objetivo:** Pantallas según wireframe de `04-application-design.md`.
- **Regla:** Estilos vía theme/tokens; 0% hex sueltos en componentes.
- **Disclaimer** visible en salud.

### Fase 4: Integración, Verify y APK

- **Objetivo:** Flujos BDD de `02-features.md` verificables.
- **Regla:** `npm run verify` y APK release (WIKA-ARCH-05).

---

## 6. Dependencias Externas

| Dependencia | Versión | Propósito |
| :--- | :--- | :--- |
| `expo` | `~52.x` | Framework |
| `react-native` | `~0.76.x` | Runtime |
| `expo-router` | `~4.x` | Navegación |
| `typescript` | `~5.x` | Tipos |
| `@react-native-async-storage/async-storage` | `~2.x` (vía `npx expo install`) | Persistencia `MOD-08` |
| `expo-build-properties` | `~0.13.x` | Kotlin 1.9.25, minSdk 24 |

**Toolchain nativo (WIKA-ARCH-04):** Node 20 LTS, JDK **17**, Android minSdk 24 / compileSdk 35 / targetSdk 34, Kotlin 1.9.25.

Prohibido: `expo-notifications`, `expo-location`, cámara, clientes HTTP de analytics.

---

## 7. Estrategia de Pruebas

| Tipo | Alcance | Comando / método |
| :--- | :--- | :--- |
| Smoke engine | Perfil, eventos, heces, salud, día, preventivos, isolation | `npm run smoke` |
| Typecheck | Proyecto completo | `npm run typecheck` |
| Build gate | Export + prebuild + APK | `npm run verify` |
| BDD manual | Escenarios `02-features.md` FEAT-01–11 | Checklist QA |
| Persistencia | Kill app → reopen sin red | Manual + smoke load/save |

---

## 8. Riesgos Técnicos

| Riesgo | Probabilidad | Mitigación |
| :--- | :--- | :--- |
| Prebuild Android falla | `Media` | `post-prebuild.js` Kotlin pin (tower) |
| Scope creep (push, GPS, fotos) | `Alta` | Respetar out-of-scope de `01-problem.md` |
| Fechas timezone | `Alta` | Día local; tests con reloj inyectable |
| Storage lleno / JSON roto | `Baja` | Fallback empty + reset confirmado |
| Formularios con lógica duplicada | `Media` | Un comando engine por acción |

---

## 9. Criterios de Aprobación V1

- [ ] Todas las features obligatorias (`FEAT-01`–`FEAT-12`) implementadas.
- [ ] `npm run verify` exitoso.
- [ ] APK release generado en `iterations/v1/`.
- [ ] `review.md` completado por arquitecto.
- [ ] Listo para `auditoria-release-v1.md`.

---

## 10. Checklist por Incremento (Quality Gate)

Antes de marcar un paso como `[COMPLETADO]`:

- [ ] 0% estilos hardcoded fuera de theme/tokens.
- [ ] Trazabilidad RTM respetada (feature → módulo → archivo).
- [ ] Escenario BDD asociado verificado.
- [ ] Sin errores TypeScript ni linter bloqueante.

---

## 11. Cierre de Fase de Construcción

- **Revisado por (Arquitecto):** `________________________`
- **Fecha de finalización:** `YYYY-MM-DD`
- **ready_for_construction:** activar solo al inicio; al cerrar V1 → `[LISTO_PARA_AUDITORIA_RELEASE]`

### Orden WIKA (estado)

```
Idea → Preparación (01–05) ✓
     → Auditoría Documentación ✓
     → Auditoría Módulos ✓
     → Aprobación visual ✓
     → Auditoría Ensamblado ✓
     → Construcción iterations/v1 ✓ (smoke/typecheck/export OK)
     → Auditoría Release (APK pendiente local) ← SIGUIENTE
```
