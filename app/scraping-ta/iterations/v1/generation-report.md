# Generation report — Scraping TA v1.1

- Docs WIKA `idea/01–05` + `audits/` (entregable **Aplicación Web**, no APK)
- Admin empresarial Vissiuss (navy + oro): login, páginas a scrapear, preview, informes
- FastAPI + Bee: token, 4 URLs, Auditar, Reintentar por canal, Excel
- Fuentes nativas: Peya XHR menú, Uber `catalogItems`, Rappi store-bus, Justo CDN
- 1 request Bee / URL (~75 créditos); Justo tarragona.cl = 0
- Jobs async + poll (túnel Cloudflare no corta el POST)
- Verify: `python -m pytest tests -q`
