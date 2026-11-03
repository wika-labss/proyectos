# Pedidos Fotos → Google Drive

App Android para capturar fotos de pedidos, completar un formulario (agregador, número de pedido, fecha) y subir la imagen renombrada a carpetas fijas de Google Drive.

## Flujo

1. **Onboarding (obligatorio al instalar)**
   - Iniciar sesión con Google (cuenta del teléfono).
   - Aceptar permiso de Google Drive (`drive.file`).
   - Comprobar acceso de escritura a las carpetas PedidosYa y Uber.
   - Permitir cámara y entrar a la app.
2. **Cámara** → tomar foto.
3. **Formulario** → agregador, nº pedido, fecha (opcional / “Hoy”).
4. **Subida** → archivo `{numeroPedido}.jpg` en la carpeta del agregador.

## Carpetas destino (Drive)

| Agregador  | Folder ID |
|------------|-----------|
| PedidosYa  | `1iTMAZFdozvk6yGnNZIEV2UhGI8xRwChd` |
| Uber       | `1dbqWkCoFltiPYRhUyidTjAxx8LC5ysGo` |

La cuenta Google que inicia sesión debe ser **Editor** en ambas carpetas.

## Configuración Google Cloud (una vez)

1. Crear proyecto en [Google Cloud Console](https://console.cloud.google.com/).
2. Activar **Google Drive API**.
3. Crear credencial **OAuth 2.0 – Android**:
   - Package name: `lat.vissiuss.pedidosfotos`
   - SHA-1 del keystore de debug o release (`keytool -list -v -keystore …`).
4. (Opcional) Pantalla de consentimiento OAuth: usuarios de prueba / dominio interno.

Sin este paso, el inicio de sesión fallará en dispositivos reales.

## Compilar

Requisitos: JDK 17+, Android SDK, `ANDROID_HOME` configurado.

```bash
cd app/pedidos-fotos-drive
./gradlew assembleDebug
```

APK de debug: `app/build/outputs/apk/debug/app-debug.apk`

## Estructura

- `auth/GoogleAuthManager.kt` – Sign-In + scope Drive.
- `drive/DriveRepository.kt` – verificación de carpetas y subida.
- `ui/onboarding/` – Google + permisos antes de la cámara.
- `ui/camera/` – CameraX.
- `ui/form/` – formulario previo a guardar.

## Notas

- La fecha se guarda en la **descripción** del archivo en Drive; el nombre del archivo es solo `{pedido}.jpg`.
- “Cerrar sesión” en la barra superior reinicia onboarding y cierra la sesión Google.
