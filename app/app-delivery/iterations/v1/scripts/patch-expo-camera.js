#!/usr/bin/env node
/**
 * expo-camera 16 guarda el JPEG en memoria y abre un tercer flujo de análisis
 * aunque nadie escanea códigos. En varios teléfonos el disparo falla con
 * "Failed to capture image". Este parche escribe la foto a archivo y no abre
 * el flujo de análisis si no hay escáner.
 */
const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-camera',
  'android',
  'src',
  'main',
  'java',
  'expo',
  'modules',
  'camera',
  'ExpoCameraView.kt',
);

const MARKER = 'wika: captura a archivo';

if (!fs.existsSync(target)) {
  console.error('[patch-expo-camera] No está ExpoCameraView.kt');
  process.exit(1);
}

let source = fs.readFileSync(target, 'utf8');
if (source.includes(MARKER)) {
  console.log('[patch-expo-camera] ya aplicado');
  process.exit(0);
}

const replacements = [
  [
    'import androidx.camera.core.ImageCaptureException\nimport androidx.camera.core.ImageProxy\n',
    'import androidx.camera.core.ImageCaptureException\n',
  ],
  [
    'import expo.modules.camera.analyzers.BarcodeAnalyzer\nimport expo.modules.camera.analyzers.toByteArray\n',
    'import expo.modules.camera.analyzers.BarcodeAnalyzer\n',
  ],
  [
    'import kotlinx.coroutines.launch\n',
    'import kotlinx.coroutines.launch\nimport kotlinx.coroutines.withContext\n',
  ],
  [
    `  fun takePicture(options: PictureOptions, promise: Promise, cacheDirectory: File) {
    val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    val volume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC)
    val hasShutterSound = options.shutterSound

    imageCaptureUseCase?.takePicture(
      ContextCompat.getMainExecutor(context),
      object : ImageCapture.OnImageCapturedCallback() {
        override fun onCaptureStarted() {
          if (hasShutterSound && volume != 0) {
            MediaActionSound().play(MediaActionSound.SHUTTER_CLICK)
          }
          if (!animateShutter) {
            return
          }
          rootView.postDelayed({
            rootView.foreground = Color.WHITE.toDrawable()
            rootView.postDelayed(
              { rootView.foreground = null },
              ANIMATION_FAST_MILLIS
            )
          }, ANIMATION_SLOW_MILLIS)
        }

        override fun onCaptureSuccess(image: ImageProxy) {
          val data = image.planes.toByteArray()

          if (options.fastMode) {
            promise.resolve(null)
          }
          cacheDirectory.let {
            scope.launch {
              val shouldMirror = mirror && lensFacing == CameraType.FRONT
              ResolveTakenPicture(data, promise, options, shouldMirror, it) { response: Bundle ->
                onPictureSaved(response)
              }.resolve()
            }
          }
          image.close()
        }

        override fun onError(exception: ImageCaptureException) {
          promise.reject(CameraExceptions.ImageCaptureFailed())
        }
      }
    )
  }`,
    `  fun takePicture(options: PictureOptions, promise: Promise, cacheDirectory: File) {
    // wika: captura a archivo, sin el flujo de análisis
    val capture = imageCaptureUseCase
    if (capture == null) {
      promise.reject("E_CAMERA_UNAVAILABLE", "La cámara no está lista para capturar.", null)
      return
    }

    val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    val volume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC)
    val hasShutterSound = options.shutterSound
    val photoFile = FileSystemUtils.generateOutputFile(cacheDirectory, "Camera", ".jpg")
    val outputOptions = ImageCapture.OutputFileOptions.Builder(photoFile).build()

    capture.takePicture(
      outputOptions,
      ContextCompat.getMainExecutor(context),
      object : ImageCapture.OnImageSavedCallback {
        override fun onCaptureStarted() {
          if (hasShutterSound && volume != 0) {
            MediaActionSound().play(MediaActionSound.SHUTTER_CLICK)
          }
          if (!animateShutter) {
            return
          }
          rootView.postDelayed({
            rootView.foreground = Color.WHITE.toDrawable()
            rootView.postDelayed(
              { rootView.foreground = null },
              ANIMATION_FAST_MILLIS
            )
          }, ANIMATION_SLOW_MILLIS)
        }

        override fun onImageSaved(outputFileResults: ImageCapture.OutputFileResults) {
          if (options.fastMode) {
            promise.resolve(null)
          }
          scope.launch {
            val data = withContext(Dispatchers.IO) {
              val bytes = photoFile.readBytes()
              photoFile.delete()
              bytes
            }
            val shouldMirror = mirror && lensFacing == CameraType.FRONT
            ResolveTakenPicture(data, promise, options, shouldMirror, cacheDirectory) { response: Bundle ->
              onPictureSaved(response)
            }.resolve()
          }
        }

        override fun onError(exception: ImageCaptureException) {
          photoFile.delete()
          promise.reject(
            "E_CAPTURE_FAILED",
            "Captura \${exception.imageCaptureError}: \${exception.message ?: "Failed to capture image"}",
            exception
          )
        }
      }
    )
  }`,
  ],
  [
    `        imageCaptureUseCase = ImageCapture.Builder()
          .setResolutionSelector(resolutionSelector)
          .setFlashMode(flashMode.mapToLens())
          .build()

        val videoCapture = createVideoCapture()
        imageAnalysisUseCase = createImageAnalyzer()`,
    `        imageCaptureUseCase = ImageCapture.Builder()
          .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
          .setResolutionSelector(resolutionSelector)
          .setFlashMode(flashMode.mapToLens())
          .build()

        val videoCapture = createVideoCapture()
        imageAnalysisUseCase = if (shouldScanBarcodes) createImageAnalyzer() else null`,
  ],
];

for (const [from, to] of replacements) {
  if (!source.includes(from)) {
    console.error('[patch-expo-camera] No encontré el texto original de expo-camera 16.0.18');
    process.exit(1);
  }
  source = source.replace(from, to);
}

fs.writeFileSync(target, source);
console.log('[patch-expo-camera] aplicado');
