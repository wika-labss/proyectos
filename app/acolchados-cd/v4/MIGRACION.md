# Mudar la página y la base de datos a otro servidor

## Respuesta corta

No es difícil. Todo está en Docker y **la base de datos entera es un solo
archivo**. La mudanza real son unos 20 minutos de trabajo; lo que puede
demorar horas es el DNS, y eso se espera, no se trabaja.

Lo que viaja:

| Qué | Dónde está | Tamaño |
|---|---|---|
| Código de la web y del backend | este repositorio | ~1 MB |
| Base de datos | `~/srv/apps/tienda/datos/tienda.db` | ~60 KB |
| Fotos subidas | `~/srv/apps/tienda/datos/media/` | crece con el uso |
| Configuración de Caddy | `infra/proxy/` | unos KB |

Lo que **no** viaja: `infra/casa/` (cámara y domótica). Eso es personal y se
queda en el notebook.

---

## Antes de empezar

En el servidor nuevo hace falta: Ubuntu Server, Docker y Docker Compose. Es
el mismo trabajo que ya se hizo una vez en este notebook.

---

## Paso 1 · Sacar una copia de lo actual

Desde tu PC (con Tailscale encendido, o en la red de la casa):

```bash
ssh analdo@192.168.100.172 "tar czf - -C srv/apps/tienda datos" > datos-acolchados.tar.gz
```

Ese archivo es la base de datos y todas las fotos. **Guárdalo bien**: es lo
único irrecuperable de toda la mudanza. El resto es código, y el código está
en GitHub.

---

## Paso 2 · Montar el servidor nuevo

```bash
git clone <URL-DEL-REPOSITORIO> acolchados
cd acolchados
docker network create proxy
```

Los datos:

```bash
mkdir -p ~/acolchados
tar xzf datos-acolchados.tar.gz -C ~/acolchados/
```

Debe quedar `~/acolchados/datos/tienda.db` y `~/acolchados/datos/media/`.

Las credenciales del panel:

```bash
cp .env.ejemplo .env
nano .env          # poner ADMIN_PATH, ADMIN_USUARIO y ADMIN_CLAVE
chmod 600 .env
```

> La contraseña del `.env` **solo se usa si la base de datos está vacía**.
> Como estamos trayendo la base de datos real, el usuario y la clave que
> sigan valiendo son los que ya existían. El `.env` igual debe tener un
> valor en `ADMIN_CLAVE` para que el servicio arranque, y `ADMIN_PATH` sí
> manda siempre: es la URL del panel.

Y la página:

```bash
sudo mkdir -p /srv/static/principal
sudo cp web/index.html web/logo.png /srv/static/principal/
```

---

## Paso 3 · Levantarlo

```bash
cd infra/proxy
cp .env.ejemplo .env      # el token del túnel de Cloudflare (paso 4)
chmod 600 .env
docker compose up -d

cd ../..
docker compose up -d --build
```

Comprobar sin tocar el DNS todavía:

```bash
docker exec caddy wget -qO- --header="Host: vissiuss.lat" http://127.0.0.1/api/productos
```

Si devuelve el catálogo, la mudanza está lista y solo falta el dominio.

---

## Paso 4 · El dominio

El dominio no apunta a ninguna IP: entra por un **túnel de Cloudflare**. Eso
lo hace mucho más simple, porque no hay que tocar el router del cliente ni
esperar propagación de IPs.

**Si el dominio se queda en tu cuenta de Cloudflare:**

1. En Cloudflare → Zero Trust → Networks → Tunnels, crea un túnel nuevo.
2. Copia su token al `infra/proxy/.env` del servidor nuevo.
3. En el túnel, publica `vissiuss.lat` y `www.vissiuss.lat` apuntando a
   `http://caddy:80`.
4. Apaga el túnel viejo.

El cambio es casi inmediato: los CNAME de DNS se actualizan solos al
publicar la aplicación en el túnel nuevo.

**Si el dominio pasa a la cuenta del cliente:**

1. El cliente añade `vissiuss.lat` a su propia cuenta de Cloudflare.
2. Cambia los *nameservers* en Namecheap a los que le dé Cloudflare.
   **Esto sí demora**: entre 2 y 24 horas.
3. Después, el túnel nuevo se crea desde la cuenta del cliente, igual que
   arriba.

> Mientras se propaga, la página sigue funcionando en el servidor viejo.
> No apagues el notebook hasta que la nueva esté respondiendo.

---

## Paso 5 · Comprobar y cerrar

```bash
curl -s https://vissiuss.lat/api/productos | head -c 200
```

Entra al panel, revisa que estén los productos y las fotos, y recién ahí
apaga el servicio viejo:

```bash
ssh analdo@192.168.100.172 "cd srv/apps/tienda && docker compose down"
```

---

## Lo único que puede dar problemas

| Síntoma | Causa | Solución |
|---|---|---|
| Error 1033 | Los CNAME apuntan al túnel viejo | Volver a publicar la app en el túnel nuevo |
| Error 502 | `cloudflared` no ve a Caddy | Los dos deben estar en la red `proxy` |
| Las fotos no cargan | Faltó copiar `datos/media/` | Repetir el paso 1 |
| No entra al panel | `ADMIN_PATH` distinto al de antes | La URL cambia si cambias esa variable |
| "Permission denied" en `datos/` | Dueño incorrecto | `sudo chown -R 1000:1000 datos` |

---

## Recomendación

Deja andando el respaldo automático **antes** de entregar, no después:

```bash
# En el servidor, con crontab -e
0 3 * * * tar czf ~/respaldos/acolchados-$(date +\%F).tar.gz -C ~/acolchados datos
5 3 * * * find ~/respaldos -name "acolchados-*.tar.gz" -mtime +14 -delete
```

Guarda una copia diaria a las 3 de la mañana y borra las de más de dos
semanas.
