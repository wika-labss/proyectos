---
id: "PROB-001"
title: "Geo Empresa — Seguridad de flota corporativa"
status: "APROBADO"
version: "2.0.0"
owner: "Vissiuss / Equipo WIKA"
created_at: "2026-08-27"
updated_at: "2026-09-24"
audit_1_passed: true
---

# [01] Definición del Problema, Alcance y Metas

> **Reformulación v2.0.0:** el V1 deja de ser solo monitoreo GPS. Pasa a seguridad de equipos corporativos (Device Owner + panel web TI).  
> Los flags `audit_*` de la v1.0.0 (monitoreo) quedan **inválidos**.  
> **Equivalencia de auditoría:** `audit_1_passed: true` requiere aprobación formal en `audits/auditoria-documentacion.md`.  
> Un agente IA no activa este flag.

## 1. Identificación y Control de Cambios

- **Nombre del Proyecto:** Geo Empresa
- **Repositorio de aplicación:** `proyectos/app/geo-empresa/`
- **Backend:** Supabase `geo-empresa` (`ugzprmopgmbjjxsbjmti`, región `sa-east-1`)
- **Stakeholders clave:** Vissiuss (producto / ingeniería), administrador de flota (TI), colaborador con teléfono corporativo
- **Estado de gatekeeping:** `AUDIT_1_APROBADO`

---

## 2. Definición del Problema y Justificación

- **¿Qué problema se intenta resolver?**  
  La compañía entrega teléfonos Android **de su propiedad** a colaboradores. Necesita resguardarlos: que operen cerca de un punto base (oficina, bodega, faena), que el agente no se desinstale, y que TI pueda bloquear, liberar política, resetear el PIN corporativo y reiniciar el equipo si sale del perímetro, se pierde o se roba.

- **Impacto actual / costo de oportunidad:**  
  El contrato v1.0.0 solo observaba GPS (`telefono_encendido`, `dentro_perimetro`). Un colaborador podía salir de los 120 m, desinstalar la app o seguir usando el PIN viejo. Sin panel TI no hay quién apruebe el enrollment ni quién opere un lock/unlock remoto. Eso no es seguridad de flota.

- **Análisis de brecha (Gap Analysis):**
  - **Estado actual (hoy):** tablas `dispositivos` + `ubicacion_reportes` y 3 RPCs anon de monitoreo. Sin Device Owner, sin cola de comandos, sin Auth TI, sin panel web. App móvil pendiente. Las migraciones referenciadas en `supabase/README.md` no están versionadas en este repo.
  - **Estado deseado (mañana):** agente Android Device Owner (`DeviceAdminReceiver` + `DevicePolicyManager`) + panel web TI (aprobar, monitorear, lock, unlock_policy, reset PIN, reboot) sobre RPCs de Supabase con roles.

---

## 3. Matriz de Trazabilidad de Requerimientos (RTM Inicial)

| ID Problema | Descripción del Dolor | Impacto | ID Feature (`02-features.md`) | Módulo Destino (`03-module-discovery.md`) |
| :--- | :--- | :--- | :--- | :--- |
| `ERR-01` | No hay registro único del móvil | `Alto` | `FEAT-01` | `mod-registration` |
| `ERR-02` | No se guardan coordenadas base | `Alto` | `FEAT-01` | `mod-registration` |
| `ERR-03` | No hay ping periódico en background | `Alto` | `FEAT-02` | `mod-location-agent` |
| `ERR-04` | No se calcula si está dentro de 120 m | `Alto` | `FEAT-03` | `mod-fence-engine` |
| `ERR-05` | No se distingue teléfono apagado/encendido | `Alto` | `FEAT-04` | `mod-device-state` |
| `ERR-06` | No hay snapshot consultable del dispositivo | `Medio` | `FEAT-05` | `mod-api` |
| `ERR-07` | El equipo se usa fuera de base sin consecuencia | `Alto` | `FEAT-07` | `mod-device-policy` |
| `ERR-08` | Se puede desinstalar el agente | `Alto` | `FEAT-06` | `mod-device-policy` |
| `ERR-09` | Equipo perdido/robado sigue con el PIN viejo | `Alto` | `FEAT-08` | `mod-device-policy`, `mod-command-agent` |
| `ERR-10` | TI no aprueba ni opera la flota desde un centro | `Alto` | `FEAT-10`, `FEAT-11` | `mod-admin-web`, `mod-admin-auth` |
| `ERR-11` | No hay comando remoto lock / unlock / reboot | `Alto` | `FEAT-08`, `FEAT-09` | `mod-command-agent`, `mod-api` |

