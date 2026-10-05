# Formulario de contacto — envío de correo

La página muestra el aviso «Mensaje recibido» y borra el formulario, pero
no manda ningún correo. El JavaScript de `web/index.html` hace
`preventDefault`, muestra `#ok` y llama a `reset()`. No hay `fetch`.

En `servidor/app/main.py` no existe una ruta de contacto. `requirements.txt`
no necesita una librería nueva: el envío usa `smtplib` de la biblioteca
estándar.

El buzón de destino que ya figura en la página es
**contacto@acolchadoscd.cl**.

Caddy no cambia. En `app/servidor-vissiuss/proxy/Caddyfile` todo lo que no
es un archivo en disco ya va a `tienda:8080`. Un `POST /api/contacto` llega
al contenedor sin tocar el proxy.

---

## Materiales

Hay que tener esto antes de escribir código. Si falta el buzón o el SMTP,
el formulario sigue sin poder entregar nada.

| Material | Para qué | Dónde se consigue |
|---|---|---|
| Buzón `contacto@acolchadoscd.cl` que reciba correo | Destino de cada solicitud | Panel del dominio o del hosting de correo |
| Usuario SMTP, clave y host | El contenedor autentica y envía | El mismo panel, sección SMTP o «contraseña de aplicación» |
| Puerto **587** (STARTTLS) | Canal cifrado con autenticación | Lo indica el proveedor. 465 solo si 587 no existe |
| Acceso DNS de `acolchadoscd.cl` | SPF, DKIM y DMARC, para que el correo no caiga en spam | Cloudflare o el registrador. Registros de correo en **DNS only**, nunca *Proxied* |
| SSH al servidor donde corre `docker compose` de esta app | Pegar el `.env`, reconstruir `tienda` y copiar el HTML | El equipo descrito en `MIGRACION.md` |
| `.env` ya existente, permisos `600` | Ahí viven `ADMIN_PATH` y la clave del panel. El SMTP se agrega al mismo archivo | Junto al `docker-compose.yml`, fuera de git |
| Un correo personal para la prueba | Confirmar que llega, que el Reply-To responde y que no está en spam | Cualquier buzón distinto al de destino |

El `From` del mensaje es el buzón propio (`contacto@acolchadoscd.cl` u otra
dirección que ese SMTP autorice). El correo de quien llena el formulario
va en `Reply-To`. El servidor SMTP rechaza un `From` que no le pertenece.

La clave SMTP no va al repositorio, ni al HTML, ni al panel.

### Qué anotar del proveedor

Completar esta tabla con los datos reales antes de implementar. Los
valores de ejemplo no son los del dominio.

| Dato | Valor |
|---|---|
| Proveedor (Google, Microsoft 365, Zoho, cPanel, otro) | |
| Host SMTP | |
| Puerto | 587 |
| Cifrado | STARTTLS |
| Usuario | `contacto@acolchadoscd.cl` |
| Clave o contraseña de aplicación | solo en el `.env` del servidor |
| Dirección From autorizada | |
| Dirección de destino | `contacto@acolchadoscd.cl` |

Si el buzón tiene verificación en dos pasos, la clave del SMTP es una
**contraseña de aplicación**, no la clave con la que se entra a la webmail.

### Variables que quedarán en el `.env`

```bash
SMTP_HOST=
SMTP_PUERTO=587
SMTP_USUARIO=
SMTP_CLAVE=
CORREO_DESDE=contacto@acolchadoscd.cl
CORREO_DESTINO=contacto@acolchadoscd.cl
```

Si falta alguna, el endpoint responde error y la página no muestra el aviso
verde. El mismo `.env.ejemplo` del repo documenta los nombres, con valores
vacíos, sin secretos.

---

## Paso 1 · Confirmar que el buzón existe

Desde un correo personal, enviar un mensaje a `contacto@acolchadoscd.cl` y
abrirlo en esa casilla.

