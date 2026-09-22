# Acolchados CD — página web

Sitio público de Acolchados CD (fabricante textil, San Miguel) con un panel
de inventario propio. En producción en **https://vissiuss.lat**.

La configuración del servidor que lo aloja está en
[`app/servidor-vissiuss`](../servidor-vissiuss).

---

## Qué es cada cosa

```
acolchados-cd/
├── web/
│   ├── index.html      La página pública
│   └── logo.png        Logo: barra, pie de página y favicon
├── servidor/
│   ├── app/
│   │   ├── main.py     API pública + panel de administración (FastAPI)
│   │   ├── panel.html  El panel, una sola página sin dependencias
│   │   └── semilla.py  Carga inicial del catálogo 2025
│   ├── Dockerfile
│   └── requirements.txt
├── docker-compose.yml
├── .env.ejemplo
└── MIGRACION.md        Cómo mudarlo a otro servidor
```

---

## Cómo está armado

```
Internet → Cloudflare → cloudflared → Caddy ┬─ archivo en disco   → la página
                                            └─ cualquier otra cosa → contenedor "tienda"
```

La página es HTML estático y lo sirve Caddy. Todo lo demás —la API, las fotos
subidas y el panel— lo atiende el contenedor `tienda`, que **no publica
ningún puerto**: solo Caddy puede hablar con él.

Base de datos: **SQLite**, un único archivo. No hay motor que instalar.

---

## Qué se ve y qué no

En la página pública salen: foto, nombre, descripción, colores, tamaños y
precios (como valores netos, con aviso de que no incluyen IVA).

El **stock** y las **notas internas** nunca salen del servidor: la API
pública ni siquiera los incluye en la respuesta.

---

## El panel de administración

Vive en una URL secreta que se define en el `.env` y **no aparece en ninguna
página ni en este repositorio**. Permite crear y editar productos, subir
fotos, definir colores, administrar categorías y llevar el stock por tamaño,
con historial de movimientos.

| Medida | Para qué |
|---|---|
| URL secreta | No aparece en la web ni en buscadores |
| Usuario + contraseña | PBKDF2-SHA256, 240.000 iteraciones |
| Cookie de sesión | `HttpOnly` + `Secure` + `SameSite=Lax`, caduca a las 8 h |
| Bloqueo por intentos | 5 fallos desde una IP → 15 minutos de espera |
| Cabecera `X-Panel` | Impide que otra web dispare acciones en tu nombre |
| `noindex` + `no-store` | Ni buscadores ni cachés guardan rastro del panel |
| Firma de archivo | Al subir fotos se revisan los bytes, no la extensión |

---

## Levantarlo

```bash
docker network create proxy          # una sola vez

cp .env.ejemplo .env
nano .env                            # ADMIN_PATH, ADMIN_USUARIO, ADMIN_CLAVE
chmod 600 .env

docker compose up -d --build
docker compose exec tienda python semilla.py   # solo la primera vez
```

La página se copia aparte, al directorio que sirve Caddy:

```bash
sudo cp web/index.html web/logo.png /srv/static/principal/
```

---

## Respaldos

Todo lo irrecuperable son dos cosas dentro de `datos/`: el archivo `.db` y
la carpeta `media/` con las fotos.

```bash
tar czf respaldo-$(date +%F).tar.gz datos
```

---

## Cuidado con los acentos

Los textos van en UTF-8. Si editas productos con `curl` desde PowerShell o
Git Bash, los acentos se pueden corromper (`á` → `Ã¡`). Edita desde el panel,
o usa `curl --data-binary @archivo.json` con el archivo guardado en UTF-8.
