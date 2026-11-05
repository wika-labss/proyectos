# Inter Galaxia

App Android (Expo) para el DT: plantilla, nóminas, formaciones, fechas y pagos (mock hasta API BD).

## Flujo WIKA (importante)

| Perfil | Uso |
|--------|-----|
| **DEV** | `npx expo start` + Expo Go — solo desarrollo en PC |
| **BUILD** | **APK en teléfono** — `scripts/build-apk.sh` en **Cloud Agent** |

**No** se prueba la entrega del DT compilando con Metro en Windows. El APK lo genera el agente en la VM.

Documentación: [`idea/06-build-environment.md`](idea/06-build-environment.md)

## APK en tu teléfono

1. Descargar **`inter-galaxia-debug.apk`** del [GitHub Release](https://github.com/wika-labss/proyectos/releases/tag/inter-galaxia-preview-apk-2026-10-26) (sesión con acceso a `wika-labss/proyectos`).
2. Instalar en Android (**arm64**). Mock activo por defecto.

En PowerShell (cuenta con acceso al repo + SSO del org):

```powershell
gh auth status
gh release list --repo wika-labss/proyectos
gh release download inter-galaxia-preview-apk-2026-10-26 --repo wika-labss/proyectos --pattern inter-galaxia-debug.apk --dir .
```

Si sale **release not found**, `gh` no está logueado con un usuario del org o falta **Authorize SSO** para wika-labss.

## Regenerar APK (Cloud Agent)

```bash
cd app/inter-galaxia/iterations/v1
bash scripts/verify-build.sh
bash scripts/build-apk.sh
```

Artefacto: `/opt/cursor/artifacts/inter-galaxia-debug.apk`
