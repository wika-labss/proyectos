"""Carga inicial del catálogo (tomado del Catálogo 2025 de Acolchados CD).

Los precios son los valores netos del catálogo y el stock parte en 0: es el
administrador quien lo va cargando desde el panel.

Se ejecuta una sola vez:   docker compose exec tienda python semilla.py
Con --forzar vuelve a insertar aunque ya existan productos.
"""

import json
import sys

from main import ahora, bd, iso

FOTO = "https://images.unsplash.com/photo-{}?w=1000&q=80"
CAMA = FOTO.format("1582582621959-48d27397dc69")
PLUMON = FOTO.format("1631049307264-da0ec9d70304")
COLCHA = FOTO.format("1616594039964-ae9021a400a0")
PIECERA = FOTO.format("1540518614846-7eded433c457")
COJIN = FOTO.format("1616627561950-9f746e330187")
MANTEL = FOTO.format("1519710164239-da123dc03ef4")
BORDADO = FOTO.format("1600166898405-da9535204843")

# Paletas que menciona el catálogo
LISOS = [
    ("Blanco", "#F4F2ED"),
    ("Azul marino", "#1F2A44"),
    ("Beige", "#D8C5A8"),
    ("Gris", "#8B8D8F"),
]
RUSTICAS = [
    ("Beige oscuro", "#B49A75"),
    ("Beige claro", "#E6D9C3"),
    ("Azul marino", "#1F2A44"),
    ("Gris", "#8B8D8F"),
    ("Pistacho", "#9CB98C"),
    ("Negro", "#1A1A1A"),
]
GAMUZA = [
    ("Café moro", "#5B4636"),
    ("Gris perla", "#C6C3BC"),
    ("Beige", "#D8C5A8"),
]

PLAZAS = ["1 plaza", "1.5 plazas", "2 plazas", "King", "Super King"]


def tallas(medidas, precios, tamanos=None):
    """Arma la lista de variantes emparejando tamaño, medida y precio."""
    tamanos = tamanos or PLAZAS
    return [
        {"tamano": t, "medida": m, "precio": p}
        for t, m, p in zip(tamanos, medidas, precios)
    ]


def x(ancho, alto, extra=""):
    return f"{ancho} x {alto} cm{extra}"


