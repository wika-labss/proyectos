# Problema

## Contexto

Las linternas del teléfono son una de las utilidades más usadas en situaciones de emergencia, cortes de luz, espacios oscuros o señalización. La mayoría de apps de linterna en Android son genéricas, llenas de publicidad o con interfaces poco claras. Existe demanda de una herramienta simple, confiable y visualmente distintiva que aproveche el flash LED del dispositivo sin depender de internet.

## Problema a resolver

Crear una aplicación de linterna para Android que controle el flash LED del teléfono, ofrezca un modo SOS de señalización de emergencia y permita regular la intensidad de la luz, con una experiencia visual gótica y controles accesibles con una sola mano.

## Usuarios objetivo

| Perfil | Necesidad |
|--------|-----------|
| Usuario cotidiano | Encender/apagar la linterna rápidamente en situaciones cotidianas |
| Usuario en emergencia | Activar señal SOS reconocible internacionalmente sin configuración previa |
| Usuario nocturno | Ajustar intensidad para no deslumbrar en espacios cerrados |
| Usuario Android | App ligera, offline, sin permisos innecesarios más allá de cámara/flash |

## Restricciones

- **Plataformas:** Android (API 24+, Android 7.0+) — **v1 solo Android**
- **Conectividad:** 100% offline, sin backend ni servicios en la nube
- **Hardware:** Requiere dispositivo con flash LED trasero; mostrar mensaje claro si no está disponible
- **Rendimiento:** Encendido/apagado del flash en < 300 ms; modo SOS con timing preciso (±50 ms)
- **Almacenamiento:** Persistir preferencia de intensidad y último modo usado localmente
- **Tamaño de app:** < 15 MB instalado
- **Permisos:** Solo `CAMERA` / `FLASHLIGHT` (necesarios para control del LED en Android)

## Criterios de éxito

- [ ] La app enciende y apaga el flash LED del teléfono de forma confiable en dispositivos Android compatibles
- [ ] El modo SOS transmite el patrón estándar `··· ——— ···` (3 cortos, 3 largos, 3 cortos) de forma continua hasta desactivarse
- [ ] El control de intensidad modifica el brillo percibido de la linterna mediante PWM software (duty efectivo 20–80%; torch strength nativo fuera de alcance en v1)
- [ ] La interfaz sigue el estilo gótico definido en `04-design.md` (negro, morado, rojo oscuro, botones blancos)
- [ ] La app funciona sin conexión a internet
- [ ] Un usuario puede encender la linterna en menos de 2 toques desde abrir la app
- [ ] El APK **release** compila, se instala por sideload y funciona en el teléfono sin PC ni servidor Metro
