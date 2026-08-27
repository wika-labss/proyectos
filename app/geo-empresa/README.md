# Geo Empresa

Monitoreo de teléfonos corporativos con geocerca Supabase.

- **Backend:** Supabase `geo-empresa` — ver [supabase/README.md](./supabase/README.md)
- **Documentación WIKA:** [idea/](./idea/)
- **App móvil:** pendiente V1 (Android agente + registro único + background)

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
