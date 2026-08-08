# Arquitectura

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Framework móvil | **React Native + Expo SDK 52** |
| Lenguaje | TypeScript (strict mode) |
| Navegación | Expo Router (2 pantallas: reloj + ajustes) |
| Widget Android | `react-native-android-widget` |
| Estado global | Zustand |
| Persistencia | AsyncStorage (preferencias de reloj) |
| Fuentes | `expo-font` + DSEG7 Classic (7 segmentos) |
| Estilos | StyleSheet nativo + tokens retro en `src/constants/theme.ts` |
| Utilidades | `expo-keep-awake` (modo reloj de mesa), `expo-haptics` (opcional) |
| Build | Prebuild local → APK release autónomo (Android) |

> Manifiesto completo de dependencias: ver `06-build-environment.md`

---

## Dependencias técnicas

> Referencia obligatoria: `06-build-environment.md`. El manifiesto de dependencias debe estar completo **antes** de generar código.

### Reglas WIKA de dependencias

1. Instalar con `npx expo install <paquete>` (proyectos Expo)
2. Usar prefijo `~` en versiones Expo/RN — **prohibido `^`**
3. `react-native-android-widget` se instala con `npm install react-native-android-widget@0.15.1` (versión validada para Expo SDK 52)
4. Ejecutar `npx expo install --fix` al finalizar cada iteración
5. Validar con `npx expo-doctor` — 0 errores bloqueantes

### Manifiesto del proyecto

| Paquete | Versión | Capa | Obligatorio |
|---------|---------|------|-------------|
| `expo` | `~52.0.0` | Core | ✅ |
| `expo-router` | `~4.0.0` | Navegación | ✅ |
| `expo-font` | `~13.0.0` | Fuente DSEG7 | ✅ |
| `expo-keep-awake` | `~14.0.0` | Pantalla activa (modo mesa) | ✅ |
| `expo-haptics` | `~14.0.0` | Feedback táctil | ✅ |
| `expo-system-ui` | `~4.0.9` | UI oscura | ✅ |
| `expo-asset` | `~11.0.5` | Assets | ✅ |
| `expo-build-properties` | `~0.13.0` | Build nativo | ✅ |
| `react-native-android-widget` | `0.15.1` | Widget Android | ✅ |
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
        "react-native-android-widget",
        {
          "fonts": ["./assets/fonts/DSEG7Classic-Bold.ttf"],
          "widgets": [
            {
              "name": "RetroClockWidget",
              "label": "Reloj Retro",
              "minWidth": "250dp",
              "minHeight": "110dp",
              "targetCellWidth": 4,
              "targetCellHeight": 2,
              "description": "Reloj digital retro en tu pantalla de inicio",
              "previewImage": "./assets/widget-preview/retro-clock.png",
              "updatePeriodMillis": 1800000
            }
          ]
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
      "package": "com.wika.relojandroid"
    }
  }
}
```

---

## Perfil de build

| Perfil | Target esta iteración | Pipeline |
|--------|----------------------|----------|
| DEV (Expo Go) | [ ] | No soporta widget nativo — solo preview en app |
| BUILD (APK local) | [x] | `prebuild` + `assembleRelease` → **target v1** |
| RELEASE (EAS) | [ ] | `eas build` — futuro |

> v1 requiere perfil **BUILD** porque el widget Android es código nativo generado por `react-native-android-widget` y no funciona en Expo Go.

---

## Estructura del proyecto

```text
app/reloj android/
├── idea/
├── iterations/v1/
│   ├── index.ts                     # Entry custom: expo-router + widget handler
│   ├── widget-task-handler.tsx      # Handler de eventos del widget
│   ├── app/
│   │   ├── _layout.tsx              # Layout raíz + carga de fuentes
│   │   ├── index.tsx                # Pantalla principal (reloj)
│   │   └── settings.tsx             # Pantalla de ajustes
│   ├── src/
│   │   ├── components/
│   │   │   ├── SevenSegmentDisplay.tsx
│   │   │   ├── RetroBezel.tsx
│   │   │   ├── DateLine.tsx
│   │   │   ├── SettingsRow.tsx
│   │   │   ├── ColorPresetPicker.tsx
│   │   │   └── WidgetPreview.tsx
│   │   ├── widgets/
│   │   │   └── RetroClockWidget.tsx # Render del widget (FlexWidget/TextWidget)
│   │   ├── hooks/
│   │   │   ├── useClock.ts          # Hora actual, tick cada 1s
│   │   │   └── useWidgetSync.ts     # requestWidgetUpdate + intervalo 60s
│   │   ├── stores/
│   │   │   └── clockStore.ts        # Preferencias + estado
│   │   ├── engine/
│   │   │   ├── formatTime.ts        # Formateo 12h/24h, AM/PM
│   │   │   └── widgetRenderer.ts    # renderWidget compartido app/widget
│   │   ├── constants/
│   │   │   └── theme.ts             # Presets retro + tokens
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils/
│   │       └── storage.ts
│   ├── assets/
│   │   ├── fonts/
│   │   │   └── DSEG7Classic-Bold.ttf
│   │   └── widget-preview/
│   │       └── retro-clock.png
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
├── review.md
└── final/
```

---

## Componentes principales

### App — Pantalla principal (`app/index.tsx`)

- Monta `useClock` para tick cada segundo
- Renderiza `SevenSegmentDisplay` dentro de `RetroBezel`
- `DateLine` condicional según preferencias
- Icono navegación a ajustes
- Monta `useWidgetSync` para refrescar widget mientras app está activa

### App — Ajustes (`app/settings.tsx`)

- Controles de formato, segundos, fecha, color
- `WidgetPreview` con hora actual
- Instrucciones para añadir widget
- Al cambiar preferencia → persistir + `requestWidgetUpdate`

### Widget — `RetroClockWidget.tsx`

- Usa primitivas de `react-native-android-widget`: `FlexWidget`, `TextWidget`
- `TextWidget` con `fontFamily: 'DSEG7Classic-Bold'`
- Lee preferencias desde AsyncStorage (mismo key que la app)
- Renderiza hora formateada con color del preset activo
- Fondo `#0D0D0D`, padding, borde simulado

