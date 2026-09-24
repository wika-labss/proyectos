# Geo Empresa — Estado congelado V1

**Estado:** `CONGELADO`  
**Fecha:** 2026-09-24  
**Arquitecto:** Vissiuss  
**Versión de contrato:** `idea/` v2.0.0  
**Código:** `iterations/v1/` + `admin/v1/`  
**Release WIKA:** `audits/auditoria-release-v1.md` — **no APROBADO**. No copiar a `final/`.

Construcción V1 cerrada. No hay más features, módulos ni pantallas en esta iteración. Lo que sigue es otra iteración (V1.1 / V2) con gate nuevo, o firma humana de release si se aceptan las desviaciones.

---

## Qué quedó construido

| Pieza | Ruta | Estado |
|---|---|---|
| Contrato WIKA (01–05) | `idea/` | Gates 1–3B + `ready_for_construction` firmados |
| Schema / RPCs | `supabase/migrations/003_security_fleet.sql` | Aplicado en `ugzprmopgmbjjxsbjmti` |
| Agente Android | `iterations/v1/` | APK release `com.wika.geoempresa` |
| Módulo nativo | `iterations/v1/modules/device-policy/` | `lockNow`, `reboot`, `resetPin`, `getPolicyStatus` |
| Panel TI | `admin/v1/` | Login, flota, ficha, comandos, enrollment |
| Usuario lab TI | Auth + `perfiles.rol = ti` | `pureba` / `pureba@geo-empresa.local` |

---

## Qué funciona en lab (2026-09-24)

Probado con teléfonos que **ya tenían cuentas** (Galaxy `R83XB042SRE` y equipo de Verox/Joaquin):

| Capacidad | Resultado |
|---|---|
| Instalar APK (sin reboot) | OK |
| Registro (nombre + base) | OK — filas `Verox`, `Joaquin` en flota |
| GPS / geocerca 120 m / ping | OK — `dentro`, `ultimo_ping_at` vivo |
| Panel login TI | OK |
| Lista de flota | OK |
| Device Admin activo | OK — `dpm` reportó *already an admin for user 0* |
| Device Owner | **BLOQUEADO** — *accounts on the device* |
| `lockNow()` remoto (comando `lock`) | Código listo; exige Admin activo + Aprobar en la **ficha** |
| Autolock por geocerca | Código listo; **solo corre si `es_device_owner`** |
| `reboot` / `reset_pin` | Código listo; el agente acusa `Requiere Device Owner` |

`adb devices` debe decir `device` (no `unauthorized`) antes de cualquier `dpm`.

---

## Admin vs Owner (no son lo mismo)

```
sideload          →  no enrolado. GPS sí. Lock no (el loop de geocerca exige Owner).
Device Admin      →  lock remoto por comando TI. El usuario puede quitar el admin y desinstalar.
Device Owner      →  lock + autolock + reboot + PIN + anti-desinstalación. Exige teléfono sin cuentas.
```

Android **no** deja `set-device-owner` si hay Google/Samsung account. Quitar cuentas por PowerShell no es posible sin root. Camino limpio: factory reset → asistente **sin Wi‑Fi/SIM/cuentas** → depuración USB → APK → `dpm`.

Comando Owner (lab):

```powershell
adb shell dpm set-device-owner com.wika.geoempresa/com.wika.geoempresa.devicepolicy.GeoDeviceAdminReceiver
```

Éxito: `Success: Device owner set to package com.wika.geoempresa`.  
Fallo típico: `Not allowed to set the device owner because there are already some accounts on the device.`

---

## Cómo usa TI el panel

La home **Flota corporativa** es solo el resumen. Los botones no están ahí.

1. Login (`pureba`).
2. Clic en el **nombre** del equipo (`Verox`, `Joaquin`, …) → `/dispositivos/<id>`.
3. En la ficha: **Aprobar** (enrollment `pendiente` → `aprobado`).
4. Después: Bloquear / Liberar / Reiniciar / Nuevo PIN.
5. Los comandos se aplican en el próximo poll del agente (30–60 s).
6. `Enrollment` (arriba a la derecha) son instrucciones de `dpm`, no gestiona equipos.

Columnas de la tabla:

| Columna | Significado |
|---|---|
| Perímetro | `dentro` / `fuera` según último ping |
| Owner | `isDeviceOwnerApp` reportado por el agente |
| Enrollment | `pendiente` / `aprobado` / `rechazado` |
| Ping | `ultimo_ping_at` |

---

## Congelación — reglas

1. No implementar FEAT-12+ (push, wipe, multi-tenant, iOS) en `iterations/v1/` ni `admin/v1/`.
2. No reabrir Gates 1–3B ni tocar flags YAML de `idea/`.
3. Bugfix de seguridad/regresión: iteración nueva o hotfix documentado; no “seguir sumando V1”.
4. Device Owner en un teléfono limpio es **lab pendiente**, no trabajo de esta congelación.
5. Promoción a `final/` exige que el arquitecto firme `auditoria-release-v1.md` como APROBADO.

---

## Desviaciones vs contrato v2.0.0

Ver `audits/auditoria-release-v1.md` y `iterations/v1/review.md`.

- FEAT-06 (Owner + anti-uninstall): implementado; **no verificado** en lab (cuentas en el teléfono).
- FEAT-07 (autolock geocerca): implementado; gated a Owner; **no verificado**.
- FEAT-08 reboot / PIN: implementado; fallan en Admin; **no verificados**.
- FEAT-08 lock remoto + FEAT-01–05 + FEAT-10–11: construidos; flota y GPS vistos en panel.
- Escenario 7 (no finge Owner): el agente reporta `es_device_owner = no` en la flota. Correcto.
