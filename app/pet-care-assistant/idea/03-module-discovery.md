---
id: "MOD-001"
title: "Descubrimiento y Arquitectura de Módulos — Pet Care Assistant"
status: "BORRADOR"
version: "1.0.0"
owner: "Vissiuss / Arquitecto WIKA"
created_at: "2026-08-21"
updated_at: "2026-08-21"
audit_1_passed: false
audit_2_passed: false
---

# [03] Descubrimiento y Especificación de Arquitectura Modular

> **Pre-requisito:** `audit_1_passed: true` en `01-problem.md` y `02-features.md`.  
> **Equivalencia:** Auditoría de Módulos → `docs/auditoria-modulos.md`.

## 1. Identificación y Documentos Base

- **Nombre del Proyecto:** `Pet Care Assistant`
- **Especificaciones base:** `01-problem.md` (`PROB-001`) | `02-features.md` (`FEAT-001`)
- **Estado de gatekeeping:** `PENDIENTE_AUDITORIA_MODULOS`

---

## 2. Matriz de Trazabilidad Modular (RTM 1:1)

| ID Módulo | ID Feature (`02-features.md`) | ID Problema (`01-problem.md`) | Nombre del Módulo | Tipo | Responsabilidad Principal |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `MOD-01` | `FEAT-01`, `FEAT-09` | `ERR-07`, `ERR-09` | `mod-pet-profile` | `engine / lógica` | Ficha, tipos, edad, multi-mascota |
| `MOD-02` | `FEAT-02`, `FEAT-03`, `FEAT-04`, `FEAT-11` | `ERR-01`, `ERR-02`, `ERR-03` | `mod-care-events` | `engine / lógica` | Alta/listado de eventos de cuidado |
| `MOD-03` | `FEAT-03` | `ERR-02` | `mod-stool-scale` | `engine / datos` | Catálogo y semántica de consistencia |
| `MOD-04` | `FEAT-05` | `ERR-04` | `mod-health-status` | `engine / lógica` | Estado sano/enfermo/recuperación + síntomas |
| `MOD-05` | `FEAT-06`, `FEAT-10` | `ERR-05` | `mod-day-history` | `engine / lógica` | Consulta por fecha y resumen del día |
| `MOD-06` | `FEAT-07` | `ERR-06` | `mod-preventive-calendar` | `engine / lógica` | Vacunas y desparasitación |
| `MOD-07` | `FEAT-01`–`FEAT-11` | `ERR-01`–`ERR-09` | `mod-pet-engine` | `engine / orquestación` | Estado puro, validaciones, reducers |
| `MOD-08` | `FEAT-08` | `ERR-08` | `mod-offline-store` | `infra` | Persistencia AsyncStorage |
| `MOD-09` | `FEAT-10` + UI de todas | — | `mod-care-ui` | `UI / presentación` | Pantallas, CTAs, badges, navegación |
| `MOD-10` | `FEAT-12` | — | `mod-android-release` | `infra` | Pipeline APK Release WIKA |

---

## 3. Desglose de Arquitectura Modular

### Módulo `MOD-01`: `mod-pet-profile`

**Patrón:** Pure engine / catalog  
**Ruta en repositorio:** `src/engine/petProfile.ts`

#### Contrato

- **Entradas:** `CreatePetInput` (`name`, `type`, `breed?`, `sex?`, `birthDate`, `birthDateEstimated?`, `weightKg?`)
- **Salidas:** `Pet` (`id`, campos de ficha, `createdAt`); `ageFromBirthDate(birthDate, now): { years, months }`
- **Dependencias:** ninguna (puro)
- **Reutilizable:** Sí (otras apps de ficha)

#### Reglas de aislamiento

- No importa React ni UI.
- Catálogo de tipos cerrado: `perro | gato | ave | conejo | otro`.
- Nombre recortado, no vacío; `birthDate` obligatorio.

---

### Módulo `MOD-02`: `mod-care-events`

**Patrón:** Pure engine / event log  
**Ruta:** `src/engine/careEvents.ts`

#### Contrato

- **Entradas:** `AddEventInput` discriminado por `kind`: `feed` | `bathroom` | `walk` | `note`
- **Salidas:** `CareEvent` con `id`, `petId`, `at` (ISO), payload tipado
- **Dependencias:** `MOD-03` para validar consistencia si `kind=bathroom` e incluye heces
- **Reutilizable:** Sí

#### Reglas de aislamiento

