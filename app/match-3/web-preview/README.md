# Match-3 América — preview web compartible

**Versión:** 4.2.0  
**Fuente:** `iterations/v4.2/`

## URL pública (túnel Cloudflare)

https://chubby-tone-questionnaire-deliver.trycloudflare.com

Abre en el móvil o el PC. No hace falta Metro ni APK.

El túnel vive mientras el agente/VM esté arriba. Para regenerarlo:

```bash
cd app/match-3/iterations/v4.2
npx expo export --platform web --output-dir /tmp/match3-v42-web
npx serve -s /tmp/match3-v42-web -l 8090
cloudflared tunnel --url http://127.0.0.1:8090
```

Alternativa localtunnel: https://match3-america-v42.loca.lt

Códigos: `vissiuss` (+1 000 000, máx. 3) · `map` (abre países).
