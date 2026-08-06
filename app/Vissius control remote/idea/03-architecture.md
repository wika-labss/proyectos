# Arquitectura

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Framework móvil | **React Native + Expo SDK 52** |
| Lenguaje | TypeScript (strict mode) |
| Navegación | Expo Router (emparejamiento, mando, apps) |
| Comunicación TV | WiFi LAN — **discovery real** (Vissius HTTP + Roku ECP) |
| Estado global | Zustand |
| Persistencia | AsyncStorage (TV emparejada, preferencias) |
| Estilos | StyleSheet nativo + tokens en `src/constants/theme.ts` |
| Utilidades | `expo-haptics` (feedback), `expo-network` (estado WiFi) |
| Build | Prebuild local → **APK release** autónomo (Android) — **target v3** |

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
| `expo-network` | `~7.0.0` | Estado WiFi | ✅ |
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
| DEV (Expo Go) | [ ] | Solo desarrollo UI opcional |
| BUILD (APK release) | [x] | `prebuild` + `assembleRelease` → **target v3.1** |
| RELEASE (EAS) | [ ] | `eas build` — futuro |

> v3.1 = v3 + módulo `src/diagnostics/` (logs exportables). Emparejamiento LAN: cleartext HTTP + timeouts largos.

---

## Estructura del proyecto

```text
app/Vissius control remote/
├── idea/
├── iterations/v2/
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── index.tsx                # Splash Vissiuss (negro)
│   │   ├── pairing.tsx              # Emparejamiento LAN real
│   │   └── (tabs)/
│   │       ├── remote.tsx           # Mando + Cambiar TV
│   │       └── apps.tsx
│   ├── src/
│   │   ├── engine/
│   │   │   ├── discovery.ts
│   │   │   ├── lanDiscovery.ts      # Escaneo subred
│   │   │   ├── tvRemoteApi.ts
│   │   │   └── drivers/
│   │   │       ├── vissiusDriver.ts # HTTP :8080
│   │   │       └── rokuDriver.ts    # ECP :8060
│   │   └── components/
│   │       └── FeedbackBanner.tsx
│   │   ├── stores/
│   │   │   ├── tvStore.ts           # TV conectada, estado, error
│   │   │   └── pairingStore.ts      # Lista TVs, emparejamiento
│   │   ├── constants/
│   │   │   ├── theme.ts             # #F7B9AD, #E83A17, negro/blanco
│   │   │   └── streamingApps.ts     # Netflix, HBO, YouTube, Crunchyroll
│   │   ├── types/
│   │   │   └── index.ts             # RemoteCommand, TvDevice, StreamingApp
│   │   └── utils/
│   │       └── storage.ts
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
| `src/diagnostics/` (v3.1) | Logger `ejecución --> resultado`, export texto/JSON, UI `/logs` |
| `tvRemoteApi.ts` | Envía comandos: `nav_up`, `nav_down`, `nav_left`, `nav_right`, `ok`, `back`, `vol_up`, `vol_down`, `launch_app` |
| `discovery.ts` + `lanDiscovery.ts` | Escaneo subred WiFi; drivers Vissius + Roku + Android TV |
| `drivers/*.ts` | Protocolo HTTP/TLS por marca/modelo |
| `tvStore.ts` | Estado: conectado, TV emparejada, loading, error |
| `NavigationPad` | UI del pad direccional |
| `VolumeControls` | Botones vol + / vol − |
| `apps.tsx` | Segunda pantalla con 4 botones de streaming |
| `RemoteButton` | Componente base: fondo `#000000`, texto `#FFFFFF` |

---

## Comandos remotos

| Comando | Acción en TV |
|---------|--------------|
| `nav_up` | Mover foco arriba |
| `nav_down` | Mover foco abajo |
| `nav_left` | Mover foco izquierda |
| `nav_right` | Mover foco derecha |
| `ok` | Seleccionar / confirmar |
| `back` | Retroceder |
| `vol_up` | Subir volumen |
| `vol_down` | Bajar volumen |
| `launch_netflix` | Abrir Netflix |
| `launch_hbo` | Abrir HBO |
| `launch_youtube` | Abrir YouTube |
| `launch_crunchyroll` | Abrir Crunchyroll |

> v2: transporte HTTP LAN. Vissius `:8080/api/v1/*`, Roku ECP `:8060`. Más marcas en v3.

---

## Flujo de datos

```text
Usuario → RemoteButton tap
    ↓
useRemoteCommand → tvRemoteApi.send(command)
    ↓ WiFi LAN
Televisor emparejado
```

```text
Usuario → tab Apps → StreamingAppButton tap
    ↓
tvRemoteApi.launchApp('netflix' | 'hbo' | 'youtube' | 'crunchyroll')
    ↓
TV abre la app correspondiente
```

---

## Decisiones técnicas

| Decisión | Elección | Justificación |
|----------|----------|---------------|
| Dos pantallas | Tabs Mando / Apps | Separación clara de funciones según requerimiento |
| Mock en DEV | Eliminado en v2 discovery | v2 exige LAN real |
| Botón base único | `RemoteButton.tsx` | Garantiza negro/blanco en todos los controles |
| Estado | Zustand | Patrón WIKA validado |
| Tema fijo | Sin dark mode | Paleta obligatoria en `04-design.md` |

---

## Toolchain nativo

Ver `06-build-environment.md` para JDK 17, Kotlin 1.9.25, Android SDK 35 y gates de build.
