#!/usr/bin/env python3
"""Genera la presentación Tower V5 (Ember Keep)."""

from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.util import Inches, Pt, Emu

OUT = Path(__file__).resolve().parent / "Tower-V5-Presentacion.pptx"
ARTIFACT = Path("/opt/cursor/artifacts/Tower-V5-Presentacion.pptx")

# Ember Keep palette
NIGHT = RGBColor(0x0A, 0x0E, 0x16)
STEEL = RGBColor(0x1A, 0x22, 0x33)
EMBER = RGBColor(0xE8, 0x5D, 0x04)
GOLD = RGBColor(0xE8, 0xB8, 0x4A)
MIST = RGBColor(0xE8, 0xEE, 0xF5)
MUTED = RGBColor(0x9A, 0xA8, 0xB8)
STONE = RGBColor(0x3A, 0x45, 0x58)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)

W, H = Inches(13.333), Inches(7.5)  # 16:9


def rgb_fill(shape, color: RGBColor):
    shape.fill.solid()
    shape.fill.fore_color.rgb = color


def no_line(shape):
    shape.line.fill.background()


def add_bg(slide, color=NIGHT):
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, W, H)
    rgb_fill(shape, color)
    no_line(shape)
    # send to back
    spTree = slide.shapes._spTree
    sp = shape._element
    spTree.remove(sp)
    spTree.insert(2, sp)
    return shape


def accent_bar(slide, y=0):
    bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, y, W, Inches(0.08))
    rgb_fill(bar, EMBER)
    no_line(bar)


def side_glow(slide):
    glow = slide.shapes.add_shape(
        MSO_SHAPE.OVAL, Inches(-1.2), Inches(-1.5), Inches(4.5), Inches(4.5)
    )
    rgb_fill(glow, RGBColor(0x2A, 0x18, 0x08))
    no_line(glow)


def set_run(run, text, size=18, bold=False, color=MIST, font="Calibri"):
    run.text = text
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    run.font.name = font


def add_title(slide, text, left=Inches(0.7), top=Inches(0.35), width=Inches(12), size=36):
    box = slide.shapes.add_textbox(left, top, width, Inches(0.7))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    set_run(p.add_run(), text, size=size, bold=True, color=MIST)
    return box


def add_kicker(slide, text, left=Inches(0.7), top=Inches(0.15)):
    box = slide.shapes.add_textbox(left, top, Inches(10), Inches(0.3))
    p = box.text_frame.paragraphs[0]
    set_run(p.add_run(), text.upper(), size=12, bold=True, color=EMBER)
    p.font.name = "Calibri"
    return box


def add_body(slide, lines, left=Inches(0.7), top=Inches(1.2), width=Inches(11.8), size=18):
    box = slide.shapes.add_textbox(left, top, width, Inches(5.5))
    tf = box.text_frame
    tf.word_wrap = True
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_after = Pt(10)
        set_run(p.add_run(), line, size=size, color=MUTED if not line.startswith("•") else MIST)
        if line.startswith("•") or line.startswith("–"):
            p.level = 0
    return box


def add_card(slide, left, top, width, height, title, bullets, accent=EMBER):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    rgb_fill(card, STEEL)
    no_line(card)
    stripe = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, Inches(0.1), height)
    rgb_fill(stripe, accent)
    no_line(stripe)

    tbox = slide.shapes.add_textbox(left + Inches(0.28), top + Inches(0.18), width - Inches(0.4), Inches(0.4))
    set_run(tbox.text_frame.paragraphs[0].add_run(), title, size=16, bold=True, color=GOLD)

    bbox = slide.shapes.add_textbox(
        left + Inches(0.28), top + Inches(0.6), width - Inches(0.4), height - Inches(0.75)
    )
    tf = bbox.text_frame
    tf.word_wrap = True
    for i, b in enumerate(bullets):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_after = Pt(6)
        set_run(p.add_run(), f"• {b}", size=13, color=MIST)


def footer(slide, page: int, total: int):
    box = slide.shapes.add_textbox(Inches(0.7), Inches(7.05), Inches(10), Inches(0.3))
    set_run(box.text_frame.paragraphs[0].add_run(), "Tower · WIKA · v5.0.0 Ember Keep", size=11, color=STONE)
    num = slide.shapes.add_textbox(Inches(11.8), Inches(7.05), Inches(1), Inches(0.3))
    p = num.text_frame.paragraphs[0]
    p.alignment = PP_ALIGN.RIGHT
    set_run(p.add_run(), f"{page}/{total}", size=11, color=STONE)