Si rebota o no hay casilla, el trabajo se detiene aquí. Primero se crea el
buzón en el hosting del dominio `acolchadoscd.cl`. El sitio público está en
`vissiuss.lat`; el correo no pasa por ese túnel ni por Caddy.

Los registros MX de `acolchadoscd.cl` siguen apuntando al servidor de correo
del proveedor. No se apuntan a `vissiuss.lat`.

---

## Paso 2 · Probar el SMTP a mano, antes de tocar la aplicación

En el servidor, con los datos del paso anterior, una prueba suelta confirma
que el contenedor va a poder autenticarse. Python 3 basta; no hace falta
instalar nada en el repo.

Guardar esto como archivo local fuera del repositorio, por ejemplo
`/tmp/probar-smtp.py`, con la clave real solo en esa máquina:

```python
import smtplib
from email.message import EmailMessage

msg = EmailMessage()
msg["From"] = "contacto@acolchadoscd.cl"
msg["To"] = "contacto@acolchadoscd.cl"
msg["Subject"] = "Prueba SMTP Acolchados CD"
msg["Reply-To"] = "tu-correo-personal@ejemplo.com"
msg.set_content("Si este mensaje llegó, el SMTP está listo para el formulario.")

with smtplib.SMTP("SMTP_HOST", 587, timeout=20) as smtp:
    smtp.starttls()
    smtp.login("SMTP_USUARIO", "SMTP_CLAVE")
    smtp.send_message(msg)
```

Ejecutar `python3 /tmp/probar-smtp.py` y borrar el archivo al terminar.

Resultado esperado: el mensaje aparece en `contacto@acolchadoscd.cl`.
Revisar también la carpeta de spam. Responder el mensaje y comprobar que
la respuesta sale hacia el `Reply-To`.

Si la autenticación falla, se corrige host, puerto o clave en este paso.
No se sigue con el código hasta que esta prueba entregue el correo.

---

## Paso 3 · DNS del dominio de correo

En el DNS de `acolchadoscd.cl`, con los registros de correo en **DNS only**:

1. **SPF** (TXT en la raíz). Debe autorizar al proveedor SMTP. Un ejemplo
   genérico, a reemplazar por el que entregue el panel del correo:
   `v=spf1 include:_spf.ejemplo.com ~all`
2. **DKIM**. El proveedor da un nombre de host y un TXT. Se copian tal cual.
3. **DMARC** (TXT en `_dmarc`). Para empezar, observar sin rechazar:
   `v=DMARC1; p=none; rua=mailto:contacto@acolchadoscd.cl`

MX, `mail`, `autoconfig`, `autodiscover` y los TXT de correo quedan fuera
del proxy naranja de Cloudflare. Si uno de esos registros está *Proxied*,
el correo se pierde. La web de `vissiuss.lat` puede seguir proxied: es otro
dominio.

---

## Paso 4 · Qué hay que cambiar en el código

Estos son los tres puntos de la aplicación. Se implementan juntos, después
de que el paso 2 haya entregado un correo real.

### `servidor/app/main.py`

Nuevo `POST /api/contacto`, público, al lado de `/api/productos`.

Cuerpo JSON:

| Campo | Regla |
|---|---|
| `nombre` | Obligatorio. Texto recortado, máximo 120 caracteres |
| `telefono` | Opcional. Máximo 40 caracteres |
| `email` | Obligatorio. Formato de correo, máximo 200 caracteres |
| `producto` | Opcional. Máximo 160 caracteres. Es el texto del `<select>` |
| `mensaje` | Obligatorio en el servidor, máximo 4000 caracteres |

El HTML de hoy no marca `mensaje` como `required`. El servidor sí lo exige.

Respuestas:

| Código | Cuándo | Cuerpo |
|---|---|---|
| 200 | El SMTP aceptó el mensaje | `{"ok": true}` |
| 400 | Falta un campo o el correo no tiene forma válida | `{"ok": false}` |
| 429 | Demasiados envíos desde la misma IP | `{"ok": false}` |
| 503 | Falta alguna variable SMTP en el entorno | `{"ok": false}` |
| 502 | El SMTP rechazó o no respondió | `{"ok": false}` |

