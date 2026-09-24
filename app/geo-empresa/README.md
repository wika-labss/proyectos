# Geo Empresa

Seguridad de flota: teléfonos Android **propiedad de la empresa**, geocerca 120 m, Device Owner y panel web para TI.

- **Backend:** Supabase `geo-empresa` — [supabase/README.md](./supabase/README.md)
- **Documentación WIKA (v2.0.0, BORRADOR):** [idea/](./idea/)
- **Auditorías:** [audits/](./audits/) — veredictos **pendientes de arquitecto**
- **Agente Android:** `iterations/v1/` — **no construir** hasta `ready_for_construction: true`
- **Panel TI:** `admin/v1/` — **no construir** hasta el mismo flag

## Qué cambió respecto de v1.0.0

El contrato anterior solo monitoreaba GPS (`telefono_encendido`, `dentro_perimetro`).  
v2.0.0 reformula el V1 a **seguridad de equipos**:

- Agente Device Owner (`DeviceAdminReceiver` + `DevicePolicyManager`)
- TI aprueba enrollment, monitorea, bloquea, libera política, resetea PIN y reinicia
- Auth TI (`perfiles.rol = ti`); el agente no usa esas RPCs

`lockNow()` no quita el PIN del usuario. Desbloqueo TI = `unlock_policy` + `reset_pin`.

## Gates (todos en false)

| Gate | Flag | Doc |
|------|------|-----|
| 1 Documentación | `audit_1_passed` | `idea/01`, `idea/02`, `audits/auditoria-documentacion.md` |
| 2 Módulos | `audit_2_passed` | `idea/03`, `audits/auditoria-modulos.md` |
| 3A Visual | `visual_approval_passed` | `idea/04` |
| 3B Ensamblado | `audit_3_passed` | `idea/04`, `idea/05`, `audits/auditoria-ensamblado.md` |
| Construcción | `ready_for_construction` | `idea/05` |

Un agente IA no activa estos flags.

## Campos clave (Supabase)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `nombre_registrado` | text | Nombre del teléfono |
| `base_lat` / `base_lng` | float | Coordenadas base |
| `telefono_encendido` | boolean | Inferido (agente vivo) |
| `dentro_perimetro` | boolean | Dentro de 120 m |
| `estado_enrollment` | text | `pendiente` / `aprobado` / `rechazado` |
| `es_device_owner` | boolean | Owner reportado |
| `politica_autolock` | boolean | Lock al salir de base |

## RPCs

**Agente (anon + fingerprint):** `registrar_dispositivo`, `reportar_ubicacion`, `obtener_dispositivo`, `reportar_politica`, `obtener_comando_pendiente`, `acusar_comando`.

**TI (JWT + rol `ti`):** `listar_flota`, `obtener_dispositivo_admin`, `aprobar_dispositivo`, `solicitar_comando`, `listar_comandos`.

Migración `003_security_fleet.sql`: contrato listo; apply remoto solo post-gate.
