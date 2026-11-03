---
name: indeed-cl-inspired
description: Recreate a Chile-market job/oficios search UX inspired by public layout patterns of cl.indeed.com — search-first header, dense result list, compact job cards, blue accent CTAs — without copying Indeed trademarks, CSS/JS, or assets. Use when building or restyling trabajamos.com (or similar local oficios/jobs products) toward a familiar job-board search experience.
---

# SKILL: Job search UX inspired by Chile Indeed patterns

> **Inspired-by only.** This skill documents *public UX patterns* (structure, density, hierarchy, interaction recipes). It is **not** a license to clone Indeed IP, brand, copy, logos, fonts bundles, proprietary CSS/JS, class names, or marketing assets.

## When to use

Use this skill when:

- Building or restyling **trabajamos.com** (or a Chilean oficios/jobs product) so search → results feel familiar to users of major job boards.
- You need a **search-first** public surface: keyword + locality, filters, vertical result cards, optional detail pane.
- Stakeholders ask for “como Indeed Chile” meaning **UX familiarity**, not a pixel clone.

Do **not** use this skill to:

- Replace a locked `direction_skill` (e.g. `industrial-brutalist-ui`) unless the architect explicitly reopens MOD-DIR / Gate 2.
- Paste Indeed HTML/CSS/JS, steal brand kits, or ship UI copy that says “Indeed”, “Indeed.com”, or “Apply with Indeed”.
- Scrape large copyrighted job text from Indeed for content or training fixtures.

## Absolute constraints (legal / brand)

1. **Inspired-by, not clone.** Recreate structure and feel with original markup, tokens, and copy owned by the product.
2. **No trademark misuse in UI.** Never show the Indeed name, logo, wordmark, or slogans in product UI, meta titles, or OG images. Mentions of Indeed are allowed only in *internal* docs/skills (this file), never end-user chrome.
3. **No proprietary assets.** Do not download or embed Indeed sprites, favicons, illustration packs, webfont files, or minified CSS/JS. Prefer open fonts (e.g. IBM Plex Sans, Source Sans 3, Noto Sans from Google Fonts / self-host under your license).
4. **No verbatim CSS/JS.** Do not copy class names like `mosaic-provider-jobcards`, `yosegi-*`, `icl-*`, `jobsearch-*`, or Indeed hashing schemes. Invent product-owned BEM/utility names.
5. **Tokens are equivalents.** Color values below are **generic job-board blues / neutrals** chosen to evoke the same *role* (link blue, primary CTA). Prefer the product brand blue when one exists; do not claim these are Indeed’s official brand kit.
6. **Content is product data.** Job titles, companies, salaries in examples are placeholders. Never scrape Indeed listings into the app.

---

## Pattern digest (what to imitate)

Public Chile Indeed surfaces (`cl.indeed.com`, SERPs like `/jobs?q=…`) consistently show:

| Zone | Pattern |
| :--- | :--- |
| **Home** | Sparse hero: short headline + dual search (“qué” / “dónde”) + primary “Buscar…” CTA. Optional account nudge below. |
| **Global header** | Logo left; compact nav (CV / employers / sign-in); **search bar stays dominant** and sticks or repeats on results. |
| **Search bar** | Two fields side-by-side on desktop: **keyword/oficio** + **location**; single primary button. Labels float/inline. Autocomplete for both. |
| **Filters** | Chip/dropdown row under search: salary, job type, language, date posted, etc. Horizontal scroll on mobile. |
| **Results chrome** | H1 with query context + “Clasificar por: relevancia / fecha”. Count implied by list, not a dashboard of stats. |
| **Job cards** | Dense vertical stack. Title (link-colored) → company → location → salary/meta → 1–2 snippet lines → optional quick-apply affordance. Hairline separators or light card borders. |
| **Detail** | Desktop often pairs list + detail panel; mobile pushes detail to a new view / full-width sheet. |
| **Density** | High information density, modest whitespace, system-like sans, blue links/CTAs on white/near-white ground. |
| **Mobile** | Stacked qué→dónde→Buscar; filters as horizontal chips; full-width cards; sticky search optional. |

---

## Layout anatomy

