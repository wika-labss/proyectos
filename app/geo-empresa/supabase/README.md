# Supabase — Geo Empresa

| Campo | Valor |
|-------|-------|
| **Proyecto** | geo-empresa |
| **Ref** | `ugzprmopgmbjjxsbjmti` |
| **Región** | sa-east-1 |
| **Estado** | `ACTIVE_HEALTHY` (revisado 2026-09-28) |
| **URL** | `https://ugzprmopgmbjjxsbjmti.supabase.co` |

La anon key vive en la app vía `EXPO_PUBLIC_SUPABASE_ANON_KEY`. No commitearla.

El contrato vigente es el de las migraciones del 2026-09-24 (`security_fleet*`). Las funciones de agosto quedan como historial: migraciones posteriores las reemplazan.

SQL reproducible: [migrations/](./migrations/).

---

## Tablas

RLS está habilitado y no hay políticas de lectura directa. El acceso es por RPC `SECURITY DEFINER`.

### `dispositivos`

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid | PK |
| `nombre_registrado` | text | Mínimo 2 caracteres |
| `device_fingerprint` | text | UNIQUE |
| `modelo` | text | Opcional |
| `base_lat` / `base_lng` | float | Punto base |
| `radio_metros` | int | Default **120**, máximo 5000 |
| `telefono_encendido` | boolean | Encendido / agente vivo |
| `dentro_perimetro` | boolean | Distancia ≤ radio |
| `ultima_lat` / `ultima_lng` / `ultima_precision_m` | float | Último ping |
| `distancia_base_m` | float | Haversine en metros |
| `ultimo_ping_at` | timestamptz | |
| `registrado_at` / `updated_at` | timestamptz | |
| `activo` | boolean | Default `true` |
| `estado_enrollment` | text | `pendiente` \| `aprobado` \| `rechazado` |
| `es_device_owner` | boolean | El agente lo reporta |
| `admin_activo` | boolean | El agente lo reporta |
| `politica_autolock` | boolean | Default `true` |
| `ultimo_lock_at` | timestamptz | Último lock acusado |

### `ubicacion_reportes`

Histórico de cada ping (el cuerpo vigente inserta todos los reportes, no solo anomalías).

`dispositivo_id`, `lat`, `lng`, `precision_m`, `distancia_base_m`, `telefono_encendido`, `dentro_perimetro`, `registrado_at`.

### `perfiles`

Usuario TI. `id` → `auth.users`. `rol` solo admite `ti`.

### `comandos_dispositivo`

| Columna | Valores |
|---------|---------|
| `tipo` | `lock`, `unlock_policy`, `reset_pin`, `reboot` |
| `estado` | `pendiente`, `ejecutado`, `fallido` |
| `payload` | JSON con `pin` solo en `reset_pin`; se borra al acusar éxito |

---

## RPCs del agente (anon)

### `registrar_dispositivo`

Upsert por fingerprint. El alta nueva queda en `estado_enrollment = pendiente`. Un re-registro actualiza nombre, base, modelo y radio, y **conserva** el enrollment.

```json
{
  "p_nombre_registrado": "Telefono Juan",
  "p_device_fingerprint": "android-abc123",
  "p_base_lat": -33.4489,
  "p_base_lng": -70.6693,
  "p_modelo": "Samsung A54",
  "p_radio_metros": 120
}
```

La convención de la app es `android-{ANDROID_ID}`. El RPC vigente acepta cualquier fingerprint no vacío.

### `reportar_ubicacion`

Actualiza el snapshot, inserta histórico y calcula el lock.

`debe_bloquear` es `true` solo si las tres condiciones se cumplen: fuera del radio, `politica_autolock` y `estado_enrollment = aprobado`.

```json
{
  "p_device_fingerprint": "android-abc123",
  "p_lat": -33.449,
  "p_lng": -70.6693,
  "p_precision_m": 15,
  "p_telefono_encendido": true
}
```

### `obtener_dispositivo`

Snapshot sin escribir histórico. Incluye enrollment, política, Device Owner y admin.

### `reportar_politica`

```json
{
  "p_device_fingerprint": "android-abc123",
  "p_es_device_owner": true,
  "p_admin_activo": true,
  "p_locked": false
}
```

### `obtener_comando_pendiente`

El comando `pendiente` más antiguo, o `null`. El payload de `reset_pin` viaja aquí una sola vez.

### `acusar_comando`

```json
{
  "p_comando_id": "uuid",
  "p_device_fingerprint": "android-abc123",
  "p_ok": true,
  "p_error": null
}
```

Éxito en `lock` escribe `ultimo_lock_at`. Éxito en `unlock_policy` deja `politica_autolock = false`. Éxito en `reset_pin` limpia el payload.

---

## RPCs de TI (sesión autenticada + `perfiles.rol = ti`)

Todas lanzan `forbidden` si `is_ti()` es falso.

| RPC | Uso |
|-----|-----|
| `listar_flota()` | Listado de dispositivos |
| `obtener_dispositivo_admin(uuid)` | Detalle + últimos 20 reportes |
| `aprobar_dispositivo(uuid, 'aprobado' \| 'rechazado')` | Enrollment |
| `solicitar_comando(uuid, tipo, pin?)` | Encola comando. Solo dispositivos `aprobado`. `lock` enciende autolock; `unlock_policy` lo apaga. PIN mínimo 4 |
| `listar_comandos(uuid)` | Historial de comandos, sin payload |

La migración otorga estas funciones a `authenticated`. En el catálogo vivo también aparece `EXECUTE` para `anon` por privilegios default de Supabase; `is_ti()` igual rechaza la llamada. Conviene revocar `anon` en un paso aparte.

---

## Migraciones aplicadas

1. `20260827235221_create_geo_empresa_schema`
2. `20260827235229_create_geo_empresa_rpcs_and_rls`
3. `20260828152731_v2_registro_unico_y_historial_anomalias`
4. `20260924191131_security_fleet`
5. `20260924191149_security_fleet_rpcs`
6. `20260924191217_security_fleet_commands`
7. `20260924191221_security_fleet_admin_rpcs`

Datos al 2026-09-28: `dispositivos` y `ubicacion_reportes` en 0 filas, `perfiles` en 1, `comandos_dispositivo` en 5.
