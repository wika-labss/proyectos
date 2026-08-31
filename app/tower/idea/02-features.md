# Funcionalidades — V4

## Obligatorias

### Feature 01 — Dificultad ↑ (leve)
Mantener fusión L1–L4 y costos de torres. Ajustar multipliers: +HP/count leve, oro inicial ligeramente menor que V3 pero mayor que V2.

### Feature 02 — Venta de torres
- Acción: seleccionar torre → **Vender**.
- Reembolso = `floor(investedGold * 0.7)`.
- L1 arquera (50) → 35. Evoluciones acumulan `investedGold` de las fusionadas.
- Libera el pad.

### Feature 03 — Modo infinito
- Acceso desde menú / tienda.
- Oleadas sin fin; dificultad escala por oleada (HP/count).
- Misma colocación/fusión/venta.

### Feature 04 — Tienda visual (sin IAP)
Productos:
1. **Modo Infinito** — compra visual.
2. **Pack de Contenido** — 10 mapas nuevos, torres nuevas, hardcore de niveles existentes — compra visual.
Botón Comprar → toast/alert “Las compras se habilitarán pronto”. Flags `owned=false`.

### Feature 05 — Hereda V3
25 mapas campaña, prep, fusión, 4 clases, evolución L4 con nombres.

## Fuera de alcance V4
IAP real, billing Play Store, anuncios, cuentas.
