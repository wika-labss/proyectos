# Jobbing.cl — funciones del producto

Inventario de lo que se ve en público el 4 de noviembre de 2026. Se recorrieron páginas renderizadas (home, directorio, fichas, categorías, ciudades, alta, login, planes y formularios). No se creó ninguna cuenta ni se envió ninguna solicitud. Lo que exige sesión, token o pago y no se abrió queda marcado como no verificado.

Sitio: https://www.jobbing.cl/  
Portal de profesionales: https://profesionales.jobbing.cl/

## Actores

- **Cliente.** Persona que publica una solicitud para su casa, departamento u oficina y elige con quién avanzar. Tiene cuenta propia, distinta de la del profesional.
- **Profesional independiente.** Persona que ofrece oficios a domicilio. Crea un perfil, declara especialidades y comunas, y decide qué solicitudes toma. La cuenta se usa en la app Android o en el portal web (el alta indica el portal web para iPhone).
- **Empresa u oficio con marca.** El mismo directorio muestra perfiles marcados como empresa: razón o nombre comercial, RUT, sitio, Instagram y una persona a cargo. No es un actor separado del profesional; es un tipo de ficha.
- **Empresa que busca gente.** Puede publicar un trabajo para recibir interesados. El pie distingue “buscar personal” de “soy profesional”.
- **Operación corporativa (Jobbing Empresas).** Pantalla para facilities, colegios, clínicas, comunidades y carteras de propiedades. El alta no es un formulario: pide demo o WhatsApp. El alcance del producto interno no se abrió.
- **Jobbing.** Opera la plataforma de contacto. Los términos públicos dicen que no ejecuta el trabajo ni contrata al profesional en nombre del cliente. El pago del trabajo se acuerda entre cliente y profesional, con una pasarela opcional anunciada pero no usada en esta revisión.

Hay enlaces a Jobbing Argentina, Perú y México. No se revisaron.

## Objetos que aparecen

| Objeto | Qué muestra en público |
| --- | --- |
| Solicitud | Descripción del trabajo, comuna, fotos opcionales, y luego nombre, teléfono y correo del cliente. |
| Categoría / oficio | 13 categorías: aire acondicionado, armar e instalar, arreglos menores, carpintería, electricidad, fletes y mudanzas, gasfitería, jardinería, limpieza, otros, pintar, remodelación, soldadura. |
| Trabajo frecuente | Dentro de una categoría, botones de tareas concretas (por ejemplo, en gasfitería: cambio de flexible, destape, detección de fuga). |
| Perfil de persona | Nombre visible, distintivo destacado, nota, cantidad de opiniones, actividad reciente, texto de presentación, oficios, botón de solicitud y WhatsApp. |
| Perfil de empresa | Además: etiqueta Empresa, campo RUT, sitio web, Instagram, persona a cargo, servicios con precio y portafolio. |
| Servicio con precio | Nombre, “desde” un monto, qué incluye, condiciones, comunas de atención, fecha de confirmación del precio y botón para cotizar. No está en todas las fichas. |
| Portafolio | Bloque “trabajos realizados”: título del trabajo y cantidad de fotos. No está en todas las fichas. |
| Reseña | Autor, fecha, estrellas y comentario, o la nota de que no dejó comentario. Las fichas visitadas marcan “experiencias verificadas”. |
| Ubicación | Comuna elegida de una lista. En el directorio, varias comunas. En la tarjeta, comuna principal y un “+N”. No apareció mapa ni permiso de GPS. |
| Cobertura | Región, ciudad y combinación categoría + ciudad. |
| Plan | Gratis, Empresa Pro y Empresa Activa, con precio mensual visible. |
| Guía de precio | Rango referencial en pesos, buscable por texto y categoría. No es una cotización. |
| Mensaje | Mencionados el chat de la solicitud, WhatsApp del profesional y WhatsApp de soporte. El hilo real cliente–profesional no se abrió con sesión. |
| Puntos | El plan de pago habla de puntos para abrir solicitudes y de solicitudes privadas que no los gastan. La compra no se ejecutó. |

## Flujos vistos

### Buscar

1. Home y directorio listan profesionales sin login.  
   https://www.jobbing.cl/  
   https://www.jobbing.cl/directorio-profesionales
