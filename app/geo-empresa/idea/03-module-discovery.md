---
id: "MOD-001"
title: "Geo Empresa — Módulos V1 seguridad de flota"
status: "APROBADO"
version: "2.0.0"
owner: "Vissiuss / Equipo WIKA"
created_at: "2026-08-27"
updated_at: "2026-09-24"
audit_1_passed: true
audit_2_passed: true
---

# [03] Descubrimiento y Especificación de Arquitectura Modular

> **Pre-requisito:** `audit_1_passed: true` en `01-problem.md` y `02-features.md`.  
> **Equivalencia:** Auditoría de Módulos → `audits/auditoria-modulos.md`.

## 1. Identificación y Documentos Base

- **Nombre del Proyecto:** Geo Empresa
- **Especificaciones base:** `01-problem.md` (`PROB-001`) | `02-features.md` (`FEAT-001`)
- **Estado de gatekeeping:** `AUDIT_2_APROBADO`
- **Backend:** ver `supabase/README.md` y `supabase/migrations/003_security_fleet.sql`

---

## 2. Matriz de Trazabilidad Modular (RTM 1:1)

| ID Módulo | ID Feature (`02-features.md`) | ID Problema (`01-problem.md`) | Nombre del Módulo | Tipo | Responsabilidad Principal |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `MOD-01` | `FEAT-01` | `ERR-01`, `ERR-02` | `mod-registration` | UI + persist | Registro único y fingerprint |
| `MOD-02` | `FEAT-02` | `ERR-03` | `mod-location-agent` | service | Ping GPS background |
| `MOD-03` | `FEAT-03` | `ERR-04` | `mod-fence-engine` | engine | Validación client-side de radio (fuente de verdad = Postgres) |
| `MOD-04` | `FEAT-04`, `FEAT-09` | `ERR-05`, `ERR-11` | `mod-device-state` | engine | Inferir encendido + armar payload de política (sin Android) |
| `MOD-05` | `FEAT-01`–`FEAT-09` | `ERR-01`–`ERR-07`, `ERR-11` | `mod-api` | client | RPCs agente (anon / fingerprint) |
| `MOD-06` | `FEAT-01`, `FEAT-02` | `ERR-01`, `ERR-03` | `mod-registration-store` | persist | AsyncStorage del registro local |
| `MOD-07` | `FEAT-06`, `FEAT-07`, `FEAT-08` | `ERR-07`, `ERR-08`, `ERR-09`, `ERR-11` | `mod-device-policy` | nativo Kotlin | `lockNow`, `reboot`, reset PIN, `isDeviceOwnerApp` |
| `MOD-08` | `FEAT-08` | `ERR-09`, `ERR-11` | `mod-command-agent` | service | Poll 30–60 s y despacho a MOD-07 |
| `MOD-09` | `FEAT-10` | `ERR-10` | `mod-admin-web` | UI web | Panel Next.js TI |
| `MOD-10` | `FEAT-11` | `ERR-10` | `mod-admin-auth` | auth | Sesión TI + guard de rol |
| `MOD-11` | `FEAT-10` | `ERR-10` | `mod-admin-api` | client | RPCs TI (JWT + rol `ti`) |

---

## 3. Desglose de Arquitectura Modular

### Módulo `MOD-01`: mod-registration

**Patrón:** Feature module (UI + llamada API)  
**Ruta:** `iterations/v1/app/register.tsx`, `iterations/v1/src/modules/registration/`

#### Contrato

- **Entradas:** nombre, base_lat, base_lng, radio opcional; fingerprint y modelo automáticos
- **Salidas:** dispositivo persistido en store; `estado_enrollment`
- **Dependencias:** `MOD-05`, `MOD-06`
- **Reutilizable:** No (dominio geo-empresa)

#### Reglas de aislamiento

- No llama a `DevicePolicyManager`.
- No importa pantallas del panel web.

---

### Módulo `MOD-02`: mod-location-agent

**Patrón:** Background service  
**Ruta:** `iterations/v1/src/modules/location-agent/`

#### Contrato

- **Entradas:** intervalo (default 10 min), fingerprint
- **Salidas:** POST `reportar_ubicacion`; entrega `debe_bloquear` / `politica_autolock` a `MOD-08` / engine
- **Dependencias:** permisos ubicación Android, `MOD-05`, `MOD-04`
- **Reutilizable:** Parcial (patrón background de otras apps WIKA)

#### Reglas de aislamiento

- No ejecuta lock. Si `debe_bloquear`, notifica a `MOD-08` o llama al bridge de `MOD-07` vía un hook de integración (no desde `src/engine/`).

---

### Módulo `MOD-03`: mod-fence-engine

**Patrón:** Pure engine  
**Ruta:** `iterations/v1/src/engine/fence.ts`

#### Contrato

- **Entradas:** `distanceM`, `radiusM`
- **Salidas:** `boolean`
- **Dependencias:** ninguna
- **Reutilizable:** Sí

