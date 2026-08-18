# Proceso WIKA — Sodoku nuevo V3.3

## Objetivo

Materializar en código jugable la **post-implementación Design System**: tokens oficiales, producción sin modo test, y preparación APK Release.

## Entradas

| Recurso | Ruta |
|---------|------|
| DS aprobado | `design-system/visual-expectation/sodoku-nuevo-v3.2/approval.md` |
| Tokens | `design-system/tokens/cute-pink/` |
| Base código | `iterations/v3.2/` |
| Pack UI | `assets/recursos/ui/` (heredado) |

## Orden de construcción V3.3

1. Bootstrap `iterations/v3.3` desde `v3.2`
2. Crear `src/tokens/cute-pink/` alineado a DS
3. Refactor `app-theme` → re-export tokens
4. `sodoku-ui-kit/assets.ts` → heights desde tokens
5. `testMode.ts` → `INFINITE_HINTS=false`
6. Storage `sodoku-nuevo:v3.3:*`
7. Eliminar `CutePinkButton.tsx`
8. `typecheck` + `smoke:v3`
9. Auditorías V3.3
10. APK Release en máquina local

## Criterios de salida

- [x] Tokens cute-pink consumidos desde módulo dedicado
- [x] Pistas limitadas (3/nivel)
- [x] CutePinkButton eliminado
- [x] Storage versionado v3.3
- [ ] APK Release local

## Siguiente

- Publicar `@wika/sodoku-ui-kit` cuando exista `shared-packages`
- Migraciones visuales opcionales (tablero gráfico) en V3.4+
