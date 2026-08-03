# Arquitectura

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Framework móvil | **React Native + Expo SDK 52** |
| Lenguaje | TypeScript (strict mode) |
| Navegación | Expo Router (pantalla única en v1) |
| Control de flash | `expo-camera` (torch mode) |
| Estado global | Zustand |
| Persistencia | AsyncStorage (intensidad, último modo) |
| Estilos | StyleSheet nativo + tokens góticos en `src/constants/theme.ts` |
| Utilidades | `expo-keep-awake` (pantalla activa), `expo-haptics` (feedback) |
| Build | Prebuild local → APK release autónomo (Android) |

> Manifiesto completo de dependencias: ver `06-build-environment.md`

---

## Dependencias técnicas

> Referencia obligatoria: `06-build-environment.md`. El manifiesto de dependencias debe estar completo **antes** de generar código.

### Reglas WIKA de dependencias

1. Instalar con `npx expo install <paquete>` (proyectos Expo)
2. Usar prefijo `~` en versiones Expo/RN — **prohibido `^`**
3. Ejecutar `npx expo install --fix` al finalizar cada iteración
4. Validar con `npx expo-doctor` — 0 errores bloqueantes

### Manifiesto del proyecto

| Paquete | Versión | Capa | Obligatorio |
|---------|---------|------|-------------|
| `expo` | `~52.0.0` | Core | ✅ |
| `expo-router` | `~4.0.0` | Navegación | ✅ |
| `expo-camera` | `~16.0.0` | Flash/torch | ✅ |
| `expo-keep-awake` | `~14.0.0` | Pantalla activa | ✅ |
| `expo-haptics` | `~14.0.0` | Feedback táctil | ✅ |
| `expo-system-ui` | `~4.0.9` | Aplica `userInterfaceStyle: dark` | ✅ |
| `expo-asset` | `~11.0.5` | Assets | ✅ |
| `expo-build-properties` | `~0.13.0` | Build nativo | ✅ |
| `@react-native-async-storage/async-storage` | `1.23.1` | Persistencia | ✅ |
| `zustand` | `5.0.0` | Estado | ✅ |
| `react` | `18.3.1` | Core | ✅ |
| `react-native` | `0.76.9` | Core | ✅ |

### Plugins nativos (app.json)

```json
{
  "expo": {
    "plugins": [
      "expo-router",
      "expo-asset",
      [
        "expo-camera",
        {
          "cameraPermission": "Permite a BBY Light controlar el flash de tu teléfono.",
          "recordAudioAndroid": false
        }
      ],
      [
        "expo-build-properties",
        {
          "android": {
            "kotlinVersion": "1.9.25",
            "compileSdkVersion": 35,
            "targetSdkVersion": 34,
            "minSdkVersion": 24
          }
        }
      ]
    ],
    "android": {
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.FLASHLIGHT"
      ]
    }
  }
}
```

---

## Perfil de build

| Perfil | Target esta iteración | Pipeline |
|--------|----------------------|----------|
| DEV (Expo Go) | [ ] | `npx expo start` — torch limitado en Expo Go |
| BUILD (APK local) | [x] | `prebuild` + `assembleRelease` → **target v1** |
| RELEASE (EAS) | [ ] | `eas build` + keystore propio — futuro |

> v1 requiere perfil **BUILD** porque el control del flash LED debe probarse en dispositivo físico.
> El entregable es el APK **release** (`npm run apk`): lleva el bundle Hermes embebido y funciona
> sin servidor Metro. El APK debug solo sirve para desarrollo con hot reload.

---

## Estructura del proyecto