---

## 4. Audiencia y Casos de Uso Core

- **Usuarios principales:**
  - **Colaborador (agente):** registra el teléfono corporativo una vez y deja el agente en background. No opera políticas.
  - **TI / administrador de flota:** inicia sesión en el panel web, aprueba enrollment, ve estado (perímetro, owner, último ping) y emite lock, unlock_policy, reset PIN o reboot.

- **Fuera de alcance (Out of Scope explícito):**
  - iOS.
  - BYOD (teléfono personal del colaborador).
  - Wipe / factory reset remoto.
  - Alertas push al supervisor (V1 usa polling).
  - Apagado completo de hardware (`PowerManager.shutdown` no es API pública).
  - Publicación en Play Store consumidor.
  - Multi-tenant / varias compañías en el mismo proyecto.

---

## 5. Objetivo y Beneficios Esperados

- **Objetivo:** V1 instalable (APK release Android + panel web TI) que enrolla el teléfono como Device Owner, reporta geocerca 120 m, bloquea al salir de base o por orden de TI, permite a TI liberar política y resetear PIN, y reinicia el equipo bajo comando. Sin aprobación TI el agente no aplica lock.

- **Beneficios esperados:**
  - La empresa es dueña del dispositivo (Owner), no “pide prestado” un Device Admin revocable.
  - TI ve la flota y opera seguridad sin SQL ad-hoc.
  - Un equipo fuera de perímetro o perdido no sigue usable con el PIN del colaborador.

---

## 6. Criterios de Éxito en Formato BDD (Gherkin)

### Escenario 1: Enrollment Device Owner

- **Dado que** el teléfono corporativo está en factory reset
- **Cuando** TI provisiona Device Owner del package `com.wika.geoempresa` (QR / `dpm set-device-owner`)
- **Entonces** `isDeviceOwnerApp()` es true y el agente no se desinstala

### Escenario 2: Aprobación TI (otorgar permiso)

- **Dado que** el agente registró el dispositivo y `estado_enrollment = pendiente`
- **Cuando** TI aprueba en el panel web
- **Entonces** el dispositivo pasa a `aprobado` y el agente puede aplicar lock

### Escenario 3: Lock por geocerca

- **Dado que** el dispositivo está `aprobado`, es Owner y `politica_autolock = true`
- **Cuando** un ping queda a más de 120 m de la base
- **Entonces** `dentro_perimetro = false`, la RPC devuelve `debe_bloquear = true` y el agente ejecuta `lockNow()`

### Escenario 4: Lock remoto

- **Dado que** TI solicita comando `lock` sobre un dispositivo aprobado
- **Cuando** el agente hace poll (30–60 s)
- **Entonces** ejecuta `lockNow()` y acusa el comando como `ejecutado`

### Escenario 5: Desbloqueo TI (política + PIN)

- **Dado que** el equipo está bloqueado o con auto-lock activo
- **Cuando** TI envía `unlock_policy` y, si aplica, `reset_pin` con un PIN nuevo
- **Entonces** el agente deja de auto-bloquear y, siendo Owner, resetea el PIN; el colaborador entra con el PIN que TI definió

### Escenario 6: Reboot remoto

- **Dado que** el dispositivo es Device Owner y hay comando `reboot` pendiente
- **Cuando** el agente lo obtiene
- **Entonces** llama `DevicePolicyManager.reboot(admin)` y acusa el comando

### Escenario 7: Dispositivo no enrolado no finge seguridad

- **Dado que** la app se instaló por sideload sin Device Owner
- **Cuando** el agente arranca
- **Entonces** muestra estado “no enrolado”, reporta `es_device_owner = false` y no aplica lock ni se presenta como flota segura

