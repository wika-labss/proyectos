# Diseño de Jobbing (Chile) — solo observación visual

Fecha de lectura: 4 de noviembre de 2026.  
Sitio: [https://www.jobbing.cl/](https://www.jobbing.cl/).  
Método: Chrome headless a 1440×900 y a 390×844, más el CSS que el sitio sirve (`app.947237f3.css` y chunks de directorio, perfil, planes, auth, precios y asistente). Los hex de abajo salen de esas hojas. Cuando un valor es el `rgb()` computado pasado a hex, va marcado como equivalente.

Jobbing es un marketplace de servicios a domicilio. El diseño público mezcla una landing nueva (Inter, mucho aire, foto de oficio) con piezas más viejas (Montserrat, naranja `#ff8c00`, guías de precio). No es un solo sistema.

## Capturas

| Archivo | Pantalla | Viewport |
| --- | --- | --- |
| [capturas/01-home.png](capturas/01-home.png) | Home, hero y formulario | 1440×900 |
| [capturas/02-directorio.png](capturas/02-directorio.png) | Directorio de profesionales | 1440×900 |
| [capturas/03-perfil.png](capturas/03-perfil.png) | Ficha pública | 1440×900 |
| [capturas/04-planes.png](capturas/04-planes.png) | Planes Premium | 1440×900 |
| [capturas/05-login.png](capturas/05-login.png) | Inicio de sesión de clientes | 1440×900 |
| [capturas/06-mobile-home.png](capturas/06-mobile-home.png) | Home estrecha | 390×844 |

## Mapa de pantallas

| Pantalla | URL real | Qué se vio |
| --- | --- | --- |
| Home | `https://www.jobbing.cl/` | Nav, hero con formulario, categorías, carrusel de perfiles, “cómo funciona”, opiniones, footer |
| Cómo funciona | Misma home, ancla `#Comofunciona` | No hay página propia. El ítem del menú hace scroll a la sección |
| Publicar solicitud | Home, bloque del formulario (`/#divCarta`). `https://www.jobbing.cl/SolicitarProfesional` redirige ahí | Formulario de trabajo, comuna y fotos |
| Directorio | `https://www.jobbing.cl/directorio-profesionales` | Buscador, filtros, 1.605 tarjetas |
| Categoría | `https://www.jobbing.cl/categoria/gasfiteria` | Landing de categoría, misma familia visual que la home |
| Ficha | `https://www.jobbing.cl/p/mauricio-nunez-romo` | Perfil público con opiniones. Ejemplo; hay muchas fichas `/p/{slug}` |
| Guías de precio | `https://www.jobbing.cl/precios` | Catálogo de rangos, no planes de suscripción |
| Guía concreta | `https://www.jobbing.cl/precios/gasfiter-hora` | Artículo de precio + CTA “Solicitar visita” |
| Planes | `https://www.jobbing.cl/planes-premium` | Marketing de Empresa Pro y Empresa Activa. El precio numérico no está en esta página: manda al portal `https://profesionales.jobbing.cl/planes` |
| Login cliente | `https://www.jobbing.cl/Login` | Split foto + formulario |
| Registro cliente | Misma URL. El enlace “Crea tu cuenta” cambia el panel sin navegar | Nombre, correo, teléfono, contraseña |
| Registro profesional | `https://www.jobbing.cl/Trabajos` | Formulario público en 2 pasos. El menú “Ofrece tus servicios” apunta aquí |
| Empresas | `https://www.jobbing.cl/empresas` redirige a `https://www.jobbing.cl/empresas/solicitar-trabajadores` | Formulario “publica gratis” |
| Blog | `https://www.jobbing.cl/blog` | Listado “Ideas y consejos para tu hogar”, buscador y filtro de categoría |
| Regiones | `https://www.jobbing.cl/regiones` | Índice geográfico, enlazado en el footer |
| Cuenta cliente | `https://www.jobbing.cl/usuario/Inicio` | Redirige a `https://www.jobbing.cl/Login?ultima_ruta=%2Fusuario%2FInicio`. No se vio el interior |
| Portal profesional | Enlace externo `https://profesionales.jobbing.cl/ingresar` | Fuera de este sitio. No se documenta esa UI |
| Chat | `https://www.jobbing.cl/Chat` carga sin login | Aparece un fragmento de chat de ejemplo (nombres Federico y Roberto), sin el header de marketing. No parece la bandeja real de un usuario; no se describe como producto cerrado |
| `/Profesionales` | Vuelve a la home | No hay listado en esa ruta |

`/Solicitudes` también abre sin login: un selector de categoría con el texto “¡Hola! Bienvenido a Jobbing…”. Es otro camino para publicar, más corto y sin el hero de la home. No hay captura.

## Estructura de página

### Header y navegación

Barra fija arriba, 70px, fondo `#fff`, borde inferior `#eee`. En el CSS de viewport estrecho pasa a 60px, sombra `0 4px 14px rgba(0,0,0,.06)` y pierde el blur.

- Izquierda: logo (imagen, alto 56px en desktop y 40px bajo 850px).
- Centro, en desktop: “Busca un profesional”, “¿Cómo funciona?”, “Ofrece tus servicios”, “Blog”.
- Derecha: botón “Entrar” con ícono de persona.

Los ítems son texto 15px, peso 700, color `#334155`, fuente Montserrat. El hover y el ítem activo se ponen naranja (`#ea580c` / `#c2410c`) y dibujan una línea de 2px con gradiente `#fb923c` → `#f97316`. En el directorio, “Busca un profesional” queda en `#c2410c` con esa línea. “Ofrece tus servicios” hace lo mismo en `/Trabajos`.

“¿Cómo funciona?” no es un link: es un botón que hace scroll a `#Comofunciona` y se marca activo mientras esa sección está en vista.

“Entrar” es una píldora: padding `8px 14px`, radio 18px en CSS (el cómputo dio 14px), borde `rgba(15,23,42,.12)`, texto `#0f172a`, peso 700. Hover azul cielo `#0ea5e9`.

### Hero de la home

Fondo blanco con dos manchas desenfocadas: naranja `rgba(255,140,0,.2)` a la izquierda y azul `rgba(59,130,246,.15)` a la derecha. El bloque usa Inter.

Dos columnas. A la izquierda, el titular y la tarjeta de solicitud. A la derecha, una foto grande de un trabajador con casco y chaqueta azul, sosteniendo un teléfono con una ficha. Sobre la foto, una pastilla blanca: “Perfiles para comparar / Revisa información y opiniones antes de elegir.”

Titular, declarado en CSS:

- `h1` color `#061530`, peso 900, `clamp(36px, 3.45vw, 52px)`, interlineado 1.04, tracking `-0.055em`. En 1440px se computó 49.68px.
- La segunda línea, “tu hogar necesita.”, va en `#008bee`.
- Bajada 20px, peso 400, color `#5b6179`, tracking `-0.025em`.

### Buscador / publicar en la home

No es un buscador de listado. Es una tarjeta de solicitud (`.request-card--form`):

- Fondo `rgba(255,255,255,.97)`, borde `#e1eef8`, radio 16px, sombra `0 8px 26px rgba(30,124,190,.08)`, padding `25px 26px 17px`, alto mínimo 460px.
- Pregunta “¿Qué trabajo necesitas?” en `#071735`, 15px, peso 700.
- Textarea y input “Comuna”: clase `glass-input`, fondo `#fbfdff`, borde `#e2e8f0`, radio 8px, padding `12px 14px`, texto 15px `#102448`. Focus del landing: borde `#008bee` y anillo `0 0 0 3px rgba(0,139,238,.12)`. El input genérico, fuera de este landing, enfoca en naranja `#ff8c00`.
- “Agregar fotos” es un link azul `#008bee`, con la nota “Opcional” en gris.
- Botón “Continuar con mi solicitud”: ancho completo, alto mínimo 52px, radio 15px, peso 900, 17px. Vacío y deshabilitado: fondo `#e6eaf0`, texto `#647184`, sin sombra. Habilitado: fondo `#ff9527`, texto `#071c3c`; hover `#ff8810` y sombra `0 6px 16px rgba(255,149,39,.22)`.
- Bajo el botón, una línea chica: “Tú eliges con quién trabajar.”

Debajo, una fila de 12 oficios (Gasfitería, Limpieza, Remodelación, etc.). Cada uno es un cuadro de 56×56, radio 12px, fondo blanco, borde `#e5e7eb`, sombra `0 2px 8px rgba(0,0,0,.05)`, ícono de línea y label centrado. El ítem mide unos 80px de ancho. Hover: sube 3px y el borde pasa a `#ff8c00`. Activo: fondo `#fff7ed`.

### Tarjetas de profesional

En la home, el carrusel “Conoce a los profesionales de Jobbing” usa tarjetas blancas de radio 16px, borde `#e0e6ee`, padding 24px, alto mínimo 294px, sin sombra. Hover: borde `#9bc9e5` y el nombre pasa a `#0878c9`. Contenido: foto, nombre 21px/700, badge “Destacado”, nota, extracto y “Ver perfil”.

En el directorio la tarjeta es la misma familia (radio 16px, borde `#e0e6ee`, padding 22px, alto mínimo 320px) y suma comuna, recencia (“Últimas 24 h”) y el link “Ver perfil” en azul. Si no hay foto, hay iniciales en un círculo.

Badge “Destacado”: fondo `#fff6e8`, texto `#966018`, 11px, peso 600, radio 6px, Montserrat. Estrellas en `#c98a27` (Material Icons).

### Directorio

Fondo de página `#f8fafc`. El hero del listado es blanco, con borde inferior `#e2e8f0`.

- Migas “Inicio / Profesionales”, 13px, `#64748b`.
- `h1` “Profesionales para tu proyecto”, `clamp(30px, 3.2vw, 42px)`, peso 700, `#0b223f`, tracking `-0.045em`. La palabra “para” va en `#008cf0`.
- Bajada 16px `#64748b`.
- Barra de búsqueda en grid `1.35fr 1fr 1fr auto`: texto, categoría, comunas y botón. Contenedor blanco, radio 15px, borde `#e2e8f0`, padding 12px, sombra muy suave `0 5px 16px #0f172a06`.
- Botón “Buscar”: `#0a76c4`, texto blanco, radio 12px, alto mínimo 48px, peso 600, sombra `0 3px 8px #0084e418`.

Debajo, layout `218px + 1fr`, gap 36px.

- Sidebar “Afina tu búsqueda”, título 14px/700. Radios de reseñas (todas, 4,5+, 4,0+) y un checkbox “Con actividad reciente”. El control nativo mide 16×16 y usa `accent-color: #0084e4`. Labels 13px.
- Resultados: “1.605 profesionales activos” a 23px/700 y un select “Ordenar por” (Recomendados, Mejor valorados, Actividad más reciente).
- Grilla de 3 columnas, gap 20px.
- A un lado, una tarjeta crema invita a publicar una solicitud en vez de seguir filtrando.

El cuerpo del directorio declara `Segoe UI, Arial, sans-serif`. Los `h1–h3` vuelven a Montserrat. El hero del directorio declara Inter.

### Ficha pública

Página clara, dos tarjetas blancas de radio grande apiladas, con mucho margen.

1. Cabecera en grid `1fr + 220px`. Foto 112×112, radio 16px, borde `#e5eaf0`. Nombre 26px/700, `#172b43`, tracking `-0.025em`. Badge “Destacado”, estrellas, “25 opiniones”, punto verde y “Activo en las últimas horas”. Bio en gris. A la derecha, dos botones de ancho completo, alto mínimo 48px, radio 12px, 14px/700:
   - “Enviar solicitud”: `#2563eb`, hover `#1d4ed8`.
   - “WhatsApp”: fondo blanco, borde `#d9e3ef`, texto `#2563eb`.
2. “Servicios”: label 13px/600 `#475569` y chips `#f5f7f9` / `#526174`, radio 7px, 12px/600.
3. Segunda tarjeta, “Opiniones de clientes”: nombre, fecha, cinco estrellas y texto. A la derecha, una píldora “Experiencias verificadas”.

### Guías de precio

`/precios` es un índice editorial, no una tabla de planes. Titular grande, buscador “¿Qué servicio necesitas?” con select de categoría y conteo (“186 guías”). Cada guía es una fila o tarjeta con miniatura, pregunta, rango en CLP (“CLP 45.000 – 130.000”), la palabra “Referencial” y el link “Explorar precios →”.

La guía `/precios/gasfiter-hora` cambia de tono: fuente Montserrat, `h1` computado 42.4px peso 800 color `rgb(24, 43, 58)` (equivalente `#182b3a`). Eyebrow “Planifica tu proyecto”. Un recuadro da el rango “CLP 25.000 – 50.000”. Botón “Solicitar visita” fondo `#096ba8`, texto blanco, radio 8px, ~14.7px, peso 700. Al lado, un link de texto “Ver el detalle”. Hay índice lateral con el ítem activo en fondo `#eaf4fa`, texto `#096ba8` y una barra inset de 3px del mismo azul. Más abajo, tabla de recargos y un carrusel de profesionales de la categoría.

### Planes Premium

Fondo `#f7fafc`, texto `#142334`, cuerpo `Segoe UI, Arial`. El bloque está centrado, ancho máximo 1160px.

- Eyebrow “Planes Premium para profesionales”: `#0578be`, 12px, peso 800, tracking `0.12em`, mayúsculas.
- `h1` `clamp(32px, 4.1vw, 48px)`, peso 750, tracking `-0.04em`. En 1440px se computó 48px. La segunda línea, “También por WhatsApp.”, va en `#078ddf`.
- Lead 17px `#607386`.
- CTA primario “Ver planes Premium”: píldora (radio 100px), fondo `#078ddf`, texto blanco, 13px, peso 650. Secundario “Explorar funcionalidades”: píldora blanca, texto `#44627b`.
- Fila de chips-píldora para saltar de función. El activo repite el azul y lleva sombra `0 4px 12px rgba(7,141,223,.125)`.
- Panel blanco, radio ~24px, con un teléfono de demostración y el texto “Pide el presupuesto. Recíbelo en el chat.”
- Dos artículos, “Empresa Pro” y “Empresa Activa”, en columnas. Listas con checks. Links “Conocer Empresa Pro →” salen del sitio hacia el portal profesional.
- La página dice que los precios vigentes están en ese portal. En esta URL no hay cifras de plan.

### Cómo funciona

Sección `#Comofunciona` en la home, fondo blanco, texto `#182438`, padding 56px 24px, ancho 1160px.

- Eyebrow “De la idea a la acción”: `#a85508`, 12px, peso 700, tracking `0.1em`, mayúsculas.
- `h2` “¿Cómo funciona Jobbing?”: `clamp(26px, 2.5vw, 34px)`, peso 750, tracking `-0.035em`.
- Tres pasos en una sola pieza: fondo `#f8fafc`, borde `#e0e6ee`, radio 20px, columnas separadas por `#e8edf3`. Cada paso tiene ilustración SVG (128×90), número, `h3` 18px/700 y texto 14px `#526075`.
- Los tres pasos visibles: “Publica tu solicitud”, “Compara y coordina”, “Comparte tu experiencia”.

### Login y registro

`/Login` no usa la nav principal. Fondo en gradiente radial `#e5f4ff` → `#f0f9ff`. Arriba, logo chico (128×54) y “Volver al inicio”.

La pieza central es una tarjeta blanca, radio 28px, borde `#d7eafb`, sombra `0 16px 48px rgba(0,140,240,.07)`, grid casi mitad y mitad.

- Izquierda: foto a sangre, radio interno 20px, alto mínimo 580px, con velo oscuro abajo. Sobre la foto, `h2` blanco peso 900, `clamp(36px, 3.2vw, 48px)`, tracking `-1.8px`. “como lo imaginas.” va en `#5bc3ff`.
- Derecha: eyebrow “Mi cuenta · clientes”, `h1` “¡Qué bueno verte!” 38px/900 `#0c1944`. Inputs alto 48px, fondo `#fcfdff`, borde `#d8e1ef`, radio 9px, 15px. Focus: borde `#008cf0` y anillo `rgba(0,140,240,.13)`.
- “Iniciar sesión”: ancho completo, alto mínimo 48px, radio 9px, fondo `#008cf0`, texto blanco, 15px/700.
- “Continuar con Google”: mismo tamaño, fondo blanco, texto `#0c1944`, borde gris.
- “Crea tu cuenta” es un link azul que sustituye el panel, sin cambiar la URL. El `h1` pasa a “Tu próximo proyecto empieza aquí” y aparecen nombre, correo, teléfono con prefijo de país, contraseña y “Crear mi cuenta”, el mismo botón azul.
- Al pie del panel, una caja `#f1faff`, radio 10px: “¿Eres profesional?” enlaza al portal externo.

`/Trabajos` es el alta de profesionales, con la nav normal. Hero oscuro (en CSS, radial `#175581` sobre `#0b2c49`) y `h1` blanco computado a 46px peso 750: “Tu talento merece más oportunidades.” El formulario, en claro, marca “Crear tu cuenta es gratis”, pasos “1 Tus datos / 2 Tu perfil”, y un radio Android / iPhone. Inputs blancos, radio 7px.

`/empresas/solicitar-trabajadores` repite la idea de pasos (“1 El trabajo / 2 Contacto”), con chips de promesa: “Publicación sin costo”, “Contacto directo”, “Sin obligación de contratar”.

### Footer

Común a home, directorio, perfil, planes y guías. Fondo `#f8fafc`, borde superior `#e0e6ee`, texto a la izquierda, ancho interno ~1208px.

1. Franja invitación `#eef6fc`, borde `#dbe8f2`, radio 20px, grid de tres: ilustración, texto “¿Buscas ayuda o nuevos clientes?” (`h2` clamp 24–30px, peso 750) y dos acciones. “Buscar profesionales” es botón `#0072c6`, radio 10px, 13px/700, alto mínimo 46px. “Ofrecer mis servicios” es link `#0067b3`.
2. Columnas: logo a 160px de ancho, texto 14px `#526075`; “Explora Jobbing”; “Trabaja con Jobbing”; “Estamos para ayudarte”.
3. Links de columna: 14px `#526075`, hover `#0072c6` subrayado. Incluyen buscar profesionales, buscar personal, guías de precio, ciudades, blog, soy profesional, planes, soy empresa.
4. Contacto en una caja blanca, radio 12px, borde `#dce4ed`: WhatsApp `+56 9 8565 5828`.
5. “Jobbing en otros países”: Argentina, Perú, México. El actual, Chile, queda marcado.
6. Base legal: “© 2026 Jobbing”, términos y política de privacidad. Iconos de Facebook e Instagram.

Flotante, en casi todas las pantallas: launcher “¿Necesitas ayuda?”. Píldora, radio 999px, gradiente `#28a9ed` → `#0878c9`, borde `#2095da`, sombra `0 6px 24px rgba(8,120,201,.16)`, fijo abajo a la derecha. Lleva la cara del personaje Jobbi. En 390px el texto se acorta a “¿Te ayudo?”.

### Menú estrecho

Bajo `max-width: 850px` desaparecen los links de escritorio. Quedan logo y hamburguesa (44×44, tres líneas `#1f2937`). El panel es un cajón desde la derecha, `min(360px, 88vw)`, alto de pantalla, fondo blanco, sombra `-8px 0 32px rgba(15,23,42,.08)`, con overlay `rgba(15,23,42,.3)`. Título “Menú”. Los mismos destinos, y “Entrar” se lee “Entrar a mi cuenta”.

## Paleta

Declarada en CSS, no aproximada:

| Uso | Hex |
| --- | --- |
| Tinta del titular home | `#061530` |
| Acento del titular home | `#008bee` |
| Bajada home | `#5b6179` |
| Labels del formulario | `#071735` |
| Naranja de marca (legado y hover de categorías) | `#ff8c00` |
| Naranja del CTA de solicitud | `#ff9527` / hover `#ff8810` |
| CTA deshabilitado | `#e6eaf0` / texto `#647184` |
| Nav | `#334155`; activo `#c2410c`; línea `#fb923c` → `#f97316` |
| Azul directorio | `#0084e4` y botón `#0a76c4` |
| Azul footer y foco | `#0072c6` / hover `#005b9e` |
| Azul ficha (“Enviar solicitud”) | `#2563eb` / hover `#1d4ed8` |
| Azul planes | `#078ddf` / eyebrow `#0578be` |
| Azul login | `#008cf0`; titular `#0c1944`; frase de foto `#5bc3ff` |
| Azul guía de precio | `#096ba8` |
| Badge destacado | `#fff6e8` / `#966018` |
| Estrella | `#c98a27` |
| Eyebrow “cómo funciona” | `#a85508` |
| Fondos de página | `#fff`, `#f8fafc`, planes `#f7fafc` |
| Invitación del footer | `#eef6fc` |
| Bordes de tarjeta | `#e0e6ee`, `#e2e8f0`, `#e5eaf0` |
| Texto secundario recurrente | `#526075`, `#64748b` |
| Error de input | `#ef4444` |
| Nav activo legado (casi no se ve en estas pantallas) | `#42b983` |

Hay varios azules a la vez. No es un solo token.

## Tipografía

- Landing nueva (`startup-landing-root`): `Inter, sans-serif`. El HTML carga Inter 400, 500, 700 y 900.
- `#app` por defecto: `Montserrat, sans-serif`. El CSS importa Montserrat 300 y 600, e Inter 300–700. Nav, footer, “cómo funciona”, badges y nombres de tarjeta se computan en Montserrat. Los `h2` de sección salen a 34px, peso 750.
- Directorio y planes: cuerpo `Segoe UI, Arial, sans-serif`; títulos en Montserrat o en el peso 750 de la página.
- Guías de precio: `Montserrat, Arial, sans-serif`.
- Íconos: Material Icons, más SVGs propios en categorías y pasos.
- Escala Tailwind presente en `:root` (xs 12px, sm 14px, base 16px, lg 18px, xl 20px, 2xl 24px, 3xl 30px, 4xl 36px) convive con tamaños sueltos en px. Los titulares no usan esa escala: usan `clamp`.

Pesos que sí se ven: 400 cuerpo, 600–700 UI, 750 títulos de sección, 800–900 hero y botones de la home.

## Componentes, forma y densidad

- Botones primarios: rectángulo de radio 8–15px (solicitud, login, directorio, guía) o píldora total (planes, footer no, launcher sí). El CTA de la home es el más pesado (900, 17px). El de planes es el más chico (13px).
- Inputs: radio 7–9px, alto 42–48px, fondo casi blanco, borde gris frío, anillo azul o naranja al foco. Sin sombra en reposo.
- Cards: radio 16px es la medida de perfil y de listado. La de auth sube a 28px. Los planes, cerca de 24px. La mayoría no tiene sombra; se separan con borde `#e0e6ee`. La sombra, cuando existe, es larga y muy transparente.
- Radios y checkbox del directorio: nativos, 16px, `accent-color #0084e4`, no hay un control dibujado a mano.
- Chips: oficios en caja 56px radio 12px; servicios del perfil en pastilla gris radio 7px; funciones de planes en píldora.
- Densidad: la home es holgada (titular enorme, tarjeta con alto mínimo 460px, foto de medio viewport). El directorio aprieta: 14px, sidebar 218px, tres tarjetas, filtros a 13px. La ficha vuelve a abrir el aire. Login es una sola tarjeta centrada, sin nav.

## Jerarquía y atención

En la home compiten tres cosas: el titular negro/azul, la foto del trabajador (es lo más grande y saturado) y la tarjeta blanca. El botón gris deshabilitado no compite hasta que el formulario es válido; entonces el naranja `#ff9527` es el único color cálido fuerte de la columna izquierda. La fila de oficios queda en un segundo plano, gris y chica. El launcher azul de la esquina pelea con la foto.

En el directorio manda la barra de búsqueda y el botón azul “Buscar”. El naranja solo señala en qué ítem del menú estás. Las tarjetas son iguales entre sí; el azul “Ver perfil” es el cierre de cada una. El badge crema “Destacado” es un acento chico, no un bloque.

En la ficha, el nombre y el botón `#2563eb` “Enviar solicitud” ganan. WhatsApp queda en segundo término, outline. Las opiniones son una lista larga y pareja.

En planes, todo está centrado. Gana el `h1` de dos líneas, la segunda en azul. Los chips y el teléfono son demostración, no el precio. No hay cifra que robe el titular.

En login, la foto con la frase blanca/celeste equilibra al formulario. El único bloque sólido es “Iniciar sesión”.

## Responsive (breakpoints del CSS)

| Corte | Qué cambia |
| --- | --- |
| `max-width: 1199px` | Directorio: tarjetas de 3 a 2 columnas; sidebar a 200px |
| `max-width: 1023px` | Ficha: la cabecera deja de ser dos columnas; los dos botones de contacto pasan a grilla |
| `max-width: 850px` | Nav hamburguesa, logo 40px, alto 60px. Buscador del directorio: el campo de texto ocupa la fila entera y categoría/comuna bajan |
| `max-width: 800px` | Login: la tarjeta deja de ser dos columnas. La foto baja a una banda de 160px; el `h2` de la foto pasa a 27px; el radio de la tarjeta baja a 24px |
| `max-width: 767px` | “Cómo funciona” a una columna; cada paso es fila (ilustración 64px + texto); radio del bloque 16px; padding de sección 40px 20px. El `h1` de la home usa `clamp(28px, 5.8vw, 46px)`. En 390px se computó 28px/900 |
| `max-width: 680px` | Planes: el demo deja el teléfono al lado y se apila; las pestañas scrollean en horizontal |
| `max-width: 540px` | Directorio: una sola columna de tarjetas, gap 15px. Inputs de comuna a 16px (evita zoom en móvil) |
| Footer estrecho | La invitación pasa de 3 columnas a 1, texto centrado, radio 16px, acciones en columna |
| 390px observado | El formulario de la home queda arriba y la foto asoma debajo. El launcher dice “¿Te ayudo?”. Inputs del hero a 16px |

También hay cortes sueltos en 576, 600, 700, 992 y 1000px, sobre todo en guías, blog y auth intermedio (a 1000px el login solo estrecha columnas, todavía no apila).

## Qué es marca de Jobbing y no debe copiarse

Esto es identidad de Jobbing, no un patrón genérico:

- El nombre Jobbing y el claim asociado a esa marca.
- El logo: personaje con casco azul y overol, wordmark en script azul con un swoosh naranja. Archivo servido como `logo-jobbing-nuevo`. No se guardó como asset.
- El personaje Jobbi (`jobbi.webp`) del botón “¿Necesitas ayuda?”.
- El par naranja `#ff8c00` / `#ff9527` con azul `#008bee` como colores de marca, incluido el gradiente histórico del botón `#0b8be4` → `#ff9a2f`.
- La foto de campaña del trabajador de chaqueta azul en la home, y la foto del login con la frase “Tu hogar, como lo imaginas.”
- Los dominios y el pie “Jobbing Argentina / Perú / México”, el teléfono de WhatsApp de Jobbing y los iconos sociales de Jobbing Chile.
- Los nombres de plan “Empresa Pro” y “Empresa Activa”, y la integración nombrada con Mercado Pago, como oferta comercial de ellos.

Lo que sí es estructura reusable, sin la marca: nav clara con un solo botón de cuenta, hero de dos columnas con formulario a la izquierda, tarjeta de solicitud antes que un listado, directorio con barra única y sidebar de filtros, ficha con foto + CTA primario y opiniones debajo, footer en columnas con una franja de invitación.
