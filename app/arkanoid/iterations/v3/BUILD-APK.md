# BUILD-APK — Arkanoid v3

## Requisitos

- Node 20 LTS
- JDK **17** (no 21+)
- Android SDK (API 35 / min 24) + platform-tools
- `JAVA_HOME` y `ANDROID_HOME`

El APK Release es autónomo (bundle embebido). **No requiere Metro.**

---

## Windows (`C:\Alvaro proyectos`)

En **PowerShell** (no uses Git Bash para Gradle):

```powershell
# 1) Rama V3
cd "C:\Alvaro proyectos\proyectos"
git fetch origin
git checkout cursor/arkanoid-v3-classic-eb2a
git pull origin cursor/arkanoid-v3-classic-eb2a

# 2) Toolchain (ajusta JAVA_HOME si tu JDK 17 está en otra carpeta)
$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-17'
if (-not (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
  $env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot'
}
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path = "$env:JAVA_HOME\bin;C:\Program Files\nodejs;$env:ANDROID_HOME\platform-tools;$env:Path"

java -version
# debe decir 17.x

# 3) Compilar
cd "C:\Alvaro proyectos\proyectos\app\arkanoid\iterations\v3"
npm install
npm run smoke
npm run typecheck
npm run apk:win
```

APK:

`C:\Alvaro proyectos\proyectos\app\arkanoid\iterations\v3\android\app\build\outputs\apk\release\app-release.apk`

Instalar en el móvil (USB + depuración):

```powershell
adb uninstall com.wika.arkanoid
adb install android\app\build\outputs\apk\release\app-release.apk
```

El paquete es el mismo que V1/V2 (`com.wika.arkanoid`). Si el icono abre y se cierra (o se queda en negro), **desinstala Arkanoid** y vuelve a instalar este APK **3.0.2**. No mezcles un APK viejo con uno nuevo.

### Si falla

| Error | Qué hacer |
|-------|-----------|
| `JAVA_HOME` / version 21 | Instala Temurin JDK 17 y apunta `JAVA_HOME` ahí |
| `ANDROID_HOME` | Android Studio → SDK Manager → Android 35 + Build-Tools 35 |
| `sdk.dir` | El `.bat` escribe `android\local.properties` solo |
| `gradlew` / NDK | Deja que Gradle baje el NDK; no canceles el primer build |
| `expo` / `npx` | Node 20 LTS; vuelve a `npm install` |

---

## Linux / macOS

```bash
cd app/arkanoid/iterations/v3
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64   # o tu JDK 17
export ANDROID_HOME=$HOME/Android/Sdk
npm install
npm run smoke
npm run typecheck
npm run apk
```

APK: `android/app/build/outputs/apk/release/app-release.apk`
