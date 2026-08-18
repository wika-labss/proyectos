# Design System — runtime (V3.3)

Integración **real** del Design System aprobado en la app.

## Fuente canónica

| Recurso | Repo | Ruta |
|---------|------|------|
| Tokens | `wika-labss/design-system` | `tokens/cute-pink/*.json` |
| Overrides Sodoku | `wika-labss/design-system` | `tokens/sodoku-nuevo-v3.2/overrides.json` |
| Aprobación | `wika-labss/design-system` | `visual-expectation/sodoku-nuevo-v3.2/approval.md` |

## Sincronizar desde GitHub

```powershell
.\scripts\sync-design-system.ps1
```

Copia JSON + approval a `src/design-system/`.

## Consumo en app

```typescript
import { colors, layout, radius } from '@/design-system';
// o
import { colors } from '../modules/app-theme';
```

`app-theme` re-exporta esta capa. **No hardcodear hex** fuera de `src/design-system/tokens/`.

## Componentes alineados

- `sodoku-ui-kit/*` → specs en `design-system/components/sodoku-ui-kit/`
