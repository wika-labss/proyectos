# Acolchados CD — iteración V1 (web)

Sitio público y panel de precios. Parte del proyecto WIKA `app/ramon-david/` (excepción web: no Expo/APK).

Docs oficiales: `../../idea/` (01–05).

## Arranque

```bash
python3 -m pip install -r requirements.txt
python3 app.py --host 0.0.0.0 --port 5003
```

- Público: http://127.0.0.1:5003/
- Admin: http://127.0.0.1:5003/admin

Si no hay env, el panel usa credenciales de prueba (`admin` / `cambiar123`). Antes de publicar:

```bash
python3 app.py --hash-password
```

Define `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` y `FLASK_SECRET_KEY`. En producción: `FLASK_ENV=production`.

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
