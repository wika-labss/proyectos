# my Pet — iterations/v1

App Android (Expo SDK 52) + **web de prueba** para el QR de hallazgo.

## Arranque rápido

```bash
cd proyectos/app/my-pet/iterations/v1
npm install
npm run web          # http://127.0.0.1:8787
```

Landing semilla (sin registrar nada):

- http://127.0.0.1:8787/p/demo-luna
- Botón **Encontré tu mascota / parece perdida**
- **Enviar con ubicación de prueba** (Santiago) si el GPS del navegador no está disponible
- Dashboard HTML: http://127.0.0.1:8787/owner
- Ficha imprimible: http://127.0.0.1:8787/print/demo-luna

App dueño (otro terminal):

```bash
npx expo start
```

En Ajustes, apunta la API a la web:

| Dónde corre la app | URL |
|---|---|
| Expo web / este entorno | `http://127.0.0.1:8787` |
| Emulador Android | `http://10.0.2.2:8787` |
| Teléfono físico | `http://<IP-LAN>:8787` |

## Verificar

```bash
npm run smoke        # engine
npm run smoke:web    # HTTP landing + alerta + QR PNG
npm run typecheck
npm run verify       # los tres
```

APK release (JDK 17 + Android SDK): `npm run apk`

## Flujo

1. Registrar mascota (nombre, especie, dirección, GPS casa).
2. Imprimir / compartir QR (`/p/{token}`).
3. Un extraño escanea **fuera de la app** (cámara nativa).
4. Pulsa el botón → POST alerta con lat/lng.
5. La app lista la alerta (polling 5s) y la distancia a casa.

Package: `com.wika.mypet`
