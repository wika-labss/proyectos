# Ramon David — Catálogo GD 2025

Base de datos del catálogo de [Acolchados CD](https://www.acolchadoscd.cl) (ropa de cama para hotelería). Precios **valor neto CLP**.

## Supabase

| Campo | Valor |
|-------|-------|
| **Proyecto** | ramon-david |
| **Ref** | `lgafrcuuvfexvlsmveju` |
| **Región** | sa-east-1 (São Paulo) |
| **URL** | https://lgafrcuuvfexvlsmveju.supabase.co |
| **Dashboard** | https://supabase.com/dashboard/project/lgafrcuuvfexvlsmveju |
| **Org** | vissiusscomp's Org |
| **Costo** | $0 / mes (plan gratuito) |

Claves publicables (sí van en el cliente). **Nunca** uses la `service_role` en frontend.

```
SUPABASE_URL=https://lgafrcuuvfexvlsmveju.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnYWZyY3V1dmZleHZsc212ZWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3OTAxOTQsImV4cCI6MjEwNDM2NjE5NH0._FSjW4RqkAqk8NWO9gPU3LGGdm6gr9MXbnxCgDQxdDM
SUPABASE_PUBLISHABLE_KEY=sb_publishable_Frt6BSAPN4-jM1m7JbrDKQ_a2Pnr9A9
```

## Modelo

```
categories  1──N  products  1──N  product_variants
                    │
                    ├── product_colors  N──1  colors
                    └── product_fabrics N──1  fabrics
```

| Tabla | Contenido |
|-------|-----------|
| `categories` | Sábanas, plumones, quilts, cubre plumón, pieceras, colchas, almohadas, faldones, toallas, cubre colchón, servicios |
| `products` | 22 ítems (fichas 1–17 del PDF; varias SKU por misma ficha) |
| `product_variants` | 103 filas: talla + opción + precio neto (2.950–47.800 CLP) |
| `catalogo_precios` | Vista lista para cotizar |

RLS: lectura y **CRUD** para `anon` / `authenticated` (el admin HTML escribe directo). No publiques la página en internet abierto: quien tenga el HTML puede editar el catálogo.

## Admin HTML

Abre `index.html` (mejor con un servidor local):

```bash
cd app/ramon-david
python3 -m http.server 8765
# http://127.0.0.1:8765
```

Desde ahí puedes listar, crear, editar y eliminar productos y precios. Los cambios van a Supabase en vivo.

## Consultas útiles

Todos los precios:

```sql
select catalog_number, product_name, size_label, option_label, price_neto_clp
from catalogo_precios
order by catalog_number, product_id, size_label;
```

Sábanas 300 hilos:

```sql
select size_label, extra, price_neto_clp
from catalogo_precios
where product_id = 'sabana-300';
```

API REST (anon key):

```http
GET https://lgafrcuuvfexvlsmveju.supabase.co/rest/v1/catalogo_precios?select=*
apikey: {SUPABASE_ANON_KEY}
Authorization: Bearer {SUPABASE_ANON_KEY}
```

## Notas de extracción del PDF

- Cruce talla ↔ medida de sábanas inferido (el PDF mezcla columnas).
- Piecera **1 plaza**: mencionada en notas, **sin precio**.
- Faldón: el PDF duplica “1.5 plazas”; el precio 9.600 se asignó a **1 plaza**.
- Fichas 4, 5, 12, 13 y 15 tienen **dos SKU** cada una.

## Archivos

- `index.html` — admin CRUD conectado a Supabase
- `abrir-admin.sh` — sirve la página en el puerto 8765
- `supabase/migrations/20260907152300_catalogo_gd_2025.sql` — schema + seed
- `supabase/migrations/20260907173700_catalogo_gd_2025_crud_policies.sql` — políticas de escritura
- `env.example` — variables de entorno
