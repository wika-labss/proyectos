# BUILD-APK — Tower Defense v2

## Requisitos

- Node 20 LTS
- JDK **17** (no 21+)
- Android SDK (API 35 / min 24)
- `ANDROID_HOME` o `android/local.properties`

## Windows (PowerShell)

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
Set-Location "C:\PROYECTO ANALDO\proyectos\app\tower\iterations\v2"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
npm.cmd install
npm.cmd run smoke
npm.cmd run typecheck
npm.cmd run apk:win
```

APK: `android\app\build\outputs\apk\release\app-release.apk`
