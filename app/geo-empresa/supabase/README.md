# Supabase — Geo Empresa

| Campo | Valor |
|-------|-------|
| **Proyecto** | geo-empresa |
| **Ref** | `ugzprmopgmbjjxsbjmti` |
| **Región** | sa-east-1 |
| **URL** | `https://ugzprmopgmbjjxsbjmti.supabase.co` |

> Anon key del **agente**: `EXPO_PUBLIC_SUPABASE_ANON_KEY` (no commitear).  
> Panel TI: Auth email/password + JWT; no usar `service_role` en el browser.

**Contrato v2.0.0:** seguridad de flota. Las migraciones `001`–`003` viven en `migrations/`. **No aplicar `003` al remoto** hasta `ready_for_construction: true` en `idea/05-build-plan.md`.

---

## Modelo de datos

### `dispositivos` — estado actual por móvil

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid | PK |
| `nombre_registrado` | text | Nombre asignado al teléfono |
| `device_fingerprint` | text | ID único (UNIQUE) |
| `modelo` | text | Modelo (opcional) |
| `base_lat` / `base_lng` | float | Punto base |
| `radio_metros` | int | Radio geocerca (default **120**) |
| `telefono_encendido` | boolean | Inferido: agente vivo / ping |
| `dentro_perimetro` | boolean | Distancia ≤ radio |
| `ultima_lat` / `ultima_lng` | float | Último GPS |
| `ultima_precision_m` | float | Precisión GPS |
| `distancia_base_m` | float | Distancia a la base (m) |
| `ultimo_ping_at` | timestamptz | Último reporte |
| `registrado_at` | timestamptz | Alta |
| `activo` | boolean | Habilitado |
| `estado_enrollment` | text | `pendiente` \| `aprobado` \| `rechazado` |
| `es_device_owner` | boolean | Reportado por el agente |
| `admin_activo` | boolean | Device Admin activo |
| `politica_autolock` | boolean | Lock automático si sale de 120 m |
| `ultimo_lock_at` | timestamptz | Último lock ejecutado |

### `ubicacion_reportes` — histórico de pings

Sin PIN ni payload de comandos.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `dispositivo_id` | uuid | FK → dispositivos |
| `lat`, `lng` | float | Ubicación |
| `precision_m` | float | Precisión GPS |
| `distancia_base_m` | float | Distancia calculada |
| `telefono_encendido` | boolean | Estado inferido en ese momento |
| `dentro_perimetro` | boolean | Dentro/fuera |
| `registrado_at` | timestamptz | Timestamp |

### `perfiles` — rol TI

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid | PK = `auth.users.id` |
| `rol` | text | check `ti` |
| `nombre` | text | Opcional |
| `creado_at` | timestamptz | Alta |

Seed del primer usuario TI: fuera del repo (Dashboard Auth + INSERT a `perfiles`). No commitear contraseñas.

### `comandos_dispositivo`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid | PK |
| `dispositivo_id` | uuid | FK |
| `tipo` | text | `lock` \| `unlock_policy` \| `reset_pin` \| `reboot` |
| `estado` | text | `pendiente` \| `ejecutado` \| `fallido` |
| `payload` | jsonb | Solo `reset_pin`: `{ "pin": "..." }`. Lo lee `obtener_comando_pendiente`. `listar_comandos` **omite** este campo. Se borra al acusar OK. |
| `solicitado_por` | uuid | `auth.uid()` TI |
| `solicitado_at` / `ejecutado_at` | timestamptz | Auditoría |
| `error_mensaje` | text | Si `fallido` |

---

## RPCs agente (anon, fingerprint)

| RPC | Uso |
|-----|-----|
| `registrar_dispositivo` | Alta / update; deja `estado_enrollment = pendiente` |
| `reportar_ubicacion` | Ping; respuesta incluye `debe_bloquear` y `politica_autolock` |
| `obtener_dispositivo` | Snapshot propio |
| `reportar_politica` | Owner / admin / lock |
| `obtener_comando_pendiente` | Poll; incluye payload PIN solo para ese fingerprint |
| `acusar_comando` | ACK; `unlock_policy` apaga auto-lock; `reset_pin` limpia payload |

`debe_bloquear = (NOT dentro_perimetro) AND politica_autolock AND estado_enrollment = 'aprobado'`.

El agente **no** llama RPCs TI.

---

## RPCs TI (JWT + `perfiles.rol = ti`)

| RPC | Uso |
|-----|-----|
| `listar_flota` | Listado sin PIN |
| `obtener_dispositivo_admin` | Detalle + últimos 20 pings |
| `aprobar_dispositivo` | `aprobado` \| `rechazado` |
| `solicitar_comando` | Encola comando. `unlock_policy` setea `politica_autolock = false` de inmediato. `lock` la reactiva. |
| `listar_comandos` | Histórico **sin** payload |

`is_ti()` es helper interno. Anon no tiene GRANT de las RPCs TI.

---

## Seguridad

- RLS en todas las tablas; **sin políticas de lectura/escritura directa** para anon/authenticated.
- Solo RPCs `SECURITY DEFINER` con grants por rol.
- PIN de reset: no se guarda en `ubicacion_reportes`; no se devuelve en listados TI; se nullifica al acusar OK.
- `service_role` no se usa en el panel ni en el APK.

---

## Provisionamiento Device Owner (operativo, no SQL)

El panel documenta el payload. No reemplaza Android Enterprise:

1. Factory reset del teléfono corporativo.
2. QR / `adb shell dpm set-device-owner com.wika.geoempresa/.…DeviceAdminReceiver` (componente exacto = módulo nativo).
3. El agente registra fingerprint → `pendiente`.
4. TI aprueba en el panel.

---

## Migraciones

| Archivo | Contenido | Estado |
|---------|-----------|--------|
| `001_create_geo_empresa_schema.sql` | Tablas monitoreo + `distancia_metros` | Contrato de lo ya aplicado en remoto |
| `002_create_geo_empresa_rpcs_and_rls.sql` | 3 RPCs monitoreo + RLS | Contrato de lo ya aplicado; **reemplazado** por 003 |
| `003_security_fleet.sql` | Columnas policy, `perfiles`, `comandos_*`, RPCs agente+TI | Aplicado en remoto 2026-09-24 (`security_fleet`, `security_fleet_rpcs`, `security_fleet_commands`, `security_fleet_admin_rpcs`) |
