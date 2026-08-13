# Problem

## Nombre del Proyecto

Sodoku Android

---

# Resumen Ejecutivo

Los jugadores móviles necesitan un Sudoku offline, sin anuncios ni cuentas, con progresión clara de dificultad. Hoy dependen de apps saturadas de publicidad, con onboarding confuso o sin un camino de 20 niveles bien calibrado. Este proyecto entrega una app Android de Sudoku con exactamente 20 niveles progresivos, jugable con una sola mano y con progreso persistente en el dispositivo.

---

# Problema Actual

## Situación Actual

- ¿Qué ocurre hoy? Quienes quieren practicar Sudoku en el teléfono suelen descargar apps genéricas de stores, muchas con anuncios, compras o registro obligatorio.
- ¿Cómo se ejecuta actualmente? Se elige un puzzle suelto o un modo “infinito” sin una secuencia corta y clara de 20 niveles con dificultad creciente y medible.
- ¿Qué herramientas se utilizan? Apps de Sudoku de terceros, web móviles o papel; pocas ofrecen una experiencia Android offline, limpia y con progresión cerrada.
- ¿Quién participa? Jugadores principiantes, casuales y avanzados que quieren partidas rápidas sin fricción ni dependencia de red.

---

## Problemas Detectados

- Experiencias saturadas de anuncios o paywalls que interrumpen la partida.
- Falta de una progresión corta y explícita (exactamente 20 niveles) de fácil a experto.
- Dependencia de conexión o de cuentas para guardar progreso.
- Interfaces densas, poco aptas para uso con una sola mano en trayectos o pausas.
- Pistas y dificultad poco calibradas: demasiada ayuda o demasiada frustración sin curva intermedia.

---

# Usuarios Afectados

## Usuarios Principales

| Perfil | Uso esperado |
|--------|----------------|
| Principiante | Aprender Sudoku con pistas abundantes y niveles fáciles (1–4) |
| Jugador casual | Partidas offline cortas durante trayectos o pausas |
| Jugador avanzado | Desafíos crecientes (niveles 16–20) con mínimas pistas |
| Usuario Android | App ligera, táctil, sin cuenta ni internet obligatorio |

---

## Impacto en los Usuarios

- Pérdida de tiempo por interrupciones publicitarias o flujos de registro.
- Dificultad para medir avance personal sin una secuencia de niveles desbloqueables.
- Riesgo de perder progreso si la app exige nube o cuenta.
- Frustración por falta de feedback claro (errores, pistas, victoria) en móvil.

---

# Objetivo del Proyecto

## Objetivo General

Entregar una aplicación Android de Sudoku offline con **20 niveles progresivos**, interfaz táctil usable con una sola mano, validación y pistas en partida, y persistencia local del progreso — sin backend, anuncios ni autenticación en v1.

---

## Objetivos Específicos

- Ofrecer un tablero 9×9 interactivo con entrada numérica táctil.
- Definir exactamente 20 niveles con dificultad perceptiblemente creciente.
- Generar puzzles válidos de solución única acordes a cada nivel.
- Persistir progreso, partida en curso y preferencias en el dispositivo.
- Permitir que un principiante complete el nivel 1 en pocos minutos sin instrucciones externas.
- Entregar un APK instalable y usable en dispositivo Android físico.

---

# Alcance

## Incluye

- Juego de Sudoku clásico 9×9 en Android.
- 20 niveles con desbloqueo secuencial y rejugabilidad.
- Motor local de generación, validación y pistas.
- Temporizador por partida y guardado automático local.
- Pantallas de inicio, selección de niveles, juego, victoria, ajustes y estadísticas básicas.
- Funcionamiento 100% offline en v1.

---

## No Incluye

- iOS u otras plataformas en v1 (solo Android).
- Multijugador, rankings globales o modo diario compartido.
- Cuentas de usuario, autenticación o sincronización en la nube.
- Anuncios, compras in-app u otra monetización.
- Variantes (Killer, Hyper, Samurai, etc.).
- Backend o APIs externas de puzzles.

---

# Beneficios Esperados

- Experiencia de Sudoku limpia y usable en Android sin fricción.
- Progresión clara y medible en 20 niveles.
- Retención mediante progreso local y rejugabilidad.
- Base documental WIKA lista para auditorías y siguientes etapas (sin ambigüedad de alcance).
- Producto demostrable en dispositivo físico vía APK.

---

# Criterios de Éxito

- [ ] La app muestra un tablero 9×9 jugable y acepta entrada táctil.
- [ ] Existen exactamente 20 niveles con dificultad creciente perceptible.
- [ ] El progreso (niveles desbloqueados/completados, tiempos) persiste al cerrar la app.
- [ ] Un jugador nuevo puede completar el nivel 1 en menos de 5 minutos sin instrucciones externas.
- [ ] Un jugador experimentado encuentra desafío real en los niveles 16–20.
- [ ] La interfaz es usable con una sola mano en pantallas de ~5" a ~6.7".
- [ ] La app funciona sin conexión a internet.
- [ ] El APK se instala por sideload y funciona en dispositivo Android físico sin depender de Metro en runtime.

---

# Restricciones Conocidas

- **Plataforma:** Android (API 24+, Android 7.0+) — **v1 solo Android**.
- **Conectividad:** 100% offline; sin backend ni servicios en la nube.
- **Niveles:** Exactamente 20 niveles con dificultad escalable.
- **Rendimiento:** Carga percibida < 2 s; animaciones fluidas en dispositivo medio.
- **Almacenamiento:** Progreso y partida activa persistidos localmente.
- **Tamaño:** < 30 MB instalado como objetivo.
- **Permisos:** Sin permisos sensibles en v1 (no requiere ubicación, cámara ni internet obligatorio).
- **Seguridad / privacidad:** Sin cuentas ni datos personales; no transmitir progreso fuera del dispositivo.
- **Operativas:** Entrega validable en dispositivo físico; sideload de APK aceptable para demo interna.

---

# Información Adicional

- Carpeta del proyecto en el portafolio: `app/sodoku android/`.
- Nombre oficial del producto/documentación: **Sodoku Android**.
- El producto es un juego de Sudoku; el nombre de carpeta/proyecto WIKA es `sodoku android`.
- Fuente de verdad documental: `idea/` (01–06).
- Detalle funcional: `02-features.md`. Arquitectura/diseño/build: `03`–`06`.
- Antecedente histórico: `app/sodoku app/` (iteraciones previas); este proyecto es la fuente oficial Android.

---

# Resultado Esperado

Al finalizar este documento cualquier persona o agente IA debe ser capaz de responder:

1. ¿Qué problema existe?
2. ¿Quién tiene el problema?
3. ¿Por qué es importante resolverlo?
4. ¿Qué resultado se espera obtener?
5. ¿Qué límites tiene la iniciativa?
