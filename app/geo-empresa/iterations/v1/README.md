# Geo Empresa — Agente Android V1

Package `com.wika.geoempresa`. Expo SDK 52 + módulo nativo Device Policy.

**Congelado** con el resto del proyecto. Ver [`../../STATUS.md`](../../STATUS.md).

```bash
cp .env.example .env
# completar EXPO_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run smoke
npm run typecheck
```

Expo Go no incluye `DevicePolicyManager`. Usar development build / APK. Instalar el APK **no** requiere reboot.

## Device Admin vs Device Owner

| Nivel | Cómo se obtiene | Qué aplica este agente |
|---|---|---|
| Nada | Sideload | GPS / registro. Owner = no. Autolock no corre. |
| Device Admin | El usuario acepta administrador | `lockNow()` por comando TI (`lock`) |
| Device Owner | Teléfono **sin cuentas** + `dpm` | lock, autolock, reboot, reset PIN, anti-uninstall |

```powershell
adb devices
# tiene que decir "device", no "unauthorized"

adb install -r .\geo-empresa-v1.apk

adb shell dpm set-device-owner com.wika.geoempresa/com.wika.geoempresa.devicepolicy.GeoDeviceAdminReceiver
```

Si `dpm` dice *already some accounts on the device*: factory reset, asistente **sin** Google/Samsung (mejor sin Wi‑Fi/SIM), repetir. No se quitan cuentas por PowerShell.

Lab 2026-09-24: Galaxy quedó Admin, no Owner.
