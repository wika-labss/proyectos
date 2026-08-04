# Arquitectura

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Framework móvil | **React Native + Expo SDK 52** |
| Lenguaje | TypeScript (strict mode) |
| Navegación | Expo Router (pantallas: conexión, control, ajustes) |
| Comunicación | `fetch` nativo + polling HTTP (REST Vissius) |
| Estado global | Zustand |
| Persistencia | AsyncStorage (último dispositivo, preferencias) |
| Estilos | StyleSheet nativo + tokens en `src/constants/theme.ts` |
| Utilidades | `expo-haptics` (feedback), `expo-network` (estado de red) |
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
| `expo-network` | `~7.0.0` | Estado de red | ✅ |
| `expo-haptics` | `~14.0.0` | Feedback táctil | ✅ |
| `expo-system-ui` | `~4.0.9` | Tema oscuro | ✅ |
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
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE",
        "android.permission.ACCESS_WIFI_STATE"
      ]
    }
  }
}
```

---

## Perfil de build

| Perfil | Target esta iteración | Pipeline |
|--------|----------------------|----------|
| DEV (Expo Go) | [x] | `npx expo start` — validar UI y flujos con mock API |
| BUILD (APK local) | [ ] | `prebuild` + Gradle — target v2 |
| RELEASE (EAS) | [ ] | `eas build` — futuro |

> v1 usa perfil **DEV** con cliente HTTP mock para desarrollo sin hardware Vissius real.
> v2 migrará a **BUILD** para APK en dispositivo físico en red LAN.

---

## Estructura del proyecto

```text
app/Vissius control remote/
├── idea/
├── iterations/v1/
│   ├── app/
│   │   ├── _layout.tsx            # Layout raíz + providers
│   │   ├── index.tsx              # Pantalla de conexión / descubrimiento
│   │   ├── control.tsx            # Panel de control remoto
│   │   └── settings.tsx           # Configuración (IP, puerto)
│   ├── src/
│   │   ├── components/
│   │   │   ├── PowerButton.tsx    # Botón encender/apagar
│   │   │   ├── ModeSelector.tsx   # Selector de modos
│   │   │   ├── StatusPanel.tsx    # Estado del dispositivo
│   │   │   ├── ParameterSlider.tsx # Slider de parámetros
│   │   │   ├── ConnectionBanner.tsx # Banner conexión/desconexión
│   │   │   └── DeviceCard.tsx     # Tarjeta dispositivo en lista
│   │   ├── hooks/
│   │   │   ├── useDeviceConnection.ts  # Conexión y polling
│   │   │   └── useStatusPolling.ts     # Polling /api/status
│   │   ├── engine/
│   │   │   ├── vissiusApi.ts      # Cliente HTTP REST
│   │   │   ├── discovery.ts       # Escaneo LAN (v1: mock + IP manual)
│   │   │   └── mockDevice.ts      # Mock para DEV sin hardware
│   │   ├── stores/
│   │   │   ├── deviceStore.ts     # Estado dispositivo y conexión
│   │   │   └── settingsStore.ts   # IP, puerto, preferencias
│   │   ├── constants/
│   │   │   └── theme.ts           # Tokens de diseño
│   │   ├── types/
│   │   │   └── index.ts           # DeviceStatus, Mode, Command
│   │   └── utils/
│   │       └── storage.ts         # AsyncStorage helpers
│   ├── assets/
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
├── review.md
└── final/
```

---

## Componentes principales

| Módulo | Responsabilidad |
|--------|-----------------|
| `vissiusApi.ts` | Cliente HTTP puro: GET status, POST power/mode/setpoint. Sin dependencia de React |
| `discovery.ts` | Descubrimiento LAN; v1 incluye mock y entrada manual de IP |
| `deviceStore.ts` | Estado global: conexión, power, mode, values, loading, error |
| `useDeviceConnection.ts` | Orquesta conexión, envío de comandos y manejo de errores |
| `useStatusPolling.ts` | Polling periódico de `/api/status` mientras conectado |
| `StatusPanel` | UI de lectura del estado actual |
| `PowerButton` / `ModeSelector` | Controles de acción principales |

---

## Flujo de datos

```text
Usuario → UI (control.tsx)
    ↓ tap power/mode/slider
deviceStore → vissiusApi.post(...)
    ↓ HTTP POST
Dispositivo Vissius
    ↓ respuesta / polling GET
useStatusPolling → deviceStore.updateStatus(...)
    ↓
StatusPanel / ModeSelector (re-render)
```

---

## Decisiones técnicas

| Decisión | Elección | Justificación |
|----------|----------|---------------|
| Protocolo v1 | HTTP REST + polling | Simple, debuggeable, sin WebSocket nativo extra |
| Estado | Zustand | Ligero, patrón WIKA validado en bby/sodoku |
| Mock en DEV | `mockDevice.ts` | Permite desarrollar UI sin hardware Vissius |
| Polling vs push | Polling 2 s | Suficiente para control doméstico; push en v2+ |
| Navegación | Expo Router file-based | Estándar WIKA SDK 52 |

---

## Toolchain nativo

Ver `06-build-environment.md` para:

- JDK 17, Kotlin 1.9.25, Android SDK 35
- Configuración `expo-build-properties`
- Gates de verificación de build
