# Geo Empresa — Experimento 0 (admin directo, sin BD)

Canal **consola → broker en memoria → APK** por WebSocket. No usa Supabase para comandos ni registro.

**Informe de sesión (15 oct 2026):** [docs/SESION-2026-10-15.md](docs/SESION-2026-10-15.md) — qué funcionó, pendientes (reposo / post-reboot) y **Fase 2** (ping, geocerca, auto-lock).

## Componentes

| Carpeta | Rol |
|---------|-----|
| [`broker/`](broker/) | HTTP + WebSocket, estado en RAM |
| [`admin/`](admin/) | Consola HTML servida en `/` |
| [`agent/`](agent/) | APK silenciosa `com.wika.geoempresa` (Device Owner) |

## Comandos (contrato WebSocket)

**Servidor → APK** (`kind: "command"`):

```json
{ "kind": "command", "id": "uuid", "type": "LOCK" }
```

Tipos v0: `LOCK`, `UNLOCK`, `LOCATE`, `REBOOT`, `STATUS`.

**APK → servidor:**

```json
{ "kind": "hello", "model": "SM-A225M", "appVersion": "0.1.0", "isDeviceOwner": true, "androidSdk": 34 }
```

```json
{
  "kind": "ack",
  "commandId": "uuid",
  "ok": true,
  "kiosk": true,
  "lat": -33.417,
  "lng": -70.595,
  "accuracyM": 15,
  "error": null
}
```

```json
{
  "kind": "telemetry",
  "kiosk": false,
  "airplane": false,
  "gpsOn": true,
  "networkOk": true,
  "lat": -33.417,
  "lng": -70.595,
  "accuracyM": 20
}
```

**Consola → broker (HTTP):**

- `GET /api/devices` — solo **online** (WebSocket abierto + `lastSeen` < 30 s)
- `POST /api/devices/:deviceId/commands` — body `{ "type": "LOCK" }`
- `GET /api/config` — base geocerca para UI
- `GET /api/events?limit=50`

**Conexión APK:**

`ws://<IP-PC-LAN>:8787/ws/device?deviceId=android-<ANDROID_ID>`

## Laboratorio

### 1. Broker + consola

```bash
cd app/geo-empresa/experiment-0/broker
npm install
npm start
```

Abrir `http://<IP-PC>:8787/` (misma WiFi que el teléfono).

### 2. Mock (sin teléfono)

```bash
node scripts/mock-device.js &
curl -s -X POST http://127.0.0.1:8787/api/devices/android-mock-lab/commands \
  -H 'Content-Type: application/json' \
  -d '{"type":"LOCATE"}'
```

### 3. APK

```bash
cd app/geo-empresa/experiment-0/agent
npm install
export EXPO_PUBLIC_BROKER_WS_URL=ws://192.168.x.x:8787/ws/device
npm run build:apk
```

Windows (mantener Device Owner — **no desinstalar**):

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r .\app-release.apk
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" shell am start -n com.wika.geoempresa/.MainActivity
```

Abrir la app **una vez**; se minimiza sola. El dispositivo debe aparecer **online** en la consola.

PIN kiosco local: **1312**. `UNLOCK` remoto sale del kiosco sin PIN (TI).

### 4. Criterios de aceptación

1. Dispositivo online sin login en consola.
2. `LOCK` → kiosco ≤10 s, ACK `kiosk: true`.
3. `UNLOCK` → sale de kiosco.
4. `LOCATE` → coords en consola.
5. `REBOOT` → reinicio (manual, con confirmación).
6. Sin Supabase en runtime.

## Mapping Device Owner (Kotlin)

| Comando | Nativo |
|---------|--------|
| LOCK | `GeoLockController.applyHardLock` → `startLockTask` |
| UNLOCK | `SecurityLockActivity` + `EXTRA_ADMIN_UNLOCK` |
| LOCATE | `LocationManager` last known |
| REBOOT | `DevicePolicyManager.reboot` |
| STATUS | flags owner / kiosk / red / GPS / avión |

## v1 (fuera de alcance)

`SET_PIN`, `WIPE`, restricciones cámara, auditoría en Supabase.

## Roadmap breve

| Etapa | Contenido |
|-------|-----------|
| **Exp 0 (hoy)** | Admin directo, comandos manuales LOCK/UNLOCK/LOCATE/REBOOT/STATUS. |
| **Hardening** | WS estable con pantalla off / Doze; auto-arranque tras reboot. |
| **Fase 2** | Ping constante, detección fuera de rango, bloqueo automático. |
| **v1 Supabase** | Registro, auditoría persistente, RPCs (cuando exp0 sea estable). |

Detalle en [docs/SESION-2026-10-15.md](docs/SESION-2026-10-15.md).
