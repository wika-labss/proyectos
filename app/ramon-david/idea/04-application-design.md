---
id: "DES-001"
title: "Ramon David — Diseño V1–V2 (web)"
status: "EN_REVISION"
version: "1.1.0"
owner: "Vissiuss / Arquitecto WIKA"
created_at: "2026-09-07"
updated_at: "2026-09-07"
audit_1_passed: false
audit_2_passed: false
visual_approval_passed: false
audit_3_passed: false
excepcion_web: true
---

# [04] Diseño de Aplicación, Navegación y Aprobación Visual

> **Pre-requisito:** `audit_2_passed: true` en `03-module-discovery.md`.
> **EXCEPCIÓN WIKA-WEB:** Navegación por URLs HTML, no expo-router. Preview V2 = `iterations/v2/`.

## 1. Identificación y Antecedentes

- **Nombre del Proyecto:** `Ramon David` (Acolchados CD)
- **Documentos base:** `01-problem.md` | `02-features.md` | `03-module-discovery.md`
- **Estado de gatekeeping:** `PENDIENTE_APROBACION_VISUAL`
- **Marca:** Acolchados CD — textiles para dormitorio / hotelería

---

## 2. Arquitectura General

V2 ensambla V1 más:

1. **`iterations/v2/*.html`** — páginas públicas.
2. **`iterations/v2/app.py`** — Flask: público, `/portal`, `/admin` stock, roles.
3. **`data/products.json`**, **`users.json`**, **`stock.json`**, **`stock_movimientos.json`**.
4. **`css/`** + **`css/portales.css`**.

No hay `app/` expo-router ni `src/engine/` TS.

---

## 3. Módulos Utilizados en V1

| ID Módulo | Nombre | Rol en V1 |
| :--- | :--- | :--- |
| `MOD-01` | `mod-catalog-store` | Persistencia |
| `MOD-02` | `mod-catalog-api` | JSON público |
| `MOD-03` | `mod-admin-auth` | Login |
| `MOD-04` | `mod-admin-crud` | Panel |
| `MOD-05` | `mod-uploads` | Imágenes |
| `MOD-06` | `mod-public-site` | Home / nosotros / contacto |
| `MOD-07` | `mod-catalog-ui` | Productos |
| `MOD-08` | `mod-theme` | Tokens CSS |
| `MOD-09` | `mod-web-serve` | HTTP |
| `MOD-10` | `mod-roles` | Login por portal |
| `MOD-11` | `mod-portal-user` | Catálogo interno + edición |
| `MOD-12` | `mod-stock` | Consultas y movimientos |

---

## 4. Relaciones entre Módulos

```text
Visitante → MOD-06/07 → MOD-02 → MOD-01
User      → MOD-10 → MOD-11 → MOD-01
Admin     → MOD-10 → MOD-12
MOD-09 envuelve el proceso
```

Estados de catálogo: `loading` · `success` · `empty` · `error` (fetch).  
Estados admin: `login` · `saved` · `saving` · `error` (sync pill).

---

## 5. Flujo Principal de Usuario

```text
[Home VIEW-01]
    → Productos [VIEW-03] → filtro categoría → detalle en card
    → Nosotros [VIEW-02] / Contacto [VIEW-04]
    → Portal [/portal/login] → [VIEW-07 categorías] → [VIEW-08 productos] → [VIEW-09 editor]
    → Admin [/admin/login] → [VIEW-10 consultas] → movimiento / [VIEW-11 reportes]
```

---

## 6. Navegación (web)

| Ruta | Pantalla | Módulos | Feature |
| :--- | :--- | :--- | :--- |
| `/` · `index.html` | Home | MOD-06, MOD-08, MOD-09 | FEAT-01 |
| `/nosotros.html` | Nosotros | MOD-06 | FEAT-05 |
| `/productos.html` | Catálogo | MOD-07, MOD-02 | FEAT-02 |
| `/contacto.html` | Contacto | MOD-06 | FEAT-05 |
| `/portal/login` | Login usuario | MOD-10 | FEAT-12 |
| `/portal` | Categorías | MOD-11 | FEAT-13 |
| `/portal/c/<slug>` | Productos de categoría | MOD-11 | FEAT-13 |
| `/portal/p/<id>` | Editor | MOD-11 | FEAT-03, FEAT-13 |
| `/admin/login` | Login admin | MOD-10 | FEAT-12 |
| `/admin` | Consultas + movimientos | MOD-12 | FEAT-14 |
| `/admin/reportes` | Reportes / CSV | MOD-12 | FEAT-14 |
| `/api/products` | API pública | MOD-02 | FEAT-02 |

---

## 7. Consumo de Tokens y Theme

