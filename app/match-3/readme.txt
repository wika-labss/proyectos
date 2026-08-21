Match-3 América — proyecto WIKA

Fuente: wika-fundaments @ wika-fundaments-v2

Producto V1:
- Match-3 Android offline, tablero 8×10
- Mundo: 5 países de América (México → Colombia → Perú → Brasil → Argentina)
- 10 niveles por país (50 totales); dificultad fácil/media oculta
- Inventario de recompensas; hint idle 5s; botón pánico (reshuffle)
- Umbral de puntos por nivel; umbral de recompensas para desbloquear país
- Motor: TypeScript puro src/engine/match3Engine.ts (Expo SDK 52)

Estado:
- idea/ documentado V1 (01–05)
- audits/ documentacion + módulos + ensamblado + release → APROBADO (sideload pendiente)
- ready_for_construction: true
- iterations/v1/ construido (smoke + typecheck + APK Release)
- APK: iterations/v1/android/.../app-release.apk · artifact match-3-america-v1-release.apk
- final/ vacío

Siguiente: sideload en dispositivo → copiar a final/ si aplica
