my Pet — proyecto WIKA (placa QR + alerta de hallazgo)

Fuente: wika-fundaments @ wika-fundaments-v2
Stakeholder: Vissiuss (solicitud explícita de V1 + web de prueba, 2026-08-31)

Producto V1:
- Registrar mascota: nombre, especie, dirección
- Al registrar se capturan coordenadas GPS como "casa"
- Genera QR imprimible (URL pública de la web de prueba)
- Escanear el QR fuera de la app abre una página web
- Botón "Encontré tu mascota / parece perdida" dispara alerta con GPS del hallazgo
- La app del dueño muestra la alerta y las coordenadas
- Entregable: APK Release SIN Metro + servidor web de prueba local

Estado:
- idea/ documentado V1 (01–05) — gates activados por solicitud de construcción
- audits/ documentación + módulos + ensamblado → APROBADO
- iterations/v1/ construido (engine + Expo + web/server de prueba)

Cómo probar la web:
  cd iterations/v1 && npm install && npm run web
  Abrir http://127.0.0.1:8787/p/demo-luna

Siguiente: npm run apk (JDK 17 + SDK) → sideload → auditoría Release → final/