CATALOGO = [
    # ── Sábanas ────────────────────────────────────────────────────────
    {
        "nombre": "Sábana 300 hilos 100% algodón",
        "descripcion": "Juego que incluye sábana superior lisa, sábana bajera elasticada y funda de almohada.",
        "categoria": "dorm", "etiqueta": "Ropa de cama", "imagen": CAMA,
        "colores": LISOS,
        "notas": "Bajera con caída de 40 cm. Fundas de 50x70 (1 y 1.5 plazas) y 50x90 (2 plazas en adelante).",
        "variantes": tallas(
            [x(160, 270), x(175, 270), x(220, 270), x(250, 270), x(270, 270)],
            [27700, 30200, 38800, 44800, 47800],
        ),
    },
    {
        "nombre": "Sábana 200 hilos 50% algodón / 50% poliéster",
        "descripcion": "Juego que incluye sábana superior lisa, sábana bajera elasticada y funda de almohada.",
        "categoria": "dorm", "etiqueta": "Ropa de cama", "imagen": CAMA,
        "colores": LISOS,
        "notas": "Bajera con caída de 40 cm.",
        "variantes": tallas(
            [x(160, 270), x(175, 270), x(220, 270), x(250, 270), x(270, 270)],
            [18900, 20200, 25800, 29800, 31900],
        ),
    },
    {
        "nombre": "Sábana 144 hilos 50% algodón / 50% poliéster",
        "descripcion": "Juego que incluye sábana superior lisa, sábana bajera elasticada y funda de almohada.",
        "categoria": "dorm", "etiqueta": "Ropa de cama", "imagen": CAMA,
        "colores": LISOS,
        "notas": "Bajera con caída de 25 cm. La opción más usada en hotelería por su relación precio/resistencia.",
        "variantes": tallas(
            [x(160, 245), x(175, 245), x(220, 245), x(250, 245), x(270, 245)],
            [12900, 13900, 18900, 20500, 22900],
        ),
    },
    # ── Plumones y quilts ──────────────────────────────────────────────
    {
        "nombre": "Plumón acolchado microfibra",
        "descripcion": "Plumón de microfibra 100% poliéster con relleno parejo y pespunte que evita que se desplace.",
        "categoria": "dorm", "etiqueta": "Dormitorio", "imagen": PLUMON,
        "colores": LISOS,
        "notas": "Relleno napa siliconada de 180 grs/m2. No incluye fundas de almohada.",
        "variantes": tallas(
            [x(180, 240), x(190, 240), x(230, 240), x(260, 240), x(280, 240)],
            [15800, 16800, 19200, 20900, 22900],
        ),
    },
    {
        "nombre": "Plumón acolchado 144 hilos",
        "descripcion": "Plumón en tela de 144 hilos, 50% algodón y 50% poliéster, de tacto más suave que la microfibra.",
        "categoria": "dorm", "etiqueta": "Dormitorio", "imagen": PLUMON,
        "colores": LISOS,
        "notas": "Relleno napa siliconada de 180 grs/m2. No incluye fundas de almohada.",
        "variantes": tallas(
            [x(180, 240), x(190, 240), x(230, 240), x(260, 240), x(280, 240)],
            [21420, 22200, 25900, 27900, 29900],
        ),
    },
    {
        "nombre": "Quilt acolchado microfibra",
        "descripcion": "Quilt liviano de microfibra, ideal para entretiempo o como tapa sobre el plumón.",
        "categoria": "dorm", "etiqueta": "Dormitorio", "imagen": PLUMON,
        "colores": LISOS,
        "notas": "Relleno napa siliconada de 90 grs/m2. No incluye fundas de almohada.",
        "variantes": tallas(
            [x(180, 230), x(190, 230), x(230, 230), x(260, 230), x(280, 230)],
            [15800, 16800, 19200, 20900, 22900],
        ),
    },
    {
        "nombre": "Quilt acolchado 144 hilos",
        "descripcion": "Quilt liviano en tela de 144 hilos, 50% algodón y 50% poliéster.",
        "categoria": "dorm", "etiqueta": "Dormitorio", "imagen": PLUMON,
        "colores": LISOS,
        "notas": "Relleno napa siliconada de 90 grs/m2. No incluye fundas de almohada.",
        "variantes": tallas(
            [x(180, 230), x(190, 230), x(230, 230), x(260, 230), x(280, 230)],
            [21420, 22200, 25900, 27900, 29900],
        ),
    },
    # ── Cubre plumones ─────────────────────────────────────────────────
    {
        "nombre": "Cubre plumón 300 hilos",
        "descripcion": "Funda de plumón en algodón 300 hilos, con terminaciones limpias y caída pareja a ambos lados.",
        "categoria": "dorm", "etiqueta": "Dormitorio", "imagen": COLCHA,
        "colores": LISOS,
        "notas": "Fundas con pestaña y traslape en la misma tela: 50x70 $4.000 · 50x90 $4.350.",
        "variantes": tallas(
            [x(180, 240), x(190, 240), x(230, 240), x(260, 240), x(280, 240)],
            [26900, 28900, 31950, 35500, 38200],
        ),
    },
    {
        "nombre": "Cubre plumón 200 hilos",
        "descripcion": "Funda de plumón en tela de 200 hilos, 50% algodón y 50% poliéster.",
        "categoria": "dorm", "etiqueta": "Dormitorio", "imagen": COLCHA,
        "colores": LISOS,
        "notas": "Fundas con pestaña y traslape: 50x70 $3.700 · 50x90 $4.000.",
        "variantes": tallas(
            [x(180, 240), x(190, 240), x(230, 240), x(260, 240), x(280, 240)],
            [17900, 18900, 21600, 24200, 25700],
        ),
    },
    {
        "nombre": "Cubre plumón 144 hilos",
        "descripcion": "Funda de plumón en tela de 144 hilos, pensada para alta rotación.",
        "categoria": "dorm", "etiqueta": "Dormitorio", "imagen": COLCHA,
        "colores": LISOS,
        "notas": "Fundas con pestaña y traslape: 50x70 $3.400 · 50x90 $3.600. No incluye fundas de almohada.",
        "variantes": tallas(
            [x(180, 240), x(190, 240), x(230, 240), x(260, 240), x(280, 240)],
            [13900, 14600, 17200, 19100, 20800],
        ),
    },
    # ── Colchas y pieceras ─────────────────────────────────────────────
    {
        "nombre": "Colcha con fundas",
        "descripcion": "Colcha acolchada en tapa, confeccionada a la medida exacta de su cama, con fundas a juego.",
        "categoria": "dorm", "etiqueta": "Dormitorio", "imagen": COLCHA,
        "colores": RUSTICAS,
        "notas": "Incluye fundas con traslape en la misma tela, de 50x70 y 50x90 cm.",
        "variantes": tallas(
            [x(180, 240), x(190, 240), x(230, 240), x(260, 240), x(280, 240)],
            [19800, 20800, 25000, 28900, 31900],
        ),
    },
    {
        "nombre": "Colcha sin fundas",
        "descripcion": "La misma colcha acolchada en tapa, sin las fundas de almohada.",
        "categoria": "dorm", "etiqueta": "Dormitorio", "imagen": COLCHA,
        "colores": RUSTICAS,
        "notas": "",
        "variantes": tallas(
            [x(180, 240), x(190, 240), x(230, 240), x(260, 240), x(280, 240)],
            [16900, 17900, 20300, 22600, 24100],
        ),
    },
    {
        "nombre": "Piecera sin cojines",
        "descripcion": "La pieza que le da carácter y orden al conjunto, al pie de la cama.",
        "categoria": "dorm", "etiqueta": "Dormitorio", "imagen": PIECERA,
        "colores": RUSTICAS + GAMUZA,
        "notas": "Telas disponibles: rústicas y gamuza.",
        "variantes": tallas(
            [x(65, 180), x(65, 230), x(65, 260), x(65, 280)],
            [10800, 12500, 13900, 15200],
            ["1.5 plazas", "2 plazas", "King", "Super King"],
        ),
    },
    {
        "nombre": "Piecera con cojines",
        "descripcion": "Piecera con cojines de 45x45 cm en la misma tela y color.",
        "categoria": "dorm", "etiqueta": "Dormitorio", "imagen": PIECERA,
        "colores": RUSTICAS + GAMUZA,
        "notas": "1 y 1.5 plazas incluyen 1 cojín. 2 plazas, King y Super King incluyen 2 cojines.",
        "variantes": tallas(
            [x(65, 180), x(65, 230), x(65, 260), x(65, 280)],
            [14200, 15900, 20700, 22000],
            ["1.5 plazas", "2 plazas", "King", "Super King"],
        ),
    },
    # ── Protección del colchón ─────────────────────────────────────────
    {
        "nombre": "Cubre colchón clásico",
        "descripcion": "Cubre colchón acolchado, encintado en todo su contorno y con elásticos de sujeción.",
        "categoria": "dorm", "etiqueta": "Protección", "imagen": "",
        "colores": [("Blanco", "#F4F2ED")],
        "notas": "Acolchado con napa de 130 grs/m2. Elásticos de 35 mm.",
        "variantes": tallas(
            [x(90, 200), x(105, 200), x(150, 200), x(180, 200), x(200, 200)],
            [7500, 7900, 10800, 12900, 14500],
        ),
    },
    {
        "nombre": "Cubre colchón borde tela (fuelle)",
        "descripcion": "Cubre colchón con fuelle y contorno completamente elasticado, para que no se mueva.",
        "categoria": "dorm", "etiqueta": "Protección", "imagen": "",
        "colores": [("Blanco", "#F4F2ED")],
        "notas": "Elástico de 10 mm en todo el contorno.",
        "variantes": tallas(
            [x(90, 200, " + 40"), x(105, 200, " + 40"), x(150, 200, " + 40"),
             x(180, 200, " + 40"), x(200, 200, " + 40")],
            [10900, 11900, 13800, 15400, 16400],
        ),
    },
    {
        "nombre": "Cubre colchón impermeable",
        "descripcion": "Con capa interior sin costuras que impide el paso de líquidos. Borde tela con fuelle.",
        "categoria": "dorm", "etiqueta": "Protección", "imagen": "",
        "colores": [("Blanco", "#F4F2ED")],
        "notas": "Todo el contorno elasticado, elástico de 10 mm. Muy pedido en hotelería y clínicas.",
        "variantes": tallas(
            [x(90, 200, " + 40"), x(105, 200, " + 40"), x(150, 200, " + 40"),
             x(180, 200, " + 40"), x(200, 200, " + 40")],
            [13500, 14200, 15600, 16900, 17700],
        ),
    },
    {
        "nombre": "Faldón liso 144 hilos",
        "descripcion": "Faldón liso que cubre la base de la cama y unifica el conjunto.",
        "categoria": "dorm", "etiqueta": "Dormitorio", "imagen": "",
        "colores": LISOS,
        "notas": "Caída de 30 cm.",
        "variantes": tallas(
            [x(90, 200, " + 30"), x(105, 200, " + 30"), x(150, 200, " + 30"),
             x(180, 200, " + 30"), x(200, 200, " + 30")],
            [9600, 9900, 10900, 12100, 12900],
        ),
    },
    # ── Complementos ───────────────────────────────────────────────────
    {
        "nombre": "Almohada",
        "descripcion": "Almohada con tela exterior de 144 hilos y relleno de fibra siliconada retardante al fuego.",
        "categoria": "extra", "etiqueta": "Complementos", "imagen": COJIN,
        "colores": [("Blanco", "#F4F2ED")],
        "notas": "Relleno hollowfill siliconado, material retardante al fuego.",
        "variantes": [
            {"tamano": "50 x 70 cm", "medida": "850 grs", "precio": 4800},
            {"tamano": "50 x 90 cm", "medida": "950 grs", "precio": 5200},
        ],
    },
    {
        "nombre": "Almohada impermeable de hule clínico",
        "descripcion": "Superficie 100% lisa, flexible y de fácil limpieza, con ojetillos de ventilación.",
        "categoria": "extra", "etiqueta": "Complementos", "imagen": COJIN,
        "colores": [("Blanco", "#F4F2ED")],
        "notas": "Producto ideal para usos de alta rotación. Usar siempre con funda.",
        "variantes": [
            {"tamano": "50 x 70 cm", "medida": "", "precio": 10900},
            {"tamano": "40 x 90 cm", "medida": "", "precio": 10900},
            {"tamano": "50 x 90 cm", "medida": "", "precio": 12900},
        ],
    },
    {
        "nombre": "Toallas 500 grs",
        "descripcion": "Toallas 100% algodón de 500 grs, suaves y de secado rápido.",
        "categoria": "extra", "etiqueta": "Complementos", "imagen": "",
        "colores": [("Blanco", "#F4F2ED")],
        "notas": "",
        "variantes": [
            {"tamano": "Baño", "medida": x(70, 140), "precio": 6800},
            {"tamano": "Mano", "medida": x(45, 90), "precio": 2950},
        ],
    },
    {
        "nombre": "Toallas 650 grs",
        "descripcion": "Toallas 100% algodón de 650 grs, de mayor densidad y absorción.",
        "categoria": "extra", "etiqueta": "Complementos", "imagen": "",
        "colores": [("Blanco", "#F4F2ED")],
        "notas": "",
        "variantes": [
            {"tamano": "Baño", "medida": x(70, 140), "precio": 8900},
            {"tamano": "Mano", "medida": x(45, 90), "precio": 3650},
        ],
    },
    # ── Servicios ──────────────────────────────────────────────────────
    {
        "nombre": "Mantelería a medida",
        "descripcion": "Manteles rectangulares y redondos, caminos de mesa y servilletas, confeccionados a la medida.",
        "categoria": "mesa", "etiqueta": "Mesa", "imagen": MANTEL,
        "colores": [],
        "notas": "Telas: bistrech, granite y gabardina. Manteles redondos hasta 280 cm de diámetro. Se cotiza según medidas.",
        "variantes": [],
    },
    {
        "nombre": "Servicio de bordado",
        "descripcion": "Iniciales, monogramas y logotipos bordados sobre cualquiera de nuestros textiles o los suyos.",
        "categoria": "mesa", "etiqueta": "Personalización", "imagen": BORDADO,
        "colores": [],
        "notas": "Se cotiza según necesidad. Podemos bordar sin que se note en el lado posterior.",
        "variantes": [],
    },
]


