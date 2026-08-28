---
id: "FEAT-001"
title: "Geo Empresa — Features V1"
status: "APROBADO"
version: "1.0.0"
owner: "Vissiuss / Equipo WIKA"
created_at: "2026-08-27"
updated_at: "2026-08-27"
audit_1_passed: true
audit_2_passed: false
---

# [02] Especificación de Características

## RTM Features

| ID Feature | ID Problema | Nombre | Prioridad | Módulo |
|------------|-------------|--------|-----------|--------|
| FEAT-01 | ERR-01, ERR-02 | Registro único del dispositivo | Crítica | mod-registration |
| FEAT-02 | ERR-03 | Agente de ubicación en background | Crítica | mod-location-agent |
| FEAT-03 | ERR-04 | Geocerca 120 m | Crítica | mod-fence-engine |
| FEAT-04 | ERR-05 | Estado teléfono encendido/apagado | Alta | mod-device-state |
| FEAT-05 | ERR-06 | Consulta estado vía RPC | Alta | mod-api |

---

## FEAT-01: Registro único

**Pantalla única** al instalar. Campos:

| Campo UI | Campo Supabase | Tipo |
|----------|----------------|------|
| Nombre del teléfono | `nombre_registrado` | text |
| (auto) ID dispositivo | `device_fingerprint` | text |
| (auto) Modelo | `modelo` | text |
| Latitud base | `base_lat` | float |
| Longitud base | `base_lng` | float |
| Radio (default 120) | `radio_metros` | int |

**RPC:** `registrar_dispositivo(nombre, fingerprint, base_lat, base_lng, modelo?, radio_metros?)`

#### Escenario 1.1 — Happy path

- **Dado** red disponible y permisos de ubicación
- **Cuando** confirma registro
- **Entonces** RPC retorna JSON con `id`, coordenadas base y flags iniciales `true`

---

## FEAT-02: Background location

- Tras registro, la UI puede minimizarse; solo corre servicio en background
- Intervalo configurable: 5–15 min (V1 default: 10 min)
- Cada ping llama `reportar_ubicacion`

---

## FEAT-03: Geocerca

- Cálculo Haversine en Postgres (`distancia_metros`)
- `dentro_perimetro = distancia_base_m <= radio_metros`
- Default `radio_metros = 120`

---

## FEAT-04: Estado del teléfono

| Valor | Significado |
|-------|-------------|
| `telefono_encendido = true` | Dispositivo operativo, pantalla/desbloqueo activo o agente vivo |
| `telefono_encendido = false` | Apagado, sin señal prolongada, o agente detenido |

La app infiere el estado (AppState + último ping) y lo envía en cada reporte.

---

## FEAT-05: Consulta de estado

**RPC:** `obtener_dispositivo(fingerprint)` — retorna snapshot actual:

```json
{
  "nombre_registrado": "Telefono Juan",
  "telefono_encendido": true,
  "dentro_perimetro": false,
  "distancia_base_m": 145.2,
  "ultimo_ping_at": "2026-08-27T23:00:00Z"
}
```

---

## Fuera de alcance V1

- Dashboard web
- iOS
- MDM
- Notificaciones