```typescript
export function isInsideFence(distanceM: number, radiusM: number): boolean {
  return distanceM <= radiusM;
}
```

Fuente de verdad de `dentro_perimetro` = Postgres. Este módulo es validación client-side opcional.

#### Reglas de aislamiento

- Sin React. Sin I/O de red.

---

### Módulo `MOD-04`: mod-device-state

**Patrón:** Pure engine  
**Ruta:** `iterations/v1/src/engine/deviceState.ts`

#### Contrato

- **Entradas:** AppState / timestamp último ping (JS); flags Owner/admin **inyectados** desde `MOD-07` (no los lee el engine)
- **Salidas:** `{ telefonoEncendido, shouldLock, reportPolitica }`
- **Dependencias:** ninguna nativa
- **Reutilizable:** No

#### Reglas de aislamiento

- **Prohibido** importar Android / Expo modules.
- Decide *si* hay que bloquear; no bloquea.

---

### Módulo `MOD-05`: mod-api

**Patrón:** HTTP client (engine, sin SDK pesado)  
**Ruta:** `iterations/v1/src/engine/geoApi.ts`

#### Contrato — RPCs agente (anon + fingerprint)

| RPC | Método | Uso |
| :--- | :--- | :--- |
| `registrar_dispositivo` | POST `/rest/v1/rpc/registrar_dispositivo` | Una vez |
| `reportar_ubicacion` | POST `/rest/v1/rpc/reportar_ubicacion` | Background; respuesta incluye `debe_bloquear`, `politica_autolock` |
| `obtener_dispositivo` | POST `/rest/v1/rpc/obtener_dispositivo` | Snapshot propio |
| `reportar_politica` | POST `/rest/v1/rpc/reportar_politica` | Owner / admin / lock |
| `obtener_comando_pendiente` | POST `/rest/v1/rpc/obtener_comando_pendiente` | Poll |
| `acusar_comando` | POST `/rest/v1/rpc/acusar_comando` | ACK |

**Env:** `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`  
**Proyecto:** `https://ugzprmopgmbjjxsbjmti.supabase.co`

#### Reglas de aislamiento

- Sin React. No llama RPCs TI (`listar_flota`, `solicitar_comando`, etc.).

---

### Módulo `MOD-06`: mod-registration-store

**Patrón:** Persist  
**Ruta:** `iterations/v1/src/modules/registration/store.ts`

#### Contrato

- **Entradas / salidas:** fingerprint, id, enrollment local
- **Dependencias:** AsyncStorage
- **Reutilizable:** Patrón store WIKA

---

### Módulo `MOD-07`: mod-device-policy

**Patrón:** Expo native module (Kotlin) + config plugin  
**Ruta:** `iterations/v1/modules/device-policy/` (o `src/modules/device-policy/android/`)

#### Contrato

- **Entradas (JS):** `lockNow()`, `reboot()`, `resetPin(pin)`, `getPolicyStatus()`, `ensureResetPasswordToken()`
- **Salidas:** `{ isDeviceOwner, isAdminActive }` o error tipado
- **Dependencias:** `DevicePolicyManager`, `DeviceAdminReceiver`, `device_admin.xml`
- **Reutilizable:** No (package `com.wika.geoempresa`)

#### Reglas de aislamiento

- Único módulo que toca Android policy.
- El `AndroidManifest.xml` **no** se edita a mano: config plugin (`withDeviceAdmin`) mergea el receiver en `prebuild`.
- API 24–25: `resetPassword`. API 26+: `setResetPasswordToken` + `resetPasswordWithToken`.
- `reboot` y `resetPin` fallan de forma segura si no es Owner.

---

### Módulo `MOD-08`: mod-command-agent

**Patrón:** Service / scheduler  
**Ruta:** `iterations/v1/src/modules/command-agent/`

#### Contrato

- **Entradas:** intervalo 30–60 s; fingerprint
- **Salidas:** despacho a `MOD-07` según `tipo`; `acusar_comando`
- **Dependencias:** `MOD-05`, `MOD-07`, `MOD-04`
- **Reutilizable:** No

#### Reglas de aislamiento

- No conoce UI. Si no hay Owner, acusa `fallido` en reboot/reset_pin.

---

### Módulo `MOD-09`: mod-admin-web

**Patrón:** App Next.js (App Router)  
**Ruta:** `admin/v1/app/`

#### Contrato

- **Páginas:** `/login`, `/` (flota), `/dispositivos/[id]`, `/enrollment` (instrucciones QR / dpm)
- **Dependencias:** `MOD-10`, `MOD-11`, `theme` web documentado en `04`
- **Reutilizable:** No

#### Reglas de aislamiento

- No embebe el agente Expo. No usa anon key para comandos.

---

### Módulo `MOD-10`: mod-admin-auth

