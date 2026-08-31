# Cómo generar el APK Release — my Pet v1

Requisitos: JDK 17, Android SDK (minSdk 24), Node 20+.

```bash
cd proyectos/app/my-pet/iterations/v1
npm install
npm run apk
```

Salida: `android/app/build/outputs/apk/release/app-release.apk`

El APK no necesita Metro. La web de prueba sí debe estar alcanzable para QR y alertas.
