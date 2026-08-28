# Geo Empresa V1

Agente Android de geolocalización corporativa.

## Funcionalidades V1

- Registro único con **nombre** (coordenadas base = GPS actual)
- Ubicación permanente + ping cada **5 minutos** en background
- Radio geocerca **120 m** (Supabase)
- PIN test **`1312`** para detener monitoreo / permitir desinstalación
- Reporte inmediato al encender/apagar (AppState + modo avión)
- Overlay bloqueante si modo avión activo
- Device Admin Android para dificultar desinstalación sin PIN

## Comandos

```bash
npm install
npm run typecheck
npm run smoke
npm run prebuild:android
```

## Supabase

Proyecto `ugzprmopgmbjjxsbjmti` — ver `../../supabase/README.md`

## Limitaciones

- Bloqueo **total** de modo avión y desinstalación requiere **Device Owner** (Android Enterprise).
- V1 usa Device Admin + overlay + PIN `1312`.
