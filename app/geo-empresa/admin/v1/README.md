# Geo Empresa — Panel TI V1

Next.js 14 + `@supabase/ssr`. Login con usuario Auth que tenga `perfiles.rol = ti`.

```bash
cp .env.example .env.local
# NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run typecheck
npm run dev
```

Seed TI (Dashboard, no commitear contraseña):

1. Auth → Create user
2. SQL: `insert into perfiles (id, rol, nombre) values ('<auth user uuid>', 'ti', 'TI');`
