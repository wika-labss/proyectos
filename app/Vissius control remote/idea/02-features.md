# Funcionalidades

## Iteración v3.1 — cambios respecto a v3

| Área | v3 | v3.1 |
|------|----|------|
| Diagnóstico | Solo consola / feedback UI | **Módulo logs** `ejecución → resultado` |
| Export | No | **Share texto + JSON** |
| Pantalla Logs | No | **`/logs`** filtros + limpiar |
| Discovery fix | Pendiente | **Sin fix aún** (diagnóstico primero) |

---

## Iteración v3 — cambios respecto a v2

| Área | v2 | v3 |
|------|----|----|
| Discovery | Timeout 700 ms, batches 40, sin cleartext | **Timeout 2.5 s**, batches 16, **HTTP cleartext**, progreso visible |
| Protocolos | Roku + Vissius | **Android TV / Google TV** (6466/6467 + PIN) + Roku + Vissius |
| Emparejamiento | Connect Roku sin verificar | **Probe real** + **PIN Android TV** + IP manual |
| Volumen | Paso 5 | **Paso 1** (0–100 de uno en uno) |
| Entradas | No | **Pantalla Entradas** HDMI 1–4, AV, TV |
| Perfil | BUILD v2 | BUILD **v3** |

---

## Funcionalidades principales

### Pantalla de inicio

- [x] Splash Vissiuss (negro / blanco / watermark)

### Conexión y emparejamiento (P0 URGENTE)

- [x] **Android TV / Google TV** — Discovery puerto 6467 + emparejamiento PIN (protocolo Remote v2)
- [x] **Cleartext HTTP LAN** — `usesCleartextTraffic: true` (Android bloquea HTTP sin esto)
- [x] **Escaneo largo** — timeout probe ≥ 2500 ms; lotes ≤ 16 hosts
- [x] **Progreso de búsqueda** — "Escaneando red… X%" o hosts revisados
- [x] **Mínimo tiempo de búsqueda** — al menos ~8–12 s de escaneo visible (no cerrar en <1 s)
- [x] **Verificar al conectar** — `connect` hace probe HTTP real; falla si TV no responde
- [x] **IP manual** — campo para IP + seleccionar protocolo (Roku / Vissius) si el escaneo falla
- [x] **Aviso sin TVs** — mensaje claro + sugerencia de IP manual
- [x] **Conexión exitosa** — banner ✓
- [x] Recordar TV emparejada

### Diagnóstico (v3.1)

- [x] Logger `ejecución --> resultado`
- [x] Exportar texto / JSON (Share)
- [x] Pantalla Logs con filtros
- [x] Instrumentación discovery / WiFi / Android TV / connect

### Control remoto

- [x] Pad navegación + Cambiar TV
- [x] **Volumen 0–100, pasos 1**; 0 = mute

### Apps

- [x] Netflix, HBO, YouTube, Crunchyroll

### Entradas (v3)

- [x] **HDMI 1, HDMI 2, HDMI 3, HDMI 4**
- [x] **AV / TV Tuner** (si el protocolo lo soporta)
- [x] Tab o pantalla **Entradas** junto a Mando / Apps

## Layout de pantallas

| Pantalla | Contenido |
|----------|-----------|
| Splash | Negro, Vissiuss |
| Emparejamiento | Buscar + progreso + IP manual + enlace Logs |
| **Logs (v3.1)** | Lista ejecución→resultado + exportar |
| Mando | Pad + volumen step 1 + Logs |
| Apps | Streaming |
| **Entradas** | HDMI 1–4, AV, TV |

## Priorización v3.1

| Prioridad | Funcionalidad |
|-----------|---------------|
| **P0** | Módulo logs exportables para diagnosticar discovery vacío |
| P1 | Fix discovery (tras logs del dispositivo) |

## Fuera de alcance (v3.1)

- Fix de permisos / IP / Nearby WiFi (siguiente iteración tras logs)
- iOS
- Bluetooth
- Samsung/LG APIs propietarias completas (v4+)
