# Sodoku nuevo — iterations/v3.3

Primera iteración **post-Design System** con integración runtime real del DS aprobado.

## Design System en runtime

```text
src/design-system/
├── tokens/cute-pink/*.json   ← copia oficial wika-labss/design-system
├── tokens/sodoku-overrides.json
├── tokens/index.ts           ← resuelve JSON → tokens RN
├── APPROVAL.md
└── README.md
```

**No** hay hex duplicados en componentes: todo sale de JSON DS.

Sincronizar tokens desde GitHub:

```powershell
.\scripts\sync-design-system.ps1
```

## Delta vs V3.2

| Área | V3.2 | V3.3 |
|------|------|------|
| Tokens | TS hardcoded (falso DS) | JSON `design-system` + `src/design-system/tokens/` |
| Componentes | valores sueltos | `layout.*`, `radius.*`, specs DS |
| Pistas | ∞ (test) | 3/nivel |
| Storage | `v3.2:*` | `v3.3:*` |

## Traer a Windows

```powershell
.\scripts\sync-to-windows.ps1
# destino: C:\dev\sodoku nuevo v3.1
```

## Scripts

```bash
npm install
npm run typecheck
npm run smoke:v3
npm run build:apk
```

## Design System

Aprobación: `design-system/visual-expectation/sodoku-nuevo-v3.2/approval.md`