def sembrar(forzar=False):
    momento = iso(ahora())
    with bd() as cx:
        cuantos = cx.execute("SELECT COUNT(*) AS n FROM productos").fetchone()["n"]
        if cuantos and not forzar:
            print(f"Ya hay {cuantos} productos cargados. No se toca nada.")
            print("Si de verdad quieres volver a cargar el catálogo: python semilla.py --forzar")
            return

        for orden, p in enumerate(CATALOGO):
            colores = [{"nombre": n, "hex": h} for n, h in p["colores"]]
            cursor = cx.execute(
                "INSERT INTO productos (nombre, descripcion, categoria, etiqueta, imagen, "
                "colores, notas, visible, orden, creado, actualizado) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)",
                (
                    p["nombre"], p["descripcion"], p["categoria"], p["etiqueta"],
                    p["imagen"], json.dumps(colores, ensure_ascii=False), p["notas"],
                    orden, momento, momento,
                ),
            )
            for i, v in enumerate(p["variantes"]):
                cx.execute(
                    "INSERT INTO variantes (producto_id, tamano, medida, precio, stock, minimo, orden) "
                    "VALUES (?, ?, ?, ?, 0, 0, ?)",
                    (cursor.lastrowid, v["tamano"], v.get("medida", ""), v["precio"], i),
                )

        total = cx.execute("SELECT COUNT(*) AS n FROM variantes").fetchone()["n"]
        print(f"Cargados {len(CATALOGO)} productos y {total} tamaños. El stock parte en 0.")


if __name__ == "__main__":
    sembrar(forzar="--forzar" in sys.argv)
