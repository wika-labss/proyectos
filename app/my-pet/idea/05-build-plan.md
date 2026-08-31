---
id: "BUILD-001"
title: "Plan de Construcción V1 — my Pet"
status: "APROBADO"
version: "1.0.0"
owner: "Vissiuss"
created_at: "2026-08-31"
updated_at: "2026-08-31"
audit_1_passed: true
audit_2_passed: true
visual_approval_passed: true
audit_3_passed: true
ready_for_construction: true
---

# [05] Plan de Construcción V1 (Build Plan)

> **Activación:** `ready_for_construction: true` — stakeholder solicitó generar V1 + web de prueba.

## 1. Verificación de Pre-requisitos

- [x] Auditoría de Documentación: `audit_1_passed == true`
- [x] Auditoría de Módulos: `audit_2_passed == true`
- [x] Aprobación visual: `visual_approval_passed == true`
- [x] Auditoría de Ensamblado: `audit_3_passed == true`

---

## 2. Alcance de la V1

**Features incluidas:** `FEAT-01`, `FEAT-02`, `FEAT-03`, `FEAT-04`, `FEAT-05`  
**Features excluidas:** `FEAT-06+` (push prod, foto, dominio HTTPS, chat)  
**Módulos incluidos:** `MOD-01` … `MOD-06`

---

## 3. Cronograma de Ejecución (Build Schedule)

| Paso | Módulo | ID Feature | Archivos a crear / modificar | Tokens / estándares | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `01` | global | N/A | `package.json`, `app.json`, scripts verify | WIKA-ARCH-02, 03 | COMPLETADO |
| `02` | MOD-01/02/04 | FEAT-01/02/04 | `src/engine/*` | coding-standards | COMPLETADO |
| `03` | MOD-05/03 | FEAT-03/05 | `web/server.ts`, HTML landing | theme (CSS espejo) | COMPLETADO |
| `04` | MOD-06 | FEAT-01–04 | `app/*`, components, PetProvider | theme.ts | COMPLETADO |
| `05` | integración | FEAT-05 | smoke + smoke:web | BDD 02 | COMPLETADO |

---

## 4. Orden de Implementación y Justificación

1. Setup Expo SDK 52 (starter pet-care / tower).
2. Engine puro testeable.
3. Servidor web de prueba (landing + API) importando el engine.
4. UI dueño + polling.
5. Smoke engine + HTTP.

---

## 5. Desglose por Fases

### Fase 1: Setup y Design Tokens

- **Objetivo:** Proyecto Expo + `theme.ts` my Pet.
- **Criterio:** `npm run typecheck`

### Fase 2: Engine (`MOD-01`, `MOD-02`, `MOD-04`)

- **Regla:** Sin React en `src/engine/`.
- **Criterio:** `npm run smoke`

### Fase 3: Web de prueba (`MOD-03`, `MOD-05`)

- **Objetivo:** `npm run web` sirve `/p/demo-luna`.
- **Criterio:** `npm run smoke:web`

### Fase 4: UI y APK

- **Objetivo:** Flujos BDD verificables.
- **APK:** `scripts/build-apk.sh` (JDK 17 + SDK local).

---

## 6. Dependencias Externas

| Dependencia | Versión | Propósito |
| :--- | :--- | :--- |
| `expo` | `~52.0.0` | Framework |
| `react-native` | `0.76.9` | Runtime |
| `expo-router` | `~4.0.0` | Navegación |
| `expo-location` | `~18.0.0` | GPS casa |
| `qrcode` | `~1.5.4` | PNG del QR (servidor) |
| `tsx` | dev | smoke + server TS |

---

## 7. Estrategia de Pruebas

| Tipo | Alcance | Comando |
| :--- | :--- | :--- |
| Smoke engine | Lógica pura | `npm run smoke` |
| Smoke web | Landing + API | `npm run smoke:web` |
| Typecheck | Proyecto | `npm run typecheck` |
| Verify local | smoke + types + web | `npm run verify` |
| APK | assembleRelease | `npm run apk` |

---

## 8. Riesgos Técnicos

| Riesgo | Probabilidad | Mitigación |
| :--- | :--- | :--- |
| Teléfono no alcanza localhost | Alta | Settings URL + 10.0.2.2 emulator + LAN |
| Geolocalación browser bloqueada | Alta | Botón ubicación de prueba |
| APK en CI sin SDK | Alta | verify no exige Gradle; apk es paso local |

---

## 9. Criterios de Aprobación V1

- [x] Features obligatorias implementadas en código
- [ ] `npm run verify` (a ejecutar en construcción)
- [ ] APK release (local, JDK 17)
- [ ] `review.md` del arquitecto post-verify
- [ ] Listo para `auditoria-release-v1.md` tras APK

---

## 10. Checklist por Incremento (Quality Gate)

- [x] Hex solo en theme.ts / CSS espejo documentado
- [x] Trazabilidad RTM
- [x] Escenarios BDD cubiertos por smoke
- [x] Engine sin React

---

## 11. Cierre de Fase de Construcción

- **Revisado por (Arquitecto):** Vissiuss
- **Fecha de finalización:** 2026-08-31
- **ready_for_construction:** `true`
