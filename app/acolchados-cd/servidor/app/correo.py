"""Envío de correo para las cotizaciones.

Dos correos por cotización:

  · Al cliente  — confirmación. SOLO lleva su nombre y los productos que
                  eligió, y los nombres salen de la base de datos, no de lo
                  que escribió. Si repitiéramos su mensaje, el formulario
                  sería una máquina de mandar texto anónimo a cualquiera
                  firmado con nuestro dominio.
  · A la casa   — todo, incluido el texto libre. Va con Reply-To del cliente
                  para poder responderle con un clic.

Los dos salen en dos versiones dentro del mismo mensaje: texto plano y HTML.
El cliente de correo elige. El que no entiende HTML, o el que lo bloquea,
igual lee el contenido completo.

**Todo lo que escribe el visitante pasa por `escapar()` antes de entrar al
HTML.** Si no, alguien podría escribir etiquetas en el mensaje y romper el
diseño del correo que le llega al dueño. El texto plano no necesita eso.
"""

import os
import smtplib
import ssl
from datetime import datetime
from email.headerregistry import Address
from email.message import EmailMessage
from email.utils import formataddr, parseaddr
from html import escape as escapar

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


# ─── Paleta y piezas del diseño ───────────────────────────────────────────
# Los mismos colores de la página. En correo se usa fondo claro: es lo que
# mejor se ve en todos los clientes, y lo que se espera de algo formal.
TINTA = "#1A1A1C"        # texto principal
SUAVE = "#6E6961"        # texto secundario
ORO = "#B99A72"          # el acento de la marca
BORDE = "#E6E1D8"
PAPEL = "#FFFFFF"
FONDO = "#F4F2ED"

# Las tablas y los estilos en línea no son por gusto: la mitad de los
# clientes de correo descarta <style> y ninguno entiende flex ni grid.
_TIPO = "font-family:Helvetica,Arial,sans-serif"


def _fila(etiqueta: str, valor: str) -> str:
    """Una fila de la ficha de contacto. El valor ya viene escapado."""
    if not valor:
        return ""
    return (
        f'<tr>'
        f'<td style="{_TIPO};font-size:12px;color:{SUAVE};padding:7px 16px 7px 0;'
        f'white-space:nowrap;vertical-align:top">{etiqueta}</td>'
        f'<td style="{_TIPO};font-size:14px;color:{TINTA};padding:7px 0;'
        f'vertical-align:top">{valor}</td>'
        f'</tr>'
    )


def _titulo(texto: str) -> str:
    return (
        f'<p style="{_TIPO};font-size:11px;letter-spacing:.14em;text-transform:uppercase;'
        f'color:{ORO};margin:28px 0 10px;font-weight:bold">{texto}</p>'
    )


def _envoltorio(encabezado: str, cuerpo: str, pie: str) -> str:
    """El marco común de los dos correos."""
    return f"""<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:{FONDO};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
       style="background:{FONDO};padding:28px 12px">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
           style="width:100%;max-width:600px;background:{PAPEL};border:1px solid {BORDE}">

      <tr><td style="background:{TINTA};padding:26px 32px">
        <p style="{_TIPO};margin:0;font-size:15px;letter-spacing:.22em;
                  text-transform:uppercase;color:#F2EFEA;font-weight:bold">
          {escapar(NOMBRE_DESDE)}</p>
        <p style="{_TIPO};margin:7px 0 0;font-size:13px;color:{ORO}">{encabezado}</p>
      </td></tr>

      <tr><td style="height:3px;background:{ORO};font-size:0;line-height:0">&nbsp;</td></tr>

      <tr><td style="padding:10px 32px 32px">{cuerpo}</td></tr>

      <tr><td style="border-top:1px solid {BORDE};padding:18px 32px;background:{PAPEL}">
        <p style="{_TIPO};margin:0;font-size:11px;color:{SUAVE};line-height:1.6">{pie}</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>"""


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

    # ── versión en texto plano (va primero: es la alternativa de respaldo) ──
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

    # ── versión con diseño ──
    pedidos = "".join(
        f'<tr><td style="{_TIPO};font-size:14px;color:{TINTA};padding:9px 0;'
        f'border-bottom:1px solid {BORDE}">{escapar(p)}</td></tr>'
        for p in productos
    ) or (f'<tr><td style="{_TIPO};font-size:14px;color:{SUAVE};padding:9px 0">'
          f'Lo conversamos con usted</td></tr>')

    cuerpo = (
        f'<p style="{_TIPO};font-size:15px;color:{TINTA};line-height:1.7;margin:24px 0 0">'
        f'{escapar(saludo)}:</p>'
        f'<p style="{_TIPO};font-size:15px;color:{TINTA};line-height:1.7;margin:14px 0 0">'
        f'Recibimos su solicitud de cotización. Gracias por escribirnos.</p>'
        + _titulo("Nos pidió información sobre")
        + f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" '
          f'width="100%">{pedidos}</table>'
        + f'<p style="{_TIPO};font-size:15px;color:{TINTA};line-height:1.7;margin:26px 0 0">'
          f'Estamos preparando la propuesta con telas, medidas, plazos y valores, y le '
          f'respondemos dentro de las próximas <b>24 horas hábiles</b>.</p>'
        + f'<p style="{_TIPO};font-size:15px;color:{TINTA};line-height:1.7;margin:14px 0 0">'
          f'Si necesita algo antes, puede llamarnos al '
          f'<a href="tel:{escapar(TELEFONO.replace(" ", ""))}" '
          f'style="color:{TINTA};font-weight:bold">{escapar(TELEFONO)}</a>.</p>'
        + f'<p style="{_TIPO};font-size:14px;color:{SUAVE};line-height:1.7;margin:26px 0 0">'
          f'San José 5887, San Miguel &middot; Santiago</p>'
    )
    m.add_alternative(
        _envoltorio(
            "Solicitud de cotización recibida",
            cuerpo,
            "Este mensaje se generó automáticamente porque alguien completó el "
            f"formulario de cotización en {escapar(SITIO)} con esta dirección de correo. "
            "Si no fue usted, puede ignorarlo: no le volveremos a escribir.",
        ),
        subtype="html",
    )
    _enviar(m)


