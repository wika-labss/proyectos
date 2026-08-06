# Funcionalidades

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

- [ ] Splash Vissiuss (negro / blanco / watermark)

### Conexión y emparejamiento (P0 URGENTE)

- [ ] **Android TV / Google TV** — Discovery puerto 6467 + emparejamiento PIN (protocolo Remote v2)
- [ ] **Cleartext HTTP LAN** — `usesCleartextTraffic: true` (Android bloquea HTTP sin esto)
- [ ] **Escaneo largo** — timeout probe ≥ 2500 ms; lotes ≤ 16 hosts
- [ ] **Progreso de búsqueda** — "Escaneando red… X%" o hosts revisados
- [ ] **Mínimo tiempo de búsqueda** — al menos ~8–12 s de escaneo visible (no cerrar en <1 s)
- [ ] **Verificar al conectar** — `connect` hace probe HTTP real; falla si TV no responde
- [ ] **IP manual** — campo para IP + seleccionar protocolo (Roku / Vissius) si el escaneo falla
- [ ] **Aviso sin TVs** — mensaje claro + sugerencia de IP manual
- [ ] **Conexión exitosa** — banner ✓
- [ ] Recordar TV emparejada

### Control remoto

- [ ] Pad navegación + Cambiar TV
- [ ] **Volumen 0–100, paso 1**; 0 = mute

### Apps

- [ ] Netflix, HBO, YouTube, Crunchyroll

### Entradas (v3)

- [ ] **HDMI 1, HDMI 2, HDMI 3, HDMI 4**
- [ ] **AV / TV Tuner** (si el protocolo lo soporta)
- [ ] Tab o pantalla **Entradas** junto a Mando / Apps

## Layout de pantallas

| Pantalla | Contenido |
|----------|-----------|
| Splash | Negro, Vissiuss |
| Emparejamiento | Buscar + progreso + IP manual |
| Mando | Pad + volumen step 1 |
| Apps | Streaming |
| **Entradas** | HDMI 1–4, AV, TV |

## Priorización v3

| Prioridad | Funcionalidad |
|-----------|---------------|
| **P0 URGENTE** | Emparejamiento Android TV funcional (PIN + TLS) |
| P0 | Cleartext + timeouts + verify connect |
| P0 | Volumen paso 1 |
| P0 | Pantalla Entradas HDMI |
| P1 | IP manual |
| P1 | Progreso de escaneo |

## Fuera de alcance (v3)

- iOS
- Bluetooth
- Samsung/LG APIs propietarias completas (v4+)
