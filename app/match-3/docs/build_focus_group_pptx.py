#!/usr/bin/env python3
"""Build the Match-3 América focus-group deck (Spanish, night-cyan)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Inches, Pt

# --- paths ---
REPO = Path(__file__).resolve().parents[3]
V42 = REPO / "app/match-3/iterations/v4.2/assets"
DS = Path("/agent/repos/design-system/generated-assets/match-3")
ART = Path("/opt/cursor/artifacts")
STAGING = Path("/tmp/ppt-fg")
OUT_REPO = Path(__file__).resolve().parent / "focus-group-match-3-america.pptx"
OUT_ART = ART / "focus-group-match-3-america.pptx"

# --- palette ---
NAVY = RGBColor(0x00, 0x1B, 0x2E)
NAVY_CARD = RGBColor(0x00, 0x2C, 0x45)
NAVY_DEEP = RGBColor(0x00, 0x14, 0x22)
CYAN = RGBColor(0x7E, 0xE8, 0xF7)
TEAL = RGBColor(0x00, 0xA8, 0xC6)
ORANGE = RGBColor(0xE6, 0x7E, 0x22)
WHITE = RGBColor(0xF8, 0xF9, 0xF9)
MUTED = RGBColor(0xA8, 0xD4, 0xDE)

SLIDE_W = 13.333
SLIDE_H = 7.5
FONT = "Calibri"


def _set_run_font(run, size: int, color: RGBColor, bold: bool = False) -> None:
    run.font.size = Pt(size)
    run.font.color.rgb = color
    run.font.bold = bold
    run.font.name = FONT
    run.font.italic = False


def _solid_bg(slide, color: RGBColor = NAVY) -> None:
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = color


def _shape_fill(shape, color: RGBColor, line: RGBColor | None = None, line_pt: float = 1.25) -> None:
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    if line is None:
        shape.line.fill.background()
    else:
        shape.line.color.rgb = line
        shape.line.width = Pt(line_pt)


def _round(shape, adj: float = 0.08) -> None:
    try:
        shape.adjustments[0] = adj
    except Exception:
        pass


def add_rect(slide, x, y, w, h, color, line=None, rounded=False, adj=0.1):
    kind = MSO_SHAPE.ROUNDED_RECTANGLE if rounded else MSO_SHAPE.RECTANGLE
    sh = slide.shapes.add_shape(kind, Inches(x), Inches(y), Inches(w), Inches(h))
    _shape_fill(sh, color, line)
    if rounded:
        _round(sh, adj)
    sh.shadow.inherit = False
    return sh


def add_textbox(
    slide,
    x,
    y,
    w,
    h,
    text: str,
    size=20,
    color=WHITE,
    bold=False,
    align=PP_ALIGN.LEFT,
    anchor=MSO_ANCHOR.TOP,
    spacing: float | None = 1.05,
):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame
    tf.word_wrap = True
    tf.auto_size = None
    try:
        tf._txBody.bodyPr.set("anchor", {MSO_ANCHOR.TOP: "t", MSO_ANCHOR.MIDDLE: "ctr", MSO_ANCHOR.BOTTOM: "b"}[anchor])
    except Exception:
        pass
    lines = text.split("\n")
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.clear()
        run = p.add_run()
        run.text = line
        _set_run_font(run, size, color, bold)
        if spacing:
            p.line_spacing = spacing
        p.space_after = Pt(4)
    return box


def add_picture(slide, path: Path, x, y, w=None, h=None):
    kwargs = {}
    if w is not None:
        kwargs["width"] = Inches(w)
    if h is not None:
        kwargs["height"] = Inches(h)
    return slide.shapes.add_picture(str(path), Inches(x), Inches(y), **kwargs)


def add_picture_fit(slide, path: Path, x, y, box_w, box_h):
    """Contain image in a box, centered, keeping aspect ratio."""
    with Image.open(path) as im:
        iw, ih = im.size
    aspect = iw / ih
    box_aspect = box_w / box_h
    if aspect > box_aspect:
        w, h = box_w, box_w / aspect
    else:
        h, w = box_h, box_h * aspect
    return add_picture(slide, path, x + (box_w - w) / 2, y + (box_h - h) / 2, w=w)


def footer(slide, page: int, total: int = 13) -> None:
    add_rect(slide, 0, 7.22, SLIDE_W, 0.28, NAVY_DEEP)
    add_textbox(slide, 0.45, 7.22, 8, 0.28, "WIKA  ·  Match-3 América  ·  Focus group", size=11, color=MUTED, anchor=MSO_ANCHOR.MIDDLE)
    add_textbox(
        slide,
        11.2,
        7.22,
        1.7,
        0.28,
        f"{page}  /  {total}",
        size=11,
        color=CYAN,
        align=PP_ALIGN.RIGHT,
        anchor=MSO_ANCHOR.MIDDLE,
        bold=True,
    )


def header(slide, kicker: str, title: str) -> None:
    add_rect(slide, 0, 0, SLIDE_W, 0.08, TEAL)
    add_textbox(slide, 0.5, 0.22, 12.3, 0.28, kicker.upper(), size=13, color=ORANGE, bold=True)
    add_textbox(slide, 0.5, 0.46, 12.3, 0.58, title, size=30, color=CYAN, bold=True)
    add_rect(slide, 0.5, 1.08, 2.1, 0.055, TEAL)


def key_black(im: Image.Image, thresh: int = 24) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r <= thresh and g <= thresh and b <= thresh:
                px[x, y] = (0, 0, 0, 0)
    return im


def cover_bg(src: Path, dest: Path) -> None:
    im = Image.open(src).convert("RGB")
    target = (1920, 1080)
    scale = max(target[0] / im.width, target[1] / im.height)
    nw, nh = int(im.width * scale), int(im.height * scale)
    im = im.resize((nw, nh), Image.Resampling.NEAREST)
    left = (nw - target[0]) // 2
    top = max(0, (nh - target[1]) // 6)
    im = im.crop((left, top, left + target[0], top + target[1]))
    navy = Image.new("RGB", target, (0, 27, 46))
    im = Image.blend(im, navy, 0.72)
    im = im.filter(ImageFilter.GaussianBlur(radius=0.6))
    im.save(dest, "PNG")


def prepare_assets() -> dict[str, Path]:
    STAGING.mkdir(parents=True, exist_ok=True)
    assets: dict[str, Path] = {}

    home = Image.open(ART / "v42_hero_home.png").convert("RGB")
    # Hide the internal version line; crop out the creator-code block.
    draw = ImageDraw.Draw(home)
    draw.rectangle((70, 148, 650, 192), fill=(0, 27, 46))
    home.crop((0, 0, 720, 820)).save(STAGING / "home-avatars.png")
    assets["home"] = STAGING / "home-avatars.png"

    travel = Image.open(ART / "v42_hero_travel.png").convert("RGB")
    travel.crop((28, 18, 692, 990)).save(STAGING / "travel-map.png")
    assets["travel"] = STAGING / "travel-map.png"

    board = Image.open(ART / "v41_play_board_closeup_square_cells.png").convert("RGB")
    board.crop((448, 138, 832, 628)).save(STAGING / "board.png")
    assets["board"] = STAGING / "board.png"

    world = Image.open(V42 / "recursos/screens/map-americas.png").convert("RGB")
    world.save(STAGING / "world.png")
    assets["world"] = STAGING / "world.png"
    cover_bg(V42 / "recursos/screens/map-americas.png", STAGING / "cover-bg.png")
    assets["cover_bg"] = STAGING / "cover-bg.png"

    gems = Image.open(DS / "gems.png").convert("RGB")
    gems.crop((40, 280, 1496, 760)).save(STAGING / "gems.png")
    assets["gems"] = STAGING / "gems.png"

    gifts = Image.open(DS / "gifts.png").convert("RGB")
    gifts.crop((40, 80, 1496, 960)).save(STAGING / "gifts.png")
    assets["gifts"] = STAGING / "gifts.png"

    for code in ("mx", "co", "pe", "br", "ar"):
        p = DS / "cast" / f"{code}.png"
        Image.open(p).convert("RGB").save(STAGING / f"cast-{code}.png")
        assets[f"cast_{code}"] = STAGING / f"cast-{code}.png"

    # 8-bit player avatars row (home portraits)
    row = Image.new("RGB", (256 * 6 + 10 * 5, 256), (0, 27, 46))
    x = 0
    for name in ("m1", "m2", "m3", "w1", "w2", "w3"):
        av = Image.open(V42 / "avatars" / f"avatar-{name}.png").convert("RGBA")
        canvas = Image.new("RGBA", (256, 256), (0, 44, 69, 255))
        canvas.alpha_composite(av)
        row.paste(canvas.convert("RGB"), (x, 0))
        x += 266
    row.save(STAGING / "avatar-row.png")
    assets["avatar_row"] = STAGING / "avatar-row.png"

    plane_gif = V42 / "recursos/ui/plane.gif"
    g = Image.open(plane_gif)
    g.seek(0)
    plane = key_black(g.convert("RGBA"))
    pad = Image.new("RGBA", (160, 160), (0, 44, 69, 255))
    plane = plane.resize((128, 128), Image.Resampling.NEAREST)
    pad.alpha_composite(plane, (16, 16))
    pad.save(STAGING / "plane.png")
    assets["plane"] = STAGING / "plane.png"

    # Mini country strip for "qué es"
    strip = Image.new("RGB", (1024 * 5 + 16 * 4, 1024), (0, 27, 46))
    x = 0
    for code in ("mx", "co", "pe", "br", "ar"):
        im = Image.open(STAGING / f"cast-{code}.png").convert("RGB")
        strip.paste(im, (x, 0))
        x += 1040
    strip.resize((1300, 250), Image.Resampling.LANCZOS).save(STAGING / "cast-strip.png")
    assets["cast_strip"] = STAGING / "cast-strip.png"

    return assets


def question_card(slide, x, y, w, h, number: str, text: str) -> None:
    add_rect(slide, x, y, w, h, NAVY_CARD, TEAL, rounded=True, adj=0.12)
    add_rect(slide, x, y, 0.12, h, ORANGE)
    add_textbox(slide, x + 0.32, y + 0.22, 0.7, 0.5, number, size=22, color=ORANGE, bold=True)
    add_textbox(
        slide,
        x + 0.95,
        y + 0.22,
        w - 1.25,
        h - 0.44,
        text,
        size=20,
        color=WHITE,
        bold=False,
        anchor=MSO_ANCHOR.MIDDLE,
        spacing=1.15,
    )


def build(assets: dict[str, Path]) -> Presentation:
    prs = Presentation()
    prs.slide_width = Inches(SLIDE_W)
    prs.slide_height = Inches(SLIDE_H)
    blank = prs.slide_layouts[6]

    # 1. Portada
    s = prs.slides.add_slide(blank)
    _solid_bg(s)
    add_picture(s, assets["cover_bg"], 0, 0, SLIDE_W, SLIDE_H)
    add_rect(s, 0, 0, 8.4, SLIDE_H, NAVY)
    add_rect(s, 8.15, 0, 0.12, SLIDE_H, TEAL)
    add_textbox(s, 0.7, 1.55, 7.2, 0.35, "WIKA  ·  FOCUS GROUP", size=16, color=ORANGE, bold=True)
    add_textbox(s, 0.7, 1.95, 7.2, 1.7, "Match-3\nAmérica", size=52, color=CYAN, bold=True, spacing=0.92)
    add_rect(s, 0.7, 3.8, 2.4, 0.07, ORANGE)
    add_textbox(
        s,
        0.7,
        4.1,
        7.0,
        1.3,
        "Puzzle + mapa del continente +\npersonajes por país.",
        size=22,
        color=WHITE,
    )
    add_textbox(s, 0.7, 6.55, 7.0, 0.4, "Sesión 15–20 min  +  debate", size=16, color=MUTED)
    add_picture_fit(s, assets["home"], 8.55, 0.35, 4.5, 6.7)
    footer(s, 1)

    # 2. Hoy vamos a
    s = prs.slides.add_slide(blank)
    _solid_bg(s)
    header(s, "Guion", "Hoy vamos a…")
    cards = [
        ("01", "Ver el juego", "Puzzle, mapa y personajes.\nDecir si se entiende."),
        ("02", "Hablar del look", "¿Se siente 8-bit?\n¿Hay suficiente anime?"),
        ("03", "Hablar de dinero", "Anuncios, compras y un pack\ndel juego sin ads."),
    ]
    for i, (num, title, body) in enumerate(cards):
        x = 0.5 + i * 4.2
        add_rect(s, x, 1.5, 3.95, 4.85, NAVY_CARD, TEAL, rounded=True, adj=0.08)
        add_textbox(s, x + 0.3, 1.75, 3.3, 0.5, num, size=28, color=ORANGE, bold=True)
        add_textbox(s, x + 0.3, 2.4, 3.35, 1.0, title, size=26, color=CYAN, bold=True)
        add_textbox(s, x + 0.3, 3.55, 3.35, 2.0, body, size=18, color=WHITE)
    footer(s, 2)

    # 3. Qué es
    s = prs.slides.add_slide(blank)
    _solid_bg(s)
    header(s, "Producto", "Tres piezas, un juego")
    blocks = [
        (assets["board"], "Match-3", "Junta gemas contra\nel reloj. Ganas monedas."),
        (assets["travel"], "Mapa", "América. Viajas de\npaís en país."),
        (assets["cast_mx"], "Personajes", "4 por país. Los conquistas\ny los coleccionas."),
    ]
    for i, (img, title, body) in enumerate(blocks):
        x = 0.5 + i * 4.2
        add_rect(s, x, 1.45, 3.95, 5.5, NAVY_CARD, TEAL, rounded=True, adj=0.07)
        add_picture_fit(s, img, x + 0.22, 1.6, 3.5, 3.4)
        add_textbox(s, x + 0.28, 5.15, 3.4, 0.45, title, size=22, color=CYAN, bold=True)
        add_textbox(s, x + 0.28, 5.6, 3.4, 1.1, body, size=16, color=WHITE)
    footer(s, 3)

    # 4. Puzzle
    s = prs.slides.add_slide(blank)
    _solid_bg(s)
    header(s, "Funcionalidad", "El puzzle")
    add_rect(s, 0.45, 1.4, 6.35, 5.55, NAVY_CARD, TEAL, rounded=True, adj=0.05)
    add_picture_fit(s, assets["board"], 0.6, 1.55, 6.05, 5.25)
    add_picture_fit(s, assets["gems"], 7.05, 1.4, 5.8, 1.55)
    facts = [
        ("Tablero 8 × 10", "Gemas de cinco colores. Una partida, un país."),
        ("Tiempo", "El reloj corre. Si se acaba, pánico: se pone feo."),
        ("Premio", "Cuanto más rápido, más monedas."),
    ]
    for i, (t, b) in enumerate(facts):
        y = 3.15 + i * 1.2
        add_rect(s, 7.05, y, 5.8, 1.08, NAVY_CARD, TEAL, rounded=True, adj=0.14)
        add_textbox(s, 7.25, y + 0.12, 5.4, 0.38, t, size=20, color=CYAN, bold=True)
        add_textbox(s, 7.25, y + 0.5, 5.4, 0.45, b, size=16, color=WHITE)
    footer(s, 4)

    # 5. Mapa
    s = prs.slides.add_slide(blank)
    _solid_bg(s)
    header(s, "Funcionalidad", "El mapa de América")
    add_rect(s, 0.45, 1.4, 5.5, 5.55, NAVY_CARD, TEAL, rounded=True, adj=0.05)
    add_picture_fit(s, assets["travel"], 0.6, 1.5, 5.2, 5.35)
    add_textbox(s, 6.2, 1.45, 6.6, 0.7, "Cinco países. Viajas cuando quieres\nconocer a otra gente.", size=20, color=WHITE)
    countries = [
        ("MX", "México"),
        ("CO", "Colombia"),
        ("PE", "Perú"),
        ("BR", "Brasil"),
        ("AR", "Argentina"),
    ]
    for i, (code, name) in enumerate(countries):
        y = 2.35 + i * 0.72
        add_rect(s, 6.2, y, 6.6, 0.64, NAVY_CARD, TEAL, rounded=True, adj=0.2)
        add_textbox(s, 6.4, y, 1.1, 0.64, code, size=18, color=ORANGE, bold=True, anchor=MSO_ANCHOR.MIDDLE)
        add_textbox(s, 7.55, y, 3.6, 0.64, name, size=20, color=WHITE, bold=True, anchor=MSO_ANCHOR.MIDDLE)
    add_textbox(s, 6.2, 6.05, 4.6, 0.85, "El avión 8-bit cruza el mapa al viajar.", size=16, color=MUTED, anchor=MSO_ANCHOR.MIDDLE)
    add_picture_fit(s, assets["plane"], 10.9, 5.95, 1.7, 1.05)
    footer(s, 5)

    # 6. Personajes
    s = prs.slides.add_slide(blank)
    _solid_bg(s)
    header(s, "Funcionalidad", "Personajes: conquistar y coleccionar")
    add_rect(s, 0.45, 1.4, 4.55, 5.55, NAVY_CARD, TEAL, rounded=True, adj=0.05)
    add_textbox(s, 0.65, 1.5, 4.15, 0.35, "México · 4 personajes", size=14, color=ORANGE, bold=True)
    add_picture_fit(s, assets["cast_mx"], 0.6, 1.88, 4.25, 4.9)
    add_rect(s, 5.15, 1.4, 3.7, 5.55, NAVY_CARD, TEAL, rounded=True, adj=0.05)
    add_textbox(s, 5.35, 1.5, 3.3, 0.35, "Regalos · 20 000", size=14, color=ORANGE, bold=True)
    add_picture_fit(s, assets["gifts"], 5.3, 1.88, 3.4, 4.9)
    bullets = [
        ("4 por país", "Cada destino tiene su elenco."),
        ("Regalos", "Los compras en la tienda\n(20 000 monedas)."),
        ("Afinidad", "Regalar sube el vínculo.\nColeccionas al elenco."),
    ]
    for i, (t, b) in enumerate(bullets):
        y = 1.4 + i * 1.85
        add_rect(s, 9.05, y, 3.8, 1.7, NAVY_CARD, TEAL, rounded=True, adj=0.12)
        add_textbox(s, 9.25, y + 0.18, 3.4, 0.4, t, size=20, color=CYAN, bold=True)
        add_textbox(s, 9.25, y + 0.62, 3.4, 0.9, b, size=16, color=WHITE)
    footer(s, 6)

    # 7. Preguntas funcionalidad
    s = prs.slides.add_slide(blank)
    _solid_bg(s)
    header(s, "Funcionalidad  ·  para el grupo", "¿Se entiende? ¿Qué engancha?")
    qs = [
        ("01", "¿Se entiende qué hay que hacer?\n¿Cómo se unen puzzle, mapa y personajes?"),
        ("02", "Si pudieras pedir una cosa\nque falta, ¿cuál sería?"),
        ("03", "Entre el mapa y el puzzle,\n¿qué te engancha más? ¿Por qué?"),
        ("04", "¿Coleccionar personajes te da ganas\nde seguir, o se siente de relleno?"),
    ]
    for i, (n, q) in enumerate(qs):
        col = i % 2
        row = i // 2
        question_card(s, 0.5 + col * 6.4, 1.45 + row * 2.7, 6.15, 2.45, n, q)
    footer(s, 7)

    # 8. Diseño
    s = prs.slides.add_slide(blank)
    _solid_bg(s)
    header(s, "Diseño", "8-bit + anime, de noche")
    add_rect(s, 0.45, 1.4, 4.3, 5.55, NAVY_CARD, TEAL, rounded=True, adj=0.05)
    add_picture_fit(s, assets["home"], 0.58, 1.52, 4.05, 5.3)
    add_rect(s, 4.9, 1.4, 4.15, 3.35, NAVY_CARD, TEAL, rounded=True, adj=0.05)
    add_picture_fit(s, assets["travel"], 5.05, 1.5, 3.85, 3.15)
    add_rect(s, 4.9, 4.9, 4.15, 2.05, NAVY_CARD, TEAL, rounded=True, adj=0.08)
    add_picture_fit(s, assets["cast_mx"], 5.05, 4.98, 3.85, 1.88)
    notes = [
        ("Pixel", "Tablero, mapa y avión 8-bit."),
        ("Anime", "Retratos de personajes, más ilustración."),
        ("Noche", "Cyan sobre marino. Se lee de lejos."),
    ]
    for i, (t, b) in enumerate(notes):
        y = 1.4 + i * 1.85
        add_rect(s, 9.2, y, 3.65, 1.7, NAVY_CARD, TEAL, rounded=True, adj=0.12)
        add_textbox(s, 9.4, y + 0.2, 3.25, 0.4, t, size=20, color=ORANGE, bold=True)
        add_textbox(s, 9.4, y + 0.65, 3.25, 0.85, b, size=16, color=WHITE)
    footer(s, 8)

    # 9. Preguntas diseño
    s = prs.slides.add_slide(blank)
    _solid_bg(s)
    header(s, "Diseño  ·  para el grupo", "¿Se siente 8-bit? ¿Anime suficiente?")
    qs = [
        ("01", "¿Se siente un juego 8-bit,\no un juego de ahora con filtros?"),
        ("02", "Los retratos: ¿hay suficiente anime,\no preferirías que todo fuera pixel?"),
        ("03", "Colores de noche (cyan / marino):\n¿gustan, o los ves fríos / tristes?"),
        ("04", "Si tuvieras que cambiar UNA cosa\nde la cara del juego, ¿cuál?"),
    ]
    for i, (n, q) in enumerate(qs):
        col = i % 2
        row = i // 2
        question_card(s, 0.5 + col * 6.4, 1.45 + row * 2.7, 6.15, 2.45, n, q)
    footer(s, 9)

    # 10. Negocio
    s = prs.slides.add_slide(blank)
    _solid_bg(s)
    header(s, "Modelo de negocio", "Tres vías. Ninguna está cerrada.")
    biz = [
        (ORANGE, "Publicidad", "Ads", "Anuncios entre niveles\ny para revivir.\n\nGratis de entrar.\nPagas con atención."),
        (TEAL, "Compras in-app", "IAP", "Monedas y objetos.\nTienda: regalos a 20 000.\n\nQuien quiere ir más rápido,\npaga ahí."),
        (CYAN, "Juego sin ads", "Premium", "Compras el juego\nsin anuncios.\n\nLleva un paquete de\nmonedas de regalo."),
    ]
    for i, (accent, title, tag, body) in enumerate(biz):
        x = 0.5 + i * 4.2
        add_rect(s, x, 1.4, 3.95, 5.55, NAVY_CARD, accent, rounded=True, adj=0.07)
        add_rect(s, x, 1.4, 3.95, 0.12, accent)
        add_textbox(s, x + 0.3, 1.7, 3.35, 0.35, tag.upper(), size=13, color=accent, bold=True)
        add_textbox(s, x + 0.3, 2.1, 3.35, 1.0, title, size=26, color=WHITE, bold=True)
        add_textbox(s, x + 0.3, 3.3, 3.35, 3.2, body, size=18, color=WHITE)
    footer(s, 10)

    # 11. Preguntas negocio
    s = prs.slides.add_slide(blank)
    _solid_bg(s)
    header(s, "Negocio  ·  para el grupo", "¿Ads, pagar, o las dos?")
    qs = [
        ("01", "¿Aguantarías anuncios entre niveles\na cambio de jugar gratis?"),
        ("02", "¿Cuánto pagarías por quitar los anuncios?\nDi un número, aunque sea aproximado."),
        ("03", "¿Comprarías monedas o regalos,\no eso te saca del juego?"),
        ("04", "Pack “sin ads + monedas”:\n¿lo ves claro, o solo quitar ads?"),
    ]
    for i, (n, q) in enumerate(qs):
        col = i % 2
        row = i // 2
        question_card(s, 0.5 + col * 6.4, 1.45 + row * 2.7, 6.15, 2.45, n, q)
    footer(s, 11)

    # 12. Flujo
    s = prs.slides.add_slide(blank)
    _solid_bg(s)
    header(s, "Cómo se gana hoy", "Un círculo, no un callejón")
    steps = [
        ("1", "Jugar", "Match-3"),
        ("2", "Monedas", "Premio"),
        ("3", "Regalos", "Tienda"),
        ("4", "Personajes", "Afinidad"),
        ("5", "Viajar", "Mapa"),
    ]
    for i, (n, title, sub) in enumerate(steps):
        x = 0.45 + i * 2.55
        add_rect(s, x, 1.7, 2.3, 2.35, NAVY_CARD, TEAL, rounded=True, adj=0.12)
        add_textbox(s, x + 0.15, 1.85, 2.0, 0.4, n, size=20, color=ORANGE, bold=True, align=PP_ALIGN.CENTER)
        add_textbox(s, x + 0.1, 2.35, 2.1, 0.7, title, size=22, color=CYAN, bold=True, align=PP_ALIGN.CENTER)
        add_textbox(s, x + 0.1, 3.1, 2.1, 0.55, sub, size=16, color=WHITE, align=PP_ALIGN.CENTER)
        if i < 4:
            arr = s.shapes.add_shape(
                MSO_SHAPE.RIGHT_ARROW,
                Inches(x + 2.22),
                Inches(2.55),
                Inches(0.32),
                Inches(0.28),
            )
            _shape_fill(arr, ORANGE)
    add_textbox(s, 0.5, 4.3, 12.3, 0.4, "Dos atajos que no rompen el círculo:", size=18, color=MUTED)
    add_rect(s, 0.45, 4.85, 6.05, 2.05, NAVY_CARD, ORANGE, rounded=True, adj=0.1)
    add_textbox(s, 0.7, 5.05, 5.6, 0.4, "Publicidad y compras", size=20, color=ORANGE, bold=True)
    add_textbox(s, 0.7, 5.5, 5.6, 1.1, "Suman monedas. El círculo sigue igual:\njugar → regalar → viajar.", size=16, color=WHITE)
    add_rect(s, 6.75, 4.85, 6.1, 2.05, NAVY_CARD, CYAN, rounded=True, adj=0.1)
    add_textbox(s, 7.0, 5.05, 5.6, 0.4, "Pack sin ads", size=20, color=CYAN, bold=True)
    add_textbox(s, 7.0, 5.5, 5.6, 1.1, "Quita interrupciones y regala monedas.\nEl mapa y los personajes no se pagan aparte.", size=16, color=WHITE)
    footer(s, 12)

    # 13. Cierre
    s = prs.slides.add_slide(blank)
    _solid_bg(s)
    header(s, "Cierre", "Gracias. Tres votos rápidos.")
    votes = [
        ("A", "Jugabilidad", "Del 1 al 5:\n¿te dan ganas de\nseguir jugando?"),
        ("B", "Look", "Del 1 al 5:\n¿te gusta cómo\nse ve?"),
        ("C", "¿Pagarían?", "Sí / no / depende.\nUna frase basta."),
    ]
    for i, (letter, title, body) in enumerate(votes):
        x = 0.5 + i * 4.2
        add_rect(s, x, 1.45, 3.95, 4.35, NAVY_CARD, TEAL, rounded=True, adj=0.08)
        add_textbox(s, x + 0.25, 1.7, 3.45, 0.5, letter, size=28, color=ORANGE, bold=True)
        add_textbox(s, x + 0.25, 2.3, 3.45, 0.7, title, size=26, color=CYAN, bold=True)
        add_textbox(s, x + 0.25, 3.2, 3.45, 2.1, body, size=18, color=WHITE)
    add_textbox(
        s,
        0.5,
        6.05,
        12.3,
        0.9,
        "No hay respuesta correcta. Nos sirve tanto el “me encanta” como el “esto no”.",
        size=18,
        color=MUTED,
        align=PP_ALIGN.CENTER,
    )
    footer(s, 13)

    return prs


def render_previews(prs: Presentation, dest: Path) -> None:
    """Rough PNG of each slide for visual QA (not a pixel-perfect PowerPoint render)."""
    from io import BytesIO

    from pptx.enum.shapes import MSO_SHAPE_TYPE

    dest.mkdir(parents=True, exist_ok=True)
    cw, ch = 1920, 1080
    sx = cw / prs.slide_width
    sy = ch / prs.slide_height
    try:
        font_reg = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf", 22)
        font_sm = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf", 16)
    except OSError:
        font_reg = font_sm = ImageFont.load_default()

    for idx, slide in enumerate(prs.slides, 1):
        canvas = Image.new("RGB", (cw, ch), (0, 27, 46))
        draw = ImageDraw.Draw(canvas)
        for shape in slide.shapes:
            x = int(shape.left * sx)
            y = int(shape.top * sy)
            w = max(1, int(shape.width * sx))
            h = max(1, int(shape.height * sy))
            if shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
                im = Image.open(BytesIO(shape.image.blob)).convert("RGBA")
                im = im.resize((w, h), Image.Resampling.LANCZOS)
                canvas.paste(im, (x, y), im)
                continue
            fill_rgb = None
            try:
                if shape.fill.type is not None:
                    c = shape.fill.fore_color.rgb
                    fill_rgb = (int(c[0]), int(c[1]), int(c[2]))
            except Exception:
                fill_rgb = None
            if fill_rgb is not None:
                rad = min(18, max(4, w // 14), max(4, h // 10))
                draw.rounded_rectangle([x, y, x + w, y + h], radius=rad, fill=fill_rgb)
            if shape.has_text_frame:
                text = shape.text_frame.text.strip()
                if text:
                    draw.multiline_text(
                        (x + 10, y + 8),
                        text,
                        font=font_reg if h > 40 else font_sm,
                        fill=(248, 249, 249),
                        spacing=6,
                    )
        out = dest / f"slide-{idx:02d}.png"
        canvas.save(out, "PNG")
        print(f"preview {out}")


def main() -> None:
    assets = prepare_assets()
    prs = build(assets)
    OUT_REPO.parent.mkdir(parents=True, exist_ok=True)
    prs.save(str(OUT_REPO))
    OUT_ART.parent.mkdir(parents=True, exist_ok=True)
    prs.save(str(OUT_ART))
    print(f"slides={len(prs.slides)}")
    print(f"wrote {OUT_REPO}")
    print(f"wrote {OUT_ART}")
    print(f"bytes={OUT_REPO.stat().st_size}")
    preview_dir = STAGING / "slides"
    render_previews(prs, preview_dir)


if __name__ == "__main__":
    main()
