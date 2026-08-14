# Build APK Release — Sodoku nuevo

> Entregable WIKA: **APK Release instalable por sideload, SIN Metro.**  
> `npx expo start` es solo desarrollo opcional. **No cierra Release.**

## Requisitos (Windows)

- Node.js 20 LTS
- JDK **17** (Gradle)
- Android Studio + SDK API 35
- Variables: `JAVA_HOME`, `ANDROID_HOME`

## Comando (PowerShell) — traer V1 y generar APK

```powershell
git clone --depth 1 --filter=blob:none --sparse https://github.com/wika-labss/proyectos.git "$env:TEMP\proyectos-sodoku"
Set-Location "$env:TEMP\proyectos-sodoku"
git sparse-checkout set "app/sodoku nuevo/iterations/v1"
New-Item -ItemType Directory -Force -Path "C:\dev\sodoku nuevo" | Out-Null
Copy-Item -Path "app\sodoku nuevo\iterations\v1\*" -Destination "C:\dev\sodoku nuevo" -Recurse -Force
Set-Location "C:\dev\sodoku nuevo"
npm install
.\scripts\verify-build.bat
```

APK esperado:

```text
android\app\build\outputs\apk\release\app-release.apk
```

(o `app-release-unsigned.apk` si aún no hay keystore)

Instalar:

```powershell
adb install -r .\android\app\build\outputs\apk\release\app-release.apk
```

## Alternativa npm

```powershell
npm run build:apk
```

## Qué NO usar para Release

```powershell
npx expo start   # Metro / DEV — no es el entregable
```
