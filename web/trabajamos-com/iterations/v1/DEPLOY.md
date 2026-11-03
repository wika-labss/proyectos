# Despliegue en servidor de prueba (QA)

## Requisitos

- Docker y Docker Compose
- Un dominio apuntando al servidor (HTTPS con Caddy) **o** acceso por IP con `DOMAIN=:80`

## Primera vez

```bash
cd proyectos/web/trabajamos-com/iterations/v1
cp .env.example .env
# Completar: POSTGRES_PASSWORD, SESSION_SECRET (≥32), DOMAIN, PUBLIC_BASE_URL,
# COOKIE_SECURE, NOMINATIM_USER_AGENT, SEED_PASSWORD (si vas a sembrar)
docker compose up -d --build
# Las migraciones corren al arrancar el contenedor app.
docker compose exec app npm run seed   # opcional
```

Abre `PUBLIC_BASE_URL`. Salud: `/health`.

### Sin dominio (solo IP / localhost)

```env
DOMAIN=:80
PUBLIC_BASE_URL=http://TU_IP
COOKIE_SECURE=false
GEOCODER=nominatim   # o fake si no hay salida a Nominatim
```

### Con dominio

```env
DOMAIN=qa.trabajamos.com
PUBLIC_BASE_URL=https://qa.trabajamos.com
COOKIE_SECURE=true
```

Caddy obtiene el certificado solo.

## Operación

```bash
docker compose logs -f app
docker compose restart app
./scripts/backup.sh                 # volcado PG + tar de uploads
NUEVA_CONTRASENA='…' docker compose exec -e NUEVA_CONTRASENA -e DATABASE_URL app \
  npm run admin:reset-password -- correo@dominio.cl
```

## Variables

Ver `.env.example`. Obligatorias: `POSTGRES_PASSWORD`, `SESSION_SECRET`. Con `GEOCODER=nominatim` también `NOMINATIM_USER_AGENT` (política de uso de OSM).

## Ideas para salir del servidor de prueba

Documentadas en `idea/06-modelo-datos.md` §7: Postgres gestionado, objetos en S3, Nominatim propio o de pago, verificación de correo, secretos fuera del `.env`.
