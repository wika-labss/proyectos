# Revisión — Vissius Control Remote

## Versión evaluada

**v3.1** — Módulo de logs exportables — `app/Vissius control remote/iterations/v3.1/`

## Evaluador

Arquitecto WIKA / Cloud Agent

## Fecha

2026-08-06 (v3.1 diagnostics — en curso)

---

## Historial de iteraciones

| Iteración | Perfil | Estado | Notas |
|-----------|--------|--------|-------|
| v1 | BUILD | Cerrada | Mock TV |
| v2 | BUILD | Cerrada | LAN Roku/Vissius |
| v3 | BUILD | Cerrada | Android TV + pairing · Auditorías 1–3 ✅ |
| **v3.1** | **BUILD** | **En curso** | Logs `ejecución → resultado` exportables |

---

## Cambios v3.1 (resumen)

| Área | Cambio |
|------|--------|
| Módulo `src/diagnostics/` | Logger en memoria (máx. 800), niveles info/ok/fail/warn |
| Formato | `[ts] LEVEL ejecucion --> resultado` |
| Export | Share texto + JSON (`exportLogsAsText` / `exportLogsAsJson`) |
| UI | Pantalla `/logs` — filtros, limpiar, exportar |
| Instrumentación | Discovery, WiFi, connect, Android TV TLS/PIN, pairingStore |
| Versión | `3.1.0` |

**Fuera de alcance v3.1:** fix de discovery (permisos/IP) — se aplica tras analizar logs exportados.

---

## Cómo usar

1. Compilar APK v3.1 e instalar
2. Reproducir “Buscar TV” / IP manual
3. Emparejar → **Ver logs / exportar** (o Mando → Logs)
4. Enviar export texto o JSON

---

## Compilar APK

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path = "$env:JAVA_HOME\bin;C:\Program Files\nodejs;$env:ANDROID_HOME\platform-tools"
cd "C:\dev\vissiuss control remote v3.1"
npm install
npx expo prebuild --platform android
node scripts/post-prebuild.js
"sdk.dir=$($env:ANDROID_HOME -replace '\\','/')" | Set-Content android/local.properties
cd android; .\gradlew.bat assembleRelease; cd ..
Copy-Item "android\app\build\outputs\apk\release\app-release.apk" "C:\dev\Vissiuss-Control-Remote-v3.1.apk"
```