```text
app/bby app/
├── idea/
├── iterations/v1/
│   ├── app/
│   │   ├── _layout.tsx            # Layout raíz + providers
│   │   └── index.tsx              # Pantalla principal (linterna)
│   ├── src/
│   │   ├── components/
│   │   │   ├── TorchButton.tsx    # Botón central encender/apagar
│   │   │   ├── IntensitySlider.tsx # Slider de intensidad
│   │   │   ├── SosButton.tsx      # Botón modo SOS
│   │   │   ├── StatusIndicator.tsx # Indicador OFF/ON/SOS
│   │   │   └── GothicBackground.tsx # Fondo gótico con gradiente
│   │   ├── hooks/
│   │   │   ├── TorchProvider.tsx  # Contexto + CameraView oculta (torch)
│   │   │   ├── useTorch.ts        # API única de control (ON/OFF/SOS)
│   │   │   ├── useSosPattern.ts   # Lógica del patrón Morse SOS
│   │   │   └── useFlashAvailability.ts # Detección de hardware
│   │   ├── stores/
│   │   │   └── torchStore.ts      # Estado: mode, intensity, isAvailable
│   │   ├── engine/
│   │   │   ├── sosPattern.ts      # Definición del patrón Morse
│   │   │   └── intensityController.ts # Mapeo intensidad → torch/PWM
│   │   ├── constants/
│   │   │   └── theme.ts           # Tokens de diseño gótico
│   │   ├── types/
│   │   │   └── index.ts           # TorchMode, TorchState, SosStep
│   │   └── utils/
│   │       └── storage.ts         # Wrapper AsyncStorage
│   ├── assets/
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
├── review.md
└── final/
```

---

## Componentes principales

### Motor de linterna (`src/hooks/` + `src/engine/`)

- **TorchProvider.tsx** — Monta una `CameraView` de 100×100 fuera de pantalla (opacidad 0.01) que
  mantiene viva la sesión de cámara necesaria para el torch en Android. Expone el contexto
  `TorchController` con `setTorch` / `applyIntensity` / `stopIntensity`. Un preview de 1×1 no basta:
  varios dispositivos no activan el LED sin superficie mínima.
- **useTorch.ts** — **Única API de control** de la linterna. Expone `turnOn()`, `turnOff()`,
  `toggle()`, `enterSos()`, `exitSos()`, `updateIntensity()` y `shutdown()`. Ninguna pantalla debe
  llamar a `torchStore.setMode` ni a `TorchController` directamente.
- **intensityController.ts** — PWM software sobre el torch. Período 20 ms, pulsos acotados a
  `[4 ms, 16 ms]` porque los timers de RN no bajan de ~4 ms. Duty cycle efectivo 20–80%;
  0% apaga y 100% enciende de forma continua. Torch strength nativo (Android 13+) queda fuera
  de v1.
- **sosPattern.ts** — Array de pasos `{ action: 'on' | 'off', durationMs: number }` con el patrón
  Morse completo, incluidas las pausas entre letras (600 ms) y entre ciclos (1200 ms).
- **useSosPattern.ts** — Ejecuta el patrón en bucle con `setTimeout` encadenados; cancela y apaga
  el torch al detenerse.

### Capa de estado (`src/stores/torchStore.ts`)

```typescript
type TorchMode = 'off' | 'on' | 'sos';

interface TorchState {
  mode: TorchMode;
  intensity: number;         // 0–100
  isFlashAvailable: boolean; // false hasta confirmar permiso + hardware
  loaded: boolean;           // preferencias cargadas
  recheckToken: number;      // incrementa al pulsar "Reintentar"
  setMode: (mode: TorchMode) => void;
  setIntensity: (value: number) => void;
  setFlashAvailable: (available: boolean) => void;
  setLoaded: (loaded: boolean) => void;
  requestRecheck: () => void;
}
```

### Capa de UI (`src/components/` + `app/index.tsx`)

- Pantalla única sin navegación adicional
- Componentes desacoplados del hardware via hooks
- Todos los estilos derivados de `theme.ts` (paleta gótica)

---

## Flujo de datos

> Regla: toda la UI pasa por `useTorch`. El store y el `TorchController` son detalles internos.

### Encender / apagar linterna

