# Geo Empresa

Monitoreo de teléfonos corporativos con geocerca, enrollment y comandos de flota.

- **Backend:** Supabase `geo-empresa` (`ACTIVE_HEALTHY`) — [supabase/README.md](./supabase/README.md)
- **Documentación WIKA:** [idea/](./idea/)
- **Diseño de pantallas:** [idea/04-application-design.md](./idea/04-application-design.md) — Gate 3A pendiente
- **App móvil:** pendiente V1. El siguiente paso, tras el visto bueno visual, es `05-build-plan.md` y `iterations/v1/`

## Campos clave (Supabase)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `nombre_registrado` | text | Nombre del teléfono |
| `base_lat` / `base_lng` | float | Coordenadas base |
| `telefono_encendido` | boolean | Encendido (`true`) / apagado (`false`) |
| `dentro_perimetro` | boolean | Dentro de 120 m (`true`) / fuera (`false`) |

## RPCs

Agente: `registrar_dispositivo`, `reportar_ubicacion`, `obtener_dispositivo`, `reportar_politica`, `obtener_comando_pendiente`, `acusar_comando`.

Consola TI: `listar_flota`, `obtener_dispositivo_admin`, `aprobar_dispositivo`, `solicitar_comando`, `listar_comandos`.
