# Geo Empresa V2

Agente Android corporativo con bloqueo PIN, registro único y Supabase selectivo.

## V2 vs V1

| Feature | V2 |
|---------|-----|
| Registro único por `android-{ANDROID_ID}` | Si |
| Histórico Supabase solo anomalías | Si |
| Post-registro solo splash vissiuss | Si |
| Pantalla bloqueo PIN `1312` | Si |
| Lock Task si Device Owner | Si |

Ver [DEVICE-OWNER.md](./DEVICE-OWNER.md) y [DS-IMPLEMENTATION.md](./DS-IMPLEMENTATION.md).

## Comandos

```bash
npm install
npm run typecheck
npm run smoke
bash scripts/build-apk.sh
```
