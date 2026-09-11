# Evaluación Proyectos — Vissiuss

App interna para calificar **Proyecto Alan**, **Proyecto Alvaro** y **Proyecto Joaquin**. Fondo negro, tipografía sobria, bordes grises.

| | |
|---|---|
| Docs oficiales | [`idea/`](./idea/) (01–05) |
| Auditorías | [`audits/`](./audits/) |
| App Expo V1 | [`iterations/v1/`](./iterations/v1/) |
| Schema | [`supabase/migrations/`](./supabase/migrations/) |

## Flujo

Splash 5 s (wordmark VISSIUSS) → login (nombre) → home (3 proyectos) → detalle (1–5 × 3 criterios) → `POST /rest/v1/eval_evaluations`.

La UI **no** muestra promedios. Las filas se ven en el dashboard de Supabase.

## Supabase

El plan Free de la org **vissiusscomp** admite **2 proyectos activos**. Hoy están ocupados por `mercado-publico` y `ramon-david`; `geo-empresa` y el proyecto genérico están pausados. No se creó un tercer proyecto para no pausar un producto en uso.

El espacio de evaluación vive en **mercado-publico** con tablas propias (`eval_*`), RLS y seed de los tres proyectos.

| Campo | Valor |
|---|---|
| **Proyecto** | mercado-publico |
| **Ref** | `wdpvlmuescstqnliorkx` |
| **Región** | sa-east-1 |
| **URL** | https://wdpvlmuescstqnliorkx.supabase.co |
| **Dashboard** | https://supabase.com/dashboard/project/wdpvlmuescstqnliorkx |
| **Tablas** | `eval_projects`, `eval_evaluations` |

Claves publicables: `env.example`. Nunca uses `service_role` en el cliente.

```
eval_projects  1──N  eval_evaluations
```

## App

```bash
cd iterations/v1
npm install
cp ../../env.example .env
npm start
```

Verificación V1: `npm run typecheck` y `npm run smoke`.
