# Look LinkedIn / perfil profesional — notas

**Rama:** `cursor/look-linkedin-aa58`  
**Capturas:** `look-linkedin-inicio.png`, `look-linkedin-resultados.png`, `look-linkedin-perfil.png`, `look-linkedin-mobile.png`  
**Veredicto:** pendiente (experimento Team A)

## Tokens

| Rol | Valor |
| :--- | :--- |
| Page wash | `#f4f2ee` (`--lp-bg`) |
| Surface | `#ffffff` |
| Border | `#e0ded8` hairline |
| Text | `#191919` / muted `#666666` |
| **Acento único** | teal `#0f766e` → hover `#0d5f59` · soft `#e6f4f2` |
| Radius | 8–10px (CTA / cards); chips 8px (no pill-full) |
| Shadow | hairline + soft `0 2px 8px` (sin multi-layer glow) |

**Tipografía:** Syne (logo + H1 nombre) · Plus Jakarta Sans (UI / cuerpo).  
**Evita:** azul job-board, cream+terracotta+serif, glass isla Soft Structuralism, grain orgánico 4b.

## Estructura que cambió

1. **Header** — `lp-header` plano blanco (sin `backdrop-filter` / isla); logo + nav; lema debajo.
2. **Home** — search-first Qué / Dónde + Buscar; kicker “Portal de oficios”; resultados densos título → empresa → distancia → meta.
3. **Perfil** — `ep-topcard` (banner teal + foto/inicial overlapping + H1 + headline + localidad + **Contactar** en hero); TOC sticky; secciones en bloques blancos; portafolio rail horizontal; Contactar repetido en `#contacto` con `#contacto-dato`.
4. **Motion** — reveals suaves translateY/opacity (header, search, topcard, secciones).

## Invariantes Fase 1

Ids `#form-buscar`, `#q`, `#localidad`, `#usar-ubicacion`, `#ubicacion-actual`, `#estado-busqueda`, `#reintentar`, `#resultados`, `#contacto-dato`, `tel:`/`mailto:`/`https:` en Contactar. Sin marcas “LinkedIn”/“Indeed” en UI.