### A. Header (search-first)

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo]     Empleos / Para empresas / Entrar                 │
├─────────────────────────────────────────────────────────────┤
│ [ Qué / oficio …………… ] [ Dónde / comuna …… ] [ Buscar ]   │
└─────────────────────────────────────────────────────────────┘
```

- Logo + light text nav; **do not** bury search below hero marketing clutter.
- On results pages, keep the same search row above filters (users refine in place).

### B. Results page

```
┌─ search row (sticky optional) ─────────────────────────────┐
├─ filters: [Sueldo▾] [Tipo▾] [Fecha▾] … ────────────────────┤
├─ title + sort ─────────────────────────────────────────────┤
│  Empleos de gasfiter · Clasificar: relevancia | fecha      │
├──────────────┬─────────────────────────────────────────────┤
│ card list    │ detail panel (desktop ≥960px)               │
│ card         │ title, company, meta, CTA, description      │
│ card         │                                             │
│ …            │                                             │
└──────────────┴─────────────────────────────────────────────┘
```

For **trabajamos.com** oficios (single-page `#buscar` → `#resultados`), map:

- Search row → `VIEW-01` / `#buscar`
- Locality → `VIEW-02` / `#ubicacion`
- Status → `VIEW-03`
- Cards → `VIEW-04` / `#resultados`
- Detail → profile/oferta route or inline expand — product decision; keep list scannable.

### C. Job / oferta card anatomy (top → bottom)

1. **Title** — prominent, accent/link color, 1–2 lines max  
2. **Optional badge** — “Nuevo”, “Urgente”, “Postulación rápida” (product copy, not Indeed marks)  
3. **Company / perfil name** — secondary weight  
4. **Location** — comuna / región  
5. **Salary / meta row** — one line; muted  
6. **Snippet** — 1–2 lines clamped (`line-clamp: 2`)  
7. **Footer actions** — save / contact / primary CTA (optional, keep quiet)

Target card height: roughly **120–180px** desktop so several cards fit above the fold.

---

## Typography / spacing / color tokens (generic equivalents)

Use CSS variables owned by the product. Values below are **role-based starting points**, not an official third-party kit.

```css
:root {
  /* Surfaces */
  --jb-bg: #ffffff;
  --jb-bg-subtle: #f3f2f1;      /* filter rails, zebra soft */
  --jb-border: #d4d2d0;        /* hairlines between cards */
  --jb-border-strong: #949494;

  /* Text */
  --jb-text: #2d2d2d;
  --jb-text-muted: #595959;
  --jb-text-faint: #767676;

  /* Accent = “job-board blue” role (prefer brand blue if defined) */
  --jb-accent: #2557a7;
  --jb-accent-hover: #164081;
  --jb-accent-soft: #e8f0fe;   /* selected card / focus wash */

  /* CTA */
  --jb-cta-bg: var(--jb-accent);
  --jb-cta-text: #ffffff;
  --jb-cta-radius: 8px;        /* soft, utilitarian — not pill-full */

  /* Type */
  --jb-font: "IBM Plex Sans", "Source Sans 3", "Noto Sans", system-ui, sans-serif;
  --jb-fs-title: 1.125rem;     /* 18px card title */
  --jb-fs-body: 0.875rem;      /* 14px meta/snippet */
  --jb-fs-small: 0.75rem;      /* 12px badges */
  --jb-lh-tight: 1.25;
  --jb-lh-body: 1.4;

  /* Space (dense) */
  --jb-space-1: 4px;
  --jb-space-2: 8px;
  --jb-space-3: 12px;
  --jb-space-4: 16px;
  --jb-space-5: 24px;
  --jb-card-pad: 12px 16px;
  --jb-max: 1120px;
}
```

**Typography rules**

- One humanist/neo-grotesque sans for UI; avoid Inter/Roboto/Arial as the *expressive* brand face if the product already locked fonts (e.g. Archivo Black + IBM Plex for trabajamos) — keep **Plex/Noto for the job-list chrome** if mixing with a louder brand banner.
- Titles: semibold/bold; meta: regular muted; links: accent without underline until hover.
- Density over airy marketing: `padding` on cards ~12–16px, gaps ~0–8px with borders.

