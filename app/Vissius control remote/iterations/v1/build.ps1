# WIKA — build APK release (Windows)
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$nodeDir = "C:\Program Files\nodejs"
$env:Path = "$env:JAVA_HOME\bin;$nodeDir;$env:ANDROID_HOME\platform-tools"

Set-Location $PSScriptRoot

Write-Host "Java:" (& "$env:JAVA_HOME\bin\java.exe" -version 2>&1 | Select-Object -First 1)
Write-Host "Node:" (node -v)
Write-Host ""

npm run apk:win
