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
- idea/01 y idea/02 en v1.1.0; audit_1_passed: true; estado AUDIT_1_APROBADO
- audits/auditoria-documentacion.md → APROBADO
- DEC-04 cerrada: proyecto nfryurrhgaeepdwqtswo, región sa-east-1, URL https://nfryurrhgaeepdwqtswo.supabase.co
- Tabla public.evidencia (RLS activo) y bucket privado evidencia
- Migración: supabase/migrations/20261105190131_create_evidencia.sql
- idea/03-module-discovery.md v1.0.0; audit_2_passed: false
- audits/auditoria-modulos.md → PENDIENTE_ARQUITECTO
- idea/04 y idea/05 siguen en plantilla
- iterations/ vacío
- final/ vacío
- No hay código de producto. Gate 2, visto visual, Gate 3 y ready_for_construction siguen en false

Siguiente: el Arquitecto revisa el Gate 2. Después, diseño (04). La API y la app se construyen solo con ready_for_construction.