- Todo evento exige `petId` existente (validado por `MOD-07`).
- No calcula resúmenes de día (eso es `MOD-05`).
- Funciones puras: `addEvent(state, input)`, `removeEvent(state, id)`.

**Payloads V1:**

```ts
type FeedPayload = { foodType: "seco"|"humedo"|"casero"|"premio"|"otro"; amountLabel?: string };
type BathroomPayload = { bathroomType: "orina"|"heces"|"ambos"; stool?: StoolCode };
type WalkPayload = { durationMin?: number; note?: string };
type NotePayload = { text: string }; // 1..280
```

---

### Módulo `MOD-03`: `mod-stool-scale`

**Patrón:** Pure catalog  
**Ruta:** `src/engine/stoolScale.ts`

#### Contrato

- **Entradas:** código de consistencia
- **Salidas:** `{ code, label, severity: "ok"|"warning"|"error" }`
- **Dependencias:** ninguna
- **Reutilizable:** Sí

#### Reglas de aislamiento

- Catálogo cerrado de 6 códigos (`firme`, `dura`, `blanda`, `liquida`, `moco`, `sangre`).
- `requiresStool(bathroomType)` → true si `heces` o `ambos`.

---

### Módulo `MOD-04`: `mod-health-status`

**Patrón:** Pure engine  
**Ruta:** `src/engine/healthStatus.ts`

#### Contrato

- **Entradas:** `setHealth(petId, { status, symptoms[], notes? })`
- **Salidas:** `PetHealth` + evento derivado `kind: "health"` para el log del día
- **Dependencias:** ninguna
- **Reutilizable:** Sí

#### Reglas de aislamiento

- `enfermo` exige `symptoms.length >= 1`.
- No emite consejo clínico; solo persiste lo que el cuidador declara.

---

### Módulo `MOD-05`: `mod-day-history`

**Patrón:** Pure query  
**Ruta:** `src/engine/dayHistory.ts`

#### Contrato

- **Entradas:** `petId`, `date` (`YYYY-MM-DD`), lista de eventos + preventivos
- **Salidas:** `DaySummary` (contadores, lista ordenada por hora, última heces, health snapshot)
- **Dependencias:** consume eventos de `MOD-02`, salud de `MOD-04`, preventivos de `MOD-06`
- **Reutilizable:** Sí

#### Reglas de aislamiento

- Query pura: no escribe storage.
- Timezone: día civil del dispositivo (`local YYYY-MM-DD`). Documentado para no mezclar UTC.

---

### Módulo `MOD-06`: `mod-preventive-calendar`

**Patrón:** Pure engine  
**Ruta:** `src/engine/preventiveCalendar.ts`

#### Contrato

- **Entradas:** `AddPreventiveInput` (`petId`, `kind: "vacuna"|"desparasitacion"`, `name`, `appliedAt`, `nextDueAt?`, `notes?`)
- **Salidas:** lista por mascota; `dueStatus(nextDueAt, today): "ok"|"soon"|"overdue"` (`soon` = ≤ 14 días)
- **Dependencias:** ninguna
- **Reutilizable:** Sí

#### Reglas de aislamiento

- `nextDueAt` si existe debe ser ≥ `appliedAt`.
- No envía notificaciones (V1 visual only).

---

### Módulo `MOD-07`: `mod-pet-engine`

**Patrón:** Pure orchestrator  
**Ruta:** `src/engine/index.ts` + `src/engine/types.ts`

#### Contrato

- **Entradas:** comandos (`createPet`, `selectPet`, `addEvent`, `setHealth`, `addPreventive`, `deletePet`)
- **Salidas:** `AppState` nuevo + errores de validación (`EngineError`)
- **Dependencias:** `MOD-01` … `MOD-06`
- **Reutilizable:** No (específico del producto)

#### Reglas de aislamiento

- Sin React, sin AsyncStorage, sin expo-router.
- Única fuente de verdad in-memory; el store solo serializa `AppState`.

```ts
type AppState = {
  pets: Pet[];
  activePetId: string | null;
  events: CareEvent[];
  healthByPetId: Record<string, PetHealth>;
  preventives: PreventiveItem[];
};
```

---

### Módulo `MOD-08`: `mod-offline-store`

**Patrón:** Repository  
**Ruta:** `src/modules/offline-store/`

#### Contrato

- **Entradas:** `AppState`
- **Salidas:** `load(): Promise<AppState | null>`, `save(state): Promise<void>`
- **Dependencias:** `@react-native-async-storage/async-storage`
- **Reutilizable:** Patrón igual a `tower` `offline-progress`

#### Dependencias

