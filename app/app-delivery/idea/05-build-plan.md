---
id: "BUILD-001"
title: "[Plan de Construcción V1 y Hoja de Ruta Técnica]"
status: "BORRADOR"
version: "1.0.0"
owner: "[Lead Developer / Arquitecto]"
created_at: "YYYY-MM-DD"
updated_at: "YYYY-MM-DD"
audit_1_passed: false
audit_2_passed: false
visual_approval_passed: false
audit_3_passed: false
ready_for_construction: false
---

# [05] Plan de Construcción V1 (Build Plan)

> **Bloqueo:** Si `ready_for_construction: false`, queda prohibido crear o modificar código en `iterations/v1/src/` y `iterations/v1/app/`.  
> **Activación:** `ready_for_construction: true` solo cuando los cuatro flags anteriores sean `true`.

## 1. Verificación de Pre-requisitos

- [ ] Auditoría de Documentación: `audit_1_passed == true` (`auditoria-documentacion.md`)
- [ ] Auditoría de Módulos: `audit_2_passed == true` (`auditoria-modulos.md`)
- [ ] Aprobación visual: `visual_approval_passed == true` (`04-application-design.md`)
- [ ] Auditoría de Ensamblado: `audit_3_passed == true` (`auditoria-ensamblado.md`)

---

## 2. Alcance de la V1

**Features incluidas:** `[FEAT-01, FEAT-02, ...]`  
**Features excluidas:** `[FEAT-03+, deseables]`  
**Módulos incluidos:** `[MOD-01, MOD-02, ...]`

---

## 2b. Prototipo (modo `exploration`)

Si `project_mode: exploration` en `01-problem.md`:

- Código solo bajo `iterations/prototype/`.
- Scripts según [`iteration-environment-spec.md`](../docs/iteration-environment-spec.md).
- **Prohibido** `ready_for_construction: true` y `final/` hasta promoción a construcción.

---

## 2c. Canales de entrega

| Canal | Verify / artefacto | Estándar |
| :--- | :--- | :--- |
| `android` | APK vía `wika-build-artifact.mjs` | [`coding-standards.md`](../standards/coding-standards.md) |
| `web` | `dist/` static | [`coding-standards-web.md`](../standards/coding-standards-web.md) |

---

## 3. Cronograma de Ejecución (Build Schedule)

| Paso | Módulo | ID Feature | Archivos a crear / modificar | Tokens / estándares | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `01` | `global` | N/A | `package.json`, `app.json`, `scripts/verify-build.sh` | WIKA-ARCH-02, 03 | `[PENDIENTE]` |
| `02` | `MOD-01` | `FEAT-01` | `src/engine/[nombre].ts` | `coding-standards.md` | `[PENDIENTE]` |
| `03` | `MOD-02` | `FEAT-01` | `app/index.tsx`, `src/components/` | `design-system.md`, `theme.ts` | `[PENDIENTE]` |
| `04` | `MOD-01` | `FEAT-02` | `src/modules/[persistencia]/` | AsyncStorage | `[PENDIENTE]` |
| `05` | `integración` | `FEAT-01/02` | `app/play.tsx`, hooks | BDD `02-features.md` | `[PENDIENTE]` |

---

## 4. Orden de Implementación y Justificación

1. **Setup y toolchain** — base reproducible (tower v1 como referencia).
2. **Engine puro** — lógica testeable sin UI.
3. **Theme y componentes** — según `04-application-design.md`.
4. **Pantallas expo-router** — ensamblado con hooks/providers.
5. **Persistencia e integración** — features secundarias.
6. **Verify + APK** — cierre de iteración.

---

## 5. Desglose por Fases

### Fase 1: Setup y Design Tokens

- **Objetivo:** Proyecto Expo con scripts WIKA y `theme.ts` desde tokens documentados.
- **Referencia:** `proyectos/app/tower/iterations/v1/`
- **Criterio de parada:** `npm run typecheck` sin errores.

### Fase 2: Engine y Módulos de Lógica (`MOD-01`)

- **Objetivo:** Implementar contratos de `03-module-discovery.md`.
- **Regla:** Sin imports de React en `src/engine/`.
- **Criterio:** Smoke tests en `scripts/smoke-*.ts` pasan.

### Fase 3: UI y Navegación (`MOD-02`)

- **Objetivo:** Pantallas según wireframe aprobado en `04-application-design.md`.
- **Regla:** Estilos vía theme/tokens; 0% hex sueltos en componentes.

### Fase 4: Integración, Verify y APK

- **Objetivo:** Flujos BDD de `02-features.md` verificables manualmente.
- **Regla:** `npm run verify` y APK release exitoso (WIKA-ARCH-05).

---

## 6. Dependencias Externas

| Dependencia | Versión | Propósito |
| :--- | :--- | :--- |
| `expo` | `~52.x` | Framework |
| `react-native` | `~0.76.x` | Runtime |
| `expo-router` | `~4.x` | Navegación |
| `[otras]` | `~x.x` | `[Propósito]` |

---

## 7. Estrategia de Pruebas

| Tipo | Alcance | Comando / método |
| :--- | :--- | :--- |
| Smoke engine | Lógica pura | `npm run smoke` |
| Typecheck | Proyecto completo | `npm run typecheck` |
| Build gate | Export + prebuild + APK | `npm run verify` |
| BDD manual | Escenarios `02-features.md` | Checklist QA |

---

## 8. Riesgos Técnicos

| Riesgo | Probabilidad | Mitigación |
| :--- | :--- | :--- |
| `[Prebuild Android falla]` | `Media` | `post-prebuild.js` Kotlin pin |
| `[Scope creep]` | `Alta` | Respetar out-of-scope de `01-problem.md` |

---

## 9. Criterios de Aprobación V1

- [ ] Todas las features obligatorias implementadas.
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