2. El directorio mostró 1.606 profesionales activos y paginación (páginas 1, 2 y 134).
3. Cada tarjeta lleva a una ficha `/p/{slug}`.
4. También se llega por categoría, por ciudad y por categoría + ciudad.

### Filtrar y ordenar

En https://www.jobbing.cl/directorio-profesionales:

- Texto: nombre o servicio.
- Categoría, con las 13 del sitio.
- Comunas: botón “Todas” abre un buscador y permite marcar más de una.
- Orden: recomendados, mejor valorados, actividad más reciente.
- Nota: todas, 4,5 o más, 4,0 o más.
- Actividad: activos en los últimos 7 días.
- Desde el directorio se puede saltar a publicar una solicitud si se prefiere recibir propuestas.

### Publicar una solicitud (cliente)

Formulario del home, repetido en categoría, ciudad y categoría + ciudad. No hace falta estar logueado para verlo.

Paso 1, en https://www.jobbing.cl/ y en https://www.jobbing.cl/#buscar-servicio:

- Descripción del trabajo.
- Comuna, con autocompletado. Si se sigue sin elegir una de la lista, el sitio pide seleccionarla. Se comprobó con “Providencia”.
- Fotos, marcadas como opcionales (jpeg, png, gif, webp).

Paso 2, visto al continuar con descripción y comuna, sin enviar:

- Nombre y apellido.
- Teléfono con prefijo +56.
- Correo.
- Casilla de aceptación de términos y de privacidad, y autorización para compartir el contacto y los antecedentes de la solicitud con profesionales interesados, para que coticen.
- Botón “Enviar solicitud”. No se envió.

Otra entrada, https://www.jobbing.cl/Solicitudes, solo muestra las 13 categorías. No se hizo clic en una, así que el paso siguiente de esa pantalla queda sin verificar.

Desde la ficha, “Enviar solicitud” abre un recuadro con descripción y comuna, y el texto de que la solicitud se publica para que ese profesional decida si contacta. No se completó el envío.  
Ejemplo de ficha: https://www.jobbing.cl/p/mauricio-nunez-romo

### Contactar

- WhatsApp del perfil: enlace del tipo `https://backend1.jobbing.cl/api/profesionales/{id}/whatsapp`. No se abrió el chat.
- En ficha de empresa también hay sitio web e Instagram, si el perfil los cargó.
- Soporte de la plataforma: botón de WhatsApp en el pie y correo publicado `contacto@jobbing.cl` en planes y preguntas frecuentes.
- Lanzador “¿Necesitas ayuda?” en las pantallas. No se recorrió la conversación de ese asistente.

### Registrarse e ingresar (cliente)

https://www.jobbing.cl/Login

- Ingreso: correo y contraseña. Enlace de vuelta a la ruta previa (`ultima_ruta`).
- “Continuar con Google”. No se completó el OAuth.
- “Crea tu cuenta”, en la misma URL: nombre, correo, teléfono con prefijo de país, contraseña (el campo pide al menos 6 caracteres) y repetición. No se creó la cuenta.
- “¿Olvidaste tu contraseña?”: pide el correo y ofrece enviar un enlace. No se envió.

https://www.jobbing.cl/usuario/Inicio redirige a ese login. El interior de la cuenta no se vio.

### Publicar perfil (profesional)

https://www.jobbing.cl/Trabajos y el mismo alta en https://profesionales.jobbing.cl/registrarse

El sitio dice que crear la cuenta es gratis y que la clave llega por correo.

Paso de datos, con campos marcados obligatorios en el formulario:

- Nombre, apellido, correo, celular y tipo de teléfono (Android: app; iPhone: portal web).
- Prefijo de país, Chile +56 entre otras opciones.

Paso de perfil, visible en la misma página:

- Texto sobre la experiencia (tope 1.000 caracteres).
- Especialidades, más de una, de la lista de 13 categorías.
- Comunas de trabajo, con buscador. El texto dice que se verán solicitudes de las regiones donde se marque alguna comuna, y que después se ajustan en la app.
- Aceptación de los términos para profesionales.

No se envió el formulario. El enlace “ya tengo cuenta” lleva al portal.

### Ingresar como profesional

https://profesionales.jobbing.cl/ingresar

- Correo y contraseña, mismas credenciales que la app.
- Google, en pestaña nueva. No se completó.
- Recuperación: https://profesionales.jobbing.cl/recuperar-contrasena pide el correo. No se envió.
- Registro: https://profesionales.jobbing.cl/registrarse

