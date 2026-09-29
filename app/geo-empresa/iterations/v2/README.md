# Geo Empresa V2.4

Kiosco Device Owner **inmediato** (sin snooze) si:

- modo avión
- GPS apagado
- sin internet / sin Supabase

Ping de ubicación cada **30 s** (nativo + consola). Si la consola ve **fuera de 20 m**, envía `lock`. PIN `1312`.

Consola: [admin/index.html](./admin/index.html). Clave `geo-ti-consola-1982`.

```bash
npm install
npm run typecheck
npm run smoke
bash scripts/build-apk.sh
```
