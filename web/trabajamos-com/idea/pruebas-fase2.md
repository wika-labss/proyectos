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

Registro de las tres pruebas de look aplicadas sobre el SSR de Fase 1 (`iterations/v1/`).  
**Ninguna convenció al arquitecto.** El código deja instalada la última prueba (Soft Structuralism); la dirección definitiva queda **pendiente** para otra sesión.

Capturas en `idea/pruebas-fase2/`.

---

## Estado al cerrar el día (2026-11-02 / 03, America/Santiago)

| Ítem | Estado |
| :--- | :--- |
| Fase 1 (`construction_phase_complete`) | Firmada |
| Look Fase 2 | **No aprobado** — ver pruebas abajo |
| `direction_skill` actual en MOD-DIR | `high-end-visual-design` / `soft_structuralism_claro` (última prueba; no es firma de look) |
| Skills auxiliares | `skills/indeed-cl-inspired/` · `skills/linkedin-profile-inspired/` (perfil editable, inspired-by) |
| Siguiente sesión | Elegir o iterar dirección; luego Auditoría de Release |

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
| Veredicto | **No convence** (Vissiuss); cerramos el día con las tres como pruebas |
| Capturas | `pruebas-fase2/03-soft-struct-inicio.png`, `03-soft-struct-menu.png`, `03-soft-struct-resultados.png` |

---

## Skills de apoyo (no son dirección MOD-DIR)

| Skill | Ruta | Uso |
| :--- | :--- | :--- |
| Job-board search (Indeed CL inspired-by) | `skills/indeed-cl-inspired/SKILL.md` (`19f4fcd2`) | Barra / listado tipo job board |
| Perfil emprendedor (LinkedIn inspired-by) | `skills/linkedin-profile-inspired/SKILL.md` (`b70f294b`) | Perfil público + panel editable |

No sustituyen `direction_skill`. No usan marcas ni assets de terceros en la UI.

---

## Notas para la próxima sesión

1. No marcar look Fase 2 como aprobado hasta que Vissiuss firme una dirección (u otra skill / brandkit propio).
2. El HTML semántico de Fase 1 se mantiene; solo cambia CSS/shell.
3. PR de trabajo: https://github.com/wika-labss/proyectos/pull/117
