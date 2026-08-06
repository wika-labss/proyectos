Vissius Control Remote
======================

Proyecto WIKA — mando remoto WiFi para televisor.

Iteracion activa: v3 — BUILD (emparejamiento robusto + HDMI + volumen step 1)

Codigo v3:
  app\Vissius control remote\iterations\v3

Generar APK (Windows — PowerShell, sin instalar):
  cd "C:\dev\vissiuss control remote v3"
  $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"
  $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
  $env:Path = "$env:JAVA_HOME\bin;C:\Program Files\nodejs;$env:ANDROID_HOME\platform-tools"
  npx expo prebuild --platform android
  node scripts/post-prebuild.js
  "sdk.dir=$($env:ANDROID_HOME -replace '\\','/')" | Set-Content android/local.properties
  cd android; .\gradlew.bat assembleRelease; cd ..

APK:
  android\app\build\outputs\apk\release\app-release.apk

Estado: v3 — Auditoria 1 APROBADA (pairing fix urgente)
