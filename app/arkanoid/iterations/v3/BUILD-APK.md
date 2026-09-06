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

El paquete es el mismo que V1/V2 (`com.wika.arkanoid`). Desinstala Arkanoid en el móvil **antes** de instalar este APK **3.0.2**.

### Instalar sin `adb` (recomendado si no hay dispositivo)

El APK ya está listo. No hace falta volver a compilar.

1. En el móvil: Ajustes → Aplicaciones → **Arkanoid** → Desinstalar.
2. Conecta el USB y en el móvil elige **Transferencia de archivos / MTP** (no “Solo carga”).
3. Copia este archivo a Descargas del móvil:

`C:\Alvaro proyectos\proyectos\app\arkanoid\iterations\v3\android\app\build\outputs\apk\release\app-release.apk`

4. En el móvil abre el APK → Instalar. Si pide “orígenes desconocidos”, actívalo para Archivos.

### Instalar con `adb`

En el móvil: Opciones de desarrollador → **Depuración USB** ON. Desbloquea la pantalla y acepta “¿Permitir depuración USB?”.

```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path = "$env:ANDROID_HOME\platform-tools;$env:Path"
adb kill-server
adb start-server
adb devices
```

Tiene que salir un serial y `device` (no `unauthorized` ni lista vacía). Luego:

```powershell
adb uninstall com.wika.arkanoid
adb install android\app\build\outputs\apk\release\app-release.apk
```

### Si falla

| Error | Qué hacer |
|-------|-----------|
| `no devices/emulators found` | No es un error de Gradle. USB + Depuración USB, o copia el APK a Descargas |
| `unauthorized` | Acepta el diálogo RSA en el móvil; `adb kill-server` y `adb devices` otra vez |
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
