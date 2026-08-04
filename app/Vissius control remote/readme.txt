Vissius Control Remote
======================

Proyecto WIKA — mando remoto WiFi para televisor.

Perfil v1: BUILD — APK release autonomo (sin Metro, sin Expo Go)

Generar APK (Windows):
  cd "app\Vissius control remote\iterations\v1"
  set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
  set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
  set "Path=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%Path%"
  npm install
  npx expo install --fix
  npm run apk:win

APK resultante:
  iterations\v1\android\app\build\outputs\apk\release\app-release.apk

Instalar en telefono:
  adb install -r android\app\build\outputs\apk\release\app-release.apk

Verificar todos los gates WIKA:
  npm run verify:win

Estado: v1 BUILD — Auditorias re-ejecutadas

Manual completo (prompts, pasos, troubleshooting):
  app\Vissius control remote\MANUAL-USUARIO.md
