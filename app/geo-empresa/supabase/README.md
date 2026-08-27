# Supabase — Geo Empresa

| Campo | Valor |
|-------|-------|
| **Proyecto** | geo-empresa |
| **Ref** | `ugzprmopgmbjjxsbjmti` |
| **Región** | sa-east-1 |
| **URL** | `https://ugzprmopgmbjjxsbjmti.supabase.co` |

> La anon key se configura en la app vía `EXPO_PUBLIC_SUPABASE_ANON_KEY` (no commitear en código productivo).

---

## Modelo de datos

### `dispositivos` — estado actual por móvil

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid | PK |
| `nombre_registrado` | text | Nombre asignado al teléfono |
| `device_fingerprint` | text | ID único del dispositivo (UNIQUE) |
| `modelo` | text | Modelo del móvil (opcional) |
| `base_lat` | float | Latitud del punto base |
| `base_lng` | float | Longitud del punto base |
| `radio_metros` | int | Radio geocerca (default **120**) |
| `telefono_encendido` | **boolean** | `true` encendido / operativo, `false` apagado o sin agente |
| `dentro_perimetro` | **boolean** | `true` dentro del radio, `false` fuera |
| `ultima_lat` | float | Última latitud reportada |
| `ultima_lng` | float | Última longitud reportada |
| `ultima_precision_m` | float | Precisión GPS del último ping |
| `distancia_base_m` | float | Distancia al punto base (m) |
| `ultimo_ping_at` | timestamptz | Timestamp del último reporte |
| `registrado_at` | timestamptz | Fecha de registro |
| `activo` | boolean | Dispositivo habilitado |

### `ubicacion_reportes` — histórico de pings

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `dispositivo_id` | uuid | FK → dispositivos |
| `lat`, `lng` | float | Ubicación del ping |
| `precision_m` | float | Precisión GPS |
| `distancia_base_m` | float | Distancia calculada |
| `telefono_encendido` | **boolean** | Estado en ese momento |
| `dentro_perimetro` | **boolean** | Dentro/fuera en ese momento |
| `registrado_at` | timestamptz | Timestamp del ping |

---

## RPCs

### `registrar_dispositivo`

Registro **una sola vez** (re-registro actualiza datos si mismo fingerprint).

```http
POST /rest/v1/rpc/registrar_dispositivo
Content-Type: application/json
apikey: {ANON_KEY}
Authorization: Bearer {ANON_KEY}

{
  "p_nombre_registrado": "Telefono Juan",
  "p_device_fingerprint": "abc123-fingerprint",
  "p_base_lat": -33.4489,
  "p_base_lng": -70.6693,
  "p_modelo": "Samsung A54",
  "p_radio_metros": 120
}
```

### `reportar_ubicacion`

Llamada periódica desde background. Actualiza `dispositivos` e inserta histórico.

```http
POST /rest/v1/rpc/reportar_ubicacion

{
  "p_device_fingerprint": "abc123-fingerprint",
  "p_lat": -33.4490,
  "p_lng": -70.6693,
  "p_precision_m": 15.0,
  "p_telefono_encendido": true
}
```

**Respuesta:**

```json
{
  "id": "uuid",
  "nombre_registrado": "Telefono Juan",
  "telefono_encendido": true,
  "dentro_perimetro": true,
  "distancia_base_m": 11.12,
  "radio_metros": 120,
  "ultimo_ping_at": "2026-08-27T23:52:38Z"
}
```

### `obtener_dispositivo`

Consulta snapshot sin escribir histórico.

```http
POST /rest/v1/rpc/obtener_dispositivo

{ "p_device_fingerprint": "abc123-fingerprint" }
```

---

## Seguridad

- RLS habilitado en tablas; **sin políticas de lectura directa**
- Solo RPCs `SECURITY DEFINER` expuestas a `anon`
- V1.1: panel admin con `service_role` o Auth + roles

---

## Migraciones aplicadas

1. `create_geo_empresa_schema` — tablas + `distancia_metros`
2. `create_geo_empresa_rpcs_and_rls` — RPCs + grants

Ver `migrations/` para SQL reproducible.
