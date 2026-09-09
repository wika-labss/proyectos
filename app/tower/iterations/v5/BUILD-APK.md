# BUILD-APK — Tower Defense v5

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
Set-Location "C:\PROYECTO ANALDO\proyectos\app\tower\iterations\v5"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
npm.cmd install
npm.cmd run smoke
npm.cmd run apk:win
```

Linux:

```bash
export ANDROID_HOME="$HOME/Android/Sdk"
npm install
npm run smoke
npm run apk
```

APK Release: `android/app/build/outputs/apk/release/app-release.apk`  
Paquete: `com.wika.tower` · versión `5.0.0` · sin Metro  
Firma: Android Debug si no hay keystore de upload (sideload OK).
