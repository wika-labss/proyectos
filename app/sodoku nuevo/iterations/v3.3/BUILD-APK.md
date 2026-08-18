# Build APK Release — Sodoku nuevo V3.3

> Entregable WIKA: **APK Release instalable por sideload, SIN Metro.**  
> `npx expo start` es solo desarrollo opcional. **No cierra Release.**

## Traer V3.3 a Windows (`C:\dev\sodoku nuevo v3.1`)

### Opción A — Script automático (recomendado)

```powershell
git clone --depth 1 --filter=blob:none --sparse https://github.com/wika-labss/proyectos.git "$env:TEMP\proyectos-sodoku-bootstrap"
Set-Location "$env:TEMP\proyectos-sodoku-bootstrap"
git sparse-checkout set "app/sodoku nuevo/iterations/v3.3"
Set-Location "app\sodoku nuevo\iterations\v3.3"
.\scripts\sync-to-windows.ps1
```

Destino por defecto: `C:\dev\sodoku nuevo v3.1`

Otro destino:

```powershell
.\scripts\sync-to-windows.ps1 -Destination "D:\mis-apps\sodoku-v3.3"
```

### Opción B — Copia manual

```powershell
git clone --depth 1 --filter=blob:none --sparse https://github.com/wika-labss/proyectos.git "$env:TEMP\proyectos-sodoku"
Set-Location "$env:TEMP\proyectos-sodoku"
git sparse-checkout set "app/sodoku nuevo/iterations/v3.3"
New-Item -ItemType Directory -Force -Path "C:\dev\sodoku nuevo v3.1" | Out-Null
Copy-Item -Path "app\sodoku nuevo\iterations\v3.3\*" -Destination "C:\dev\sodoku nuevo v3.1" -Recurse -Force
Set-Location "C:\dev\sodoku nuevo v3.1"
npm install
.\scripts\verify-build.bat
```

## Requisitos (Windows)

- Node.js 20 LTS
- JDK **17** (Gradle)
- Android Studio + SDK API 35
- Variables: `JAVA_HOME`, `ANDROID_HOME`
- Git

## Comandos en la carpeta local

```powershell
cd "C:\dev\sodoku nuevo v3.1"
npm run typecheck
npm run smoke:v3
npm run validate:levels
npm run build:apk
```

APK esperado:

```text
android\app\build\outputs\apk\release\app-release.apk
```

Instalar:

```powershell
adb install -r .\android\app\build\outputs\apk\release\app-release.apk
```

## Delta V3.3 vs carpeta v3.1 anterior

| | v3.1 local (nombre carpeta) | V3.3 (contenido nuevo) |
|--|----------------------------|-------------------------|
| Tokens | hex en app-theme | `src/tokens/cute-pink/` (Design System) |
| Pistas | ∞ test | 3 por nivel |
| Storage | v3.1:* | v3.3:* |
| UI | btn_002 parcial | pack sodoku-ui-kit completo |

## Qué NO usar para Release

```powershell
npx expo start   # Metro / DEV — no es el entregable
```