El detalle del fallo SMTP se escribe en el log del contenedor. No se
devuelve al navegador.

Asunto sugerido: `Consulta web — {nombre}`. El cuerpo incluye nombre,
teléfono, correo, producto y mensaje, en texto plano.

`From` = `CORREO_DESDE`. `To` = `CORREO_DESTINO`. `Reply-To` = el correo
del formulario.

Tope por IP, aparte del bloqueo del panel. El panel usa la tabla
`intentos` para claves fallidas; mezclar el formulario ahí bloquearía el
acceso de administración. Un límite propio, por ejemplo 5 envíos por IP
cada 15 minutos, usando la misma lectura de IP que ya existe (`cf-connecting-ip`,
luego `x-forwarded-for`).

Timeout del SMTP de unos 20 segundos, para no dejar colgado al worker de
uvicorn.

### `web/index.html`

En el `submit` de `#form`, enviar JSON a `/api/contacto`. El aviso `#ok`
aparece solo con respuesta 200, y ahí se hace `reset()`.

Si la red falla o el código no es 200, el aviso verde no aparece, los
campos se conservan y se muestra un texto de error al lado del botón, del
estilo: «No pudimos enviar el mensaje. Escríbanos a contacto@acolchadoscd.cl
o por WhatsApp.»

Mientras la petición está en curso, el botón queda deshabilitado para no
mandar dos veces el mismo formulario.

### `.env.ejemplo`

Agregar los seis nombres de la tabla de variables, vacíos, con un comentario
de una línea. Sin claves de ejemplo que parezcan reales.

---

## Paso 5 · Despliegue

La página pública no sale del contenedor. Caddy la lee de disco.

```bash
# en el servidor, dentro del directorio de la app
nano .env          # las seis variables SMTP
chmod 600 .env

docker compose up -d --build

sudo cp web/index.html /srv/static/principal/index.html
```

`docker compose` lee el `env_file` al crear el contenedor. Cambiar el
`.env` y no recrear `tienda` deja el proceso con las variables viejas.
`up -d --build` cubre las dos cosas: imagen nueva y entorno nuevo.

---

## Paso 6 · Comprobar el circuito completo

1. `POST` directo, sin el navegador:

```bash
curl -sS -D- https://vissiuss.lat/api/contacto \
  -H 'Content-Type: application/json' \
  --data-binary '{"nombre":"Prueba","telefono":"+56900000000","email":"tu-correo-personal@ejemplo.com","producto":"Colchas","mensaje":"Mensaje de prueba del formulario."}'
```

Esperado: HTTP 200 y `{"ok": true}`. El correo está en la bandeja de
`contacto@acolchadoscd.cl`, con Reply-To igual al correo personal.

2. En https://vissiuss.lat/#contacto, enviar el formulario de verdad.
   El aviso verde sale después de la respuesta, no al instante. Al
   responder desde el buzón, el destinatario es quien llenó el formulario.

3. Cortar a propósito `SMTP_CLAVE` en una prueba local (o apuntar el host
   a uno inválido) y volver a enviar. La página muestra el error y conserva
   los campos. Se restaura la clave y se recrea el contenedor al terminar.

4. Un sexto envío seguido desde la misma IP responde 429.

5. Mirar spam en la primera entrega real. Si cayó ahí, revisar SPF, DKIM
   y DMARC del paso 3 antes de darlo por cerrado.

---

## Listo cuando

- Una solicitud escrita en la web llega a `contacto@acolchadoscd.cl`.
- Responder ese correo llega a quien lo envió.
- Un fallo de SMTP no muestra «Mensaje recibido».
- La clave SMTP está solo en el `.env` del servidor, con permisos `600`.
- El catálogo, las fotos y el panel siguen respondiendo como antes.
