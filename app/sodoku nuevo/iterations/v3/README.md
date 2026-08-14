# Sodoku nuevo — iterations/v3

Construcción WIKA V3 (post auditoría ensamblado APROBADO).

## Qué incluye
- 100 niveles (dificultad interna easy/medium alternada, **oculta**)
- Rewards: `regalo 1` … `regalo 8` al azar al completar
- Inventario: solo visualización
- Home: **Jugar**, **Inventario** + info **Puntaje**, **Histórico**, **Regalos**
- Paleta Pinki Cute (`imagenes/PALETA.md`)

## Scripts
```bash
npm install
npm run typecheck
npm run validate:levels   # 100/100 REQUIRED
# Windows APK:
cmd /c "scripts\verify-build.bat"
```

## Storage keys
- `sodoku-nuevo:v3:progress`
- `sodoku-nuevo:v3:activeGame`
