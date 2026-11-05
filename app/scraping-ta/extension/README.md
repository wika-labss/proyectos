# Extensión Scraping TA (Chrome MV3)

Captura el XHR nativo del menú mientras navegás PedidosYa, Uber Eats o Rappi y lo manda a `POST /api/ingest`. **No** pide cookies, **no** inicia sesión en el marketplace y **no** se publica en Chrome Web Store.

Cada envío genera el Excel de ese agregador. Justo no forma parte del flujo.

## Cargar unpacked

1. Chrome → `chrome://extensions`
2. Activá **Modo de desarrollador**
3. **Cargar extensión sin empaquetar** → esta carpeta (`app/scraping-ta/extension`)
4. Abrí el popup, pegá `INGEST_KEY` (una vez; queda en `chrome.storage.local`)
5. API por defecto: `https://ta.vissiuss.com`. Local: `http://127.0.0.1:8000`. Túnel de prueba: `https://….trycloudflare.com`

## Uso

1. En el admin: **Generar informe** y copiá el `run_id` (o dejalo vacío: usa el informe en recolección).
2. Abrí el menú del local en Chrome (hay que **ver el menú**, no un captcha).
3. Esperá a que suba el contador de XHR.
4. **Enviar a Scraping TA**.

Si solo ves el challenge / captcha: **recargá el menú** y reintentá. Sin esa señal nativa no se envía nada:

| Canal | Señal |
| :--- | :--- |
| PedidosYa | XHR `/niles/partners/…/menus` con `sections` |
| Rappi | XHR `restaurants-bus/store/id/` |
| Uber Eats | `__REACT_QUERY_STATE__` en el HTML |

## Qué se envía

`POST {API}/api/ingest` con `Authorization: Bearer <INGEST_KEY>`:

```json
{ "job_id": "opcional", "platform": "peya|uber|rappi", "source_url": "…", "body": "<html>…", "xhr": [{"url","method","body"}] }
```

No se mandan cookies ni tokens del marketplace.
