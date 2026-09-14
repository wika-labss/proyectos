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
- Ventas Mercado Libre: http://127.0.0.1:5003/admin/meli

## V2 Mercado Libre (MOD-10)

Copia `iterations/v1/.env.example` a `.env` con `MELI_CLIENT_ID` y `MELI_CLIENT_SECRET`. Redirect URI debe coincidir con DevCenter (`https://vissiuss.lat/oauth/callback` o un túnel HTTPS que apunte a este Flask).

En modo prueba (`MELI_TEST_MODE=1`) las publicaciones usan el título `Item de Prueba - Por favor, NO OFERTAR`. Conecta el **vendedor test**, publica desde el panel y compra con el **comprador test**. Notificaciones: `POST /meli/notifications`.

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
