"""Envío de correo para las cotizaciones.

Dos correos por cotización:

  · Al cliente  — confirmación. SOLO lleva su nombre y los productos que
                  eligió, y los nombres salen de la base de datos, no de lo
                  que escribió. Si repitiéramos su mensaje, el formulario
                  sería una máquina de mandar texto anónimo a cualquiera
                  firmado con nuestro dominio.
  · A la casa   — todo, incluido el texto libre. Va con Reply-To del cliente
                  para poder responderle con un clic.

Los dos van en texto plano: el contenido lo escribe un desconocido y no hay
ninguna razón para renderizarlo como HTML en el cliente de correo de nadie.
"""

import os
import smtplib
import ssl
from email.headerregistry import Address
from email.message import EmailMessage
from email.utils import formataddr, parseaddr

SERVIDOR = os.getenv("SMTP_HOST", "")
PUERTO = int(os.getenv("SMTP_PUERTO", "465"))
USUARIO = os.getenv("SMTP_USUARIO", "")
CLAVE = os.getenv("SMTP_CLAVE", "")

# Remitente: SIEMPRE nuestro. Nunca el correo que escribió el visitante.
DESDE = os.getenv("CORREO_DESDE", "").strip()
NOMBRE_DESDE = os.getenv("CORREO_NOMBRE", "Acolchados CD").strip()

# Dónde llega la copia interna. Sale del .env, jamás de la petición.
# CORREO_DESTINO es el nombre que usa CONTACTO.md en el repositorio del
# equipo. Se acepta como alias para que quien siga ese documento no quede
# con el correo interno sin configurar y sin entender por qué.
INTERNO = (os.getenv("CORREO_INTERNO") or os.getenv("CORREO_DESTINO") or "").strip()

TELEFONO = os.getenv("TELEFONO_CONTACTO", "+56 9 9919 4045").strip()
SITIO = os.getenv("SITIO", "vissiuss.lat").strip()


def configurado() -> bool:
    return bool(SERVIDOR and USUARIO and CLAVE and DESDE)


def una_linea(texto: str, tope: int = 120) -> str:
    """Todo lo que toca una cabecera pasa por aquí.

    `EmailMessage` ya rechaza los saltos de línea en las cabeceras, pero esto
    es la primera barrera y no cuesta nada: sin saltos de línea no hay
    inyección de cabeceras posible.
    """
    return " ".join(str(texto or "").split())[:tope]


def _enviar(mensaje: EmailMessage) -> None:
    contexto = ssl.create_default_context()
    if PUERTO == 465:
        with smtplib.SMTP_SSL(SERVIDOR, PUERTO, context=contexto, timeout=20) as s:
            s.login(USUARIO, CLAVE)
            s.send_message(mensaje)
    else:
        with smtplib.SMTP(SERVIDOR, PUERTO, timeout=20) as s:
            s.starttls(context=contexto)
            s.login(USUARIO, CLAVE)
            s.send_message(mensaje)


def _base(asunto: str, para: str, responder_a: str = "") -> EmailMessage:
    m = EmailMessage()
    m["From"] = formataddr((una_linea(NOMBRE_DESDE, 60), DESDE))
    m["To"] = una_linea(para, 200)
    m["Subject"] = una_linea(asunto, 160)
    m["Auto-Submitted"] = "auto-generated"   # que los filtros sepan qué es
    if responder_a:
        m["Reply-To"] = una_linea(responder_a, 200)
    return m


def correo_valido(direccion: str) -> bool:
    """Validación deliberadamente estricta: preferimos rechazar una dirección
    rara antes que intentar mandarle correo a algo que no lo es."""
    nombre, buzon = parseaddr(direccion or "")
    if not buzon or buzon != (direccion or "").strip() or nombre:
        return False
    if buzon.count("@") != 1 or len(buzon) > 200:
        return False
    local, _, dominio = buzon.partition("@")
    if not local or not dominio or "." not in dominio or dominio.startswith("."):
        return False
    if any(c.isspace() for c in buzon) or ".." in buzon:
        return False
    try:
        Address(addr_spec=buzon)
    except (ValueError, IndexError):
        return False
    return True


def lista_bonita(productos: list[str]) -> str:
    return "\n".join(f"  · {p}" for p in productos) if productos else "  · (sin especificar)"


def resumen_corto(productos: list[str]) -> str:
    """Para el asunto: que se lea entero en la bandeja, sin cortes a media
    palabra."""
    if not productos:
        return "productos sin especificar"
    if len(productos) == 1:
        return productos[0][:70]
    if len(productos) == 2:
        return f"{productos[0][:34]} y {productos[1][:34]}"
    return f"{productos[0][:50]} y {len(productos) - 1} más"


# ─── Los dos correos ──────────────────────────────────────────────────────
def confirmacion_al_cliente(nombre: str, para: str, productos: list[str]) -> None:
    """Plantilla fija. Lo único variable son el nombre y los productos, y los
    productos vienen de la base de datos."""
    saludo = una_linea(nombre, 60) or "Hola"

    m = _base("Recibimos su solicitud de cotización", para, responder_a=INTERNO or DESDE)
    m.set_content(
        f"""{saludo}:

Recibimos su solicitud de cotización. Gracias por escribirnos.

Nos pidió información sobre:

{lista_bonita(productos)}

Estamos preparando la propuesta con telas, medidas, plazos y valores, y le
respondemos dentro de las próximas 24 horas hábiles. Si necesita algo antes,
puede llamarnos al {TELEFONO}.

Un saludo,
{NOMBRE_DESDE}
San José 5887, San Miguel · Santiago
{SITIO}

—
Este mensaje se generó automáticamente porque alguien completó el formulario
de cotización en {SITIO} con esta dirección de correo. Si no fue usted, puede
ignorarlo: no le volveremos a escribir.
"""
    )
    _enviar(m)


def aviso_interno(
    nombre: str, correo: str, telefono: str, productos: list[str], mensaje: str, ip: str
) -> None:
    """La copia para la casa: acá sí va todo, texto libre incluido."""
    quien = una_linea(nombre, 80) or "Alguien"
    resumen = resumen_corto(productos)

    m = _base(f"Cotización: {quien} — {resumen}", INTERNO, responder_a=correo)
    m.set_content(
        f"""{quien} quiere saber la cotización de:

{lista_bonita(productos)}

Cómo contactarle
  Correo    {correo}
  Teléfono  {telefono or "no lo dejó"}

Lo que escribió
{(mensaje or "(no escribió nada más)")}

—
Recibido desde el formulario de {SITIO} · IP {ip}
Responde a este correo y le llega directo a {correo}.
"""
    )
    _enviar(m)
