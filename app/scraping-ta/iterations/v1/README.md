# Scraping TA — V1 (web)

Auditoría de menú vista cliente. Proceso de parsers: [docs/PROCESO.md](docs/PROCESO.md). Docs de producto: [`../../idea/`](../../idea/). Extensión Chrome: [`../../extension/`](../../extension/).

## Levantar

Python 3.11+ (venv).

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
export INGEST_KEY=$(openssl rand -hex 32)   # la misma se pega en la extensión
export SCRAPING_TA_AUTH=0                   # tests / local sin login
python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

Abrir [http://127.0.0.1:8000/login](http://127.0.0.1:8000/login) (`admin` / `cambiar123`). Consola: `/admin`.

## Uso (extensión, camino principal)

1. En admin: **Generar informe** — copiá el `run_id`.
2. Cargá la extensión unpacked (`../../extension/`, ver su README).
3. Popup: INGEST_KEY, API `http://127.0.0.1:8000` (local) o `https://ta.vissiuss.com`.
4. Abrí el menú en Chrome (Peya / Uber / Rappi) → **Enviar a Scraping TA**.
5. **Historial** → un `.xlsx` por agregador.

## Fallback ScrapingBee

En **Ajustes**. 1 request ≈ 75 créditos. No es el camino primario.

## Tests

```bash
SCRAPING_TA_AUTH=0 python -m pytest tests -q
```

`conftest.py` ya pone `SCRAPING_TA_AUTH=0`. Los tests de ingest usan un dump Bee sintético (sin red).

## Token / secretos

Nunca commitear `INGEST_KEY` ni la key Bee.