> Theme **local web** en `iterations/v1/css/main.css`. No se usa `standards/design-system.md` (tokens móviles). Hex nuevos en páginas públicas deben ir a `:root`.

### Tokens clave V1

| Token semántico | Uso | Valor |
| :--- | :--- | :--- |
| `--ink` | Texto | `#171817` |
| `--muted` | Texto secundario | `#777a74` |
| `--paper` | Fondo | `#f4f3ef` |
| `--cream` | Bandas | `#e9e5dc` |
| `--teal` | CTA / acento | `#148d94` |
| `--line` | Bordes | `rgba(23,24,23,.16)` |
| `--serif` | Títulos | Playfair Display |
| `--sans` | UI | DM Sans |
| header (local) | Barra | `#151716` |

Admin embebido en `app.py` replica `--ink`/`--teal`/`--sand` (`#b98a4a`). Extraer a CSS en v2.

---

## 8. Matriz Preview Visual vs Componentes

| ID Vista | ID Módulo | Superficie | Tokens | Referencia |
| :--- | :--- | :--- | :--- | :--- |
| `VIEW-01` | MOD-06 | Home + hero | `--teal`, `--serif` | `iterations/v1/index.html` |
| `VIEW-02` | MOD-06 | Nosotros + valores ERC | `--paper` | `nosotros.html` |
| `VIEW-03` | MOD-07 | Grilla + filtros | `--paper`, cards | `productos.html` |
| `VIEW-04` | MOD-06 | Formulario contacto | `--ink` | `contacto.html` |
| `VIEW-05` | MOD-03 | Login | `--paper`, `--teal` | `LOGIN_PAGE` |
| `VIEW-06` | MOD-04 | Editor + preview | tokens admin | `ADMIN_PAGE` |

---

## 9. Layout Visual (wireframe / ASCII)

### VIEW-01 Home

```text
┌─────────────────────────────────────────────┐
│ CD  ACOLCHADOS CD    Inicio Nosotros … CTA  │
├─────────────────────────────────────────────┤
│ HERO slider  «Dormitorios de ensueño»       │
├───────────────┬─────────────────────────────┤
│ Intro marca   │  Foto + caption teal        │
├───────────────┴─────────────────────────────┤
│ Productos: Colchas | Pieceras | Sábanas     │
│ Beneficios 01–04                            │
│ Banda servicios  +  cierre CTA              │
├─────────────────────────────────────────────┤
│ Footer: nav · San José 5887 · +56 9 9919…   │
└─────────────────────────────────────────────┘
```

### VIEW-03 Catálogo

```text
┌─────────────────────────────────────────────┐
│ Header                                      │
│ Nuestra colección                           │
│ [Todos] [Sábanas] …          N productos    │
│ ┌────┐ ┌────┐ ┌────┐                        │
│ │card│ │card│ │card│  precio + details      │
│ └────┘ └────┘ └────┘                        │
└─────────────────────────────────────────────┘
```

### VIEW-06 Admin

```text
┌──────────────┬──────────────────┬───────────┐
│ Buscar       │ Título editable  │ Preview   │
│ grupos cat.  │ imagen / campos  │ ficha     │
│ + Nuevo      │ tablas precios   │           │
└──────────────┴──────────────────┴───────────┘
```

---

## 10. Riesgos de Diseño

| Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- |
| Hex en header/hero fuera de `:root` | `Medio` | Tokenizar en v2 (`--header`, `--hero-em`) |
| Admin styles inline en `app.py` | `Medio` | Extraer `css/admin.css` |
| Imágenes Unsplash (no stock propio) | `Bajo` | Sustituir por fotos CD |
| DS V3+ no aplica | `N/A` | Excepción web documentada |

---

## 11. Puerta de Enlace — Aprobación Visual y Ensamblado

### Checklist aprobación visual (Gate 3A)

- [x] Navegación y flujo principal definidos.
- [x] Módulos V1 sin huérfanos.
- [x] Tokens web documentados (no theme Expo).
- [ ] Wireframe / sitio revisado por arquitecto (`visual_approval_passed`).
- [x] Sin dependencias circulares.

### Checklist auditoría de ensamblado (Gate 3B)

- [x] `05-build-plan.md` alineado (V1 as-built).
- [x] Estrategia web (sin APK) documentada.
- [ ] `audits/auditoria-ensamblado.md` en estado `APROBADO`.

### Registro de visto bueno

- **Aprobación visual (Arquitecto / Stakeholder):** `________________________`
- **Fecha visual:** `YYYY-MM-DD`
- **visual_approval_passed:** `false` → `true` al aprobar preview

- **Aprobación ensamblado (Arquitecto):** `________________________`
- **Fecha ensamblado:** `YYYY-MM-DD`
- **audit_3_passed:** `false` → `true` al aprobar ensamblado