### Widget task handler (`widget-task-handler.tsx`)

```typescript
// Pseudocódigo — implementación real en v1
switch (widgetAction) {
  case 'WIDGET_ADDED':
  case 'WIDGET_UPDATE':
  case 'WIDGET_RESIZED':
    renderWidget(<RetroClockWidget />);
    break;
}
```

### Entry point custom (`index.ts`)

Según documentación de `react-native-android-widget` + Expo Router:

```typescript
import 'expo-router/entry';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler } from './widget-task-handler';

registerWidgetTaskHandler(widgetTaskHandler);
```

`package.json` → `"main": "index.ts"` (no `expo-router/entry`).

---

## Flujo de datos

```text
AsyncStorage (preferencias)
        ↕
   clockStore (Zustand)
        ↕
┌───────┴───────┐
│               │
app/index    widget-task-handler
(useClock)   (RetroClockWidget)
        ↕
  useWidgetSync
  requestWidgetUpdate() → refresca widget en launcher
```

### Preferencias persistidas

| Key | Tipo | Default |
|-----|------|---------|
| `format24h` | boolean | `true` |
| `showSeconds` | boolean | `true` |
| `showDate` | boolean | `true` |
| `colorPreset` | `'green' \| 'amber' \| 'cyan' \| 'red'` | `'green'` |
| `keepAwake` | boolean | `false` |

---

## Decisiones técnicas

| Decisión | Elección | Justificación |
|----------|----------|---------------|
| Widget library | `react-native-android-widget@0.15.1` | Compatible con Expo SDK 52; config plugin integrado |
| Entry point | `index.ts` custom | Requerido para registrar widget task handler |
| Fuente 7 segmentos | DSEG7 Classic | Estándar open source para displays retro |
| Estado | Zustand + AsyncStorage | Patrón WIKA probado; widget lee AsyncStorage directamente |
| Actualización widget | requestWidgetUpdate cada 60s + system 30min | Balance batería/usabilidad sin servicio nativo custom |
| Segundos en widget | No en v1 | Widget compacto; solo HH:MM (+ AM/PM) |

---

## Toolchain nativo

Ver `06-build-environment.md` para:

- JDK 17, Kotlin 1.9.25, Android SDK 35
- Configuración `expo-build-properties`
- Config plugin `react-native-android-widget`
- Gates de verificación de build
