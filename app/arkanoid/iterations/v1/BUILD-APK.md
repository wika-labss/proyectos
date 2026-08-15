# BUILD-APK — Arkanoid v1

## Requisitos

- Node 20 LTS
- JDK **17** (no 21+)
- Android SDK (API 35 / min 24)
- `ANDROID_HOME` o `android/local.properties`

## Windows — traer V1 a `C:\Alvaro proyectos`

```powershell
cd "C:\Alvaro proyectos"
git clone -b cursor/arkanoid-v1-11b9 --single-branch https://github.com/wika-labss/proyectos.git
cd ".\proyectos\app\arkanoid\iterations\v1"
npm install
npm run smoke
npm run typecheck
npm run apk:win
```

Si el repo **ya está clonado**:

```powershell
cd "C:\Alvaro proyectos\proyectos"
git fetch origin cursor/arkanoid-v1-11b9
git checkout cursor/arkanoid-v1-11b9
cd ".\app\arkanoid\iterations\v1"
npm install
npm run apk:win
```

> En PowerShell usa **`npm run apk:win`** (no `npm run apk`, que requiere Git Bash/WSL).

Requisitos de entorno Windows:

```powershell
# JDK 17
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot"  # ajusta ruta
# Android SDK (Android Studio)
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
```

APK:

```text
android\app\build\outputs\apk\release\app-release.apk
```

Instalar:

```powershell
adb install -r .\android\app\build\outputs\apk\release\app-release.apk
```

El APK Release es autónomo (bundle embebido) — **no requiere Metro**.

## Linux / Cloud (referencia)

```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=/opt/android-sdk
cd app/arkanoid/iterations/v1
npm install
npm run apk
```
