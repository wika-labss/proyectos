# Prompt IA

## Instrucciones para el agente

Genera la aplicación **Vissius Control Remote** — mando remoto WiFi para TV con segunda pantalla de apps de streaming. El código debe generarse en `iterations/v1/`.

**Perfil target v1: BUILD** — APK release autónomo para Android (no Expo Go como entregable).

---

## Reglas de generación

1. Seguir arquitectura en `03-architecture.md`
2. Seguir dependencias en `06-build-environment.md` — **manifiesto completo obligatorio**
3. Implementar funcionalidades de `02-features.md` por prioridad (P0 primero)
4. Respetar diseño de `04-design.md` — **paleta obligatoria, sin excepciones**
5. Código limpio, TypeScript strict, sin `any`
6. Incluir scripts WIKA BUILD: `verify-build`, `build-apk`, `post-prebuild.js`
7. Incluir `mockTv.ts` (v1 mock; protocolo real en v2+)

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
- [ ] Scripts `verify`, `verify:win`, `apk`, `apk:win`, `prebuild:android`

---

## Gates de verificación (bloqueantes) — perfil BUILD

| # | Gate | Comando |
|---|------|---------|
| 1 | Dependencias | `npx expo-doctor` → 0 errores |
| 2 | TypeScript | `npx tsc --noEmit` → exit 0 |
| 3 | Bundle JS | `npx expo export --platform android` → OK |
| 4 | Prebuild | `npx expo prebuild --platform android` → sin errores |
| 5 | Kotlin | `node scripts/post-prebuild.js` → 1.9.25 |
| 6 | APK release | `./gradlew assembleRelease` → BUILD SUCCESSFUL |
| 7 | UI paleta | Fondos `#F7B9AD`/`#E83A17`, botones negro/blanco |

---

## Restricciones adicionales

- `RemoteButton` componente base reutilizable — negro/blanco obligatorio
- `local.properties` se escribe **después** de prebuild (regla WIKA)
- Target Gradle: `assembleRelease` (no debug) — APK autónomo
- JDK 17 obligatorio en scripts `.bat`
- Mock TV simula latencia ~150 ms

---

## Resultado esperado

```text
iterations/v1/
├── app/
├── src/
├── scripts/
│   ├── verify-build.sh / .bat
│   ├── build-apk.sh / .bat
│   ├── post-prebuild.js
│   └── local.properties.example
├── assets/
├── app.json
├── package.json
└── tsconfig.json
```

---

## Criterios de aceptación

### Funcionales

- [ ] Emparejamiento WiFi (mock OK en v1)
- [ ] Pad navegación + volumen + apps streaming
- [ ] TV emparejada persiste entre sesiones

### Técnicos (WIKA — BUILD)

- [ ] `npx expo-doctor` sin errores
- [ ] `npx tsc --noEmit` sin errores
- [ ] APK release compila e instala en dispositivo físico
- [ ] App funciona sin Metro ni PC encendidos

---

## Orden de implementación sugerido

1. Configuración (`package.json`, `app.json`, `tsconfig.json`)
2. Scripts BUILD WIKA
3. `theme.ts`, engine, stores, hooks, componentes, pantallas
4. **`npx expo install --fix` + `npx expo-doctor`**
5. `npm run verify` (o `verify:win` en Windows)
6. `npm run apk:win` → instalar APK en teléfono
