---
name: linkedin-profile-inspired
description: Recreate an editable + public entrepreneur profile UX inspired by public professional-profile layout patterns (identity header, about, experience/offers, featured/media, contact CTAs) — without copying LinkedIn trademarks, CSS/JS, or assets. Use when designing or building trabajamos.com perfil público (VIEW-05..09) and panel editable (VIEW-12..17), or similar oficios profile surfaces.
---

# SKILL: Entrepreneur profile UX inspired by public professional-profile patterns

> **Inspired-by only.** This skill documents *public UX patterns* (structure, section order, density, CTA hierarchy, editable vs public dual). It is **not** a license to clone LinkedIn IP, brand, copy, logos, fonts bundles, proprietary CSS/JS, class names, or marketing assets. Do **not** paste personal PII from any real profile into product UI, fixtures, or this skill beyond generic placeholders (`Ana Rojas`, `Ñuñoa`, etc.).

## When to use

Use this skill when:

- Building or restyling the **trabajamos.com** entrepreneur profile: public `perfil.html` (`VIEW-05`–`VIEW-09`) and/or panel editors (`VIEW-12`–`VIEW-17`).
- Stakeholders ask for “como un perfil de LinkedIn” meaning **familiar professional-profile anatomy** (header → about → proof → experience → contact), not a pixel clone.
- You need a clear split between **public read surface** and **editable panel** that preview the same section order.

Do **not** use this skill to:

- Replace a locked `direction_skill` (e.g. Soft Structuralism / `high-end-visual-design`) unless the architect reopens MOD-DIR / Gate 2.
- Paste LinkedIn HTML/CSS/JS, steal brand kits, or ship UI copy that says “LinkedIn”, “in/”, or LinkedIn slogans.
- Scrape private/gated profile data, contact emails from LinkedIn, or large copyrighted About/Experience copy into the app or fixtures.
- Design the **search → results** flow — that is `indeed-cl-inspired` (see Complement below).

## Absolute constraints (legal / brand)

1. **Inspired-by, not clone.** Recreate structure and feel with original markup, tokens, and copy owned by the product.
2. **No trademark misuse in UI.** Never show the LinkedIn name, logo, wordmark, “in” badge, or slogans in product UI, meta titles, or OG images. Mentions of LinkedIn are allowed only in *internal* docs/skills (this file), never end-user chrome.
3. **No proprietary assets.** Do not download or embed LinkedIn sprites, favicons, illustration packs, webfont files, or minified CSS/JS. Prefer product fonts (Syne + Plus Jakarta Sans when Soft Structuralism is locked) or open alternatives under a clear license.
4. **No verbatim CSS/JS.** Do not copy class names like `pv-top-card`, `scaffold-layout`, `artdeco-*`, `ember-*`, or LinkedIn hashing schemes. Invent product-owned BEM/utility names (prefix `ep-` = entrepreneur profile below).
5. **Tokens are equivalents.** Neutrals and accent roles below evoke a clean professional-profile *role* (identity first, quiet sections, one primary CTA). Prefer brand teal/accent when Soft Structuralism is locked; do not claim official third-party brand kits.
6. **Content is product data.** Names, headlines, offers, and images in examples are placeholders. Never scrape a real person’s profile into the repo.
7. **No private contact harvest.** Do not store real phone/email from third-party profiles in the skill, seeds, or demos.

---

## Pattern digest (what to imitate)

Public professional-profile pages (LinkedIn-style surfaces) consistently show a **single-column stack** with high scanability:

| Zone | Pattern |
| :--- | :--- |
| **Identity header** | Photo (and optional banner) → **name as H1** → one-line headline → location/meta → primary CTA row. Sticky optional on scroll. |
| **About** | Short narrative, clamped with “ver más”; first 2–3 lines must carry the hook. |
| **Featured / media** | Horizontal proof rail (2–4 items): image/card + title; “show all” if more. |
| **Experience / offerings** | Vertical list of roles or services: title → org/type → date or meta → 1–3 lines. Dense, hairline separators. |
| **Contact CTAs** | One primary action in the header (`Message` / connect-style); secondary links quieter. On oficios products → **`Contactar`** + optional redes. |
| **Section order** | Header → About → Featured → Experience (locked mid-stack) → optional extras. Analytics/owner-only chrome stays off the public view. |
| **Density** | Medium-high: card-like section blocks on a muted page ground; generous header, tighter list rows. |
| **Owner vs visitor** | Same section order; owner sees edit affordances / “view as public”; visitor sees CTAs only. |
| **Mobile** | Single column; photo smaller; CTAs full-width; Featured becomes horizontal swipe; lists stay stacked. |

