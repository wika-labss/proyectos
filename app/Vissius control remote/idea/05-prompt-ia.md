# Prompt IA

## Instrucciones para el agente

Genera la aplicación **Vissius Control Remote** — mando remoto WiFi para TV con segunda pantalla de apps de streaming. El código debe generarse en `iterations/v1/`.

---

## Reglas de generación

1. Seguir arquitectura en `03-architecture.md`
2. Seguir dependencias en `06-build-environment.md` — **manifiesto completo obligatorio**
3. Implementar funcionalidades de `02-features.md` por prioridad (P0 primero)
4. Respetar diseño de `04-design.md` — **paleta obligatoria, sin excepciones**
5. Código limpio, TypeScript strict, sin `any`
6. Incluir `mockTv.ts` para desarrollo sin televisor real

---

## Diseño — reglas bloqueantes

| Regla | Valor |
|-------|-------|
| Fondos | Solo `#F7B9AD` y `#E83A17` (colores sólidos) |
| Botones | Fondo `#000000`, texto/icono `#FFFFFF` — **todos** los botones |
| Navegación | Pad con arriba, abajo, izquierda, derecha, OK, atrás |
| Volumen | Botón subir + botón bajar |
| Apps | Segunda pantalla: Netflix, HBO, YouTube, Crunchyroll |

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
- [ ] Permisos WiFi Android declarados

---

## Gates de verificación (bloqueantes)

| # | Gate | Comando |
|---|------|---------|
| 1 | Dependencias | `npx expo-doctor` → 0 errores |
| 2 | TypeScript | `npx tsc --noEmit` → exit 0 |
| 3 | Metro | `npx expo start` → arranca |
| 4 | UI paleta | Fondos `#F7B9AD`/`#E83A17`, botones negro/blanco |
| 5 | Mock TV | Emparejamiento demo funciona; comandos responden |

---

## Restricciones adicionales

- `RemoteButton` componente base reutilizable — negro/blanco obligatorio
- `theme.ts` debe exportar exactamente los tokens de `04-design.md`
- No usar otros colores de fondo ni botones de otro color
- Pad de navegación visible en pantalla Mando sin scroll
- Pantalla Apps separada con tabs o navegación inferior
- Mock TV simula latencia ~150 ms

---

## Resultado esperado

```text
iterations/v1/
├── app/
│   ├── _layout.tsx      # Tabs: Mando | Apps
│   ├── index.tsx        # Emparejamiento WiFi
│   ├── remote.tsx       # Navegación + volumen
│   └── apps.tsx         # Netflix, HBO, YouTube, Crunchyroll
├── src/
│   ├── components/      # NavigationPad, VolumeControls, RemoteButton, ...
│   ├── hooks/
│   ├── engine/
│   ├── stores/
│   ├── constants/       # theme.ts, streamingApps.ts
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

- [ ] Pantalla de emparejamiento: buscar y conectar TV por WiFi (mock OK en v1)
- [ ] Pad de navegación: arriba, abajo, izquierda, derecha, OK, atrás
- [ ] Volumen: botón subir y botón bajar
- [ ] Segunda pantalla con botones Netflix, HBO, YouTube, Crunchyroll
- [ ] Tabs o navegación entre pantalla Mando y pantalla Apps
- [ ] TV emparejada persiste entre sesiones

### Diseño

- [ ] Fondos usan solo `#F7B9AD` y `#E83A17`
- [ ] Todos los botones: fondo negro, texto blanco
- [ ] Targets táctiles ≥ 48 dp

### Técnicos (WIKA)

- [ ] `npx expo-doctor` sin errores
- [ ] `npx tsc --noEmit` sin errores
- [ ] Dependencias alineadas con `06-build-environment.md`

---

## Orden de implementación sugerido

1. Configuración (`package.json`, `app.json`, `tsconfig.json`)
2. `theme.ts` con paleta obligatoria + `streamingApps.ts`
3. `RemoteButton` — componente base negro/blanco
4. Engine: `tvRemoteApi.ts`, `mockTv.ts`, `discovery.ts`
5. Stores: `tvStore.ts`, `pairingStore.ts`
6. `NavigationPad`, `VolumeControls`, `StreamingAppButton`
7. Pantallas: index (emparejamiento), remote (mando), apps (streaming)
8. Layout con tabs Mando / Apps
9. **`npx expo install --fix` + `npx expo-doctor`**
10. Verificar gates DEV
