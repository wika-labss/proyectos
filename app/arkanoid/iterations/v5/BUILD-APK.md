# BUILD-APK — Arkanoid v4

V4 **no incluye MP3**. El APK Release es autónomo (bundle embebido). **No requiere Metro.**

## Windows

Pega **solo** los comandos. No copies `PS C:\...>`.

```powershell
cd "C:\Alvaro proyectos\proyectos"
git checkout cursor/arkanoid-v4-silent-eb2a
git pull origin cursor/arkanoid-v4-silent-eb2a

$jdk = Get-ChildItem "C:\Program Files\Eclipse Adoptium" -Directory -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -like "jdk-17*" } |
  Sort-Object Name -Descending |
  Select-Object -First 1
if (-not $jdk) { throw "No hay JDK 17 en C:\Program Files\Eclipse Adoptium" }
$env:JAVA_HOME = $jdk.FullName
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path = "$env:JAVA_HOME\bin;C:\Program Files\nodejs;$env:ANDROID_HOME\platform-tools;$env:Path"
java -version

cd "C:\Alvaro proyectos\proyectos\app\arkanoid\iterations\v4"
npm install
npm run apk:win
```

APK:

`C:\Alvaro proyectos\proyectos\app\arkanoid\iterations\v4\android\app\build\outputs\apk\release\app-release.apk`

Desinstala Arkanoid e instala este APK **4.0.0** (copia a Descargas si `adb` no ve el móvil).