**Reference note:** Live LinkedIn HTML often sits behind auth walls. Patterns here are distilled from *public* profile UX conventions and third-party writeups of section order (header → About → Featured → Experience). Live CSS/JS/assets were **not** copied.

---

## Map onto trabajamos.com

| Professional-profile pattern | trabajamos.com concept | Views |
| :--- | :--- | :--- |
| Photo + name (H1) + headline | `nombre` (+ optional short bio if added later); photo optional in v1 | `VIEW-05` |
| Location line under headline | `punto.etiqueta` (localidad legible) — can also sit in `#localidad` | `VIEW-05` / `VIEW-09` |
| Primary CTA (`Message` role) | **`Contactar`** → `tel:` / `mailto:` / URL; dato visible (D-03) | `VIEW-06` |
| Secondary links / social | **Redes** (`nombre` + URL); no feed incrustado | `VIEW-06`, panel `VIEW-13` |
| About / summary | Optional “Acerca de” / bio corta — if product adds it, keep clamped; v1 may omit and let ofertas + portafolio speak | (future) / keep identity lean |
| Experience list | **Ofertas** (tipo · título · `#`) | `VIEW-07`, panel `VIEW-14` |
| Featured / media rail | **Portafolio** images with `alt` | `VIEW-08`, panel `VIEW-15` |
| Location / map block | **Localidad** + mapa (`punto`) | `VIEW-09`, panel `VIEW-16` |
| “View public profile” / publish state | `VIEW-17` checklist + “Ver mi perfil público” | `VIEW-17` |
| Edit identity / contact | Nombre + contacto obligatorio (D-01) | `VIEW-12` |

**Canonical public section order for trabajamos** (align with `04-html-design.md`):

1. Identidad (`#perfil`) — nombre, nav interna  
2. Contacto + redes (`#contacto`) — `Contactar` first  
3. Ofertas (`#ofertas`)  
4. Portafolio (`#portafolio`)  
5. Localidad (`#localidad`)  

Optional UX upgrade *inspired by* profile patterns (without changing feature contracts): place a **compact locality line under the H1** and keep the full map in `#localidad`; promote `Contactar` into the identity header CTA row while repeating the contact section for a11y/anchors.

---

## Profile anatomy

