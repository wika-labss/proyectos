# Generation report — Tower V4

## Origen
Copiado desde `iterations/v3` (rama `cursor/tower-v3-73d1`).

## Cambios principales
| Área | Cambio |
|------|--------|
| `waveSystem` | Multipliers campaña ↑ leve; `buildInfiniteWave` / `infiniteHpMult` |
| `tdEngine` | `investedGold`, `sellTower`, `createInfiniteRun` |
| `shopCatalog` | Productos visuales + preview pack |
| UI | Menú Infinito/Tienda, sell CTA, Hud ∞, shop screen |
| Storage | `tower:v4:campaign` + shop flags stub |

## Verificación
- `npm run smoke`
- `npm run typecheck`
- `npx expo export --platform android` (cuando dependencias instaladas)

## APK
Pendiente local (`npm run apk:win`).
