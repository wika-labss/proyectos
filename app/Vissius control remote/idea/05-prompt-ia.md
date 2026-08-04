# Prompt IA

## Instrucciones para el agente

Genera la aplicación **Vissius Control Remote** basada en la documentación del proyecto. El código debe generarse en `iterations/v1/`.

---

## Reglas de generación

1. Seguir arquitectura en `03-architecture.md`
2. Seguir dependencias en `06-build-environment.md` — **manifiesto completo obligatorio**
3. Implementar funcionalidades de `02-features.md` por prioridad (P0 primero)
4. Respetar diseño de `04-design.md`
5. Código limpio, TypeScript strict, sin `any`
6. Incluir `mockDevice.ts` para desarrollo sin hardware Vissius real

---

## Dependencias técnicas (obligatorio)

Antes de entregar código:

```bash
npx expo install --fix
npx expo-doctor
```

### Checklist de package.json

- [ ] Todas las deps `expo-*` listadas en `06-build-environment.md`
- [ ] `expo-asset` incluido
- [ ] `expo-build-properties` incluido
- [ ] Versiones con `~`, no `^`
- [ ] `app.json` incluye plugins de `06-build-environment.md`
- [ ] Permisos de red Android declarados

---

## Gates de verificación (bloqueantes)

La iteración **no se considera completa** sin pasar:

| # | Gate | Comando |
|---|------|---------|
| 1 | Dependencias | `npx expo-doctor` → 0 errores |
| 2 | TypeScript | `npx tsc --noEmit` → exit 0 |
| 3 | Metro | `npx expo start` → arranca |
| 4 | Mock funcional | Modo demo conecta y responde a power/mode |

> Gates 4–5 de build nativo (prebuild/APK) aplican en v2 cuando el perfil sea BUILD.

---

## Restricciones adicionales

- Cliente HTTP (`vissiusApi.ts`) debe ser módulo puro, testeable sin React
- Polling de estado: intervalo 2 s, limpiar al desmontar / desconectar
- Debounce en sliders: 300 ms al soltar
- No usar librerías de red externas (axios, etc.) — `fetch` nativo
- Mock device debe simular latencia ~200 ms para UX realista

---

## Resultado esperado

```text
iterations/v1/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── control.tsx
│   └── settings.tsx
├── src/
│   ├── components/
│   ├── hooks/
│   ├── engine/
│   ├── stores/
│   ├── constants/
│   ├── types/
│   └── utils/
├── assets/
├── app.json
├── package.json
└── tsconfig.json
```

---

## Criterios de aceptación

### Funcionales

- [ ] Pantalla de conexión permite conectar vía IP manual o modo demo
- [ ] Botón power enciende/apaga (mock o dispositivo real)
- [ ] Selector de modos cambia entre Auto, Manual, Eco, Boost
- [ ] StatusPanel muestra estado actualizado (polling o mock)
- [ ] Banner de conexión refleja estado conectado/desconectado
- [ ] Preferencias (última IP, modo demo) persisten entre sesiones

### Técnicos (WIKA — obligatorios)

- [ ] `npx expo-doctor` sin errores
- [ ] `npx tsc --noEmit` sin errores
- [ ] Dependencias alineadas con `06-build-environment.md`
- [ ] Perfil DEV declarado cumplido

---

## Orden de implementación sugerido

1. Configuración (`package.json`, `app.json`, `tsconfig.json`) — según `06-build-environment.md`
2. Tipos (`DeviceStatus`, `VissiusMode`, etc.) y constantes (`theme.ts`)
3. Engine puro: `vissiusApi.ts`, `mockDevice.ts`, `discovery.ts`
4. Stores: `deviceStore.ts`, `settingsStore.ts`
5. Hooks: `useDeviceConnection.ts`, `useStatusPolling.ts`
6. Componentes UI: StatusPanel, PowerButton, ModeSelector, ConnectionBanner, ParameterSlider
7. Pantallas: index (conexión), control, settings
8. **`npx expo install --fix` + `npx expo-doctor`**
9. Verificar gates DEV