def build():
    prs = Presentation()
    prs.slide_width = W
    prs.slide_height = H
    blank = prs.slide_layouts[6]
    slides_meta = []

    # ——— 1 Portada ———
    s = prs.slides.add_slide(blank)
    add_bg(s)
    side_glow(s)
    accent_bar(s)
    accent_bar(s, Inches(7.42))
    box = s.shapes.add_textbox(Inches(0.9), Inches(2.0), Inches(11), Inches(1.2))
    set_run(box.text_frame.paragraphs[0].add_run(), "TOWER", size=72, bold=True, color=MIST)
    sub = s.shapes.add_textbox(Inches(0.9), Inches(3.3), Inches(11), Inches(0.5))
    set_run(sub.text_frame.paragraphs[0].add_run(), "Defiende la base. Fusiona. Sobrevive.", size=24, color=GOLD)
    meta = s.shapes.add_textbox(Inches(0.9), Inches(4.2), Inches(11), Inches(1.2))
    tf = meta.text_frame
    tf.word_wrap = True
    set_run(tf.paragraphs[0].add_run(), "Presentación de producto · Versión 5.0 (Ember Keep)", size=18, color=MUTED)
    p = tf.add_paragraph()
    set_run(p.add_run(), "Android · Offline · Expo SDK 52 · com.wika.tower", size=15, color=STONE)
    p = tf.add_paragraph()
    set_run(p.add_run(), "Idea · Funcionamiento · Diseño · Monetización", size=15, color=EMBER)
    slides_meta.append(s)

    # ——— 2 Agenda ———
    s = prs.slides.add_slide(blank)
    add_bg(s)
    accent_bar(s)
    add_kicker(s, "Agenda")
    add_title(s, "Enfoque de la presentación")
    items = [
        ("01", "Idea", "Qué es Tower, a quién va y qué problema resuelve"),
        ("02", "Funcionamiento", "Cómo se juega: campaña, fusión, venta, infinito"),
        ("03", "Diseño esperado", "Ember Keep: look, UI y fidelidad visual"),
        ("04", "Monetización", "Modelo freemium, productos y estado IAP"),
    ]
    for i, (num, title, desc) in enumerate(items):
        y = Inches(1.3) + Inches(i * 1.25)
        add_card(s, Inches(0.7), y, Inches(11.8), Inches(1.1), f"{num}  {title}", [desc], EMBER if i % 2 == 0 else GOLD)
    slides_meta.append(s)

    # ——— 3 Idea ———
    s = prs.slides.add_slide(blank)
    add_bg(s)
    accent_bar(s)
    add_kicker(s, "01 · Idea")
    add_title(s, "Qué es Tower")
    add_body(
        s,
        [
            "Tower Defense para Android, 100% offline: coloca torres en un mapa,",
            "detén oleadas de enemigos que siguen un camino hacia tu base.",
            "",
            "• Género clásico y reconocible, con reglas familiares",
            "• Sesiones por nivel (varias oleadas) — fácil de reintentar",
            "• Progresión local sin cuentas, anuncios ni internet",
            "• Stack WIKA: Expo 52 + React Native · APK Release sin Metro",
        ],
        top=Inches(1.15),
        size=18,
    )
    add_card(
        s,
        Inches(0.7),
        Inches(5.0),
        Inches(5.7),
        Inches(1.6),
        "Propuesta de valor",
        [
            "Estrategia accesible en portrait",
            "Progresión medible (25 niveles)",
            "Decisiones tácticas con 4 roles de torre",
        ],
    )
    add_card(
        s,
        Inches(6.7),
        Inches(5.0),
        Inches(5.7),
        Inches(1.6),
        "Usuario objetivo",
        [
            "Casual Android / fan de TD",
            "Jugador offline y de sesiones medias",
            "Quiere progresión sin meta-juego pesado",
        ],
        GOLD,
    )
    slides_meta.append(s)

    # ——— 4 Idea evolución ———
    s = prs.slides.add_slide(blank)
    add_bg(s)
    accent_bar(s)
    add_kicker(s, "01 · Idea")
    add_title(s, "Evolución del producto (V1 → V5)")
    versions = [
        ("V1", "15 mapas · 4 torres · oleadas"),
        ("V2", "25 mapas · prep · alcances"),
        ("V3", "Rebalance · fusión L1–L4"),
        ("V4", "Venta 70% · infinito · shop"),
        ("V5", "UI Ember Keep + APK 5.0.0"),
    ]
    for i, (ver, desc) in enumerate(versions):
        x = Inches(0.55) + Inches(i * 2.5)
        card = slide_card = s.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.5), Inches(2.3), Inches(2.4)
        )
        rgb_fill(slide_card, STEEL)
        no_line(slide_card)
        t = s.shapes.add_textbox(x + Inches(0.15), Inches(1.7), Inches(2.0), Inches(0.5))
        set_run(t.text_frame.paragraphs[0].add_run(), ver, size=28, bold=True, color=EMBER if ver == "V5" else GOLD)
        d = s.shapes.add_textbox(x + Inches(0.15), Inches(2.4), Inches(2.0), Inches(1.3))
        tf = d.text_frame
        tf.word_wrap = True
        set_run(tf.paragraphs[0].add_run(), desc, size=14, color=MIST)
    add_body(
        s,
        [
            "Versión actual de referencia: V5 Ember Keep — engine de V4 intacto,",
            "piel visual del Design System (keep pintado, sprites, chrome de piedra).",
        ],
        top=Inches(4.3),
        size=17,
    )
    slides_meta.append(s)

    # ——— 5 Funcionamiento overview ———
    s = prs.slides.add_slide(blank)
    add_bg(s)
    accent_bar(s)
    add_kicker(s, "02 · Funcionamiento")
    add_title(s, "Loop de partida")
    steps = [
        ("Preparación", "Coloca, fusiona o vende torres antes de la primera oleada."),
        ("Oleadas", "Enemigos spawnean y siguen el path; torres atacan solas."),
        ("Entre oleadas", "Refuerza la defensa con oro ganado."),
        ("Victoria / derrota", "Limpia todas las oleadas o pierde si la base llega a 0 vidas."),
    ]
    for i, (title, desc) in enumerate(steps):
        y = Inches(1.25) + Inches(i * 1.25)
        n = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(0.7), y + Inches(0.15), Inches(0.55), Inches(0.55))
        rgb_fill(n, EMBER)
        no_line(n)
        nt = s.shapes.add_textbox(Inches(0.7), y + Inches(0.25), Inches(0.55), Inches(0.4))
        p = nt.text_frame.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        set_run(p.add_run(), str(i + 1), size=16, bold=True, color=WHITE)
        add_card(s, Inches(1.5), y, Inches(10.9), Inches(1.1), title, [desc])
    slides_meta.append(s)

    # ——— 6 Torres y fusión ———
    s = prs.slides.add_slide(blank)
    add_bg(s)
    accent_bar(s)
    add_kicker(s, "02 · Funcionamiento")
    add_title(s, "Torres, fusión y economía")
    towers = [
        ("Arquera", "DPS single · 50 oro", "L4: Ballesta Élite"),
        ("Cañón", "Splash / área · 75 oro", "L4: Mortero Infernal"),
        ("Hielo", "Ralentiza · 65 oro", "L4: Ventisca Absolute"),
        ("Francotirador", "Largo alcance · 95 oro", "L4: Águila de Ébano"),
    ]
    for i, (name, role, l4) in enumerate(towers):
        x = Inches(0.55) + Inches(i * 3.15)
        add_card(s, x, Inches(1.3), Inches(3.0), Inches(2.3), name, [role, l4])
    add_card(
        s,
        Inches(0.55),
        Inches(3.9),
        Inches(6.0),
        Inches(2.5),
        "Fusión L1 → L4",
        [
            "2 torres mismo tipo y nivel → siguiente nivel",
            "Más daño y cadencia por tier",
            "Nombres épicos en evolución L4",
        ],
    )
    add_card(
        s,
        Inches(6.8),
        Inches(3.9),
        Inches(5.9),
        Inches(2.5),
        "Venta (V4+)",
        [
            "Reembolso ≈ 70% del oro invertido",
            "Ejemplo: gastaste 50 → recuperas 35",
            "Evoluciones suman el oro de las fusionadas",
        ],
        GOLD,
    )
    slides_meta.append(s)

    # ——— 7 Modos ———
    s = prs.slides.add_slide(blank)
    add_bg(s)
    accent_bar(s)
    add_kicker(s, "02 · Funcionamiento")
    add_title(s, "Modos de juego")
    add_card(
        s,
        Inches(0.6),
        Inches(1.3),
        Inches(6.0),
        Inches(4.8),
        "Campaña (25 niveles)",
        [
            "Mapas distintos (path, pads, atmósfera)",
            "Dificultad que escala (HP, cantidad, oleadas)",
            "Progreso local desbloqueable",
            "Preparación + colocación entre/durante oleadas",
            "20 vidas de base · oro por kills",
            "Balance heredado de V3/V4 (N10 jugable)",
        ],
    )
    add_card(
        s,
        Inches(6.9),
        Inches(1.3),
        Inches(5.8),
        Inches(4.8),
        "Modo Infinito",
        [
            "Oleadas sin fin (arena Fortaleza)",
            "HP y cantidad suben por oleada",
            "Misma fusión y venta de torres",
            "Objetivo: sobrevivir el máximo posible",
            "Acceso desde menú / tienda",
            "Ideal para retención y score personal",
        ],
        GOLD,
    )
    slides_meta.append(s)

    # ——— 8 Diseño ———
    s = prs.slides.add_slide(blank)
    add_bg(s)
    accent_bar(s)
    add_kicker(s, "03 · Diseño esperado")
    add_title(s, "Design System Ember Keep")
    add_body(
        s,
        [
            "V5 reformula la UI al 100% sobre la expectativa visual Ember Keep,",
            "manteniendo el motor de juego de V4 intacto.",
        ],
        top=Inches(1.15),
        size=17,
    )
    design_cards = [
        ("Look & feel", ["Keep / piedra pintada", "Chrome de placas", "Paleta noche + ember + oro"]),
        ("Combate", ["Torres y enemigos con sprite", "Pads circulares", "Portón ember / wash de bioma"]),
        ("Chrome UI", ["HUD en plaques", "CTAs recortados de plates", "Armería 2 paneles en tienda"]),
        ("Pantallas", ["Menú: TOWER + campaña/∞", "Victoria / derrota con beat", "How-to con keep + rosters"]),
    ]
    for i, (title, bullets) in enumerate(design_cards):
        x = Inches(0.55) + Inches((i % 4) * 3.15)
        add_card(s, x, Inches(2.3), Inches(3.0), Inches(3.8), title, bullets, EMBER if i % 2 == 0 else GOLD)
    slides_meta.append(s)

    # ——— 9 Diseño principios ———
    s = prs.slides.add_slide(blank)
    add_bg(s)
    accent_bar(s)
    add_kicker(s, "03 · Diseño esperado")
    add_title(s, "Principios de experiencia")
    add_card(
        s,
        Inches(0.6),
        Inches(1.3),
        Inches(6.0),
        Inches(5.0),
        "UX de juego",
        [
            "Portrait-first, una mano / sesión corta",
            "Feedback claro: oro, vidas, oleada",
            "Prep visible antes de comprometerse",
            "Fusión por toque (A → B) sin menús profundos",
            "Venta con preview de reembolso",
            "Pausa con salida limpia al menú",
        ],
    )
    add_card(
        s,
        Inches(6.9),
        Inches(1.3),
        Inches(5.8),
        Inches(5.0),
        "Restricciones de diseño",
        [
            "Offline · sin permisos sensibles",
            "Sin Metro en APK Release",
            "Fidelidad DS Gate 1 aprobada",
            "Engine desacoplado de la piel visual",
            "Tipografía sistema (token DS)",
            "Biomas agrupados (no 25 mapas pintados 1:1)",
        ],
        GOLD,
    )
    slides_meta.append(s)

    # ——— 10 Monetización ———
    s = prs.slides.add_slide(blank)
    add_bg(s)
    accent_bar(s)
    add_kicker(s, "04 · Monetización")
    add_title(s, "Modelo: freemium limpio")
    add_body(
        s,
        [
            "La campaña base es jugable completa offline. La monetización se apoya",
            "en expansiones opcionales — sin anuncios, pay-to-win ni cuentas.",
        ],
        top=Inches(1.15),
        size=17,
    )
    add_card(
        s,
        Inches(0.6),
        Inches(2.3),
        Inches(6.0),
        Inches(4.0),
        "Gratis (core)",
        [
            "25 niveles de campaña",
            "4 torres + fusión L1–L4",
            "Venta con reembolso parcial",
            "Progreso local",
            "Sin ads / sin login",
        ],
    )
    add_card(
        s,
        Inches(6.9),
        Inches(2.3),
        Inches(5.8),
        Inches(4.0),
        "De pago (tienda)",
        [
            "Modo Infinito — $2.99",
            "Pack de Contenido — $4.99",
            "Compra única (IAP), no suscripción",
            "Estado actual: UI visual / stub",
            "Billing Play Store = próximo paso",
        ],
        GOLD,
    )
    slides_meta.append(s)

    # ——— 11 Productos tienda ———
    s = prs.slides.add_slide(blank)
    add_bg(s)
    accent_bar(s)
    add_kicker(s, "04 · Monetización")
    add_title(s, "Productos de la tienda")
    add_card(
        s,
        Inches(0.6),
        Inches(1.25),
        Inches(6.0),
        Inches(5.2),
        "Modo Infinito · $2.99",
        [
            "Oleadas sin fin con dificultad escalable",
            "Arena Fortaleza",
            "HP y cantidad suben por oleada",
            "Misma fusión y venta",
            "Retención post-campaña",
            "Hoy: jugable desde menú; compra = visual",
        ],
    )
    add_card(
        s,
        Inches(6.9),
        Inches(1.25),
        Inches(5.8),
        Inches(5.2),
        "Pack de Contenido · $4.99",
        [
            "10 mapas nuevos (Observatorio… Núcleo)",
            "Torres nuevas: Tesla y Soporte",
            "Hardcore: vidas ×0.5 · enemigos +25% HP",
            "Expansión de contenido, no power creep puro",
            "Hoy: preview en tienda · bloqueado hasta IAP",
        ],
        GOLD,
    )
    slides_meta.append(s)

    # ——— 12 Roadmap monetización ———
    s = prs.slides.add_slide(blank)
    add_bg(s)
    accent_bar(s)
    add_kicker(s, "04 · Monetización")
    add_title(s, "Estado y siguiente paso comercial")
    phases = [
        ("Ahora (V5)", ["Tienda visual lista", "Precios y copy definidos", "Sin cobro real"]),
        ("Siguiente", ["Google Play Billing", "Flags owned=true reales", "Unlock pack + soft-lock ∞ opcional"]),
        ("Después", ["Más packs / skins", "Eventos de dificultad", "Sin ads invasivos"]),
    ]
    for i, (title, bullets) in enumerate(phases):
        x = Inches(0.55) + Inches(i * 4.2)
        add_card(s, x, Inches(1.4), Inches(4.0), Inches(4.5), title, bullets, EMBER if i == 0 else GOLD)
    note = s.shapes.add_textbox(Inches(0.7), Inches(6.2), Inches(12), Inches(0.6))
    set_run(
        note.text_frame.paragraphs[0].add_run(),
        "Principio: el jugador puede completar la campaña sin pagar. Lo de pago amplía, no bloquea el core.",
        size=15,
        color=MUTED,
    )
    slides_meta.append(s)

    # ——— 13 Cierre ———
    s = prs.slides.add_slide(blank)
    add_bg(s)
    side_glow(s)
    accent_bar(s)
    accent_bar(s, Inches(7.42))
    add_kicker(s, "Cierre")
    title = s.shapes.add_textbox(Inches(0.9), Inches(1.8), Inches(11), Inches(0.8))
    set_run(title.text_frame.paragraphs[0].add_run(), "Tower V5 en una frase", size=32, bold=True, color=MIST)
    body = s.shapes.add_textbox(Inches(0.9), Inches(2.8), Inches(11), Inches(1.5))
    tf = body.text_frame
    tf.word_wrap = True
    set_run(
        tf.paragraphs[0].add_run(),
        "Un tower defense offline con campaña profunda, fusión de torres,",
        size=20,
        color=MUTED,
    )
    p = tf.add_paragraph()
    set_run(
        p.add_run(),
        "piel Ember Keep y monetización freemium lista para IAP.",
        size=20,
        color=MUTED,
    )
    facts = s.shapes.add_textbox(Inches(0.9), Inches(4.6), Inches(11), Inches(1.5))
    tf = facts.text_frame
    set_run(tf.paragraphs[0].add_run(), "25 mapas · 4 torres (L1–L4) · Infinito · Shop $2.99 / $4.99 · APK 5.0.0", size=16, color=GOLD)
    p = tf.add_paragraph()
    set_run(p.add_run(), "WIKA · com.wika.tower · Expo SDK 52", size=14, color=STONE)
    slides_meta.append(s)

    total = len(slides_meta)
    for i, slide in enumerate(slides_meta, start=1):
        if i == 1 or i == total:
            continue
        footer(slide, i, total)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    prs.save(str(OUT))
    ARTIFACT.parent.mkdir(parents=True, exist_ok=True)
    prs.save(str(ARTIFACT))
    print(f"Saved: {OUT}")
    print(f"Artifact: {ARTIFACT}")
    print(f"Slides: {total}")


if __name__ == "__main__":
    build()
