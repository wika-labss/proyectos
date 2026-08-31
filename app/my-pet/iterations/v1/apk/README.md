# APK my Pet v1

El binario no se versiona (61 MB). Generar:

```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=$HOME/Android/Sdk
npm run apk
```

Salida Gradle: `android/app/build/outputs/apk/release/app-release.apk`

Package: `com.wika.mypet` · version 1.0.0 · minSdk 24

Instalar: `adb install -r android/app/build/outputs/apk/release/app-release.apk`

En Ajustes de la app, apunta la URL de la web de prueba (LAN o túnel HTTPS).
