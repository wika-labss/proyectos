# Generation Report — Sodoku nuevo v2

## Fecha

2026-08-14

## Entradas

- idea/01–05 actualizados a V2
- Auditoría release V1: REQUIERE CORRECCIONES (APK) + hallazgo de puzzles inválidos en fallback

## Cambios V2

### Corrección motor

- Eliminado fallback aleatorio sin verificación de unicidad.
- `validatePuzzle()` obliga `countSolutions === 1`.
- Gate `npm run validate:levels` para niveles 1–20 **antes** de release.

### Features nuevas

- 3 pistas por nivel (`hints` module).
- Home con iconos: puntaje, histórico local, niveles completados.
- Pantalla `/history`.

## Ubicación

`iterations/v2/`

## Gates

```bash
npm run validate:levels
npm run typecheck
```

## Entregable

Código V2. APK Release sigue el pipeline `scripts/verify-build.bat` (sin Metro).
