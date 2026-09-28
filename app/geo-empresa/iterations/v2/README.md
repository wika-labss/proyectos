# Geo Empresa V2.3

Servicio en primer plano + kiosco Device Owner. Bloquea con la misma ruta de modo avión si:

- modo avión
- fuera de **20 m**
- no hay conexión con Supabase (base)
- no llega ping de la consola TI (45 s, tras el primer vínculo)
- comando **lock** desde la consola

PIN `1312`. Consola: [admin/index.html](./admin/index.html). Clave `geo-ti-consola-1982`.

```bash
npm install
npm run typecheck
npm run smoke
bash scripts/build-apk.sh
```
