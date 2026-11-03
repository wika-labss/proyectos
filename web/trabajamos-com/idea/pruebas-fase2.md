---
id: "WEB-FASE2-PRUEBAS-001"
title: "trabajamos.com — Pruebas de dirección visual (Fase 2)"
status: "BORRADOR"
owner: "Vissiuss"
created_at: "2026-11-03"
updated_at: "2026-11-03"
fase2_look_aprobado: false
---

# Pruebas de dirección visual — Fase 2

Registro de pruebas de look aplicadas sobre el SSR de Fase 1 (`iterations/v1/`).  
**Ninguna está firmada como look final** hasta que el arquitecto apruebe. El código deja instalada la **última prueba** (Indeed home + LinkedIn perfil).

Capturas en `idea/pruebas-fase2/`.

---

## Estado (2026-11-03, America/Santiago)

| Ítem | Estado |
| :--- | :--- |
| Fase 1 (`construction_phase_complete`) | Firmada |
| Look Fase 2 | **No aprobado** — ver pruebas abajo |
| Código activo | Lote paralelo A/B/C en ramas `cursor/look-*-aa58` (PR #117 sigue en bootstrap) |
| Skills | Catálogo en bóveda WIKA: [`wika-fundaments/bodega-disenos/catalogo-skills.md`](https://github.com/wika-labss/wika-fundaments/blob/cursor/bodega-disenos-trabajamos-aa58/bodega-disenos/catalogo-skills.md) |
| Siguiente | Elegir look A/B/C; firmar; consolidar en bootstrap |

---

## Prueba 1 — `minimalist-ui`

| Campo | Valor |
| :--- | :--- |
| Cuándo | Tras firma Fase 1 (2026-11-02 ~23:37 UTC-3) |
| Commit | `c2a035ee` |
| Variante | Editorial warm monochrome (Newsreader + DM Sans) |
| Qué se probó | Tipografía serif/sans, poco color, motion suave |
| Veredicto | **No convence** (Vissiuss) |
| Capturas | `pruebas-fase2/01-minimalist-inicio.png`, `01-minimalist-busqueda.png` |

---

## Prueba 2 — `industrial-brutalist-ui`

| Campo | Valor |
| :--- | :--- |
| Cuándo | 2026-11-02 ~23:51 UTC-3 (Gate 2 reabierto) |
| Commit | `9120d390` |
| Variante | Swiss print **clara** (no CRT) |
| Qué se probó | Banner grande, menú hamburguesa derecho, Archivo Black, acento rojo, grilla |
| Veredicto | **No convence** (Vissiuss) |
| Capturas | `pruebas-fase2/02-brutalist-inicio.png`, `02-brutalist-menu.png` |

---

## Prueba 3 — `high-end-visual-design`

| Campo | Valor |
| :--- | :--- |
| Cuándo | 2026-11-02 ~23:59 UTC-3 (Gate 2 reabierto de nuevo) |
| Commit | `d4d96f0e` |
| Variante | Soft Structuralism clara (Syne + Plus Jakarta Sans, acento teal, sin glass morado) |
| Qué se probó | Cabecera isla, cajón premium, más motion |
| Veredicto | **No convence** (Vissiuss) |
| Capturas | `pruebas-fase2/03-soft-struct-inicio.png`, `03-soft-struct-menu.png`, `03-soft-struct-resultados.png` |

---

## Prueba 4 — Indeed home + LinkedIn perfil (inspired-by)

| Campo | Valor |
| :--- | :--- |
| Cuándo | 2026-11-03 ~10:20 UTC-3 |
| Skills | `indeed-cl-inspired` → `#buscar` / `#resultados`; `linkedin-profile-inspired` → `perfil.html` |
| Qué se copió | Distribución, densidad, formas de botones/campos (radio 8–10px CTAs; chips pill en filtros); **no** marcas ni assets de terceros |
| Home | Header plano logo+nav; Qué / Dónde lado a lado + CTA azul `Buscar`; chips; cards densas título→empresa→distancia→meta |
| Perfil | Banner + `ep-hero` (inicial, nombre H1, headline, localidad); **Contactar** en CTA del header; TOC; secciones en bloques blancos |
| Tokens | `--jb-*` (job board azul `#2557a7`) · `--ep-*` (perfil teal `#0f766e`) |
| Veredicto | Anatomía OK para probar; look aún frío/utilitario → iteración **4b** |
| Capturas | `04-indeed-inicio.png`, `04-indeed-resultados.png`, `04-indeed-mobile.png`, `04-linkedin-perfil.png` |

---

## Prueba 4b — polish orgánico (redesign-skill)

| Campo | Valor |
| :--- | :--- |
| Cuándo | 2026-11-03 ~11:20 UTC-3 |
| Base | Prueba 4 (misma IA: qué/dónde + ep-hero); **sin** cambiar ids/a11y Fase 1 |
| Auditor usado | Checklist de `web-design/external/taste-skill/skills/redesign-skill` (no hay auditor CSS dedicado en el repo) |
| Diagnóstico | Dos acentos (azul + teal); grises estériles; flat sin textura; CTAs 8px; chips pill; tipografía sin presencia suficiente |
| Fixes | Un acento sage `#3d6b4f`; neutros con tinte verde; grain + radiales; radios 12–18px; H1 más grande/tracking; sombras tintadas; chips 12px (no pill-full) |
| Evitado | cream+#terracotta+serif; purple glass; azul Indeed en UI |
| Veredicto | **Pendiente** (Vissiuss) |
| Capturas | `04b-organic-inicio.png`, `04b-organic-resultados.png`, `04b-organic-perfil.png`, `04b-organic-mobile.png` |

---

## Skills de apoyo (no son dirección MOD-DIR por sí solas)

| Skill | Ruta | Uso |
| :--- | :--- | :--- |
| Job-board search (Indeed CL inspired-by) | `skills/indeed-cl-inspired/SKILL.md` | Barra / listado tipo job board |
| Perfil emprendedor (LinkedIn inspired-by) | `skills/linkedin-profile-inspired/SKILL.md` | Perfil público (+ anatomía panel) |

No sustituyen un `direction_skill` firmado. No usan marcas ni assets de terceros en la UI.

---

## Notas

1. No marcar look Fase 2 como aprobado hasta firma de Vissiuss.
2. El HTML semántico de Fase 1 (ids de formularios / a11y / Contactar) se mantiene; cambian markup de layout y CSS.
3. PR de trabajo: https://github.com/wika-labss/proyectos/pull/117
