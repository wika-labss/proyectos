# Device Owner — Geo Empresa V2

## Bloqueo total de Inicio

`startLockTask()` solo impide el botón Home cuando la app es **Device Owner**.

### Prueba ADB (1 dispositivo)

```bash
adb install geo-empresa-v2-release.apk
adb shell dpm set-device-owner com.wika.geoempresa/.GeoDeviceAdminReceiver
adb shell dpm get-device-owner
```

Requiere factory reset o dispositivo sin cuentas configuradas.

### Producción

Generar QR Android Enterprise apuntando a `com.wika.geoempresa` tras reset IT.

## Flota legacy

Sin Device Owner, la pantalla de bloqueo RN + `SecurityLockActivity` nativa aplican presión visual; el usuario aún puede ir a Inicio si no concedió overlay.