```text
Usuario toca TorchButton
  → useTorch.toggle()
    → Si mode === 'sos' u 'on': useTorch.turnOff()
    → Si mode === 'off': useTorch.turnOn()
        → Si intensity === 0: elevar a 25% (mínimo visible)
        → torchStore.setMode('on')
        → intensityController.apply(intensity) → CameraView enableTorch
        → expo-keep-awake activate
        → Haptics.impact
  → StatusIndicator → "ENCENDIDA"
```

### Modo SOS

```text
Usuario toca SosButton
  → useTorch.enterSos()
    → torchStore.setMode('sos')
    → useSosPattern.start() → loop sobre SOS_PATTERN → controller.setTorch
    → expo-keep-awake activate
  → StatusIndicator → "SOS ACTIVO" (pulse rojo)

Usuario toca SOS o TorchButton
  → useTorch.exitSos() / toggle()
    → useSosPattern.stop() + controller.setTorch(false)
    → torchStore.setMode('off')
```

### Ajustar intensidad

```text
Usuario mueve IntensitySlider
  → useTorch.updateIntensity(value)
    → torchStore.setIntensity(value)
    → persistIntensity(value)  # debounce 400 ms → AsyncStorage
    → Si mode === 'on' y value > 0: intensityController.apply(value)
    → Si mode === 'on' y value === 0: turnOff()
    → Si mode !== 'on': solo actualiza el valor (preajuste)
```

> El slider solo se deshabilita en modo SOS; en OFF permite preajustar la intensidad.

### Inicio de app y recuperación

```text
App inicia
  → useFlashAvailability
    → Platform !== android → flashAvailable = false
    → requestPermission() denegado → flashAvailable = false
    → CameraView.isAvailableAsync() === false → flashAvailable = false
    → OK → storage.load() → setIntensity → flashAvailable = true
  → Si flashAvailable: TorchProvider monta CameraView + pantalla principal
  → Si no: pantalla fallback con botón "Reintentar" → requestRecheck()
     → incrementa recheckToken → re-ejecuta la detección

CameraView.onMountError (cámara ocupada por otra app)
  → apaga torch + markCameraUnavailable() → pantalla fallback
```

### Salida de la app

```text
AppState → background / inactive (o desmontaje)
  → useTorch.shutdown()
    → flush de la intensidad pendiente en AsyncStorage
    → turnOff(): detiene SOS, detiene PWM, apaga torch, keep-awake off
```

---

## Decisiones técnicas

| Decisión | Elección | Justificación |
|----------|----------|---------------|
| React Native + Expo SDK 52 | Sí | Stack WIKA estándar; `expo-camera` expone torch |
| Solo Android v1 | Sí | Requisito del proyecto; simplifica permisos y testing |
| expo-camera para torch | Sí | API Expo oficial; evita módulos nativos custom |
| PWM software para intensidad | Sí | Único mecanismo disponible sin módulo nativo; duty efectivo 20–80% |
| Torch strength nativo | No (v1) | Requiere módulo nativo custom; prohibido por `05-prompt-ia.md` |
| `recordAudioAndroid: false` | Sí | Evita el permiso `RECORD_AUDIO` que el plugin añade por defecto |
| CameraView 100×100 oculta | Sí | Un preview de 1×1 no activa el LED en varios dispositivos |
| `useTorch` como API única | Sí | Evita controlar el hardware desde tres capas distintas |
| Zustand | Sí | Estado simple (mode + intensity); mínimo boilerplate |
| Pantalla única | Sí | App de utilidad; no requiere navegación multi-pantalla |
| Perfil BUILD v1 | Sí | Flash LED requiere APK nativo en dispositivo físico |
| AsyncStorage | Sí | Solo se persiste intensidad; no requiere SQLite |
| expo-keep-awake | Sí | Evita que la pantalla se apague mientras la linterna está activa |
| TypeScript strict | Sí | Seguridad de tipos en lógica de timing SOS crítica |

---

## Toolchain nativo

Ver `06-build-environment.md` para:

- JDK 17, Kotlin 1.9.25, Android SDK 35
- Configuración `expo-build-properties`
- Gates de verificación de build
- Permisos Android: `CAMERA`, `FLASHLIGHT`
