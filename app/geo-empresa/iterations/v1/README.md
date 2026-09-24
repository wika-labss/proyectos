# Geo Empresa — Agente Android V1

Package `com.wika.geoempresa`. Expo SDK 52 + módulo nativo Device Owner.

```bash
cp .env.example .env
# completar EXPO_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run smoke
npm run typecheck
```

Device Owner (lab, sin cuentas en el teléfono):

```bash
adb shell dpm set-device-owner com.wika.geoempresa/com.wika.geoempresa.devicepolicy.GeoDeviceAdminReceiver
```

Expo Go no incluye `DevicePolicyManager`. Usar development build / APK.
