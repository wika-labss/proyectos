# Generation report — Tower V5

## Origen
Fork visual de `iterations/v4` + Design System Ember Keep (Gate 1).

## Cambios
UI reescrita al 100% de `visual-expectation/tower-v4/`. Engine intacto.

## Verificación
- `npm run smoke` — PASS
- `npm run typecheck` — PASS
- `npm run apk` / `gradlew assembleRelease` — PASS (JDK 17 + Android SDK 35)
- APK Release: `android/app/build/outputs/apk/release/app-release.apk` (`com.wika.tower` 5.0.0, versionCode 1, 70 692 947 bytes)
- GitHub LFS: `iterations/v5/tower-v5-release.apk`
- Firma: **Android Debug** (`CN=Android Debug`) — no hay keystore de upload en el repo. Sideload OK (`adb install -r`); no apto para Play Store.
