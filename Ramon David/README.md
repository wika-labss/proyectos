# Ramon David — Acolchados CD

Sitio público y panel de precios de [Acolchados CD](https://www.acolchadoscd.cl).

- **Página pública:** inicio, nosotros, productos, contacto
- **Admin:** `/admin` — edita catálogo, precios, medidas e imágenes
- **Datos:** `data/products.json` (sin backend externo)

## Arranque local

```bash
cd "Ramon David"
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py --port 5003
```

- Público: http://127.0.0.1:5003/
- Admin: http://127.0.0.1:5003/admin

Si no defines variables de entorno, el panel usa credenciales de prueba (`admin` / `cambiar123`). Antes de publicar:

```bash
python app.py --hash-password
```

Define `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` y `FLASK_SECRET_KEY` en el servidor. En producción usa `FLASK_ENV=production` para cookie HTTPS.

## Estructura

```text
index.html          Home
nosotros.html
productos.html      Catálogo (GET /api/products)
contacto.html
app.py              Flask: estáticos + login + CRUD + uploads
data/products.json  Catálogo editable
css/  js/  uploads/
```
