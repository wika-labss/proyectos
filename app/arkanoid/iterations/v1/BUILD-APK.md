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
npm run apk
```

Si el repo **ya está clonado**:

```powershell
cd "C:\Alvaro proyectos\proyectos"
git fetch origin cursor/arkanoid-v1-11b9
git checkout cursor/arkanoid-v1-11b9
cd ".\app\arkanoid\iterations\v1"
npm install
npm run apk
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