- Clave: `petcare:v1:state`
- Si JSON inválido → `null` + flag `corrupt` para UI (no crash)

**Prohibidas:** importar pantallas `app/` o componentes.

---

### Módulo `MOD-09`: `mod-care-ui`

**Patrón:** Feature folder / UI kit mínimo  
**Ruta:** `src/components/` + `app/` (expo-router)

#### Contrato

- **Componentes exportados:** `TodaySummary`, `QuickLogRow`, `EventList`, `StoolBadge`, `HealthBanner`, `DatePager`, `PetSwitcher`, `PrimaryButton`, formularios de alta/evento/preventivo
- **Props y tokens:** `theme.ts` según `04-application-design.md`
- **Eventos:** `onPress` hacia hooks; nunca llaman AsyncStorage ni mutan engine directo

#### Dependencias

- **Internas:** `MOD-07` vía `CareProvider` / hooks; `constants/theme`
- **Prohibidas:** llamadas inversas desde `src/engine/`

---

### Módulo `MOD-10`: `mod-android-release`

**Patrón:** Infra / scripts WIKA  
**Ruta:** `scripts/verify-build.sh`, `scripts/build-apk.sh`, `app.json`

#### Contrato

- **Entradas:** proyecto Expo SDK 52
- **Salidas:** typecheck + export + prebuild + APK release
- **Dependencias:** toolchain JDK 17, Kotlin 1.9.25, minSdk 24
- **Reutilizable:** Sí (copiar de `tower/iterations/v1`)

---

## 4. Grafo de Dependencias y Reglas de Importación

```text
[app/ screens — expo-router]
       │
       ▼ consume
[MOD-09 UI / components + CareProvider]
       │
       ▼ consume
[MOD-07 pet-engine]  ←── MOD-01, MOD-02, MOD-03, MOD-04, MOD-05, MOD-06
       │
       ▲ serializa
[MOD-08 offline-store]
       │
       ▼ alineación
[standards/ + theme.ts]
[MOD-10 android-release]  (toolchain; no importa engine)
```

**Reglas:**

- Prohibidas importaciones circulares.
- `src/engine/` sin imports de React ni AsyncStorage.
- Estilos solo vía tokens/theme documentados.
- `MOD-05` no persiste; solo consulta estado del engine.

---

## 5. Matriz de Riesgos Arquitectónicos

| ID Módulo | Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- | :--- |
| `MOD-02` | Eventos sin `petId` o cruzados | `Alto` | Validar en `MOD-07`; smoke NFR-05 |
| `MOD-03` | Consistencia libre / ambigua | `Alto` | Catálogo cerrado; UI solo códigos |
| `MOD-05` | Día UTC vs local | `Alto` | Clave `YYYY-MM-DD` local del dispositivo |
| `MOD-07` | Estado inconsistente tras delete mascota | `Alto` | Cascade delete eventos/salud/preventivos |
| `MOD-08` | JSON corrupto | `Medio` | Fallback empty + confirm reset |
| `MOD-09` | Lógica de negocio en pantallas | `Alto` | Hooks como frontera; engine puro |
| `MOD-04` | Interpretar síntomas como diagnóstico | `Medio` | Disclaimer UI; sin copy clínico |

---

## 6. Evaluación de Reutilización WIKA

| Módulo | ¿Existe equivalente WIKA? | Decisión |
| :--- | :--- | :--- |
| `MOD-07` | No (dominio mascotas) | Crear nuevo |
| `MOD-08` | `offline-progress` en tower / alvaro | Reutilizar patrón AsyncStorage |
| `MOD-09` | Theme + botones de apps V1 | Theme local V1; no design-system repo |
| `MOD-10` | `tower/iterations/v1` scripts | Reutilizar starter WIKA (WIKA-ARCH-06) |
| `MOD-01`–`MOD-06` | No | Crear nuevo (lógica de dominio) |

---

## 7. Puerta de Enlace y Firma de Auditoría de Módulos

### Checklist

- [x] Toda feature obligatoria tiene al menos un módulo.
- [x] Sin módulos duplicados ni responsabilidades superpuestas.
- [x] Dependencias y riesgos documentados.
- [x] Reutilización WIKA evaluada.
- [x] Grafo sin ciclos.
- [ ] `audits/auditoria-modulos.md` en estado `[APROBADO]`.

### Registro de visto bueno

- **Aprobado por (Arquitecto):** `________________________`
- **Fecha:** `YYYY-MM-DD`
- **audit_2_passed:** `false` → `true` al aprobar
