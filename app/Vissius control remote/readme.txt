Vissius Control Remote
======================

Proyecto WIKA — mando remoto WiFi para televisor.

Iteracion activa: v2 — BUILD (APK release, discovery LAN real)

Codigo v2:
  app\Vissius control remote\iterations\v2

Generar APK (Windows):
  cd "app\Vissius control remote\iterations\v2"
  set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"
  set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
  set "Path=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;C:\Program Files\nodejs;%Path%"
  npm install
  npx expo install --fix
  npm run apk:win

Verificar gates WIKA:
  npm run verify:win

Estado: v2 — Auditoria 1 APROBADA
Manual: MANUAL-USUARIO.md