### Planes, sin pagar

https://www.jobbing.cl/planes-premium explica dos planes de pago y enlaza al portal.  
Los precios están en https://profesionales.jobbing.cl/planes:

- **Gratis, $0.** Perfil, gestión de presupuestos y clientes, compra de puntos cuando se quiera, presencia básica en el directorio y una prueba de IA de 15 generaciones.
- **Empresa Pro.** Precio promocional visible de $7.490 al mes por 3 meses y luego $14.990 al mes, IVA incluido. Suma perfil de empresa, más visibilidad, presupuestador con IA, WhatsApp en la ficha pública y solicitudes privadas con contacto directo sin gastar puntos.
- **Empresa Activa.** $19.990 al mes por 3 meses y luego $29.990 al mes, IVA incluido. Suma 15.000 puntos al mes, distintivo destacado, avisos con la marca, estadísticas avanzadas y soporte prioritario.

La página dice renovación mensual, cancelación del siguiente período y promoción de una sola vez. Los botones “Comenzar” no se pulsaron: el cobro y el alta del plan no se verificaron.

La guía pública https://profesionales.jobbing.cl/guia-premium describe, sin entrar a una cuenta, presupuestos con IA, WhatsApp del asistente, contactos, agenda, cobros con Mercado Pago, marca de la empresa, visibilidad y puntos. Eso es texto de ayuda, no una función ejecutada.

### Empresas que contratan

https://www.jobbing.cl/empresas redirige a https://www.jobbing.cl/empresas/solicitar-trabajadores

El paso 1, “El trabajo”, marca con asterisco:

- Nombre de la empresa.
- Perfil o servicio: construcción y obra, mantención general, electricidad, gasfitería, pintura, carpintería y muebles, soldadura y estructuras metálicas, aseo y limpieza, fletes y mudanzas, jardinería, montaje e instalaciones, u otro.
- Comuna, desde una lista. Sin elegirla, el formulario lo pide.
- Descripción, tope 1.500 caracteres.

La pantalla anuncia un paso 2, “Contacto”, y dice que la publicación es sin costo, con contacto directo y sin obligación de contratar. Ese paso 2 no se logró abrir: la comuna no quedó seleccionada en la prueba. Sus campos no se inventan.

https://www.jobbing.cl/TrabajosIns es la oferta “Jobbing Empresas”: solicitudes, visitas, presupuestos, seguimiento e historial para varias propiedades. Las acciones visibles son “quiero una demo” y WhatsApp comercial. No hay precios ni panel en esa URL.

### Categorías, cobertura y contenido

- Categoría: https://www.jobbing.cl/categoria/gasfiteria (el resto usa el mismo patrón `/categoria/{slug}`).
- Trabajos frecuentes de esa categoría y enlaces a la categoría en cada ciudad publicada.
- Regiones: https://www.jobbing.cl/regiones y https://www.jobbing.cl/regiones/metropolitana-de-santiago
- Ciudades publicadas: Antofagasta, La Serena, Viña del Mar, Santiago, Concepción, Temuco, Puerto Montt. Ejemplo: https://www.jobbing.cl/ciudades/santiago
- Servicio en ciudad: https://www.jobbing.cl/servicios/gasfiteria/santiago
- Guías de precio, 186 en el listado, con buscador y filtro por categoría y un rango en pesos: https://www.jobbing.cl/precios y https://www.jobbing.cl/precios/gasfiter-hora
- Blog con buscador y las mismas categorías: https://www.jobbing.cl/blog
- Textos legales visibles, no recorridos línea a línea: https://www.jobbing.cl/terminos-y-condiciones-clientes y https://www.jobbing.cl/politica-de-privacidad

En las preguntas del home, sin copiar el texto legal, se entiende esto: la solicitud es gratuita salvo un cobro que se avise antes; el cliente y el profesional acuerdan el pago; a veces existe una pasarela opcional que procesa el monto por cuenta del profesional; la ejecución y la garantía quedan en el profesional; la calificación aparece cuando la solicitud la habilita; hay una oferta aparte para empresas y administradores, por correo.

## Qué es obligatorio para publicar

**Solicitud de cliente, hasta donde se vio el formulario**

