# Acolchados CD — iteración V2 (web)

Sitio público + dos portales internos. Docs: `../../idea/` (FEAT-12–14).

## Arranque

```bash
python3 -m pip install -r requirements.txt
python3 app.py --host 0.0.0.0 --port 5003
```

| Superficie | URL | Prueba |
|---|---|---|
| Público | http://127.0.0.1:5003/ | sin login |
| Portal usuario | http://127.0.0.1:5003/portal | `user` / `usuario123` |
| Portal admin | http://127.0.0.1:5003/admin | `admin` / `cambiar123` |

Usuario: categorías → productos → edición. **No** stock.  
Admin: consultas, +/− stock, reportes CSV. **No** edita fichas por `/portal`.

## Datos

- `data/products.json` — catálogo
- `data/users.json` — roles
- `data/stock.json` — existencias `producto|talla`
- `data/stock_movimientos.json` — historial