**Patrón:** Supabase SSR session  
**Ruta:** `admin/v1/src/auth/`

#### Contrato

- **Entradas:** email/password TI
- **Salidas:** sesión cookie; `rol === 'ti'` o redirect
- **Dependencias:** `@supabase/ssr`, tabla `perfiles`
- **Reutilizable:** Patrón dashboard WIKA futuro

---

### Módulo `MOD-11`: mod-admin-api

**Patrón:** Server/client RPC wrapper  
**Ruta:** `admin/v1/src/engine/adminApi.ts` (sin React)

#### Contrato — RPCs TI (JWT + `perfiles.rol = ti`)

| RPC | Uso |
| :--- | :--- |
| `listar_flota` | Tabla de dispositivos (sin PIN) |
| `obtener_dispositivo_admin` | Detalle + últimos reportes |
| `aprobar_dispositivo` | `pendiente` → `aprobado` (o `rechazado`) |
| `solicitar_comando` | Inserta `lock` / `unlock_policy` / `reset_pin` / `reboot` |
| `listar_comandos` | Histórico **sin** payload de PIN |

#### Reglas de aislamiento

- Prohibido llamar estas RPCs desde el APK agente.

---

## 4. Grafo de Dependencias y Reglas de Importación

```text
[iterations/v1/app — expo-router agente]
       │
       ▼
[MOD-01 UI registro]  [hooks location / command]
       │                       │
       ▼                       ▼
[MOD-06 store]          [MOD-02] [MOD-08]
       │                       │
       ▼                       ▼
              [MOD-04 engine] [MOD-03 fence]
                       │
                       ▼
                    [MOD-05 geoApi]
                       │
                       ▼
              [Supabase RPCs agente]

[MOD-08] ──llama──► [MOD-07 Kotlin DPM]
[MOD-07] ──status──► hooks ──► [MOD-04]   (datos, no import nativo en engine)

[admin/v1/app — Next]
       │
       ▼
[MOD-10 auth] [MOD-09 pages]
       │
       ▼
[MOD-11 adminApi]
       │
       ▼
[Supabase RPCs TI]
```

**Reglas:**

- Prohibidas importaciones circulares.
- `src/engine/` sin imports de React ni de `MOD-07`.
- Estilos solo vía tokens/theme documentados.
- Agente y panel no comparten binario; pueden compartir tipos TS documentados, no runtime nativo.

---

## 5. Matriz de Riesgos Arquitectónicos

| ID Módulo | Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- | :--- |
| `MOD-07` | Prebuild / plugin mal mergeado | `Alto` | Config plugin + `verify-build`; probar `dpm set-device-owner` en lab |
| `MOD-07` | reset PIN distinto API 24 vs 26+ | `Alto` | Branch documentado en contrato nativo |
| `MOD-08` | Polling hasta 60 s | `Medio` | Intervalo corto solo para comandos; documentado en NFR |
| `MOD-05` / `MOD-11` | Anon lee comandos de otro dispositivo | `Alto` | SECURITY DEFINER + match fingerprint; RLS sin SELECT directo |
| `MOD-11` | PIN en listado admin | `Alto` | `listar_comandos` omite payload |
| `MOD-09` | service_role en el browser | `Alto` | Solo JWT user; RPCs chequean `perfiles.rol` |
| `MOD-02` | Background kill en OEM | `Medio` | Foreground service / docs de batería; `telefono_encendido` refleja agente muerto |

---

## 6. Evaluación de Reutilización WIKA

| Módulo | ¿Existe equivalente WIKA? | Decisión |
| :--- | :--- | :--- |
| `MOD-01`–`MOD-06` | Registro + store + fetch RPC (control-central-acd / tower scripts) | Crear dominio nuevo; reutilizar patrón HTTP y scripts APK de tower |
| `MOD-07` | No hay Device Owner en el catálogo | Crear nuevo |
| `MOD-08` | No | Crear nuevo |
| `MOD-09`–`MOD-11` | No hay panel Next en geo-empresa; dashboards previos son Android | Crear `admin/v1/`; theme local V1 |
| Theme / kits | `design-system/` V3+ | Diferir a V3+; theme local en `04` |

---

## 7. Puerta de Enlace y Firma de Auditoría de Módulos

### Checklist

- [x] Toda feature obligatoria tiene al menos un módulo.
- [x] Sin módulos duplicados ni responsabilidades superpuestas (engine decide, nativo ejecuta, web opera).
- [x] Dependencias y riesgos documentados.
- [x] Reutilización WIKA evaluada.
- [x] Grafo sin ciclos.
- [x] `audits/auditoria-modulos.md` en estado `[APROBADO]`.
- [x] `audit_1_passed: true` como pre-requisito.

### Registro de visto bueno

- **Aprobado por (Arquitecto):** `Vissiuss`
- **Fecha:** `2026-09-24`
- **audit_2_passed:** `true`