- Comuna elegida de la lista. El sitio lo bloquea si no.
- En el paso de envío aparecen nombre, teléfono, correo y la aceptación para compartir esos datos. No se probó el botón con esos campos vacíos, así que no se afirma el mensaje de error de cada uno.
- Las fotos están marcadas opcionales.
- La descripción es el campo principal del paso 1. No se probó continuar con la descripción vacía.

**Perfil profesional, campos marcados en el formulario**

- Nombre, apellido, correo, teléfono y tipo de teléfono.
- Aceptación de los términos de profesionales.
- El paso de perfil pide experiencia, al menos una especialidad en el relato de la pantalla, y comunas. No se forzó el envío para ver cuál de esos tres rechaza el servidor.

**Solicitud de empresa**

- Empresa, tipo de perfil, comuna de la lista y descripción, marcados con asterisco.
- El paso de contacto existe como título y no se vio.

## Detrás de login o de pago (no verificado)

Estas rutas están en la aplicación o en enlaces, y no se abrieron con sesión, token o pago. No se describe su contenido.

- Interior de la cuenta cliente: `/usuario/Inicio`, `/usuario/MisSolicitudes`, `/usuario/MisOrdenes`, `/usuario/MiCuenta`, `/usuario/Orden/{token}`, `/usuario/propiedades/{id}`.
- Chat de una solicitud. `/Chat` cargó sin sesión y no mostró un hilo real. Los términos dicen que el chat, cuando está habilitado, guarda la conversación de la solicitud.
- Calificar: `/Calificar/{id}/{token}` y `/CalificarSolicitud/...`. La FAQ dice que se puede puntuar cuando la opción está habilitada.
- Pagar, pagado, solicitud de pago, reembolso, aprobar presupuesto, anular solicitud, seguir orden, visita agendada y órdenes. Existen como rutas con token.
- Onboarding y contacto directo por uuid de profesional.
- Contratar Empresa Pro o Empresa Activa, comprar puntos, vincular Mercado Pago y usar el asistente de presupuestos.
- Paso “Contacto” del formulario de empresas.
- Panel de Jobbing Empresas después de la demo.
- `/Profesionales`, `/Comprobar` y `/DatosPersonales` no mostraron una pantalla propia distinta del cascarón del sitio.

## Tabla

Solo filas confirmadas en una URL pública. La evidencia es lo que se vio, no una cita del sitio.

