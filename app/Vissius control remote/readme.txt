Vissius Control Remote
======================

Iteracion: v3 BUILD — Auditorias 1-3 APROBADAS (listo para APK)

Codigo:
  app\Vissius control remote\iterations\v3

Traer a PC:
  git clone -b cursor/vissius-v3-pairing-hdmi-8679 --single-branch https://github.com/wika-labss/proyectos.git C:\dev\vissius-temp
  Copy-Item -Recurse "C:\dev\vissius-temp\app\Vissius control remote\iterations\v3\*" "C:\dev\vissiuss control remote v3\"

Generar APK (PowerShell, JDK 17):
  cd "C:\dev\vissiuss control remote v3"
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
