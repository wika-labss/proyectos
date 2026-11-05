# Geo Empresa

**Estado: CONGELADO (2026-09-24).** Construcción V1 cerrada. Ver [STATUS.md](./STATUS.md).

Seguridad de flota: teléfonos Android **propiedad de la empresa**, geocerca 120 m, Device Policy y panel web para TI.

- **Estado as-built:** [STATUS.md](./STATUS.md)
- **Backend:** Supabase `geo-empresa` — [supabase/README.md](./supabase/README.md)
- **Documentación WIKA (v2.0.0, APROBADO):** [idea/](./idea/)
- **Auditorías:** [audits/](./audits/) — Gates 1–3B firmados. Release: **congelado, no APROBADO** (`auditoria-release-v1.md`)
- **Agente Android:** [iterations/v1/](./iterations/v1/)
- **Panel TI:** [admin/v1/](./admin/v1/)

## Qué cambió respecto de v1.0.0

El contrato anterior solo monitoreaba GPS (`telefono_encendido`, `dentro_perimetro`).  
v2.0.0 reformula el V1 a **seguridad de equipos**:

- Agente con `DeviceAdminReceiver` + `DevicePolicyManager`
- TI aprueba enrollment, monitorea, bloquea, libera política, resetea PIN y reinicia
- Auth TI (`perfiles.rol = ti`); el agente no usa esas RPCs

`lockNow()` no quita el PIN del usuario. Desbloqueo TI = `unlock_policy` + `reset_pin` (PIN exige Device Owner).

## Lab 2026-09-24 (as-built)

| Hecho | Valor |
|---|---|
| GPS + flota | Operativo (`Verox`, `Joaquin`) |
| Device Admin | Activo en el Galaxy de prueba |
| Device Owner | Bloqueado: hay cuentas en el teléfono |
| Panel | Home = resumen. Acciones en `/dispositivos/<id>` (clic en el nombre) |

Device Admin ≠ Device Owner. Sin Owner no hay autolock, reboot, reset PIN ni anti-desinstalación.

## Gates

| Gate | Flag | Doc | Estado |
|------|------|-----|--------|
| 1 Documentación | `audit_1_passed` | `idea/01`, `idea/02`, `audits/auditoria-documentacion.md` | Firmado 2026-09-24 |
| 2 Módulos | `audit_2_passed` | `idea/03`, `audits/auditoria-modulos.md` | Firmado |
| 3A Visual | `visual_approval_passed` | `idea/04` | Firmado |
| 3B Ensamblado | `audit_3_passed` | `idea/04`, `idea/05`, `audits/auditoria-ensamblado.md` | Firmado |
| Construcción | `ready_for_construction` | `idea/05` | Autorizada; **cerrada** |
| Release | registro en `audits/` | `audits/auditoria-release-v1.md` | CONGELADO — no `final/` |

Un agente IA no activa flags ni escribe APROBADO de release.

## Campos clave (Supabase)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `nombre_registrado` | text | Nombre del teléfono |
| `base_lat` / `base_lng` | float | Coordenadas base |
| `telefono_encendido` | boolean | Inferido (agente vivo) |
| `dentro_perimetro` | boolean | Dentro de 120 m |
| `estado_enrollment` | text | `pendiente` / `aprobado` / `rechazado` |
| `es_device_owner` | boolean | Owner reportado |
| `admin_activo` | boolean | Device Admin activo |
| `politica_autolock` | boolean | Lock al salir de base |

## RPCs

**Agente (anon + fingerprint):** `registrar_dispositivo`, `reportar_ubicacion`, `obtener_dispositivo`, `reportar_politica`, `obtener_comando_pendiente`, `acusar_comando`.

**TI (JWT + rol `ti`):** `listar_flota`, `obtener_dispositivo_admin`, `aprobar_dispositivo`, `solicitar_comando`, `listar_comandos`.

Migración `003` aplicada en remoto (2026-09-24). Seed del usuario TI: Auth + `insert into perfiles`.
