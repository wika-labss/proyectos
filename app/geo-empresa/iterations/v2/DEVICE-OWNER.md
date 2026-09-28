# Device Owner — Geo Empresa V2.2

El agente corre un **servicio en primer plano** (`GeoLockService`) que vigila modo avión (broadcast + watchdog 4 s), arranca al boot y entra a **Lock Task** (kiosco) con PIN `1312`.

Geocerca: **20 m**.

## Instalar sin perder Owner

```powershell
adb install -r geo-empresa-v2.apk
adb shell dumpsys package com.wika.geoempresa | findstr versionName
adb shell dpm list-owners
```

`versionName` = `2.2.0`. No desinstalar el paquete.

## Prueba interna de kiosco (ADB)

Con Device Owner ya puesto:

```powershell
adb shell am start -n com.wika.geoempresa/.SecurityLockActivity
adb shell dumpsys activity lock-task
```

`SecurityLockActivity` tiene que verse. Home no debe sacar. PIN `1312`.

Modo avión: dejar la notificación “Geo Empresa” visible, avión OFF → ON. En logcat: `GeoEmpresa`.
