# Problema

## Contexto

Los usuarios de Android suelen consultar la hora desde la pantalla de inicio o la pantalla de bloqueo. Las apps de reloj genéricas suelen tener diseños planos y modernos que no destacan, y muchas no ofrecen un widget nativo bien integrado. Existe demanda de un reloj digital con estética **retro** (LCD/VFD/7 segmentos) que funcione tanto como app como **widget en la pantalla de inicio**, sin depender de internet.

## Problema a resolver

Crear una aplicación de **reloj digital retro** para Android que muestre la hora actual con estética de display clásico (7 segmentos / VFD), permita personalización básica, y **registre un widget de pantalla de inicio** que muestre la hora con el mismo estilo visual — visible sin abrir la app.

## Usuarios objetivo

| Perfil | Necesidad |
|--------|-----------|
| Usuario cotidiano | Ver la hora de un vistazo en la pantalla de inicio |
| Aficionado retro | Estética nostálgica tipo reloj digital de los 70–80 |
| Usuario Android | Widget nativo, app ligera, offline, sin cuenta |
| Usuario minimalista | Sin publicidad, sin funciones innecesarias — solo la hora |

## Restricciones

- **Plataformas:** Android (API 24+, Android 7.0+) — **v1 solo Android**
- **Conectividad:** 100% offline, sin backend ni servicios en la nube
- **Widget:** Obligatorio en v1 — debe poder añadirse desde el selector de widgets de Android
- **Actualización de hora:** La app actualiza en tiempo real (cada segundo); el widget respeta límites del sistema Android (ver `02-features.md`)
- **Rendimiento:** Arranque de app < 2 s; consumo de batería mínimo en widget
- **Almacenamiento:** Persistir preferencias de formato y tema localmente
- **Tamaño de app:** < 20 MB instalado
- **Permisos:** Sin permisos sensibles en v1 (no requiere ubicación, cámara ni internet)

## Criterios de éxito

- [ ] La app muestra la hora actual en formato digital con estilo retro (display 7 segmentos)
- [ ] El usuario puede añadir un **widget** desde la pantalla de inicio de Android
- [ ] El widget muestra la hora con la misma estética retro que la app
- [ ] La app funciona sin conexión a internet
- [ ] Preferencias (formato 12h/24h, color del display) persisten entre sesiones
- [ ] El APK **release** compila, se instala por sideload y funciona en dispositivo físico sin Metro