| Función | Visible en URL | Evidencia breve |
| --- | --- | --- |
| Publicar solicitud, paso descripción | https://www.jobbing.cl/ | Textarea, comuna y fotos; botón para continuar. |
| Exigir comuna de una lista | https://www.jobbing.cl/ | Al continuar sin comuna, pide elegirla de la lista. |
| Adjuntar fotos opcionales | https://www.jobbing.cl/ | Input de imagen marcado opcional. |
| Dejar contacto y consentimiento | https://www.jobbing.cl/ | Tras elegir comuna: nombre, teléfono, correo, aceptación y botón de envío. No se envió. |
| Elegir una de 13 categorías | https://www.jobbing.cl/categoria/gasfiteria | Grilla de categorías y página por slug. |
| Ver trabajos frecuentes del oficio | https://www.jobbing.cl/categoria/gasfiteria | Botones de tareas de gasfitería y “ver todos”. |
| Buscar profesionales | https://www.jobbing.cl/directorio-profesionales | Buscador, 1.606 activos y tarjetas con enlace a la ficha. |
| Filtrar por categoría | https://www.jobbing.cl/directorio-profesionales | Select con las 13 categorías. |
| Filtrar por varias comunas | https://www.jobbing.cl/directorio-profesionales | Panel “dónde lo necesitas”, búsqueda y casillas. |
| Ordenar resultados | https://www.jobbing.cl/directorio-profesionales | Recomendados, mejor valorados, actividad reciente. |
| Filtrar por nota y actividad | https://www.jobbing.cl/directorio-profesionales | 4,5+, 4,0+ y activos en 7 días. |
| Paginar el directorio | https://www.jobbing.cl/directorio-profesionales | Controles de página 1, 2 y 134. |
| Ver ficha de persona | https://www.jobbing.cl/p/mauricio-nunez-romo | Nota, actividad, texto, oficios y opiniones. |
| Ver ficha de empresa | https://www.jobbing.cl/p/benjamin-chavarria | Etiqueta Empresa, RUT, web, Instagram y persona a cargo. |
| Ver oficios del perfil | https://www.jobbing.cl/p/mauricio-nunez-romo | Lista de categorías enlazadas. |
| Leer reseñas | https://www.jobbing.cl/p/mauricio-nunez-romo | Estrellas, fecha y comentario, con marca de experiencias verificadas. |
| Abrir WhatsApp del perfil | https://www.jobbing.cl/p/mauricio-nunez-romo | Botón hacia el API de WhatsApp del profesional. |
| Enviar solicitud a una ficha | https://www.jobbing.cl/p/mauricio-nunez-romo | Recuadro de descripción y comuna. No se envió. |
| Ver precio publicado del profesional | https://www.jobbing.cl/p/benjamin-chavarria | Servicio, monto “desde”, incluye, condiciones, comunas y fecha. |
| Cotizar ese servicio | https://www.jobbing.cl/p/benjamin-chavarria | Botón “cotizar este servicio” en cada precio. No se completó. |
| Ver portafolio | https://www.jobbing.cl/p/benjamin-chavarria | Trabajos con título y número de fotos. |
| Crear cuenta de cliente | https://www.jobbing.cl/Login | Formulario de nombre, correo, teléfono y contraseña. No se creó. |
| Iniciar sesión de cliente | https://www.jobbing.cl/Login | Correo y contraseña. |
| Entrar con Google (cliente) | https://www.jobbing.cl/Login | Botón visible. OAuth no completado. |
| Recuperar contraseña de cliente | https://www.jobbing.cl/Login | Pide correo y ofrece un enlace. No se envió. |
| Crear cuenta profesional | https://www.jobbing.cl/Trabajos | Datos, especialidades, comunas y términos. Clave por correo, según la pantalla. |
| Repetir el alta en el portal | https://profesionales.jobbing.cl/registrarse | Mismos datos de oficio y cobertura. |
| Iniciar sesión de profesional | https://profesionales.jobbing.cl/ingresar | Correo y contraseña de la app. |
| Entrar con Google (profesional) | https://profesionales.jobbing.cl/ingresar | Botón que abre otra pestaña. No se completó. |
| Recuperar contraseña profesional | https://profesionales.jobbing.cl/recuperar-contrasena | Pide el correo de la cuenta. |
| Ver planes y precios | https://profesionales.jobbing.cl/planes | Gratis, Empresa Pro y Empresa Activa, con montos en pesos. |
| Leer la guía de funciones de pago | https://profesionales.jobbing.cl/guia-premium | Describe IA, agenda, cobros y puntos. No se usaron dentro de una cuenta. |
| Ver explicación comercial de planes | https://www.jobbing.cl/planes-premium | Compara Empresa Pro y Empresa Activa y enlaza al portal. |
| Consultar precios de referencia | https://www.jobbing.cl/precios | 186 guías, buscador, filtro y rango en pesos. |
| Abrir una guía | https://www.jobbing.cl/precios/gasfiter-hora | Rango, factores y enlace a solicitar. |
| Leer y filtrar el blog | https://www.jobbing.cl/blog | Buscador y categorías. |
| Ver cobertura regional | https://www.jobbing.cl/regiones | Siete regiones con ciudad de entrada. |
| Ver servicios de una ciudad | https://www.jobbing.cl/ciudades/santiago | Categorías con la ciudad ya elegida y aviso de elegir comuna. |
| Ver un oficio en una ciudad | https://www.jobbing.cl/servicios/gasfiteria/santiago | Trabajos frecuentes, perfiles y formulario. |
| Publicar necesidad de una empresa | https://www.jobbing.cl/empresas/solicitar-trabajadores | Paso 1 con empresa, oficio, comuna y descripción. Paso 2 no abierto. |
| Pedir Jobbing Empresas | https://www.jobbing.cl/TrabajosIns | Demo y WhatsApp. Panel no visto. |
| Contactar soporte | https://www.jobbing.cl/ | WhatsApp en el pie; correo en planes y FAQ. |
| Leer condiciones del cliente | https://www.jobbing.cl/terminos-y-condiciones-clientes | Página legal con secciones de solicitud, contacto y pagos. |
| Elegir categoría en flujo antiguo | https://www.jobbing.cl/Solicitudes | Lista de 13 categorías. El paso siguiente no se abrió. |

**Funciones confirmadas en la tabla: 44.**
