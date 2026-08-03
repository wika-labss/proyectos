# Prompt IA

## Instrucciones para el agente

Genera la aplicación **bby app** (linterna gótica Android) basada en la documentación del proyecto. El código debe generarse en `iterations/v1/`.

---

## Reglas de generación

1. Seguir arquitectura en `03-architecture.md`
2. Seguir dependencias en `06-build-environment.md` — **manifiesto completo obligatorio**
3. Implementar funcionalidades de `02-features.md` por prioridad (P0 primero)
4. Respetar diseño gótico de `04-design.md` — paleta negro/morado/rojo oscuro, botones blancos
5. Código limpio, TypeScript strict, sin `any`
6. **Solo Android v1** — no generar código iOS

---

## Dependencias técnicas (obligatorio)

Antes de entregar código:

```bash
npx expo install --fix
npx expo-doctor
```

### Checklist de package.json

- [ ] Todas las deps `expo-*` listadas en `06-build-environment.md`
- [ ] `expo-camera` incluido (control de flash)
- [ ] `expo-keep-awake` incluido
- [ ] `expo-haptics` incluido
- [ ] `expo-system-ui` incluido (requerido por `userInterfaceStyle`)
- [ ] `expo-asset` incluido
- [ ] `expo-build-properties` incluido
- [ ] `@react-native-async-storage/async-storage` incluido
- [ ] `zustand` incluido (versión exacta `5.0.0`, no `^`)
- [ ] Versiones con `~`, no `^`
- [ ] `app.json` incluye plugins de `06-build-environment.md`
- [ ] Permisos Android: `CAMERA`, `FLASHLIGHT`

---

## Gates de verificación (bloqueantes)

La iteración **no se considera completa** sin pasar:

| # | Gate | Comando |
|---|------|---------|
| 1 | Dependencias | `npx expo-doctor` → 0 errores |
| 2 | TypeScript | `npx tsc --noEmit` → exit 0 |
| 3 | Bundle JS | `npx expo export --platform android` → sin errores |
| 4 | Prebuild | `npx expo prebuild --platform android` → sin errores |
| 5 | SDK | `android/local.properties` escrito **después** de prebuild |
| 6 | APK | `./gradlew assembleRelease` → BUILD SUCCESSFUL |

---

## Restricciones adicionales

- **No usar módulos nativos custom** — solo APIs Expo (`expo-camera` para torch)
- **Patrón SOS exacto** — seguir timings de `02-features.md`, **incluidas las pausas de 600 ms entre letras** y 1200 ms entre ciclos
- **Intensidad 0–100** — slider con valor entero; PWM software con duty efectivo 20–80%
- **Una sola vía de control** — la UI solo usa `useTorch`; prohibido llamar a `torchStore.setMode` o al `TorchController` desde pantallas
- **Persistencia con debounce** — no escribir en AsyncStorage en cada evento de arrastre
- **Pantalla única** — no crear navegación multi-pantalla en v1
- **Estilo gótico obligatorio** — usar tokens de `src/constants/theme.ts`; no colores genéricos
- **Botones blancos** — fondo `#FFFFFF`, texto/icono oscuro
- **Apagar flash al salir** — cleanup en unmount y en `AppState` background: apagar torch y cancelar SOS
- **Sin timers huérfanos** — todo `setTimeout`/PWM debe limpiarse al desmontar su dueño
- **Detección de hardware** — pantalla fallback con botón "Reintentar" si no hay flash LED

---

## Resultado esperado

```text
iterations/v1/
├── app/
│   ├── _layout.tsx
│   └── index.tsx
├── src/
│   ├── components/
│   │   ├── TorchButton.tsx
│   │   ├── IntensitySlider.tsx
│   │   ├── SosButton.tsx
│   │   ├── StatusIndicator.tsx
│   │   └── GothicBackground.tsx
│   ├── hooks/
│   │   ├── TorchProvider.tsx
│   │   ├── useTorch.ts
│   │   ├── useSosPattern.ts
│   │   └── useFlashAvailability.ts
│   ├── stores/
│   │   └── torchStore.ts
│   ├── engine/
│   │   ├── sosPattern.ts
│   │   └── intensityController.ts
│   ├── constants/
│   │   └── theme.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── storage.ts
├── assets/
├── app.json
├── package.json
└── tsconfig.json
```

---

## Criterios de aceptación

### Funcionales

- [ ] Botón central enciende y apaga el flash LED del teléfono
- [ ] Slider de intensidad modifica el brillo en tiempo real y es arrastrable sin saltos
- [ ] Botón SOS activa patrón Morse `··· ——— ···` con pausas entre letras, en bucle continuo
- [ ] Desactivar SOS detiene el parpadeo inmediatamente
- [ ] Indicador de estado muestra OFF / ENCENDIDA / SOS ACTIVO correctamente
- [ ] App detecta ausencia de flash y muestra pantalla fallback con botón "Reintentar"
- [ ] Intensidad seleccionada persiste entre sesiones
- [ ] Pantalla permanece encendida mientras linterna o SOS está activo
- [ ] El flash se apaga al enviar la app a segundo plano
- [ ] UI sigue estilo gótico: fondo negro, acentos morado/rojo oscuro, botones blancos

### Técnicos (WIKA — obligatorios)

- [ ] `npx expo-doctor` sin errores
- [ ] `npx tsc --noEmit` sin errores
- [ ] Dependencias alineadas con `06-build-environment.md`
- [ ] Perfil BUILD cumplido (APK compila)
- [ ] Permisos `CAMERA` y `FLASHLIGHT` declarados en app.json
- [ ] Flash se apaga en cleanup (unmount / app background)

### Build nativo

- [ ] `expo-build-properties` configurado en app.json
- [ ] Kotlin 1.9.25 fijado
- [ ] APK release compila sin errores
- [ ] El APK release instala y corre en dispositivo físico **sin servidor Metro**

---

## Orden de implementación sugerido

1. Configuración (`package.json`, `app.json`, `tsconfig.json`) — según `06-build-environment.md`
2. `src/constants/theme.ts` — tokens de diseño gótico
3. `src/types/index.ts` — TorchMode, TorchState, SosStep
4. `src/engine/sosPattern.ts` + `intensityController.ts` — lógica pura
5. `src/stores/torchStore.ts` — estado global
6. `src/hooks/useTorch.ts`, `useSosPattern.ts`, `useFlashAvailability.ts`
7. `src/utils/storage.ts` — persistencia
8. Componentes UI góticos (TorchButton, IntensitySlider, SosButton, StatusIndicator, GothicBackground)
9. `app/index.tsx` — pantalla principal ensamblando todo
10. **`npx expo install --fix` + `npx expo-doctor`**
11. Prebuild + verificar gates de build
