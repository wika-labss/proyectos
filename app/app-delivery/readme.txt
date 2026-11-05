app-delivery — proyecto WIKA

Fuente: wika-fundaments @ wika-fundaments-v2
Ruta: proyectos/app/app-delivery/

Producto de prueba (Negocio, 2026-11-05):
- Cámara para fotografiar el pedido en una disputa de devolución
- Clave de la evidencia: agregador (Uber o PedidosYa) + número de orden
- API para enviar, guardar y pedir la imagen
- Destino: una base Supabase propia de esta prueba

Estado:
- Gate 1 APROBADO el 2026-11-05 por Negocio, instrucción explícita
- idea/01 y idea/02 en v1.1.0; audit_1_passed: true
- audits/auditoria-documentacion.md → APROBADO
- DEC-04 cerrada: proyecto nfryurrhgaeepdwqtswo, región sa-east-1, URL https://nfryurrhgaeepdwqtswo.supabase.co
- Tabla public.evidencia (RLS activo) y bucket privado evidencia
- Migración: supabase/migrations/20261105190131_create_evidencia.sql
- Gate 2 APROBADO el 2026-11-05 por Negocio, instrucción «seguimos con el flujo»
- idea/03-module-discovery.md; audit_2_passed: true
- audits/auditoria-modulos.md → APROBADO
- idea/04-application-design.md v1.0.0; visual_approval_passed: false; audit_3_passed: false
- Pantallas: / Captura y /consulta
- idea/05 sigue en plantilla
- iterations/ vacío
- final/ vacío
- No hay código de producto. ready_for_construction sigue en false

Siguiente: visto visual del wireframe (Gate 3A). Después, plan de construcción (05). La API y la app se construyen solo con ready_for_construction.