**If `direction_skill` is industrial-brutalist:** apply *this* skill only to the **search/results module** as a familiarity layer, or ask the architect before overriding Swiss-print rules globally.

---

## HTML semantic skeleton (short, original)

```html
<header class="jb-header">
  <a class="jb-logo" href="/">trabajamos.com</a>
  <nav class="jb-nav" aria-label="Principal">…</nav>
</header>

<section class="jb-search" aria-label="Buscar oficios">
  <form class="jb-search__form" role="search" method="get" action="/">
    <label class="jb-field">
      <span class="jb-field__label">Qué</span>
      <input name="q" type="search" autocomplete="off" placeholder="Oficio o palabra clave" />
    </label>
    <label class="jb-field">
      <span class="jb-field__label">Dónde</span>
      <input name="donde" type="text" autocomplete="address-level2" placeholder="Comuna o ciudad" />
    </label>
    <button class="jb-cta" type="submit">Buscar</button>
  </form>
</section>

<div class="jb-filters" role="toolbar" aria-label="Filtros">
  <button type="button" class="jb-chip" aria-haspopup="listbox">Sueldo</button>
  <button type="button" class="jb-chip" aria-haspopup="listbox">Tipo</button>
  <button type="button" class="jb-chip" aria-haspopup="listbox">Fecha</button>
</div>

<main class="jb-results">
  <header class="jb-results__head">
    <h1>Empleos de gasfiter</h1>
    <p class="jb-sort">Clasificar por: <a href="?sort=rel" aria-current="true">relevancia</a> · <a href="?sort=date">fecha</a></p>
  </header>

  <div class="jb-split">
    <ul class="jb-list" role="list">
      <li>
        <article class="jb-card" aria-labelledby="job-1-title">
          <h2 id="job-1-title" class="jb-card__title"><a href="/oferta/…">Gasfiter con experiencia</a></h2>
          <p class="jb-card__company">Perfil ejemplo SpA</p>
          <p class="jb-card__loc">Ñuñoa, Región Metropolitana</p>
          <p class="jb-card__meta">$800.000 – $1.000.000 · Jornada completa</p>
          <p class="jb-card__snip">Instalación y mantención residencial…</p>
        </article>
      </li>
    </ul>
    <aside class="jb-detail" aria-live="polite"><!-- desktop detail --></aside>
  </div>
</main>
```

---

## CSS component recipes (original)

### Search form

```css
.jb-search__form {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: var(--jb-space-2);
  max-width: var(--jb-max);
  margin-inline: auto;
  padding: var(--jb-space-4);
}
.jb-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border: 1px solid var(--jb-border);
  border-radius: 8px;
  padding: 6px 12px;
  background: var(--jb-bg);
}
.jb-field__label {
  font-size: var(--jb-fs-small);
  color: var(--jb-text-muted);
}
.jb-field input {
  border: 0;
  font: inherit;
  font-size: 1rem;
  color: var(--jb-text);
  outline: none;
  background: transparent;
}
.jb-field:focus-within {
  border-color: var(--jb-accent);
  box-shadow: 0 0 0 2px var(--jb-accent-soft);
}
.jb-cta {
  align-self: stretch;
  padding: 0 var(--jb-space-5);
  border: 0;
  border-radius: var(--jb-cta-radius);
  background: var(--jb-cta-bg);
  color: var(--jb-cta-text);
  font-weight: 700;
  cursor: pointer;
}
.jb-cta:hover { background: var(--jb-accent-hover); }
```

### Filter chips

```css
.jb-filters {
  display: flex;
  gap: var(--jb-space-2);
  overflow-x: auto;
  padding: var(--jb-space-2) var(--jb-space-4);
  border-bottom: 1px solid var(--jb-border);
  background: var(--jb-bg);
}
.jb-chip {
  flex: 0 0 auto;
  border: 1px solid var(--jb-border);
  border-radius: 999px;
  padding: 6px 12px;
  background: var(--jb-bg);
  font-size: var(--jb-fs-body);
  color: var(--jb-text);
}
.jb-chip[aria-expanded="true"],
.jb-chip.is-active {
  border-color: var(--jb-accent);
  background: var(--jb-accent-soft);
  color: var(--jb-accent-hover);
}
```

### Cards + split

