# BUILD-APK — Tower Defense v3

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
Set-Location "C:\PROYECTO ANALDO\proyectos\app\tower\iterations\v3"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
npm.cmd install
npm.cmd run smoke
npm.cmd run apk:win
```

APK: `android\app\build\outputs\apk\release\app-release.apk`
