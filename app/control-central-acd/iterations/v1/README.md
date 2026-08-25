# Control Central ACD — V1

App Android WIKA. Consulta **solo** la API propia (`consultar_*` en el proyecto Supabase `mercado-publico`).

```
EXPO_PUBLIC_SUPABASE_URL=https://wdpvlmuescstqnliorkx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key mercado-publico>
```

```bash
npm install
npm run smoke
npm run typecheck
npm run verify   # JDK 17 + Android SDK
```

No incluir el ticket de ChileCompra. No llamar `api.mercadopublico.cl` desde el cliente.