def aviso_interno(
    nombre: str, correo: str, telefono: str, empresa: str,
    productos: list[str], mensaje: str
) -> None:
    """La copia para la casa: acá sí va todo, texto libre incluido."""
    quien = una_linea(nombre, 80) or "Alguien"
    empresa = una_linea(empresa, 120)
    resumen = resumen_corto(productos)
    fecha = datetime.now().strftime("%d/%m/%Y a las %H:%M")

    m = _base(f"Cotización: {quien} — {resumen}", INTERNO, responder_a=correo)

    # ── versión en texto plano ──
    lineas = [f"  Nombre      {quien}"]
    if empresa:
        lineas.append(f"  Empresa     {empresa}")
    lineas.append(f"  Correo      {correo}")
    lineas.append(f"  Teléfono    {telefono or 'no lo dejó'}")

    m.set_content(
        f"""NUEVA SOLICITUD DE COTIZACIÓN
{fecha}

DATOS DE CONTACTO
{chr(10).join(lineas)}

PRODUCTOS DE INTERÉS
{lista_bonita(productos)}

MENSAJE
{mensaje or "(no escribió nada más)"}

—
{NOMBRE_DESDE} · {SITIO}
"""
    )

    # ── versión con diseño ──
    filas = _fila("Nombre", escapar(quien))
    if empresa:
        filas += _fila("Empresa", escapar(empresa))
    filas += _fila(
        "Correo",
        f'<a href="mailto:{escapar(correo)}" style="color:{TINTA}">{escapar(correo)}</a>',
    )
    filas += _fila("Teléfono", escapar(telefono) if telefono
                   else f'<span style="color:{SUAVE}">No lo dejó</span>')

    pedidos = "".join(
        f'<tr><td style="{_TIPO};font-size:14px;color:{TINTA};padding:9px 0;'
        f'border-bottom:1px solid {BORDE}">{escapar(p)}</td></tr>'
        for p in productos
    ) or (f'<tr><td style="{_TIPO};font-size:14px;color:{SUAVE};padding:9px 0">'
          f'Sin especificar</td></tr>')

    texto = escapar(mensaje).replace("\n", "<br>") if mensaje else (
        f'<span style="color:{SUAVE}">No escribió nada más.</span>')

    cuerpo = (
        _titulo("Datos de contacto")
        + f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" '
          f'width="100%">{filas}</table>'
        + _titulo("Productos de interés")
        + f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" '
          f'width="100%">{pedidos}</table>'
        + _titulo("Mensaje")
        + f'<div style="{_TIPO};font-size:14px;color:{TINTA};line-height:1.7;'
          f'background:{FONDO};border-left:2px solid {ORO};padding:14px 16px">{texto}</div>'
    )

    m.add_alternative(
        _envoltorio(
            f"Nueva solicitud · {escapar(fecha)}",
            cuerpo,
            f"{escapar(NOMBRE_DESDE)} &middot; {escapar(SITIO)}",
        ),
        subtype="html",
    )
    _enviar(m)
