"""PDF de una cotización formal.

Imprime el neto, el IVA y el total tal como quedaron guardados.
No los vuelve a calcular: si en el panel se editaron a mano, eso es lo que sale.
"""

from io import BytesIO
from pathlib import Path

from PIL import Image
from reportlab.lib.colors import Color
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

LOGO = Path(__file__).resolve().parent / "logo.png"

ORO = Color(185 / 255, 154 / 255, 114 / 255)       # #B99A72
TINTA = Color(17 / 255, 17 / 255, 18 / 255)        # #111112
DIM = Color(110 / 255, 105 / 255, 97 / 255)        # #6E6961
LINEA = Color(0.85, 0.82, 0.78)
FONDO = Color(0.96, 0.95, 0.93)

MESES = (
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
)

PIE = "San José 5887, San Miguel  ·  +56 9 9919 4045  ·  contacto@acolchadoscd.cl"


def xml(texto) -> str:
    return (
        str(texto or "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def pesos(valor) -> str:
    return "$ " + f"{int(valor):,}".replace(",", ".")


def fecha_larga(iso_fecha: str) -> str:
    try:
        anio, mes, dia = iso_fecha.split("-")
        return f"{int(dia)} de {MESES[int(mes) - 1]} de {anio}"
    except (ValueError, IndexError):
        return iso_fecha or ""


def _marca() -> tuple[bytes, tuple[int, int]] | None:
    """Logo con la opacidad baja, para usarlo de marca de agua."""
    if not LOGO.is_file():
        return None
    imagen = Image.open(LOGO).convert("RGBA")
    rojo, verde, azul, alfa = imagen.split()
    alfa = alfa.point(lambda punto: int(punto * 0.14))
    tenue = Image.merge("RGBA", (rojo, verde, azul, alfa))
    salida = BytesIO()
    tenue.save(salida, format="PNG")
    return salida.getvalue(), imagen.size


def generar_pdf(cotizacion: dict) -> bytes:
    buffer = BytesIO()
    marca = _marca()
    ancho_pagina, alto_pagina = A4

    def pagina(lienzo, _doc):
        lienzo.saveState()
        if marca is not None:
            datos, (px_ancho, px_alto) = marca
            ancho = 95 * mm
            alto = ancho * px_alto / px_ancho
            lienzo.drawImage(
                ImageReader(BytesIO(datos)),
                (ancho_pagina - ancho) / 2,
                (alto_pagina - alto) / 2,
                width=ancho,
                height=alto,
                mask="auto",
                preserveAspectRatio=True,
            )
        lienzo.setStrokeColor(ORO)
        lienzo.setLineWidth(0.6)
        lienzo.line(18 * mm, 16 * mm, ancho_pagina - 18 * mm, 16 * mm)
        lienzo.setFillColor(DIM)
        lienzo.setFont("Helvetica", 8)
        lienzo.drawCentredString(ancho_pagina / 2, 10 * mm, PIE)
        lienzo.restoreState()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=16 * mm,
        bottomMargin=22 * mm,
        title=f"Cotización {cotizacion.get('numero', '')}",
        author="Acolchados CD",
    )

    marca_nombre = ParagraphStyle(
        "marca", fontName="Times-Bold", fontSize=18, textColor=TINTA, leading=22,
    )
    sub = ParagraphStyle(
        "sub", fontName="Helvetica", fontSize=9, textColor=DIM, leading=12,
    )
    titulo = ParagraphStyle(
        "titulo", fontName="Helvetica-Bold", fontSize=11, textColor=TINTA, leading=14,
    )
    normal = ParagraphStyle(
        "normal", fontName="Helvetica", fontSize=9, textColor=TINTA, leading=12,
    )
    tenue = ParagraphStyle(
        "tenue", fontName="Helvetica", fontSize=8, textColor=DIM, leading=11,
    )
    derecha = ParagraphStyle(
        "derecha", fontName="Helvetica", fontSize=9, textColor=TINTA,
        alignment=TA_RIGHT, leading=12,
    )
    derecha_fuerte = ParagraphStyle(
        "derecha_fuerte", fontName="Helvetica-Bold", fontSize=10, textColor=TINTA,
        alignment=TA_RIGHT, leading=13,
    )
    leyenda = ParagraphStyle(
        "leyenda", fontName="Helvetica", fontSize=8, textColor=ORO, leading=11, spaceAfter=2,
    )
    th = ParagraphStyle(
        "th", fontName="Helvetica", fontSize=7, textColor=DIM, leading=9,
    )
    celda = ParagraphStyle(
        "celda", fontName="Helvetica", fontSize=8, textColor=TINTA, leading=10,
    )
    celda_der = ParagraphStyle(
        "celda_der", fontName="Helvetica", fontSize=8, textColor=TINTA,
        alignment=TA_RIGHT, leading=10,
    )

    historia = [
        Paragraph("ACOLCHADOS CD", marca_nombre),
        Paragraph("textil de alta gama", sub),
        Spacer(1, 4 * mm),
        HRFlowable(width="100%", thickness=0.8, color=ORO, spaceBefore=0, spaceAfter=4 * mm),
    ]

    cabecera = Table(
        [
            [
                Paragraph(xml(cotizacion.get("numero")), titulo),
                Paragraph(xml(fecha_larga(cotizacion.get("fecha", ""))), derecha),
            ],
            [
                Paragraph(f"Válida por {int(cotizacion.get('validez_dias') or 0)} días", tenue),
                "",
            ],
        ],
        colWidths=[90 * mm, 84 * mm],
    )
    cabecera.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 1),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
    ]))
    historia.append(cabecera)
    historia.append(Spacer(1, 5 * mm))
    historia.append(Paragraph("SOLICITANTE", leyenda))

    quien = f"<b>{xml(cotizacion.get('solicitante')) or '—'}</b>"
    if cotizacion.get("empresa"):
        quien += f"<br/>{xml(cotizacion['empresa'])}"
    contacto = " · ".join(
        xml(parte) for parte in (cotizacion.get("telefono"), cotizacion.get("correo")) if parte
    )
    if contacto:
        quien += f"<br/>{contacto}"
    historia.append(Paragraph(quien, normal))
    historia.append(Spacer(1, 6 * mm))

    filas = [[
        Paragraph(nombre, th)
        for nombre in ("Producto", "Tamaño", "Detalle", "Cant.", "P. unit. neto", "Subtotal")
    ]]
    for linea in cotizacion.get("lineas") or []:
        cantidad = int(linea.get("cantidad") or 0)
        precio = int(linea.get("precio") or 0)
        filas.append([
            Paragraph(xml(linea.get("nombre")) or "—", celda),
            Paragraph(xml(linea.get("tamano")) or "—", celda),
            Paragraph(xml(linea.get("detalle")) or "—", celda),
            Paragraph(str(cantidad), celda_der),
            Paragraph(pesos(precio), celda_der),
            Paragraph(pesos(cantidad * precio), celda_der),
        ])

    tabla = Table(
        filas,
        colWidths=[42 * mm, 22 * mm, 48 * mm, 14 * mm, 24 * mm, 24 * mm],
        repeatRows=1,
    )
    tabla.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), FONDO),
        ("LINEBELOW", (0, 0), (-1, 0), 0.4, ORO),
        ("LINEBELOW", (0, 1), (-1, -1), 0.2, LINEA),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 3),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    historia.append(tabla)
    historia.append(Spacer(1, 5 * mm))

    totales = Table(
        [
            [Paragraph("Neto", tenue), Paragraph(pesos(cotizacion.get("neto") or 0), derecha)],
            [Paragraph("IVA 19 %", tenue), Paragraph(pesos(cotizacion.get("iva") or 0), derecha)],
            [
                Paragraph("<b>Total</b>", normal),
                Paragraph(f"<b>{pesos(cotizacion.get('total') or 0)}</b>", derecha_fuerte),
            ],
        ],
        colWidths=[40 * mm, 36 * mm],
        hAlign="RIGHT",
    )
    totales.setStyle(TableStyle([
        ("LINEABOVE", (0, 2), (-1, 2), 0.6, ORO),
        ("LEFTPADDING", (0, 0), (-1, -1), 2),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    historia.append(totales)

    nota = str(cotizacion.get("nota") or "").strip()
    if nota:
        historia.append(Spacer(1, 8 * mm))
        historia.append(Paragraph("NOTA", leyenda))
        historia.append(Paragraph(xml(nota).replace("\n", "<br/>"), tenue))

    doc.build(historia, onFirstPage=pagina, onLaterPages=pagina)
    return buffer.getvalue()
