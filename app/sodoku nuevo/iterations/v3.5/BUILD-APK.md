# Build APK Release — Sodoku nuevo V3.5

> Entregable WIKA: **APK Release instalable por sideload, SIN Metro.**

## Windows — build rápido (si ya hiciste prebuild)

```powershell
cd "C:\dev\sodoku nuevo v3.1"
npm run apk:release
```

O directo:

```powershell
cd android
.\gradlew.bat assembleRelease
```

> **Nota:** `npm run build:apk` usa `scripts/run-gradle.js` (compatible Windows + Linux).

## Traer V3.5 a Windows

```powershell
git clone --depth 1 --filter=blob:none --sparse https://github.com/wika-labss/proyectos.git "$env:TEMP\proyectos-sodoku-v3.5"
Set-Location "$env:TEMP\proyectos-sodoku-v3.5"
git sparse-checkout set "app/sodoku nuevo/iterations/v3.5"
Copy-Item -Path "app\sodoku nuevo\iterations\v3.5\*" -Destination "C:\dev\sodoku nuevo v3.1" -Recurse -Force
Set-Location "C:\dev\sodoku nuevo v3.1"
npm install
.\scripts\verify-build.bat
```

## Requisitos (Windows)

- Node.js 20 LTS
- JDK **17**
- Android Studio + SDK API 35
- `JAVA_HOME`, `ANDROID_HOME`

## Comandos

```powershell
npm run typecheck
npm run smoke:v3
npm run build:apk
```

APK:

```text
android\app\build\outputs\apk\release\app-release.apk
```

Instalar:

```powershell
adb install -r .\android\app\build\outputs\apk\release\app-release.apk
```
