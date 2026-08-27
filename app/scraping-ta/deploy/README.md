# Scraping TA — hosting estable (dominio Vissiuss)

Archivos para levantar la V1 como **página web fija** con HTTPS, sin trycloudflare.

No despliega nada por sí solo. Cuando tengas VPS + DNS, `docker compose up -d` desde esta carpeta.

## Dominio

Por defecto:

| Host | Uso |
| :--- | :--- |
| `vissiuss.com` | Sitio (apex) |
| `www.vissiuss.com` | Redirect 301 → apex |

Cámbialo en `.env` (`DOMAIN=ta.vissiuss.com`, `vissiuss.cl`, etc.) **antes** de pedir el certificado.

## 1. DNS (registrar)

En el panel del dominio `vissiuss.com`:

| Tipo | Nombre | Valor |
| :--- | :--- | :--- |
| `A` | `@` | IP pública del VPS |
| `A` | `www` | misma IP |

Si usas solo subdominio (`ta.vissiuss.com`), un `A` en `ta` basta.

Espera a que resuelva (`dig +short vissiuss.com`) antes de Caddy/Let's Encrypt.

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

- `DOMAIN` — `vissiuss.com` (o el host que hayas apuntado).
- `ACME_EMAIL` — correo para Let's Encrypt (avisos de cert).
- `SCRAPINGBEE_API_KEY` — **nunca en git**. En producción preferir env, no pegarlo en la UI pública.

Quien tenga la URL puede gastar créditos Bee (no hay login en V1). No indexar el sitio; no mandar el link en público.

## 4. Levantar

```bash
mkdir -p data/runs
touch data/.scrapingbee_key
chmod 600 data/.scrapingbee_key
# o:
./prepare.sh
docker compose up -d --build
docker compose logs -f
```

Caddy saca el cert TLS solo. App en un solo worker (los jobs viven en memoria).

Abrir `https://vissiuss.com`.

## 5. Operación

```bash
docker compose ps
docker compose logs -f app
docker compose pull && docker compose up -d --build   # tras un git pull
docker compose down
```

Datos persistentes en `data/` (gitignored): Excel/runs y el token si se guarda por UI.

## Qué no hace esta carpeta

- No registra el dominio.
- No crea el VPS.
- No pone login (`FEAT-11`).
- No es el túnel trycloudflare del agent.
