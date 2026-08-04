# Prompt IA

## Instrucciones para el agente

Genera la aplicación **Vissius Control Remote v2** — mando remoto WiFi con discovery LAN **real**, splash de marca, volumen 0–100 y navegación para cambiar de TV.

El código debe generarse en **`iterations/v2/`**.

**Perfil target v2: BUILD** — APK release autónomo para Android.

---

## Reglas de generación v2

1. Partir de v1 corregido; **no regresar a mock** como discovery principal
2. Seguir arquitectura `03-architecture.md` y diseño `04-design.md` (incl. splash negro)
3. Manifiesto completo en `06-build-environment.md`
4. Discovery real: escaneo subred + drivers Vissius (`:8080`) y Roku (`:8060`)
5. Mensajes: sin TVs encontradas + conexión exitosa
6. Botón **Cambiar TV** en mando para volver a emparejamiento
7. Volumen 0–100; **0 = mute**
8. Scripts WIKA BUILD en `scripts/`
9. Versión **2.0.0** en `package.json` y `app.json`

---

## Gates de verificación (bloqueantes) — BUILD v2

| # | Gate | Comando |
|---|------|---------|
| 1 | Dependencias | `npx expo-doctor` → 0 errores |
| 2 | TypeScript | `npx tsc --noEmit` → exit 0 |
| 3 | Bundle JS | `npx expo export --platform android` → OK |
| 4 | Prebuild | `npx expo prebuild --platform android` → OK |
| 5 | Kotlin | `node scripts/post-prebuild.js` → 1.9.25 |
| 6 | APK release | `./gradlew assembleRelease` → SUCCESS |
| 7 | Sin mock en discovery | `discovery.ts` usa LAN real |

---

## Resultado esperado

```text
iterations/v2/
├── app/
│   ├── index.tsx           # Splash Vissiuss
│   ├── pairing.tsx         # Buscar TV real
│   ├── (tabs)/remote.tsx   # Mando + Cambiar TV
│   └── (tabs)/apps.tsx
├── src/engine/
│   ├── discovery.ts
│   ├── lanDiscovery.ts
│   ├── tvRemoteApi.ts
│   └── drivers/            # vissius, roku
├── src/components/
│   ├── FeedbackBanner.tsx
│   └── ...
└── scripts/                # verify, build-apk, post-prebuild
```

---

## Orden de implementación v2

1. Actualizar docs `idea/` para v2
2. Copiar v1 → v2, bump 2.0.0
3. Engine LAN + drivers
4. Splash, pairing, mensajes, botón Cambiar TV
5. Volumen 0–100 + mute
6. `npx expo install --fix` + `npx expo-doctor`
7. **`npm run verify`** → Auditoría 1 WIKA

---

## Criterios de aceptación v2

### Funcionales

- [ ] Splash negro Vissiuss → emparejamiento
- [ ] Buscar TV escanea LAN real
- [ ] Aviso si 0 TVs
- [ ] Mensaje conexión exitosa
- [ ] Cambiar TV vuelve a emparejamiento
- [ ] Volumen 0–100, 0 = mute
- [ ] Comandos nav/vol/apps enviados por HTTP real

### Técnicos (WIKA — BUILD)

- [ ] Gates verify-build pasan hasta prebuild (+ Gradle local)
- [ ] APK release compila
- [ ] App funciona sin Metro