### Escenario 8: Tokens visuales

- **Dado que** se renderizan componentes del agente o del panel
- **Cuando** el agente compile la interfaz
- **Entonces** los estilos consumen tokens de `theme.ts` documentado en `04-application-design.md`

---

## 7. Matriz de Restricciones Técnicas y Operativas

| Categoría | Restricción / Límite | Impacto | Estándar asociado |
| :--- | :--- | :--- | :--- |
| **Tecnología agente** | Expo SDK 52, RN 0.76.x, TypeScript, expo-dev-client / prebuild | `Alto` | `standards/coding-standards.md` |
| **Tecnología panel** | Next.js en `admin/v1/` + `@supabase/ssr` | `Alto` | FEAT-10 |
| **Plataforma V1** | Android APK release (`minSdk` 24) + panel web | `Alto` | WIKA-ARCH-03 |
| **Package** | `com.wika.geoempresa` | `Alto` | WIKA-ARCH-04 |
| **Backend** | Solo RPCs sobre Supabase `geo-empresa`; RLS sin read directo a tablas | `Bloqueante` | coding-standards |
| **Diseño / UX** | Theme local V1; touch ≥ 44 dp en agente; pipeline `design-system/` diferido a V3+ | `Alto` | `standards/design-system.md` |
| **Seguridad** | Auth TI (`perfiles.rol = ti`). Agente anon acotado a fingerprint. PIN de reset no se lista en RPCs admin ni en histórico de pings | `Bloqueante` | FEAT-11 |
| **Radio default** | 120 m | `Alto` | FEAT-03 |
| **Polling** | Ubicación 10 min; comandos 30–60 s; sin push en V1 | `Alto` | FEAT-02, FEAT-08 |
| **Librerías prohibidas** | `^` en expo/react-native; hex sueltos fuera de `theme.ts`; engine con imports React | `Bloqueante` | WIKA-ARCH-02 |

---

## 8. Supuestos y Riesgos

- **Supuestos clave:** los teléfonos son propiedad de la empresa. TI puede hacer factory reset y provisionar Device Owner. Existe al menos un usuario Auth con `perfiles.rol = ti` (seed fuera del repo; no commitear contraseñas). El proyecto Supabase `ugzprmopgmbjjxsbjmti` sigue activo.
- **Riesgos identificados:**
  - Device Owner exige reset de fábrica; no se otorga como permiso de Play Store.
  - `reboot()` y reset PIN fallan si `isDeviceOwnerApp()` es false.
  - Reset PIN: API 24–25 `resetPassword`; API 26+ token (`setResetPasswordToken` + `resetPasswordWithToken`) generado en enrollment.
  - Polling, no push: el comando llega en el siguiente ciclo del agente (hasta 60 s).
  - `lockNow()` no quita el lock screen; “desbloqueo” es política + PIN nuevo.
  - Apagado total no existe como API pública.
- **Plan de mitigación:** UI “no enrolado” si no hay Owner; RPCs de comando exigen Owner reportado; documentar QR / `dpm set-device-owner` en el panel; PIN solo por RPC SECURITY DEFINER al fingerprint dueño. Construcción autorizada el 2026-09-24.

---

## 9. Puerta de Enlace y Firma de Auditoría de Documentación

### Checklist de criterios de aceptación

- [x] YAML frontmatter completado (`id`, `status`, `owner`, fechas).
- [x] Problemas `ERR-XX` mapeados a `FEAT-XX` y módulos sugeridos en RTM.
- [x] Criterios de éxito en formato BDD (Dado / Cuando / Entonces).
- [x] Out-of-scope explícito documentado.
- [x] Restricciones técnicas alineadas a `standards/coding-standards.md`.
- [x] Auditoría registrada en `audits/auditoria-documentacion.md` con resultado `[APROBADO]`.

### Registro de visto bueno

- **Aprobado por (Arquitecto):** `Vissiuss`
- **Fecha de aprobación:** `2026-09-24`
- **audit_1_passed:** `true`
