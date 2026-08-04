# Manual de usuario — Vissius Control Remote v1

> Recorrido completo del proyecto WIKA: desde la idea hasta el APK release en Android.  
> Repositorio: `wika-labss/proyectos` · Rama: `cursor/vissius-control-remote-8679` · PR: #13

---

## Índice

1. [Qué es WIKA y este proyecto](#1-qué-es-wika-y-este-proyecto)
2. [Cronología de prompts y acciones](#2-cronología-de-prompts-y-acciones)
3. [Estructura del proyecto](#3-estructura-del-proyecto)
4. [Documentación generada (idea/)](#4-documentación-generada-idea)
5. [Flujo WIKA aplicado](#5-flujo-wika-aplicado)
6. [Código v1 — qué incluye](#6-código-v1--qué-incluye)
7. [Auditorías 1, 2 y 3](#7-auditorías-1-2-y-3)
8. [Migración DEV → BUILD (APK release)](#8-migración-dev--build-apk-release)
9. [Obtener el proyecto en tu PC](#9-obtener-el-proyecto-en-tu-pc)
10. [Generar el APK en Windows](#10-generar-el-apk-en-windows)
11. [Problemas frecuentes y soluciones](#11-problemas-frecuentes-y-soluciones)
12. [Usar la app en el teléfono](#12-usar-la-app-en-el-teléfono)
13. [Próximos pasos (v2)](#13-próximos-pasos-v2)

---

## 1. Qué es WIKA y este proyecto

**WIKA** transforma documentación estructurada en aplicaciones funcionales mediante IA y revisión arquitectónica.

**Vissius Control Remote** es un mando remoto WiFi para televisor con:

- Emparejamiento por WiFi (mock en v1)
- Pantalla **Mando**: navegación (▲ ▼ ◄ ► OK, Atrás) + volumen (Vol + / Vol −)
- Pantalla **Apps**: Netflix, HBO, YouTube, Crunchyroll
- Diseño: fondos `#F7B9AD` / `#E83A17`, botones negro con texto blanco

**Entregable v1:** APK **release** autónomo (sin Expo Go, sin PC encendida).

---

## 2. Cronología de prompts y acciones

### Tabla resumen

| # | Fase | Resultado |
|---|------|-----------|
| 1 | Crear proyecto WIKA | Carpeta + docs `idea/` + rama + PR |
| 2 | Reescribir concepto TV | Paleta y features en `idea/` |
| 3 | Auditoría 1 | Código v1 generado, gates DEV |
| 4 | Auditoría 2 | 10 fixes motores/hooks |
| 5 | Commit/push | Documentación en remoto |
| 6 | Auditoría 3 | 6 fixes diseño/UX |
| 7 | Generar v1 | Código completo confirmado |
| 8 | Pregunta Expo Go | Decisión migrar a BUILD |
| 9 | APK release | Docs BUILD + re-auditorías |
| 10 | Exportar a Windows | Comandos clone + copy |
| 11 | Troubleshooting JDK | JDK 17, PATH, prebuild OK |
| 12 | Manual de usuario | Este documento |

### Prompts completos del usuario (texto literal)

**Prompt 1 — Crear proyecto**

> crea un nuevo proyecto en wika, sigue estructura y nombralo Vissius control remote

**Acción:** Creado `app/Vissius control remote/` con documentación `idea/` (01–06), `review.md`, rama `cursor/vissius-control-remote-8679`, PR #13.

---

**Prompt 2 — Concepto y diseño**

> re escribamos los templates… conectar y emparejar con wifi a tv… netflix, hbo, youtube, crunchyroll… botones navegación, volumen… colores F7B9AD E83A17, botones negro blanco

**Acción:** Reescrita toda la documentación `idea/` con concepto real de mando TV + paleta obligatoria.

---

**Prompt 3 — Auditoría 1**

> aplica flujo definido por wika, auditoria 1

**Acción:** Generado `iterations/v1/` (código Expo), gates DEV, Auditoría 1 documentada en `review.md`.

---

**Prompt 4 — Auditoría 2**

> ejecuta auditoria 2

**Acción:** Revisión motores/hooks, 10 fixes (API única hooks, guards race, mock disconnect reset, etc.), Auditoría 2 ✅.

---

**Prompt 5 — Commit**

> *(commit-and-push)*

**Acción:** Commit y push de documentación limpia al remoto.

---

**Prompt 6 — Auditoría 3**

> aplica auditoria 3

**Acción:** Revisión diseño vs `04-design.md`, 6 fixes (tabs activo/inactivo, disabled opacity, labels apps, press scale 0.97), Auditoría 3 ✅.

---

**Prompt 7 — Generar v1**

> okey, sigue flujo y genera codigo v1

**Acción:** Confirmada v1 completa con pantallas, engine mock, stores, hooks y componentes.

---

**Prompt 8 — APK vs Expo Go**

> segun wika deberiamos trabajar para que v1 saque un apk… porque expo go?

**Acción:** Explicación DEV vs BUILD; según WIKA-ARCH-06 el entregable v1 debe ser APK release autónomo, no Expo Go.

---

**Prompt 9 — Migrar a BUILD**

> si, actualiza la documentacion del proyecto y vuelve a correr las auditorias, debemos llegar a un v1 con un apk release

**Acción:** Actualizados `06-build-environment.md`, `03-architecture.md`, `05-prompt-ia.md`, scripts BUILD (`verify-build`, `build-apk`, `post-prebuild.js`), re-auditorías 1–3 con perfil BUILD.

---

**Prompt 10 — Exportar a PC local**

> dame el comando para exportar v1 a C:\dev\vissiuss control remote v1

**Acción:** Comandos `git clone` + `Copy-Item` documentados en sección 9.

---

**Prompt 11 — Troubleshooting Windows** *(varios mensajes)*

Errores reportados durante el build local:

- JDK 17 vs JDK 21/26 en PATH
- `npm` no reconocido tras limpiar PATH
- `build-apk.bat`: "Java no encontrado en PATH"
- Prebuild ejecutado manualmente con éxito (`√ Finished prebuild`)

**Acción:** Soporte con Temurin JDK 17, configuración `JAVA_HOME`, parche en `build-apk.bat` (usa `%JAVA_HOME%\bin\java.exe`), pasos manuales Gradle documentados.

---

**Prompt 12 — Manual**

> genera un manual de usuario con todos los pasos y promps que recibiste hasta llegar al v1

**Acción:** Este documento.

---

### Estado actual del build (PC Windows del usuario)

| Paso | Estado |
|------|--------|
| Clone + copy a `C:\dev\vissiuss control remote v1` | ✅ |
| `npm install` + `expo install --fix` | ✅ |
| JDK 17 (Temurin 17.0.20) configurado | ✅ |
| `npx expo prebuild --platform android` | ✅ |
| `node scripts/post-prebuild.js` | ⏳ pendiente |
| `gradlew assembleRelease` | ⏳ pendiente |
| Instalar APK en teléfono | ⏳ pendiente |

**Comandos pendientes** (PowerShell):

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path = "$env:JAVA_HOME\bin;C:\Program Files\nodejs;$env:ANDROID_HOME\platform-tools"
cd "C:\dev\vissiuss control remote v1"
node scripts/post-prebuild.js
$sdk = $env:ANDROID_HOME -replace '\\','/'
"sdk.dir=$sdk" | Set-Content android/local.properties
cd android; .\gradlew.bat assembleRelease; cd ..
adb install -r "android\app\build\outputs\apk\release\app-release.apk"
```

---

## 3. Estructura del proyecto

```text
app/Vissius control remote/
├── MANUAL-USUARIO.md          ← este archivo
├── readme.txt                 ← resumen rápido
├── review.md                  ← auditorías WIKA y veredicto
├── idea/
│   ├── 01-problem.md          ← problema y criterios de éxito
│   ├── 02-features.md         ← funcionalidades
│   ├── 03-architecture.md     ← stack, estructura, perfil BUILD
│   ├── 04-design.md           ← paleta, UI, flujos
│   ├── 05-prompt-ia.md        ← instrucciones para generar código
│   └── 06-build-environment.md ← manifiesto deps, pipeline APK
└── iterations/
    └── v1/                    ← código de la app
        ├── app/               ← pantallas Expo Router
        ├── src/               ← componentes, engine, stores, hooks
        ├── scripts/           ← verify-build, build-apk, post-prebuild
        ├── build.ps1          ← script Windows todo-en-uno
        ├── assets/
        ├── app.json
        └── package.json
```

---

## 4. Documentación generada (idea/)

| Archivo | Contenido clave |
|---------|-----------------|
| `01-problem.md` | Mando WiFi para TV; criterio APK release sideload |
| `02-features.md` | Emparejamiento, pad navegación, volumen, apps streaming |
| `03-architecture.md` | Expo SDK 52, Zustand, mock TV, perfil **BUILD** |
| `04-design.md` | `#F7B9AD` / `#E83A17`, botones `#000000` / `#FFFFFF` |
| `05-prompt-ia.md` | Orden de implementación y gates BUILD |
| `06-build-environment.md` | Deps pinneadas, JDK 17, `assembleRelease`, scripts |

---

## 5. Flujo WIKA aplicado

```text
Idea + documentación (idea/)
        ↓
Generación IA → iterations/v1/
        ↓
Auditoría 1 — Compilación y arquitectura
        ↓
Auditoría 2 — Motores y hooks
        ↓
Auditoría 3 — Diseño y UX (+ entrega BUILD)
        ↓
v1 BUILD aprobada → APK release en dispositivo
        ↓
(final/ — pendiente confirmación en teléfono físico)
```

### Principios WIKA aplicados

| ID | Principio |
|----|-----------|
| WIKA-ARCH-01 | La documentación es contrato de build |
| WIKA-ARCH-02 | Versiones pinneadas (`~`) en expo/react-native |
| WIKA-ARCH-03 | Perfil BUILD explícito en v1 |
| WIKA-ARCH-04 | Toolchain nativo en `06-build-environment.md` |
| WIKA-ARCH-05 | Gates obligatorios antes de cerrar iteración |
| WIKA-ARCH-06 | APK release autónomo, no Expo Go como entregable |

---

## 6. Código v1 — qué incluye

### Pantallas

| Pantalla | Ruta | Función |
|----------|------|---------|
| Emparejamiento | `app/index.tsx` | Buscar TV WiFi (mock), conectar, olvidar |
| Mando | `app/(tabs)/remote.tsx` | Pad direccional + volumen |
| Apps | `app/(tabs)/apps.tsx` | Netflix, HBO, YouTube, Crunchyroll |

### Módulos principales

| Módulo | Rol |
|--------|-----|
| `src/engine/mockTv.ts` | Simula TV (v1 sin hardware real) |
| `src/stores/tvStore.ts` | Estado conexión y comandos |
| `src/hooks/useRemoteCommand.ts` | API única para enviar comandos |
| `src/components/RemoteButton.tsx` | Botón negro/blanco reutilizable |

### Scripts npm

| Comando | Acción |
|---------|--------|
| `npm run verify:win` | Todos los gates WIKA (Windows) |
| `npm run apk:win` | Genera APK release |
| `npm run prebuild:android` | Solo prebuild + Kotlin 1.9.25 |

---

## 7. Auditorías 1, 2 y 3

Detalle completo en `review.md`. Resumen:

### Auditoría 1 — Compilación (BUILD v1)

- Manifiesto deps ✅
- `expo-doctor` 18/18 ✅
- `tsc --noEmit` ✅
- `expo export` ✅
- `prebuild` ✅
- Kotlin 1.9.25 ✅
- `assembleRelease` ⚠️ en máquina local del usuario

### Auditoría 2 — Motores y hooks

- UI no llama engine directo ✅
- Hooks `useRemoteCommand`, `useTvConnection`, `usePairing` ✅
- Guards `sendingCommand`, `connecting` ✅
- 10 fixes aplicados

### Fixes aplicados en auditorías

**Auditoría 2 — Motores y hooks (10 fixes)**

| Fix | Descripción |
|-----|-------------|
| API única | UI usa solo hooks (`useRemoteCommand`, `useTvConnection`, `usePairing`), no engine directo |
| Guard `sendingCommand` | Evita race conditions al enviar comandos rápidos |
| Guard `connecting` | Bloquea doble tap en emparejamiento |
| Mock disconnect | Resetea estado al desconectar TV mock |
| Haptic feedback | Solo cuando hay conexión activa |
| Fuente de verdad | `tvStore` centraliza conexión y comandos |
| Persistencia | TV emparejada se guarda entre sesiones |
| Latencia mock | ~150 ms simulada en `mockTv.ts` |
| Error handling | Mensajes claros en fallos de conexión |
| Tipado strict | Sin `any` en stores y hooks |

**Auditoría 3 — Diseño y UX (6 fixes)**

| Fix | Descripción |
|-----|-------------|
| Tab bar activo/inactivo | Contraste visible entre tabs Mando y Apps |
| Disabled opacity | Botones deshabilitados muestran opacidad reducida |
| Labels apps | Texto legible en grid 2×2 de streaming |
| Press scale 0.97 | Feedback táctil visual al pulsar botones |
| Paleta estricta | Solo `#F7B9AD` / `#E83A17` en fondos |
| Botones negro/blanco | `#000000` / `#FFFFFF` en todos los controles |

---

## 8. Migración DEV → BUILD (APK release)

### Decisión

Inicialmente v1 usaba perfil **DEV** (Expo Go) para iterar con mock.  
Tras el prompt *"debemos llegar a un v1 con un apk release"*, se migró a **BUILD**.

### Cambios realizados

- `06-build-environment.md` → target BUILD v1
- Scripts: `verify-build.sh/.bat`, `build-apk.sh/.bat`, `post-prebuild.js`
- `package.json` → `verify`, `verify:win`, `apk`, `apk:win`
- Target Gradle: **`assembleRelease`** (APK autónomo, no debug)

### Por qué no Expo Go

| Expo Go | APK release |
|---------|-------------|
| Requiere app Expo Go instalada | App propia instalada |
| Requiere PC + Metro en la misma red | Funciona solo con el teléfono |
| No es entregable WIKA para producto final | Entregable v1 correcto |

---

## 9. Obtener el proyecto en tu PC

### Copiar solo v1 a `C:\dev\vissiuss control remote v1`

```powershell
git clone -b cursor/vissius-control-remote-8679 --single-branch https://github.com/wika-labss/proyectos.git "C:\dev\vissiuss-temp"
New-Item -ItemType Directory -Force -Path "C:\dev\vissiuss control remote v1"
Copy-Item -Recurse "C:\dev\vissiuss-temp\app\Vissius control remote\iterations\v1\*" "C:\dev\vissiuss control remote v1\"
Remove-Item -Recurse -Force "C:\dev\vissiuss-temp"
cd "C:\dev\vissiuss control remote v1"
npm install
npx expo install --fix
```

---

## 10. Generar el APK en Windows

### Requisitos

| Herramienta | Versión | Notas |
|-------------|---------|-------|
| Node.js | 20 LTS | `C:\Program Files\nodejs` |
| JDK | **17** (Temurin) | **No** JDK 21 ni 26 |
| Android SDK | API 35 | vía Android Studio |
| ANDROID_HOME | — | `%LOCALAPPDATA%\Android\Sdk` |

### Configurar entorno (cada sesión PowerShell)

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path = "$env:JAVA_HOME\bin;C:\Program Files\nodejs;$env:ANDROID_HOME\platform-tools"

java -version    # debe decir 17.x
node -v
npm -v
```

### Opción A — Script npm (con build-apk.bat actualizado)

```powershell
cd "C:\dev\vissiuss control remote v1"
npm run apk:win
```

### Opción B — Pasos manuales (recomendado si falla el .bat)

```powershell
cd "C:\dev\vissiuss control remote v1"

npx expo prebuild --platform android
node scripts/post-prebuild.js

$sdk = $env:ANDROID_HOME -replace '\\','/'
"sdk.dir=$sdk" | Set-Content android/local.properties

cd android
.\gradlew.bat assembleRelease
cd ..
```

### Opción C — build.ps1

```powershell
powershell -ExecutionPolicy Bypass -File "C:\dev\vissiuss control remote v1\build.ps1"
```

### APK resultante

```text
C:\dev\vissiuss control remote v1\android\app\build\outputs\apk\release\app-release.apk
```

### Instalar en el teléfono

```powershell
adb install -r "android\app\build\outputs\apk\release\app-release.apk"
```

(Requiere depuración USB activada.)

---

## 11. Problemas frecuentes y soluciones

### "WIKA requiere JDK 17. Detectado: 21"

**Causa:** PATH apunta a JDK 21 (Android Studio JBR o Java 26).

**Solución:**

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"
$env:Path = "$env:JAVA_HOME\bin;C:\Program Files\nodejs;$env:ANDROID_HOME\platform-tools"
java -version   # confirmar 17.x
```

Instalar JDK 17 si no existe:

```powershell
winget install EclipseAdoptium.Temurin.17.JDK
```

---

### "Java no encontrado en PATH" (build-apk.bat antiguo)

**Causa:** versión antigua del `.bat` usaba `where java`, que falla en algunos entornos.

**Solución:** usar pasos manuales (sección 10, Opción B) o actualizar `scripts/build-apk.bat` desde la rama del repo (usa `%JAVA_HOME%\bin\java.exe`).

---

### "npm no se reconoce"

**Causa:** al limpiar `$env:Path` se eliminó Node.js.

**Solución:**

```powershell
$env:Path = "$env:JAVA_HOME\bin;C:\Program Files\nodejs;$env:ANDROID_HOME\platform-tools"
```

---

### Aviso prebuild: `expo-system-ui`

```text
» android: userInterfaceStyle: Install expo-system-ui...
```

**No bloquea el build.** Opcional:

```powershell
npx expo install expo-system-ui
```

---

### "Buscar TV" no hace nada / no detecta TVs

**Causa:** En v1 anterior, si `expo-network` no detectaba WiFi (común en APK release Android), el botón **cancelaba la búsqueda** antes de ejecutar el mock. El usuario veía el aviso amarillo pero nunca aparecían TVs simuladas.

**Solución (parche en rama):** La búsqueda mock ya **no se bloquea** por WiFi. Debes ver 2 TVs simuladas: *Vissius TV — Salón* y *Vissius TV — Dormitorio*.

Si aún falla:
1. Reinstala APK con la versión más reciente de la rama.
2. Comprueba que no haya error rojo en el banner (*No se pudieron buscar TVs en la red*).
3. v1 **no busca TVs reales** — solo mock. v2 usará LAN real.

---

Normal. Gradle descarga dependencias (5–15 min). Ejecuciones siguientes son más rápidas.

---

## 12. Usar la app en el teléfono

1. Instala el APK release (sin PC encendida).
2. Abre **Vissius Control Remote**.
3. Toca **Buscar TV** → selecciona TV mock → **Conectar**.
4. Tab **Mando**: usa pad y volumen.
5. Tab **Apps**: toca Netflix, HBO, YouTube o Crunchyroll.
6. La TV emparejada se recuerda al reabrir la app.

> v1 usa **mock TV** — los comandos se simulan. v2 conectará con televisor real en LAN.

### Checklist post-instalación (WIKA)

Completar tras instalar el APK en dispositivo físico:

- [ ] App abre sin PC / Metro encendidos
- [ ] Emparejamiento mock funciona (Buscar TV → Conectar)
- [ ] Pad navegación responde (▲ ▼ ◄ ► OK, Atrás)
- [ ] Volumen Vol + / Vol − responde
- [ ] Apps Netflix, HBO, YouTube, Crunchyroll lanzan comando
- [ ] Paleta coral `#F7B9AD` / rojo `#E83A17` + botones negro/blanco
- [ ] TV emparejada persiste al cerrar y reabrir la app

Cuando todos los ítems estén marcados, v1 queda lista para copiar a `final/`.

---

## 13. Próximos pasos (v2)

| Item | Descripción |
|------|-------------|
| Protocolo WiFi real | Reemplazar `mockTv.ts` por API LAN del televisor |
| TV física en pruebas | Validar navegación y volumen en hardware real |
| `final/` | Copiar v1 aprobada tras checklist en dispositivo |
| Logos streaming | Solo con licencia oficial |

---

## Referencias rápidas

| Recurso | Ubicación |
|---------|-----------|
| Auditorías | `review.md` |
| Build contract | `idea/06-build-environment.md` |
| Diseño | `idea/04-design.md` |
| PR GitHub | https://github.com/wika-labss/proyectos/pull/13 |
| Rama | `cursor/vissius-control-remote-8679` |

---

*Manual generado el 2026-08-04 — Vissius Control Remote v1 BUILD*
