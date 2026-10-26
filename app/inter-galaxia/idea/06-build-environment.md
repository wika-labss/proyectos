# Entorno de Build

> Proyecto: **Inter Galaxia** — App DT (plantilla, nóminas, formaciones, fechas, pagos)

## Perfil de ejecución target

- [ ] **DEV** — Expo Go (`npx expo start` + Expo Go). Solo desarrollo rápido de UI; **no** es el entregable para el DT.
- [x] **BUILD** — Nativo (`expo export` + `prebuild` + Gradle APK). **Obligatorio para probar en teléfono físico** — v1 preview.
- [ ] **RELEASE** — EAS Build (stores / link público con `EXPO_TOKEN`).

> **Regla WIKA:** probar en el celular del DT = APK generado con pipeline BUILD. **No** compilar ni “instalar” vía Metro/Expo Go como sustituto del APK.

---

## Dónde se construye el APK

| Entorno | ¿APK? |
|---------|--------|
| **Cloud Agent (Linux)** | ✅ `scripts/build-apk.sh` — **canónico** |
| PC Windows del DT | ❌ Evitar (rutas largas, JDK incorrecto, CMake). Solo DEV con Expo Go si aplica |

---

## Entorno requerido (BUILD)

| Herramienta | Versión | Notas |
|-------------|---------|-------|
| Node.js | 20+ | |
| JDK (Gradle) | **17** | No JDK 21/26 para Gradle Android |
| Android SDK | API 35 | `ANDROID_HOME` apuntando al SDK |
| Arquitectura APK preview | **arm64-v8a** | Teléfonos actuales |

Variables en Cloud Agent:

```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=/workspace/android-sdk
```

---

## Pipeline BUILD (APK debug con mock)

Desde `app/inter-galaxia/iterations/v1`:

```bash
npm install
npx expo-doctor
bash scripts/verify-build.sh    # gates
bash scripts/build-apk.sh       # APK + copia a /opt/cursor/artifacts/
```

Salida:

- `android/app/build/outputs/apk/debug/app-debug.apk`
- Artefacto Cursor: `/opt/cursor/artifacts/inter-galaxia-debug.apk`

El script fija `newArchEnabled=false` y `reactNativeArchitectures=arm64-v8a`.

---

## Gates de verificación (bloqueantes)

| Gate | Comando |
|------|---------|
| Doctor | `npx expo-doctor` |
| TypeScript | `npx tsc --noEmit` |
| Bundle embebido | `npx expo export --platform android` |
| APK | `bash scripts/build-apk.sh` |

---

## Entrega al DT (GitHub Release)

Tras compilar en Cloud Agent, subir asset al release del repo privado `wika-labss/proyectos` (requiere `gh` autenticado con acceso al org + SSO):

- Tag: `inter-galaxia-preview-apk-2026-10-26` (o tag nuevo por rebuild)
- Asset: `inter-galaxia-debug.apk`

Descarga en PC:

```bash
gh auth status
gh release list -R wika-labss/proyectos
gh release download <TAG> --repo wika-labss/proyectos --pattern inter-galaxia-debug.apk --dir .
```

Si `release not found`: la cuenta de `gh` **no** tiene acceso al repo privado o falta autorizar SSO del org **wika-labss**.

---

## DEV (Metro) — solo desarrollo

```bash
cd app/inter-galaxia/iterations/v1
npm install
npx expo start
```

Mock API: `EXPO_PUBLIC_USE_MOCK=true` (default). **No reemplaza** instalar el APK BUILD en el teléfono.