### A. Public profile (visitor)

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo]  Buscar otro oficio · Crear perfil                   │
├─────────────────────────────────────────────────────────────┤
│  (optional soft banner / atmospheric strip)                 │
│   ┌────┐                                                    │
│   │foto│  NOMBRE (h1)                                       │
│   └────┘  Headline / oficio principal (1 línea)             │
│           Localidad · Región                                │
│           [ Contactar ]   Instagram · Facebook · …          │
├─────────────────────────────────────────────────────────────┤
│  Nav anclas: Contacto · Ofertas · Portafolio · Localidad    │
├─────────────────────────────────────────────────────────────┤
│  Contacto — dato visible + redes                            │
│  Ofertas  — lista densa (tipo · título · #)                 │
│  Portafolio — rail o grid de evidencia                      │
│  Localidad — etiqueta + mapa                                │
└─────────────────────────────────────────────────────────────┘
```

### B. Editable panel (owner) — same mental model

```
┌─ VIEW-11 marco ─────────────────────────────────────────────┐
│ Panel · Perfil · Ofertas · Portafolio · Localidad · Salir   │
├─────────────────────────────────────────────────────────────┤
│ VIEW-17  Estado público + “Ver mi perfil público”           │
│ VIEW-12  Nombre + Contacto (obligatorio publicar)           │
│ VIEW-13  Redes                                              │
│ VIEW-14  Ofertas (# preview)                                │
│ VIEW-15  Portafolio (alt obligatorio)                       │
│ VIEW-16  Localidad (mapa / etiqueta; sin geolocalizar device)│
└─────────────────────────────────────────────────────────────┘
```

- Owner chrome: save status (`aria-live`), “Siguiente: …”, blocked-without-profile gates.
- Mirror public order in the panel nav so edit → publish feels 1:1.
- Never show LinkedIn-style “Open to work” frames, connection counts, or follower graphs — out of product scope.

### C. Identity header anatomy (top → bottom)

1. **Photo** — circular or soft-square; optional; placeholder initial if missing  
2. **Name** — H1, strongest type signal  
3. **Headline** — one line (primary oficio / tagline); muted weight vs name  
4. **Locality meta** — comuna / etiqueta  
5. **CTA row** — primary `Contactar`; secondary redes as text links (not icon-only)  
6. **Section nav** — in-page anchors  

Target: header fits in ~40–55% of first viewport on mobile; sections below scroll.

---

## Typography / spacing / color tokens (generic equivalents)

Use product-owned CSS variables. Prefer Soft Structuralism tokens when locked; `--ep-*` below are **role-based** starters for a clean profile stack.

```css
:root {
  /* Surfaces */
  --ep-bg: #f4f6f5;           /* page wash */
  --ep-surface: #ffffff;      /* section blocks */
  --ep-border: #e2e6e4;
  --ep-border-strong: #c5ccc9;

  /* Text */
  --ep-text: #1a2421;
  --ep-text-muted: #5c6b66;
  --ep-text-faint: #7a8a84;

  /* Accent = primary CTA role (prefer brand teal if defined) */
  --ep-accent: #0f766e;
  --ep-accent-hover: #0d5f59;
  --ep-accent-soft: #e6f4f2;

  /* CTA */
  --ep-cta-bg: var(--ep-accent);
  --ep-cta-text: #ffffff;
  --ep-cta-radius: 10px;      /* soft structural — not pill-full */

  /* Type */
  --ep-font: "Plus Jakarta Sans", "Source Sans 3", "Noto Sans", system-ui, sans-serif;
  --ep-font-display: "Syne", "Plus Jakarta Sans", sans-serif;
  --ep-fs-name: clamp(1.75rem, 2vw + 1rem, 2.25rem);
  --ep-fs-head: 1.05rem;
  --ep-fs-section: 1.25rem;
  --ep-fs-body: 0.9375rem;
  --ep-fs-small: 0.8125rem;
  --ep-lh-tight: 1.2;
  --ep-lh-body: 1.5;

  /* Space */
  --ep-space-1: 4px;
  --ep-space-2: 8px;
  --ep-space-3: 12px;
  --ep-space-4: 16px;
  --ep-space-5: 24px;
  --ep-space-6: 32px;
  --ep-section-pad: 20px 24px;
  --ep-max: 720px;            /* single-column profile focus */
  --ep-photo: 112px;
}
```

**Typography rules**

- Name uses display face; body/meta use UI sans.
- One primary CTA color; links for redes stay accent or muted underline-on-hover.
- Section blocks: white surface on soft page ground, 1px border, light radius — **not** dashboard cards with multi-shadow.

---

## HTML semantic skeletons (original)

### Public `perfil.html` (VIEW-05…09)

```html
<main id="contenido">
  <p id="estado-perfil" role="status" aria-live="polite"></p>

  <article id="perfil" class="ep-profile" aria-labelledby="perfil-nombre">
    <header class="ep-hero">
      <img class="ep-hero__photo" src="/media/…" alt="" width="112" height="112" />
      <!-- alt vacío si la foto es decorativa del nombre; si identifica, describir -->
      <div class="ep-hero__id">
        <h1 id="perfil-nombre">Ana Rojas</h1>
        <p class="ep-hero__headline">Gasfitería y mantención residencial</p>
        <p class="ep-hero__loc">Ñuñoa, Región Metropolitana</p>
        <div class="ep-hero__cta">
          <a class="ep-cta"
             href="tel:+56912345678"
             aria-describedby="contacto-dato">Contactar<span class="oculto"> a Ana Rojas por teléfono</span></a>
          <ul class="ep-redes-inline" aria-label="Redes">
            <li><a href="https://…" rel="nofollow ugc">Instagram</a></li>
          </ul>
        </div>
      </div>
    </header>

    <nav class="ep-toc" aria-label="Secciones del perfil">
      <ul>
        <li><a href="#contacto">Contacto</a></li>
        <li><a href="#ofertas">Ofertas</a></li>
        <li><a href="#portafolio">Portafolio</a></li>
        <li><a href="#localidad">Localidad</a></li>
      </ul>
    </nav>

    <section id="contacto" class="ep-section" aria-labelledby="contacto-titulo">
      <h2 id="contacto-titulo">Contacto</h2>
      <p id="contacto-dato">Teléfono: +56 9 1234 5678</p>
      <h3 id="redes-titulo">Redes</h3>
      <ul aria-labelledby="redes-titulo">…</ul>
    </section>

    <section id="ofertas" class="ep-section" aria-labelledby="ofertas-titulo">
      <h2 id="ofertas-titulo">Ofertas</h2>
      <ul class="ep-offers">
        <li>
          <article aria-labelledby="oferta-1">
            <h3 id="oferta-1">Gasfitería a domicilio</h3>
            <p class="ep-offers__meta">Oficio · #gasfiter</p>
          </article>
        </li>
      </ul>
    </section>

    <section id="portafolio" class="ep-section" aria-labelledby="portafolio-titulo">
      <h2 id="portafolio-titulo">Portafolio</h2>
      <ul class="ep-folio">
        <li><img src="…" alt="Cambio de llave en cocina, Ñuñoa" loading="lazy" /></li>
      </ul>
    </section>

    <section id="localidad" class="ep-section" aria-labelledby="localidad-titulo">
      <h2 id="localidad-titulo">Localidad</h2>
      <p>Ñuñoa</p>
      <div role="img" aria-label="Mapa con la localidad de Ana Rojas"><!-- mapa --></div>
    </section>

    <p><a href="index.html">Buscar otro oficio</a></p>
  </article>
</main>
```

### Panel excerpt — identity + publish (`VIEW-12` + `VIEW-17`)

```html
<main id="contenido">
  <section id="publicacion" class="ep-section" aria-labelledby="publicacion-titulo">
    <h2 id="publicacion-titulo">Tu perfil público</h2>
    <ul>
      <li>Nombre: Ana Rojas</li>
      <li>Contactar: abre llamada a +56 9 …</li>
      <li>Ofertas: 2</li>
      <li>Portafolio: 4 imágenes</li>
      <li>Localidad: Ñuñoa</li>
    </ul>
    <p><a href="../perfil.html?slug=ana-rojas">Ver mi perfil público</a></p>
  </section>

  <section id="datos" class="ep-section" aria-labelledby="datos-titulo">
    <h2 id="datos-titulo">Nombre y contacto</h2>
    <form id="form-datos" method="post" novalidate>
      <label for="nombre">Nombre visible (obligatorio)</label>
      <input id="nombre" name="nombre" type="text" required autocomplete="name" />
      <!-- contacto fieldset per 04-html-design D-01 / D-03 -->
      <button type="submit">Guardar perfil</button>
      <p id="form-datos-estado" role="status" aria-live="polite"></p>
      <p><a href="#redes">Siguiente: Redes sociales</a></p>
    </form>
  </section>
</main>
```

---

## CSS component recipes (original)

```css
.ep-profile { max-width: var(--ep-max); margin-inline: auto; }
.ep-hero {
  display: grid;
  grid-template-columns: var(--ep-photo) 1fr;
  gap: var(--ep-space-4);
  padding: var(--ep-space-5);
  background: var(--ep-surface);
  border: 1px solid var(--ep-border);
  border-radius: 12px;
}
.ep-hero__photo {
  width: var(--ep-photo);
  height: var(--ep-photo);
  object-fit: cover;
  border-radius: 50%;
  background: var(--ep-accent-soft);
}
.ep-hero__id h1 {
  margin: 0;
  font-family: var(--ep-font-display);
  font-size: var(--ep-fs-name);
  line-height: var(--ep-lh-tight);
  color: var(--ep-text);
}
.ep-hero__headline {
  margin: var(--ep-space-1) 0 0;
  font-size: var(--ep-fs-head);
  color: var(--ep-text);
}
.ep-hero__loc {
  margin: var(--ep-space-1) 0 0;
  font-size: var(--ep-fs-small);
  color: var(--ep-text-muted);
}
.ep-hero__cta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ep-space-3);
  margin-top: var(--ep-space-4);
}
.ep-cta {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 var(--ep-space-5);
  border-radius: var(--ep-cta-radius);
  background: var(--ep-cta-bg);
  color: var(--ep-cta-text);
  font-weight: 700;
  text-decoration: none;
}
.ep-cta:hover { background: var(--ep-accent-hover); }
.ep-redes-inline {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ep-space-3);
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: var(--ep-fs-small);
}
.ep-toc ul {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ep-space-3);
  list-style: none;
  margin: var(--ep-space-4) 0;
  padding: 0;
  font-size: var(--ep-fs-small);
}
.ep-section {
  margin-block: var(--ep-space-4);
  padding: var(--ep-section-pad);
  background: var(--ep-surface);
  border: 1px solid var(--ep-border);
  border-radius: 12px;
}
.ep-section h2 {
  margin: 0 0 var(--ep-space-3);
  font-size: var(--ep-fs-section);
}
.ep-offers { list-style: none; margin: 0; padding: 0; }
.ep-offers > li {
  padding: var(--ep-space-3) 0;
  border-bottom: 1px solid var(--ep-border);
}
.ep-offers > li:last-child { border-bottom: 0; }
.ep-offers h3 {
  margin: 0;
  font-size: 1.05rem;
}
.ep-offers__meta {
  margin: var(--ep-space-1) 0 0;
  font-size: var(--ep-fs-small);
  color: var(--ep-text-muted);
}
.ep-folio {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--ep-space-3);
  list-style: none;
  margin: 0;
  padding: 0;
}
.ep-folio img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
}
```

---

## Mobile rules

Breakpoint suggestion: **`max-width: 759px`**.

1. **Hero** → single column: photo centered or left-small, then name stack; CTAs full-width.
2. **`Contactar`** → `width: 100%`; min-height 44px.
3. **TOC** → horizontal scroll chips, not a tall wrapped block.
4. **Portafolio** → 2-column grid or horizontal snap rail; keep alt text available to AT.
5. **Map** → full-bleed within section; avoid nested scroll traps.
6. **Panel forms** → one column; sticky save bar optional with solid background.
7. Safe areas: `env(safe-area-inset-*)` on fixed chrome.

```css
@media (max-width: 759px) {
  .ep-hero { grid-template-columns: 1fr; }
  .ep-hero__photo { width: 88px; height: 88px; }
  .ep-cta { width: 100%; justify-content: center; }
  .ep-toc ul { flex-wrap: nowrap; overflow-x: auto; }
}
```

---

## Interaction recipes

- **Contactar** → leaves the portal (`tel:` / `mailto:` / `https:`); `rel="nofollow ugc"` on URL and redes.
- **TOC anchors** → smooth scroll optional; focus target heading after navigation when using JS.
- **Empty sections** → one sentence each (ofertas / portafolio / redes / localidad) — no illustration spam.
- **Panel save** → status region; first publish requires nombre + contacto válido (D-01).
- **Ver mi perfil público** → same tab; owner should recognize the public stack.
- **Keyboard** → CTA and redes in tab order after name; each oferta title is a heading, not a fake card button.

---

## Anti-patterns

- **Pixel-perfect LinkedIn clone** or reused `artdeco` / `pv-*` / `ember` class names / assets / “LinkedIn” marks in UI.
- **Social graph chrome:** connections, followers, “Open to work” frames, endorsement bars.
- **Dashboard hero** on the profile: stats strips, promo carousels, multi-widget grids above the name.
- **Card bloat:** multi-layer shadows, glow, purple gradients, emoji bullets, icon-only redes without text.
- **Buried Contactar** below long About walls — primary CTA belongs in the identity header.
- **Scraped About/Experience** from third-party profiles as demo copy or seed data.
- **Storing real PII** from research profiles in the skill or fixtures.
- **Fighting locked Soft Structuralism** without architect approval — apply this skill as *profile anatomy*, not a second visual system.
- **Auth-wall scraping** or automating login to capture private profile HTML.

---

## How it complements `indeed-cl-inspired`

| Skill | Job to be done | Primary surfaces |
| :--- | :--- | :--- |
| **`indeed-cl-inspired`** | **Search** — qué/dónde, filters, dense result cards, list→detail | `VIEW-01`–`VIEW-04` (`#buscar` → `#resultados`) |
| **`linkedin-profile-inspired`** | **Profile** — identity, contact, ofertas, portafolio, localidad; editable panel | `VIEW-05`–`VIEW-09`, `VIEW-12`–`VIEW-17` |

