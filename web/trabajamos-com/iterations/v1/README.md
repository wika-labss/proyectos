# trabajamos.com — Fase 1 (QA)

Portal de oficios y emprendedores cercanos. El cliente busca un `#` y ve ofertas ordenadas por distancia. El emprendedor administra perfil, ofertas, portafolio y localidad.

## Stack

- Node.js 22 + TypeScript + Fastify 5 (HTML SSR; funciona sin JavaScript)
- PostgreSQL 16 + PostGIS 3
- Auth: correo + contraseña (argon2id), sesiones en BD, CSRF
- Imágenes: `sharp` → WebP en `UPLOADS_DIR`
- Mapa: Leaflet + OpenStreetMap; geocodificación Nominatim (o `GEOCODER=fake`)

## Desarrollo local

```bash
cp .env.example .env   # o exporta DATABASE_URL, SESSION_SECRET, GEOCODER=fake
npm ci
npm run build
npm run migrate
SEED_PASSWORD=… npm run seed   # opcional
npm start                      # http://localhost:3000
# o: npm run dev
```

```bash
npm test                       # Vitest (usa TEST_DATABASE_URL)
```

## Despliegue QA

Ver [DEPLOY.md](./DEPLOY.md).

## Rutas

| Ruta | Quién |
|------|--------|
| `/`, `/index.html` | Cliente: buscar oficios |
| `/perfil.html?slug=` | Perfil público |
| `/panel/entrar.html`, `/panel/crear-cuenta.html` | Auth |
| `/panel/perfil.html`, `ofertas`, `portafolio`, `localidad` | Panel |
| `/health` | Salud |

## Modelo de datos

`../../idea/06-modelo-datos.md` ↔ `migrations/001_inicial.sql`.
