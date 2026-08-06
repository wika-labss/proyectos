Vissius Control Remote
======================

Iteracion: v3.2 — Limpieza mock + logs claros (guia conexion v4)

Codigo:
  app\Vissius control remote\iterations\v3.2

Traer a PC:
  git clone -b cursor/vissius-v3-2-clear-logs-mock-8679 --single-branch https://github.com/wika-labss/proyectos.git C:\dev\vissius-temp
  New-Item -ItemType Directory -Force -Path "C:\dev\vissiuss control remote v3.2" | Out-Null
  Copy-Item -Recurse -Force "C:\dev\vissius-temp\app\Vissius control remote\iterations\v3.2\*" "C:\dev\vissiuss control remote v3.2\"

Generar APK (PowerShell, JDK 17):
  cd "C:\dev\vissiuss control remote v3.2"
  $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"
  $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
  $env:Path = "$env:JAVA_HOME\bin;C:\Program Files\nodejs;$env:ANDROID_HOME\platform-tools"
  npm install
  npx expo prebuild --platform android
  node scripts/post-prebuild.js
  "sdk.dir=$($env:ANDROID_HOME -replace '\\','/')" | Set-Content android/local.properties
  cd android; .\gradlew.bat assembleRelease; cd ..

APK:
  android\app\build\outputs\apk\release\app-release.apk

Logs (export texto):
  - Sin un fail por cada IP del /24
  - Incluye guia_conexion_v4 en el encabezado
  - Eventos: network.wifi, scan.phoneIp, scan.done, connect.*
