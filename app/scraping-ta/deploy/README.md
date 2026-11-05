# Scraping TA — hosting en `ta.vissiuss.com`

Levanta la V1 como página fija con HTTPS (Caddy + Let's Encrypt). No despliega nada por sí solo: en el VPS, `docker compose up -d` desde esta carpeta.

No hace falta SSH desde este repo. En el VPS: DNS + `prepare.sh` + compose.

## Dominio

| Host | Uso |
| :--- | :--- |
| `ta.vissiuss.com` | Admin + `POST /api/ingest` de la extensión |

No se fuerza `www` (un subdominio no tiene `www.ta…`).

## 1. DNS (registrar)

En el panel de `vissiuss.com`:

| Tipo | Nombre | Valor |
| :--- | :--- | :--- |
| `A` | `ta` | IP pública del VPS |

Espera a que resuelva (`dig +short ta.vissiuss.com`) antes de Caddy/Let's Encrypt.

## 2. VPS

Ubuntu 22.04+, puertos **80** y **443** abiertos. Docker + Compose v2:

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2
sudo usermod -aG docker "$USER"   # luego re-login
```

Clona el repo (rama con Scraping TA) y entra aquí:

```bash
cd proyectos/app/scraping-ta/deploy
cp .env.example .env
nano .env
```

## 3. `.env`

- `DOMAIN` — `ta.vissiuss.com`
- `ACME_EMAIL` — correo para Let's Encrypt
- `INGEST_KEY` — Bearer de la extensión. Generar: `openssl rand -hex 32`. **Nunca en git.** La misma clave se pega una vez en el popup.
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — consola
- `SCRAPINGBEE_API_KEY` — opcional (fallback). Vacío = solo extensión.

## 4. Levantar

```bash
./prepare.sh
# editá .env: DOMAIN, INGEST_KEY, admin
docker compose up -d --build
docker compose logs -f
```

Caddy saca el cert TLS solo. App en un solo worker (los jobs viven en memoria + `data/runs`).

Abrir `https://ta.vissiuss.com`. Extensión: API por defecto = esa URL.

Datos persistentes: `./data/runs` (JSON + xlsx). **No hay SQLite.**

## 5. Operación

```bash
docker compose ps
docker compose logs -f app
docker compose pull && docker compose up -d --build   # tras un git pull
docker compose down
```

## Qué no hace esta carpeta

- No registra el dominio ni crea el VPS.
- No publica la extensión en Chrome Web Store (se carga unpacked).
- No inventa bypass de Cloudflare.
