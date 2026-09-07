# Ramon David — Acolchados CD

Proyecto WIKA **web** (excepción al stack Expo/Android). Catálogo de [Acolchados CD](https://www.acolchadoscd.cl), precios **valor neto CLP**.

| | |
|---|---|
| Docs oficiales | [`idea/`](./idea/) (01–05) |
| Auditorías | [`audits/`](./audits/) — pendiente de firma |
| Sitio + portales V2 | [`iterations/v2/`](./iterations/v2/) |
| Sitio + admin único V1 | [`iterations/v1/`](./iterations/v1/) |
| Admin HTML → Supabase | [`index.html`](./index.html) |
| Schema / seed | [`supabase/migrations/`](./supabase/migrations/) |

## Excepción de stack

WIKA-ARCH móvil (Expo SDK 52, APK, `src/engine/` TS) **no aplica**.  
Sí aplican: RTM, idea 01–05, `audits/`, `iterations/v{N}/`, pins `~=`.

Hay **dos superficies** en V1 (aún no unificadas; sync = `FEAT-08`):

1. **Sitio** (`iterations/v1/`): home, nosotros, productos, contacto + `/admin` sobre `data/products.json`.
2. **Catálogo GD 2025** (`index.html` + Supabase): CRUD directo a Postgres.

---

## Sitio V2 (Flask — usar este)

```bash
cd iterations/v2
python3 -m pip install -r requirements.txt
python3 app.py --host 0.0.0.0 --port 5003
```

- Público: http://127.0.0.1:5003/
- Portal usuario: http://127.0.0.1:5003/portal (`user` / `usuario123`)
- Admin stock: http://127.0.0.1:5003/admin (`admin` / `cambiar123`)

Detalle: `iterations/v2/README.md`. V1 queda en `iterations/v1/`.

---

## Supabase (catálogo GD 2025)

| Campo | Valor |
|-------|-------|
| **Proyecto** | ramon-david |
| **Ref** | `lgafrcuuvfexvlsmveju` |
| **Región** | sa-east-1 |
| **URL** | https://lgafrcuuvfexvlsmveju.supabase.co |
| **Dashboard** | https://supabase.com/dashboard/project/lgafrcuuvfexvlsmveju |

Claves publicables: `env.example`. **Nunca** uses `service_role` en el cliente.

```
categories  1──N  products  1──N  product_variants
                    ├── product_colors  N──1  colors
                    └── product_fabrics N──1  fabrics
```

Admin HTML (escribe en vivo; no publicar en internet abierto):

```bash
python3 -m http.server 8765
# http://127.0.0.1:8765
```

O `./abrir-admin.sh`.
