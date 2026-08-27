# Scraping TA — V1 (web)

Auditoría de menú vista cliente. Proceso de parsers: [docs/PROCESO.md](docs/PROCESO.md). Docs de producto: [`../../idea/`](../../idea/).

## Levantar

Python 3.11+ (venv).

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

Abrir [http://127.0.0.1:8000](http://127.0.0.1:8000).

## Uso lun–vie

1. Pegar token ScrapingBee y **Guardar** (`.scrapingbee_key`, gitignored). Justo no lo necesita.
2. Pegar las 4 URLs del **mismo local**. Vacío = se salta.
3. Créditos estimados: 75 × Peya/Uber/Rappi. Justo `tarragona.cl` = 0.
4. **Auditar**. Si un canal falla: **Reintentar** solo esa app (1 request). Sin loop.
5. **Descargar .xlsx** — `resumen`, `productos`, `comparacion`.

Costo típico 1 local × 3 Bee: **225 créditos/día**, **1.125/semana** (lun–vie).

## Tests (sin gastar Bee en parsers)

```bash
python -m pytest tests -q
```

## Token

Nunca commitear la key.
