# Geo Empresa — Panel TI V1

Next.js + `@supabase/ssr`. Login con usuario Auth que tenga `perfiles.rol = ti`.

**Congelado.** Ver [`../../STATUS.md`](../../STATUS.md).

```bash
cp .env.example .env.local
# NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run typecheck
npm run dev
```

## Uso

1. Login (lab: `pureba` o `pureba@geo-empresa.local`).
2. **Flota corporativa** es el resumen (perímetro, Owner, enrollment, ping).
3. Clic en el **nombre** del dispositivo → ficha `/dispositivos/<id>`.
4. Ahí: Aprobar / Rechazar / Bloquear / Liberar / Reiniciar / Nuevo PIN.
5. `Enrollment` = instrucciones `dpm`. No gestiona equipos.

Los comandos se aplican en el próximo poll del agente (30–60 s).  
`Reiniciar` y `Nuevo PIN` fallan si el teléfono no es Device Owner (el agente acusa el error).

Seed TI (Dashboard, no commitear contraseña):

1. Auth → Create user
2. SQL: `insert into perfiles (id, rol, nombre) values ('<auth user uuid>', 'ti', 'TI');`
