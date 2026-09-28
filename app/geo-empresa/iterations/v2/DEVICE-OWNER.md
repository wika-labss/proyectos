# Device Owner — Geo Empresa V2.1

Con Device Owner el agente bloquea el teléfono completo:

- `setLockTaskPackages` + `startLockTask` (kiosco, sin Inicio)
- `lockNow()` (bloqueo de sistema)
- receptor nativo de modo avión (no depende de JS ni de Supabase)
- geocerca **20 m**

El PIN de prueba es `1312` (15 minutos de snooze).

## Instalar sobre un teléfono que ya es Owner

No desinstalar el paquete. Reemplazar el APK:

```powershell
adb install -r geo-empresa-v2.apk
adb shell dpm list-owners
```

`list-owners` debe seguir mostrando `com.wika.geoempresa`.

## Primer provisionamiento

```powershell
adb install geo-empresa-v2.apk
adb shell dpm set-device-owner com.wika.geoempresa/.GeoDeviceAdminReceiver
adb shell dpm list-owners
```

Requiere factory reset o dispositivo sin cuentas.

## Probar

1. Abrir Geo Empresa y registrar (base = GPS actual, radio 20 m).
2. Activar modo avión: debe aparecer la pantalla de PIN y no se puede ir a Inicio.
3. Salir a más de 20 m: mismo lock.