```css
.jb-split {
  display: grid;
  grid-template-columns: minmax(280px, 420px) 1fr;
  gap: 0;
  max-width: var(--jb-max);
  margin-inline: auto;
}
.jb-list { list-style: none; margin: 0; padding: 0; }
.jb-card {
  padding: var(--jb-card-pad);
  border-bottom: 1px solid var(--jb-border);
  cursor: pointer;
}
.jb-card:hover,
.jb-card.is-selected {
  background: var(--jb-accent-soft);
}
.jb-card__title {
  margin: 0 0 var(--jb-space-1);
  font-size: var(--jb-fs-title);
  line-height: var(--jb-lh-tight);
  font-weight: 700;
}
.jb-card__title a {
  color: var(--jb-accent);
  text-decoration: none;
}
.jb-card__title a:hover { text-decoration: underline; }
.jb-card__company,
.jb-card__loc,
.jb-card__meta {
  margin: 0;
  font-size: var(--jb-fs-body);
  color: var(--jb-text-muted);
}
.jb-card__snip {
  margin: var(--jb-space-2) 0 0;
  font-size: var(--jb-fs-body);
  color: var(--jb-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

## Mobile rules

Breakpoint suggestion: **`max-width: 759px`**.

1. **Search form** → single column: Qué, then Dónde, then full-width Buscar.
2. **Filters** → horizontal scroll; do not wrap into a tall block that pushes results below the fold.
3. **Split pane** → `grid-template-columns: 1fr`; hide `.jb-detail` on the list route; open detail as a dedicated page or full-screen panel.
4. **Tap targets** ≥ 44px height for CTA and chips.
5. **Sticky search** optional (`position: sticky; top: 0; z-index: 10`) with solid background + bottom border — never translucent glass clutter.
6. **Safe areas:** respect `env(safe-area-inset-*)` on fixed headers.
7. Prefer **one job list column**; avoid multi-column card grids that break scan rhythm.

```css
@media (max-width: 759px) {
  .jb-search__form { grid-template-columns: 1fr; }
  .jb-cta { min-height: 44px; width: 100%; }
  .jb-split { grid-template-columns: 1fr; }
  .jb-detail { display: none; }
}
```

---

## Interaction recipes

- **Submit search** → navigate or in-place update results; show loading in a status region (`aria-live`).
- **Select card** → desktop: highlight + load detail pane; mobile: navigate.
- **Sort** → plain text links or segmented control; current sort uses `aria-current="true"`.
- **Empty state** → one sentence + suggestion to broaden query/locality (no illustration spam).
- **Keyboard** → fields tab in order Qué → Dónde → Buscar; cards are links or have a single focusable title link.

---

## Anti-patterns

- **Pixel-perfect Indeed clone** or reused Indeed class names / assets / “Apply with Indeed”.
- **Dashboard hero:** stats strips, promo carousels, multi-card marketing grids above the search.
- **Card bloat:** large rounded media thumbnails, multi-shadow stacks, emoji, glow, purple gradients.
- **Low density:** huge padding that shows only 1–2 jobs per viewport.
- **Hidden search** behind icons-only chrome on desktop.
- **Filter walls** that require a modal before seeing any results.
- **Trademarked copy** in UI (“Indeed”, logos, slogans).
- **Scraped listing bodies** as demo content.
- **Fighting a locked direction_skill** without architect approval.

---

## Protocol for the agent

1. Confirm product scope (trabajamos.com vs greenfield) and whether `direction_skill` is locked.
2. Map views to search / filters / list / detail without importing third-party markup.
3. Introduce `--jb-*` (or product-prefixed) tokens; wire accent to brand blue when available.
4. Implement semantic HTML + recipes above; verify desktop split vs mobile stack.
5. Self-check legal constraints before shipping.
6. Do not fetch or mirror Indeed production CSS/JS bundles into the repo.

## Source notes (research)

Patterns distilled from publicly visible Chile Indeed UX (home + SERP structure: qué/dónde, filters Sueldo/Tipo/Fecha, title+sort, vertical job cards with title → company → location → salary → snippet) and well-known job-board layout conventions. Live HTML/CSS/JS was **not** copied into this skill; challenge pages and third-party writeups were used only to confirm structure and hierarchy.
