# Geo Empresa

Monitoreo de teléfonos corporativos con geocerca Supabase.

- **Backend:** Supabase `geo-empresa` — ver [supabase/README.md](./supabase/README.md)
- **Documentación WIKA:** [idea/](./idea/)
- **Experimento 0 (admin directo, sin BD):** [experiment-0/README.md](./experiment-0/README.md) — broker WebSocket, consola y APK silenciosa; [cierre sesión 15-oct-2025](./experiment-0/docs/SESION-2026-10-15.md)
- **App móvil (Supabase):** diseño en `idea/`; comandos por RPC pausados hasta validar experimento 0

## Campos clave (Supabase)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `nombre_registrado` | text | Nombre del teléfono |
| `base_lat` / `base_lng` | float | Coordenadas base |
| `telefono_encendido` | boolean | Encendido (`true`) / apagado (`false`) |
| `dentro_perimetro` | boolean | Dentro de 120 m (`true`) / fuera (`false`) |

## RPCs

- `registrar_dispositivo` — registro único
- `reportar_ubicacion` — ping background
- `obtener_dispositivo` — consulta estado
