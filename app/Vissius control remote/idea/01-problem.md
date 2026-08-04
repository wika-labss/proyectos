# Problema

## Contexto

Los sistemas de control domótico e industrial cada vez más permiten operación remota desde el móvil. Los usuarios de equipos Vissius necesitan controlar sus dispositivos (encendido, modos, ajustes) sin depender de un panel físico ni de una conexión a internet externa. Las soluciones genéricas suelen ser complejas, requieren cuentas en la nube o no están adaptadas al protocolo Vissius.

## Problema a resolver

Crear una aplicación móvil de **control remoto** para dispositivos Vissius que permita descubrir equipos en la red local, conectarse de forma segura y enviar comandos de control con feedback de estado en tiempo real, con una interfaz clara y usable con una sola mano.

## Usuarios objetivo

| Perfil | Necesidad |
|--------|-----------|
| Operador doméstico | Encender/apagar y cambiar modos del equipo Vissius desde el sofá |
| Técnico de instalación | Emparejar y probar dispositivos en sitio sin panel físico |
| Usuario avanzado | Ajustar parámetros (temperatura, velocidad, escenas) con precisión |
| Usuario móvil Android | App ligera, funcional en red local, sin registro obligatorio en v1 |

## Restricciones

- **Plataformas:** Android (API 24+, Android 7.0+) — **v1 solo Android**
- **Conectividad:** Red local WiFi (LAN); sin backend en la nube en v1
- **Protocolo:** Comunicación HTTP/REST o WebSocket con API Vissius documentada internamente
- **Rendimiento:** Respuesta a comando < 500 ms en LAN; reconexión automática si se pierde enlace
- **Almacenamiento:** Persistir último dispositivo conectado y preferencias localmente
- **Tamaño de app:** < 20 MB instalado
- **Permisos:** `INTERNET`, `ACCESS_NETWORK_STATE`, `ACCESS_WIFI_STATE` (red local)

## Criterios de éxito

- [ ] La app descubre o permite conectar manualmente a un dispositivo Vissius en la misma red WiFi
- [ ] El usuario puede encender/apagar y cambiar al menos 3 modos de operación del equipo
- [ ] El estado del dispositivo (conectado, encendido, modo activo) se refleja en la UI en tiempo real
- [ ] La app funciona sin conexión a internet externa (solo LAN)
- [ ] Un usuario puede controlar el equipo en menos de 3 toques desde abrir la app
- [ ] El APK **release** compila, se instala por sideload y funciona en el teléfono sin PC ni servidor Metro
