# BUILD-APK — Arkanoid v5

V5 **no incluye MP3**. El APK Release es autónomo (bundle embebido). **No requiere Metro.**

Paquete: `com.wika.arkanoid` · versionName `5.0.0` · versionCode `6`

## Requisitos

- Node 20+ LTS
- JDK **17** (no 21+)
- Android SDK (API 35 / min 24) y NDK
- `ANDROID_HOME` o `android/local.properties`

## Windows

Pega **solo** los comandos. No copies `PS C:\...>`.

```powershell
cd "C:\Alvaro proyectos\proyectos"
git checkout main
git pull origin main

$jdk = Get-ChildItem "C:\Program Files\Eclipse Adoptium" -Directory -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -like "jdk-17*" } |
  Sort-Object Name -Descending |
  Select-Object -First 1
if (-not $jdk) { throw "No hay JDK 17 en C:\Program Files\Eclipse Adoptium" }
$env:JAVA_HOME = $jdk.FullName
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path = "$env:JAVA_HOME\bin;C:\Program Files\nodejs;$env:ANDROID_HOME\platform-tools;$env:Path"
java -version

cd "C:\Alvaro proyectos\proyectos\app\arkanoid\iterations\v5"
npm install
npm run apk:win
```

APK:

`C:\Alvaro proyectos\proyectos\app\arkanoid\iterations\v5\android\app\build\outputs\apk\release\app-release.apk`

Desinstala Arkanoid e instala este APK **5.0.0** (copia a Descargas si `adb` no ve el móvil).

## Linux

```bash
cd app/arkanoid/iterations/v5
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
npm install
npm run apk
```

APK Release: `android/app/build/outputs/apk/release/app-release.apk`
