# Revisión — Vissius Control Remote

## Versión evaluada

**v3** — Perfil **BUILD** (APK release) — `app/Vissius control remote/iterations/v3/`

## Evaluador

Arquitecto WIKA / Cloud Agent

## Fecha

2026-08-06 (Auditorías 1–3 v3 — listo para compilar)

---

## Historial de iteraciones

| Iteración | Perfil | Estado | Notas |
|-----------|--------|--------|-------|
| v1 | BUILD | Cerrada | Mock TV |
| v2 | BUILD | Cerrada | LAN Roku/Vissius |
| **v3** | **BUILD** | **Lista para APK** | Android TV + pairing fix · **Auditorías 1–3 ✅** |

---

## Cambios v3 (resumen)

| Área | Cambio |
|------|--------|
| Android TV / Google TV | Protocolo Remote v2 (TLS 6466/6467) + PIN |
| Discovery | Timeouts 2.5s, min 10s, progreso %, cleartext |
| IP manual | Auto / Android / Roku / Vissius |
| Volumen | Paso **1** (0–100), mute en 0 |
| Entradas | Tab HDMI 1–4, AV, TV |

---

## Auditoría 1 — Compilación (BUILD v3) ✅

Re-ejecutada 2026-08-06 tras Android TV.

| Gate | Resultado |
|------|-----------|
| `npx expo-doctor` | ✅ 18/18 |
| `npx tsc --noEmit` | ✅ |
| `npx expo export --platform android` | ✅ 3.44 MB |
| `npx expo prebuild --platform android` | ✅ |
| Kotlin 1.9.25 | ✅ |
| Cleartext HTTP | ✅ |
| `VOLUME_STEP = 1` | ✅ |
| Scripts verify / apk | ✅ |
| `assembleRelease` | ⚠️ en PC Windows del usuario |

**Resultado:** ✅ **APROBADA** — listo para `gradlew assembleRelease` en local.

---

## Auditoría 2 — Motores y hooks (v3) ✅

| # | Punto | v3 |
|---|-------|-----|
| 1 | UI no importa `engine/` | ✅ fix: `useAndroidTvPin` |
| 2 | Hooks API única | ✅ pairing, connection, remote, bootstrap, androidTvPin |
| 3 | Guards scan/connect/sending | ✅ |
| 4 | Android TV session + certs | ✅ `androidTvDriver` + AsyncStorage |
| 5 | Volumen step 1 compartido | ✅ `volumeLogic.ts` |
| 6 | Drivers Roku/Vissius/AndroidTV | ✅ vía `tvRemoteApi` |

**Resultado:** ✅ **APROBADA**

---

## Auditoría 3 — Diseño / UX / entrega BUILD (v3) ✅

| # | Punto | v3 |
|---|-------|-----|
| 1 | Splash negro Vissiuss | ✅ |
| 2 | Paleta `#F7B9AD` / `#E83A17` + botones N/B | ✅ |
| 3 | Tabs Mando / Apps / Entradas | ✅ |
| 4 | Progreso escaneo + aviso sin TV | ✅ |
| 5 | Modal PIN Android TV | ✅ |
| 6 | Volumen Mute / 0–100 step 1 | ✅ |
| 7 | Cambiar TV en pantallas | ✅ |
| 8 | Entregable APK release (no Expo Go) | ✅ |
| 9 | Prueba física | ⚠️ usuario |

**Resultado:** ✅ **APROBADA** (prueba física pendiente)

---

## Veredicto

- [x] Auditorías **1, 2 y 3** aprobadas
- [x] Proyecto **listo para compilar APK** en Windows
- [ ] Checklist en dispositivo + TV Android real

## Compilar APK (solo el archivo)

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path = "$env:JAVA_HOME\bin;C:\Program Files\nodejs;$env:ANDROID_HOME\platform-tools"
cd "C:\dev\vissiuss control remote v3"
npm install
npx expo prebuild --platform android
node scripts/post-prebuild.js
"sdk.dir=$($env:ANDROID_HOME -replace '\\','/')" | Set-Content android/local.properties
cd android; .\gradlew.bat assembleRelease; cd ..
Copy-Item "android\app\build\outputs\apk\release\app-release.apk" "C:\dev\Vissiuss-Control-Remote-v3.apk"
```
