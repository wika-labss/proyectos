# Revisión — Vissius Control Remote

## Versión evaluada

**v3.2** — Mock cleanup + logs claros — `app/Vissius control remote/iterations/v3.2/`

## Fecha

2026-08-06

---

## Historial

| Iteración | Estado | Notas |
|-----------|--------|-------|
| v1–v3 | Cerradas | Mock → LAN → Android TV |
| v3.1 | Cerrada | Logs exportables (ruido probe /24) |
| **v3.2** | **En curso** | Purga mock + logs alto nivel + guía v4 |

---

## Cambios v3.2

| Área | Cambio |
|------|--------|
| Storage | Migración `32`: elimina `mock-*` / TV mock v1 al cargar |
| Logs | Buffer 120; sin log por IP cerrada; `scan.*` / `connect.*` / `network.wifi` |
| Export | Texto/JSON incluyen **guia_conexion_v4** |
| Versión | `3.2.0` |

## Cómo leer un export (para v4)

1. `network.wifi --> ok` — WiFi del móvil
2. `scan.phoneIp --> ip=… subnet=…` — subred escaneada
3. `scan.done` / `scan.result` — `found=0` o lista `protocol@ip`
4. `connect.byIp` / `connect.verify` / `connect.ok|fail` — ruta de conexión real
5. `androidtv.pair` — PIN Android TV

Si `found=0`: misma WiFi + IP manual desde Ajustes→Red de la TV.
