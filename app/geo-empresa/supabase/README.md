# Supabase — Geo Empresa

| Campo | Valor |
|-------|-------|
| **Proyecto** | geo-empresa |
| **Ref** | `ugzprmopgmbjjxsbjmti` |
| **URL** | `https://ugzprmopgmbjjxsbjmti.supabase.co` |

## Tablas

- `dispositivos` — estado actual por fingerprint (flags, última ubicación, `ultimo_ping_at`)
- `ubicacion_reportes` — histórico de anomalías únicamente (V2+)

## RPCs

## Radio de geocerca

Default vivo: **20 m** (`dispositivos.radio_metros` y `registrar_dispositivo`).

### `registrar_dispositivo` (V2 — registro único)

- INSERT único; **no** `ON CONFLICT DO UPDATE`
- Requiere `p_device_fingerprint` con prefijo `android-`
- Si el fingerprint ya existe → excepción `Dispositivo ya registrado` (HTTP 400)

### `reportar_ubicacion` (V2 — histórico selectivo)

- **Siempre** actualiza fila en `dispositivos` (`ultima_lat`, `ultima_lng`, flags, `distancia_base_m`, `ultimo_ping_at`)
- **INSERT** en `ubicacion_reportes` solo si:

```sql
NOT v_dentro OR NOT COALESCE(p_telefono_encendido, true)
```

- Respuesta JSON incluye `historial_registrado: boolean`

### `obtener_dispositivo`

- Consulta estado por fingerprint

## Migraciones

| ID | Descripción |
|----|-------------|
| `v2_registro_unico_y_historial_anomalias` | Registro único + histórico solo anomalías |
| `radio_geocerca_20m` | Default y filas existentes a 20 m |

Ver SQL en `migrations/v2_registro_unico_y_historial_anomalias.sql`.

## Smoke SQL (manual)

```sql
-- 1. Registro OK
SELECT registrar_dispositivo('Test A', 'android-smoke-v2-001', -33.4489, -70.6693, NULL, 20);

-- 2. Duplicado → error
SELECT registrar_dispositivo('Test B', 'android-smoke-v2-001', -33.4489, -70.6693, NULL, 20);

-- 3. Ping dentro + encendido → historial_registrado false
SELECT reportar_ubicacion('android-smoke-v2-001', -33.4489, -70.6693, 10, true);

-- 4. Ping fuera → historial_registrado true
SELECT reportar_ubicacion('android-smoke-v2-001', -33.4600, -70.6693, 10, true);

-- 5. Ping dentro de nuevo → UPDATE dispositivos, sin fila histórica nueva
SELECT reportar_ubicacion('android-smoke-v2-001', -33.4489, -70.6693, 10, true);
```
