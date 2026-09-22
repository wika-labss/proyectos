# Servidor Vissiuss — configuración

Todo lo necesario para levantar desde cero el servidor casero que aloja
[`app/acolchados-cd`](../acolchados-cd) y la domótica de la casa.

Es un notebook Acer con Ubuntu Server 26.04 LTS, todo en Docker.

> **Ningún archivo de aquí contiene claves.** Los que las llevan están como
> `.ejemplo`: hay que copiarlos quitando esa terminación y rellenar los
> valores reales. Los archivos con secretos están en el `.gitignore`.

---

## Qué es cada cosa

```
servidor-vissiuss/
├── proxy/      Caddy + Cloudflare Tunnel. Es la puerta de entrada.
│               → Lo necesita la página web. Viaja con ella si se migra.
└── casa/       Domótica personal. NADA que ver con Acolchados CD.
    ├── camara/     MediaMTX: grabación 24/7 con borrado a los 3 días
    └── control/    API ONVIF para mover la cámara (FastAPI)
```

---

## Cómo entra el tráfico

```
Internet → Cloudflare → cloudflared → Caddy → los contenedores
```

**No hay ningún puerto abierto en el router.** `cloudflared` abre la conexión
hacia afuera, no al revés. Caddy tampoco publica puertos: solo es alcanzable
desde la red interna de Docker.

Los servicios de la casa están atados a la IP de Tailscale, nunca a
`0.0.0.0`, así que no son alcanzables desde internet ni desde la wifi.

Caddy reparte por archivo: si la URL existe como archivo en
`/srv/static/principal` la sirve él; si no, va al backend. Por eso la URL
secreta del panel **no aparece en el `Caddyfile`**: vive solo en el `.env`.

---

## Levantarlo

```bash
docker network create proxy          # una sola vez

cd proxy
cp .env.ejemplo .env                 # token del túnel de Cloudflare
chmod 600 .env
docker compose up -d
```

Para la cámara, además hay que crear el `mediamtx.yml` real:

```bash
cd ../casa/camara
cp mediamtx.yml.ejemplo mediamtx.yml   # poner usuario y clave de la cámara
docker compose up -d
```

Y el control ONVIF:

```bash
cd ../control
cp .env.ejemplo .env
chmod 600 .env
docker compose up -d --build
```

---

## Notas del hardware

- **El arranque solo funciona en modo Legacy/CSM.** Este Acer no registra
  instalaciones UEFI: si se reinstala Ubuntu, hay que poner
  `Boot Mode: Legacy` en la BIOS antes.
- La pila CMOS está agotada, así que la BIOS pierde la hora en cada corte de
  luz. No afecta a nada: NTP la corrige al arrancar.
- El notebook no tiene batería. En la BIOS está activado el encendido
  automático al volver la corriente.
- La tapa cerrada no suspende el equipo (hay un *drop-in* de `logind`).

---

## Cosas que no hay que olvidar

- Los `.env` van con permisos `600`.
- Los registros DNS de correo (`mail`, `autoconfig`, `autodiscover`, MX, TXT,
  SRV) deben quedar en **DNS only**, nunca en *Proxied*.
- **Docker se salta UFW** cuando un contenedor publica un puerto. Por eso
  ninguno publica hacia `0.0.0.0`.
