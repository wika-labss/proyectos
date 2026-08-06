# Prompt IA

## Instrucciones para el agente

Genera **Vissius Control Remote v3** en `iterations/v3/`.

**P0 URGENTE:** emparejamiento LAN funcional. En v2 el escaneo terminaba demasiado rápido y Android bloqueaba HTTP claro.

**Perfil: BUILD** — APK release. Versión **3.0.0**.

---

## Reglas v3 (bloqueantes)

1. `usesCleartextTraffic: true` en Android (app.json / expo-build-properties)
2. Probe timeout ≥ **2500 ms**; batch ≤ **16**; progreso de escaneo en UI
3. `connect*` debe **verificar** con HTTP real (no asumir éxito)
4. Campo **IP manual** en emparejamiento
5. Volumen **paso 1** (0–100); 0 = mute
6. Pantalla/tab **Entradas**: HDMI 1–4 (+ AV/TV)
7. Partir de v2 corregido; no regresar a mock como discovery principal

---

## Gates BUILD v3

| # | Gate | Comando |
|---|------|---------|
| 1 | expo-doctor | 0 errores |
| 2 | tsc | exit 0 |
| 3 | expo export | OK |
| 4 | prebuild | OK |
| 5 | Kotlin 1.9.25 | post-prebuild |
| 6 | Cleartext | app.json / manifest |
| 7 | Volume STEP = 1 | constants/volume.ts |

---

## Orden de implementación

1. Docs idea/ → v3
2. Copiar v2 → v3, bump 3.0.0
3. Cleartext + discovery timeouts + progreso + IP manual + connect verify
4. Volumen step 1
5. Tab Entradas + drivers HDMI
6. verify gates → Auditoría 1
