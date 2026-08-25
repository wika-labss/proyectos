# APK Release

Requiere JDK 17 y Android SDK.

```bash
cd iterations/v1
npm install
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=$HOME/Android/Sdk
bash scripts/build-apk.sh
```

Salida Gradle: `android/app/build/outputs/apk/release/app-release.apk`

Copia versionada (LFS): `control-central-acd-v1-release.apk`

- Package: `com.wika.controlcentralacd`
- Version: `1.0.0`
- minSdk 24 / targetSdk 34 / compileSdk 35
- Sideload: `adb install -r control-central-acd-v1-release.apk`
