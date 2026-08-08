# Prompt IA

## Instrucciones para el agente

Genera la aplicación **reloj android** (reloj digital retro con widget Android) basada en la documentación del proyecto. El código debe generarse en `iterations/v1/`.

---

## Reglas de generación

1. Seguir arquitectura en `03-architecture.md`
2. Seguir dependencias en `06-build-environment.md` — **manifiesto completo obligatorio**
3. Implementar funcionalidades de `02-features.md` por prioridad (P0 primero)
4. Respetar diseño retro de `04-design.md` — display 7 segmentos, paleta VFD/LCD
5. Código limpio, TypeScript strict, sin `any`
6. **Solo Android v1** — no generar código iOS
7. **Widget obligatorio** — registrar con `react-native-android-widget`

---

## Dependencias técnicas (obligatorio)

Antes de entregar código:

```bash
npm install
npm install react-native-android-widget@0.15.1
npx expo install --fix
npx expo-doctor
```

### Checklist de package.json

- [ ] Todas las deps `expo-*` listadas en `06-build-environment.md`
- [ ] `react-native-android-widget@0.15.1` incluido
- [ ] `expo-font` incluido (fuente DSEG7)
- [ ] `expo-keep-awake` incluido
- [ ] `expo-haptics` incluido
- [ ] `expo-system-ui` incluido
- [ ] `expo-asset` incluido
- [ ] `expo-build-properties` incluido
- [ ] `@react-native-async-storage/async-storage` incluido
- [ ] `zustand` incluido (versión exacta `5.0.0`, no `^`)
- [ ] Versiones con `~`, no `^`
- [ ] `"main": "index.ts"` (entry custom para widget handler)
- [ ] `app.json` incluye plugin `react-native-android-widget` con widget `RetroClockWidget`

---

## Gates de verificación (bloqueantes)

La iteración **no se considera completa** sin pasar:

| # | Gate | Comando |
|---|------|---------|
| 1 | Dependencias | `npx expo-doctor` → 0 errores |
| 2 | TypeScript | `npx tsc --noEmit` → exit 0 |
| 3 | Bundle JS | `npx expo export --platform android` → sin errores |
| 4 | Prebuild | `npx expo prebuild --platform android` → sin errores |
| 5 | APK | `./gradlew assembleRelease` → BUILD SUCCESSFUL |
| 6 | Widget | Añadir widget "Reloj Retro" en launcher → muestra hora |

---

## Restricciones adicionales

- **Entry point custom obligatorio** — `index.ts` importa `expo-router/entry` + registra `registerWidgetTaskHandler`
- **Render inmediato en WIDGET_ADDED** — nunca dejar widget vacío al añadirlo
- **Fuente DSEG7** — incluir en `assets/fonts/` y registrar en widget config + `expo-font`
- **Widget lee AsyncStorage** — mismas keys que la app para preferencias (formato, color)
- **Formato hora compartido** — `src/engine/formatTime.ts` usado por app y widget
- **Estilo retro obligatorio** — usar tokens de `src/constants/theme.ts`; presets verde/ámbar/cian/rojo
- **Dos puntos parpadeantes** — `:` alterna opacidad cada 500 ms en app
- **Segundos solo en app** — widget muestra HH:MM (+ AM/PM si 12h)
- **requestWidgetUpdate** — llamar al cambiar preferencias y cada 60 s con app en foreground
- **Sin permisos innecesarios** — no solicitar cámara, ubicación ni internet
- **Prohibido Expo Go como target** — v1 es BUILD nativo

---

## Resultado esperado

```text
iterations/v1/
├── index.ts
├── widget-task-handler.tsx
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   └── settings.tsx
├── src/
│   ├── components/
│   │   ├── SevenSegmentDisplay.tsx
│   │   ├── RetroBezel.tsx
│   │   ├── DateLine.tsx
│   │   ├── SettingsRow.tsx
│   │   ├── ColorPresetPicker.tsx
│   │   └── WidgetPreview.tsx
│   ├── widgets/
│   │   └── RetroClockWidget.tsx
│   ├── hooks/
│   │   ├── useClock.ts
│   │   └── useWidgetSync.ts
│   ├── stores/
│   │   └── clockStore.ts
│   ├── engine/
│   │   ├── formatTime.ts
│   │   └── widgetRenderer.ts
│   ├── constants/
│   │   └── theme.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── storage.ts
├── assets/
│   ├── fonts/
│   │   └── DSEG7Classic-Bold.ttf
│   └── widget-preview/
│       └── retro-clock.png
├── app.json
├── package.json
└── tsconfig.json
```

---

## Criterios de aceptación

### Funcionales

- [ ] App muestra hora actual en display 7 segmentos retro, actualizada cada segundo
- [ ] Dos puntos (`:`) parpadean entre horas y minutos
- [ ] Fecha visible si preferencia activada
- [ ] Ajustes: formato 12h/24h, segundos, fecha, color del display
- [ ] 4 presets de color retro (Verde VFD, Ámbar LCD, Cian CRT, Rojo LED)
- [ ] Preferencias persisten entre sesiones
- [ ] Widget "Reloj Retro" aparece en selector de widgets de Android
- [ ] Widget muestra hora con estilo retro coherente con la app
- [ ] Tap en widget abre la app
- [ ] Cambiar preferencias actualiza el widget inmediatamente

### Técnicos (WIKA — obligatorios)

- [ ] `npx expo-doctor` sin errores
- [ ] `npx tsc --noEmit` sin errores
- [ ] Dependencias alineadas con `06-build-environment.md`
- [ ] Perfil BUILD cumplido (APK compila)
- [ ] Entry point `index.ts` con widget handler registrado
- [ ] Plugin `react-native-android-widget` en app.json

### Build nativo

- [ ] `expo-build-properties` configurado en app.json
- [ ] Kotlin 1.9.25 fijado
- [ ] APK release compila sin errores
- [ ] APK instala y corre en dispositivo físico **sin servidor Metro**
- [ ] Widget funcional en pantalla de inicio del dispositivo

---

## Orden de implementación sugerido

1. Configuración (`package.json`, `app.json`, `tsconfig.json`, `index.ts`) — según `06-build-environment.md`
2. `assets/fonts/DSEG7Classic-Bold.ttf` + preview widget
3. `src/constants/theme.ts` — presets retro + tokens
4. `src/types/index.ts` — ClockPreferences, ColorPreset
5. `src/engine/formatTime.ts` — formateo 12h/24h compartido
6. `src/utils/storage.ts` + `src/stores/clockStore.ts`
7. `src/hooks/useClock.ts` — tick cada segundo
8. Componentes UI retro (SevenSegmentDisplay, RetroBezel, DateLine, etc.)
9. `app/index.tsx` — pantalla principal del reloj
10. `app/settings.tsx` — pantalla de ajustes
11. `src/widgets/RetroClockWidget.tsx` + `widget-task-handler.tsx`
12. `src/hooks/useWidgetSync.ts` — sincronización app → widget
13. **`npx expo install --fix` + `npx expo-doctor`**
14. Prebuild + verificar gates de build + probar widget en dispositivo
