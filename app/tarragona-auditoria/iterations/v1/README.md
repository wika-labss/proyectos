# Auditoría de menú — demo localhost

Web local para ver **precios y productos de cliente** en PedidosYa, Uber Eats, Rappi y Justo (tarragona.cl). No es APK. No usa Partner Catalog.

Proceso técnico: [docs/PROCESO.md](docs/PROCESO.md).

## Levantar

Python 3.11+ (venv, no el alias de Microsoft Store).

```bash
cd app/tarragona-auditoria/iterations/v1
python -m venv .venv
```

Windows (PowerShell):

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

macOS / Linux:

```bash
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

Abrir [http://127.0.0.1:8000](http://127.0.0.1:8000).

## Uso lun–vie

1. Pegar token ScrapingBee y **Guardar** (una vez por máquina, o cuando rotes la key).
2. Pegar las 4 URLs del **mismo local**. Vacío = se salta.
3. Revisar créditos estimados (75 × Peya/Uber/Rappi). Justo `tarragona.cl` = 0.
4. **Auditar** (serie, 1–3 min). Si un canal falla, **Reintentar** solo esa app (1 request; Bee ~75 créditos). No reintentes en loop.
5. **Descargar .xlsx** — hojas `resumen`, `productos`, `comparacion`.

Costo típico 1 local × 3 apps Bee: **225 créditos/día**, **1.125/semana** (lun–vie).

## Token

- UI → `.scrapingbee_key` (gitignored), o env `SCRAPINGBEE_API_KEY`.
- Nunca commitear la key.

## Tests de parsers (sin gastar créditos)

```bash
python -m pytest tests -q
```
