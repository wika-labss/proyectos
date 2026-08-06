Vissius Control Remote
======================

Iteracion: v3.1 — Modulo de logs exportables (diagnostico discovery)

Codigo:
  app\Vissius control remote\iterations\v3.1

Traer a PC:
  git clone -b cursor/vissius-v3-1-diagnostics-logs-8679 --single-branch https://github.com/wika-labss/proyectos.git C:\dev\vissius-temp
  Copy-Item -Recurse "C:\dev\vissius-temp\app\Vissius control remote\iterations\v3.1\*" "C:\dev\vissiuss control remote v3.1\"

Generar APK (PowerShell, JDK 17):
  cd "C:\dev\vissiuss control remote v3.1"
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

Uso diagnostico:
  1. Abrir app → Emparejar → Buscar TV (o IP manual)
  2. Abrir "Ver logs / exportar"
  3. Exportar texto o JSON y enviar para analisis
