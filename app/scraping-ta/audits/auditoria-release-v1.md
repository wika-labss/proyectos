# Auditoría de Release — V1 (web)

## Proyecto
Scraping TA

## Fecha
2026-08-27

## Objetivo
Validar que `iterations/v1` cumple FEAT-01–08 y es usable como app web localhost.

## Entradas
- `idea/01-05`
- `iterations/v1/` (FastAPI + HTML)
- `pytest tests -q`

## Entregable
Aplicación web. **No APK.**

---

## Validaciones

### Compilación / runtime
- [x] `python -m pytest tests -q` (parsers + retry mock + Justo CDN)
- [x] `uvicorn app:app --host 127.0.0.1 --port 8000`
- [x] `GET /` sirve VIEW-01

### Funcionalidad
- [x] Token local gitignored (`FEAT-01`)
- [x] 4 URLs, vacío = skip (`FEAT-02`)
- [x] 1 scrape Bee / URL, serie (`FEAT-03`)
- [x] Parsers nativos + Uber catalogItems lista (`FEAT-04`)
- [x] Excel 3 hojas (`FEAT-05`)
- [x] Reintentar por canal (`FEAT-06`)
- [x] Estimación créditos (`FEAT-07`)
- [x] Job + poll (`FEAT-08`)

### Seguridad
- [x] `.scrapingbee_key` y `runs/` en `.gitignore`
- [x] Sin Partner API, sin bypass Cloudflare

### UX
- [x] Marca Scraping TA
- [x] Reintentar junto a cada URL y en la tabla

---

## Resultado

## APROBADO

V1 lista para demo. Publicación productiva (hosting + token en servidor) queda fuera de V1 (`FEAT-12`).
