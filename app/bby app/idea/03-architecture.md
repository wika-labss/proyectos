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
| Build | Prebuild local → APK debug (Android) |

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
          "cameraPermission": "Permite a BBY Light controlar el flash de tu teléfono."
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
| BUILD (APK local) | [x] | `prebuild` + Gradle → **target v1** |
| RELEASE (EAS) | [ ] | `eas build` — futuro |

> v1 requiere perfil **BUILD** porque el control del flash LED debe probarse en dispositivo físico con APK nativo.

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
│   │   │   ├── useTorch.ts        # Control del flash LED
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

### Motor de linterna (`src/hooks/useTorch.ts` + `src/engine/`)

- **useTorch** — Hook principal que expone `turnOn()`, `turnOff()`, `setIntensity(0-100)`. Usa `expo-camera` CameraView con `enableTorch` o API torch dedicada
- **intensityController.ts** — Mapea valor 0–100 a:
  - Android 13+ (API 33+): torch strength nativo si la API lo expone
  - Fallback: PWM software (ciclos ON/OFF de 20 ms; duty cycle = intensidad%)
- **sosPattern.ts** — Array de pasos `{ action: 'on' | 'off', durationMs: number }` que define el patrón Morse completo
- **useSosPattern.ts** — Ejecuta el patrón en bucle con `setTimeout`/`setInterval` precisos; cancela al desactivar SOS

### Capa de estado (`src/stores/torchStore.ts`)

```typescript
type TorchMode = 'off' | 'on' | 'sos';

interface TorchState {
  mode: TorchMode;
  intensity: number;        // 0–100
  isFlashAvailable: boolean;
  setMode: (mode: TorchMode) => void;
  setIntensity: (value: number) => void;
  setFlashAvailable: (available: boolean) => void;
}
```

### Capa de UI (`src/components/` + `app/index.tsx`)

- Pantalla única sin navegación adicional
- Componentes desacoplados del hardware via hooks
- Todos los estilos derivados de `theme.ts` (paleta gótica)

---

## Flujo de datos

### Encender linterna

```text
Usuario toca TorchButton
  → torchStore.setMode('on')
  → useTorch.turnOn(intensity)
  → expo-camera enableTorch = true
  → intensityController.apply(intensity)
  → expo-keep-awake activate
  → StatusIndicator → "ENCENDIDA"
  → storage.save({ intensity, mode: 'on' })
```

### Modo SOS

```text
Usuario toca SosButton
  → torchStore.setMode('sos')
  → useSosPattern.start()
  → Loop: sosPattern.steps → useTorch.turnOn/Off con duraciones Morse
  → StatusIndicator → "SOS ACTIVO" (pulse rojo)
  → expo-keep-awake activate
  → Usuario toca SOS o TorchButton
    → useSosPattern.stop()
    → torchStore.setMode('off')
    → useTorch.turnOff()
```

### Ajustar intensidad

```text
Usuario mueve IntensitySlider
  → torchStore.setIntensity(value)
  → Si mode === 'on': intensityController.apply(value) inmediato
  → Si mode === 'sos': no aplica (SOS usa máxima intensidad)
  → storage.save({ intensity: value })
```

### Inicio de app

```text
App inicia
  → useFlashAvailability.check()
    → Si no hay flash: torchStore.setFlashAvailable(false) → pantalla fallback
    → Si hay flash: continuar
  → storage.load() → restaurar intensity
  → Mostrar pantalla principal (linterna apagada)
```

---

## Decisiones técnicas

| Decisión | Elección | Justificación |
|----------|----------|---------------|
| React Native + Expo SDK 52 | Sí | Stack WIKA estándar; `expo-camera` expone torch |
| Solo Android v1 | Sí | Requisito del proyecto; simplifica permisos y testing |
| expo-camera para torch | Sí | API Expo oficial; evita módulos nativos custom |
| PWM fallback para intensidad | Sí | Compatibilidad con dispositivos sin torch strength API |
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
