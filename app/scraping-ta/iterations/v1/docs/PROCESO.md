# Proceso: Scraping TA — auditoría de menú (vista cliente)

Esto extrae lo que ve el cliente en cada canal. **No** usa Partner Catalog / APIs de carga: eso es lo que el local publica, no lo que el marketplace muestra.

Demo: web en `http://127.0.0.1:8000`. Sin APK.

## Flujo

```
Extensión (camino principal)
  ├─ PedidosYa  → XHR GET /v2/niles/partners/{id}/menus → Excel pedidosya
  ├─ Uber Eats  → __REACT_QUERY_STATE__ catalogItems     → Excel ubereats
  └─ Rappi      → XHR POST restaurants-bus/store/id/{id} → Excel rappi
```

## Costos ScrapingBee

Cada llamada stealth Chile (`render_js` + `stealth_proxy` + `country_code=cl` + `json_response` + `wait=8000`) costó **75 créditos** en las corridas validadas.

| Canal | Créditos / URL | Fuente nativa |
|---|---:|---|
| PedidosYa | 75 | XHR menú |
| Uber Eats | 75 | `__REACT_QUERY_STATE__` |
| Rappi | 75 | XHR store bus |

Auditoría lun–vie, 1 local × 3 apps Bee: **225 créditos/día**, **1.125/semana**. Cada agregador exporta su propio Excel. Justo no está en el flujo.

## Reglas operativas

1. **1 request por URL.** Sin retry loop automático. Si Cloudflare/captcha/timeout, se corta y se muestra el error. Reintento manual por canal (un click = un request).
2. Bee en **serie**, no en paralelo (créditos + IP).
3. Token ScrapingBee se pega en la UI y se guarda en `.scrapingbee_key` (gitignored). Nunca en git ni en logs completos.
4. Campos de URL vacíos se saltan.
5. El cruce por nombre en Excel es **señal**, no auditoría 1:1: hay que pegar URLs del **mismo local**. PedidosYa Alameda vs Uber Belloto vs Rappi Florida no son comparables.

## PedidosYa

- Bee sobre la URL pública del menú (`…/restaurantes/…/tarragona-…-menu`).
- Parser: XHR `GET https://www.pedidosya.cl/v2/niles/partners/{partnerId}/menus?occasion=DELIVERY`.
- Precio cliente = `price.finalPrice`. Lista = `price.originalPrice`.

## Uber Eats

- Bee sobre la URL del store (`ubereats.com/store/…`).
- Catálogo nativo: script `__REACT_QUERY_STATE__` → query `getStoreV1` → `catalogItems[]`.
- Precio cliente = `price / 100`. Lista = `priceTagline.accessibilityText` (`discounted from CLP …`).
- JSON-LD `hasMenu.offers.price` es fallback y **no** trae tachado. Deduplicar por `uuid` (Uber repite SKUs en “Save on Select Items”).

## Rappi

- Bee sobre `rappi.cl/restaurantes/{id}-…`.
- Parser: `POST https://services.rappi.cl/api/web-gateway/web/restaurants-bus/store/id/{id}/`.
- Precio cliente = `discounts[].price` si `apply_to_user`, si no `price`. Lista = `real_price`.

## Schema unificado (fila Excel)

`platform, store, section, name, description, price_clp, price_original_clp, available, source_url, scraped_at`

## Fuera de alcance

APK, login en las apps, Partner API, proxies gratis, reintentos automáticos, bypassear Cloudflare a mano.