Flow: job-board search (Indeed-inspired) → result card → **entrepreneur profile** (this skill). Do not apply search-list density to the profile page, and do not put a dual qué/dónde search inside the profile hero.

If both skills conflict with `direction_skill`, **direction_skill wins** for color/type/motion; these skills win only for *information architecture and familiarity patterns* within their modules.

---

## Protocol for the agent

1. Confirm product scope (trabajamos.com) and locked `direction_skill`.
2. Map public vs panel views (`VIEW-05`–`09` / `12`–`17`) without importing third-party markup.
3. Keep section order: identidad → contacto/redes → ofertas → portafolio → localidad.
4. Put **`Contactar`** in the identity CTA row; keep D-01/D-03 contact rules.
5. Introduce `--ep-*` (or product-prefixed) tokens; wire accent to brand teal when Soft Structuralism is active.
6. Implement semantic HTML + recipes; verify mobile stack and 44px CTAs.
7. Self-check legal constraints; no LinkedIn marks in UI; no scraped PII.
8. Do not fetch or mirror LinkedIn production CSS/JS bundles into the repo.

## Source notes (research)

Patterns distilled from publicly documented professional-profile UX (identity header with photo/name/headline/location; About; Featured/media rail; Experience list; primary message-style CTA; owner “view public” dual) and mapped to trabajamos.com features in `idea/02-features.md` / `idea/04-html-design.md`. The example public URL used as a *layout reference* was not copied; auth-walled HTML/CSS/JS was not stored. No real contact data from that profile appears in this skill—placeholders only (`Ana Rojas`, demo phone formats already used in product docs).
