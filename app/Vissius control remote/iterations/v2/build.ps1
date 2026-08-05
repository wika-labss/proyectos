# WIKA — generar APK release v2 (Windows, sin depender del .bat)
$ErrorActionPreference = "Stop"

$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$nodeDir = "C:\Program Files\nodejs"
$env:Path = "$env:JAVA_HOME\bin;$nodeDir;$env:ANDROID_HOME\platform-tools"

Set-Location $PSScriptRoot

Write-Host "Java:" (& "$env:JAVA_HOME\bin\java.exe" -version 2>&1 | Select-Object -First 1)
Write-Host "Node:" (node -v)
Write-Host ""

npx expo prebuild --platform android
node scripts/post-prebuild.js

$sdk = $env:ANDROID_HOME -replace '\\', '/'
"sdk.dir=$sdk" | Set-Content android/local.properties

Push-Location android
.\gradlew.bat assembleRelease
Pop-Location

$apk = Join-Path $PSScriptRoot "android\app\build\outputs\apk\release\app-release.apk"
Write-Host ""
Write-Host "APK listo:" $apk
