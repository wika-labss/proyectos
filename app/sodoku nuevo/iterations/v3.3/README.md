# Sodoku nuevo — iterations/v3.3

Primera iteración **post-Design System**: consume tokens oficiales `cute-pink` y reglas de producción.

## Proceso
Ver `idea/PROCESO-V3.3.md` y `idea/V3.3.md`.

## Delta vs V3.2

| Área | V3.2 | V3.3 |
|------|------|------|
| Tokens | `app-theme` hardcoded | `src/tokens/cute-pink/` ← design-system |
| Pistas | ∞ (test) | 3 por nivel (producción) |
| Storage | `v3.2:*` | `v3.3:*` |
| CutePinkButton | huérfano en repo | eliminado |
| UI kit | assets locales | heights desde tokens DS |

## Scripts

```bash
npm install
npm run typecheck
npm run smoke:v3
cmd /c "scripts\verify-build.bat"
npm run build:apk   # Release local
```

## Design System

Aprobación: `design-system/visual-expectation/sodoku-nuevo-v3.2/approval.md`
