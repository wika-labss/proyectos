# Review — my Pet V1

## Fecha
2026-08-31

## Alcance revisado
Registro de mascota, QR imprimible, landing pública de prueba, alerta con coordenadas, app dueño.

## Estado
Construcción V1 entregada. APK release pendiente de toolchain local (JDK 17 + SDK).

## Cómo probar sin APK
1. `cd iterations/v1 && npm install && npm run web`
2. Abrir `/p/demo-luna` y pulsar el botón (ubicación de prueba si no hay GPS)
3. Abrir `/owner` o la app Expo en Alertas

## Pendiente Release
- `npm run apk` en máquina con SDK
- Auditoría `audits/auditoria-release-v1.md` tras sideload
