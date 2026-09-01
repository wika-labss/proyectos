# Scraping TA

Proyecto WIKA **web** (no APK): auditoría de menú **vista cliente** en PedidosYa, Uber Eats, Rappi y Justo (tarragona.cl).

Fuente de verdad: [`idea/`](idea/). Código V1: [`iterations/v1/`](iterations/v1/).

## Qué hace

Pegas las URLs públicas del **mismo local**. Extrae productos, descripciones y precios (cliente + lista) desde JSON nativo — no Partner Catalog. Baja un Excel (`resumen` / `productos` / `comparacion`).

- Bee (Peya / Uber / Rappi): ~75 créditos, **1 request** por URL, en serie. Fallback: `SCRAPING_TA_FETCHER=bee`.
- Default V1.1: **Scrapling** (browser local, 0 créditos Bee). Justo `tarragona.cl`: CDN, **0**.
- **Reintentar** por canal: un click = un fetch.

## Levantar V1

```bash
cd app/scraping-ta/iterations/v1
python -m venv .venv
source .venv/bin/activate   # Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app:app --host 127.0.0.1 --port 8000
```

Abrir http://127.0.0.1:8000. Default: **Scrapling** (sin token Bee). Justo CDN no usa browser.

`SCRAPING_TA_FETCHER=bee` + token ScrapingBee si quieres el camino anterior.

Tras `pip install -r requirements.txt` corre `scrapling install` (browsers).

## Documentación WIKA

| Etapa | Ruta |
| :--- | :--- |
| Problema | `idea/01-problem.md` |
| Features | `idea/02-features.md` |
| Módulos | `idea/03-module-discovery.md` |
| Diseño | `idea/04-application-design.md` |
| Build | `idea/05-build-plan.md` |
| Auditorías | `audits/` |

Fuera de alcance: APK, login en apps, Partner API, retry loop, proxies gratis.

## Hosting estable (dominio Vissiuss)

Cuando haya VPS + DNS `vissiuss.com`, no uses trycloudflare. Carpeta lista:

[`deploy/`](deploy/) — Docker, Caddy (HTTPS), `.env.example`.

```bash
cd app/scraping-ta/deploy
./prepare.sh
cp .env.example .env   # DOMAIN=vissiuss.com y el token Bee
docker compose up -d --build
```
