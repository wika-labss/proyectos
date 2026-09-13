# Acolchados CD — iteración V2 (web)

Sitio público + un portal interno. Docs: `../../idea/` (FEAT-12–14).

## Arranque

```bash
python3 -m pip install -r requirements.txt
python3 app.py --host 0.0.0.0 --port 5003
```

| Superficie | URL | Prueba |
|---|---|---|
| Público | http://127.0.0.1:5003/ | sin login |
| Portal | http://127.0.0.1:5003/admin | `admin` / `cambiar123` |

`/portal` redirige a `/admin`. En el sitio público hay un solo enlace **Portal**.

Dentro del portal, tres botones:

1. **Catálogo** — categorías (crear / renombrar / borrar si vacía) → productos (crear / editar ficha / eliminar)
2. **Stock** — consultas y +/− unidades (sin saldo negativo; bajo ≤ 5)
3. **Reportes** — stock actual + movimientos + CSV

## Datos

- `data/products.json` — catálogo
- `data/categories.json` — categorías editables
- `data/users.json` — login admin
- `data/stock.json` — existencias `producto|talla`
- `data/stock_movimientos.json` — historial
