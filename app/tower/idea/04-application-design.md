# 04 — Diseño V3

## Fusión
```
Tap torre A (selección merge) → Tap torre B
  si kind A==B y tier A==B y tier<4:
    remove A, B → place tier+1 en pad B
  else: feedback rechazo
```

## Escalado por tier (contrato)
| Tier | Daño × | Cooldown × |
|------|--------|------------|
| 1 | 1.00 | 1.00 |
| 2 | 1.55 | 0.85 |
| 3 | 2.25 | 0.72 |
| 4 | 3.40 | 0.58 |

## Balance oleadas (resumen)
Oro inicial más alto; hpMult/countMult más suaves que V2.
