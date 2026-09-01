# Generation report — Scraping TA v1

- Docs WIKA `idea/01–05` + `audits/` (entregable **Aplicación Web**, no APK)
- FastAPI + página única: token Bee opcional, 4 URLs, Auditar, Reintentar por canal, Excel
- Fetcher default **Scrapling** (`capture_xhr` → mismo schema `body`+`xhr`). Fallback `SCRAPING_TA_FETCHER=bee`
- Justo CDN intacto. Un fetch, `retries=1`
- Verify: `python -m pytest tests -q`
