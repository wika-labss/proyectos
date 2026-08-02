# Problema

## Contexto

Los juegos de puzzles móviles son una de las categorías más descargadas en App Store y Google Play. El Sudoku sigue siendo uno de los puzzles más populares por su accesibilidad, capacidad de jugar sin conexión y valor cognitivo. Existe demanda de experiencias móviles limpias, sin anuncios intrusivos y con progresión clara de dificultad.

## Problema a resolver

Crear un juego de Sudoku móvil multiplataforma (Android e iOS) con **20 niveles progresivos** que permita a jugadores de distintos niveles de habilidad avanzar de forma gradual, desde principiantes hasta expertos, manteniendo el interés y el desafío a lo largo del tiempo.

## Usuarios objetivo

| Perfil | Necesidad |
|--------|-----------|
| Principiante | Aprender Sudoku con pistas abundantes y niveles fáciles |
| Jugador casual | Partidas rápidas offline durante trayectos o pausas |
| Jugador avanzado | Desafíos crecientes con puzzles complejos y mínimas pistas |
| Usuario móvil | Interfaz táctil intuitiva, sin fricción, carga instantánea |

## Restricciones

- **Plataformas:** Android (API 24+) e iOS (15+)
- **Conectividad:** Funcionamiento 100% offline (sin backend en v1)
- **Niveles:** Exactamente 20 niveles con dificultad escalable
- **Rendimiento:** Tiempo de carga < 2 segundos, 60 fps en animaciones
- **Almacenamiento:** Progreso local persistente entre sesiones
- **Tamaño de app:** < 30 MB instalado

## Criterios de éxito

- [ ] La app compila y corre en Android e iOS sin modificaciones de código
- [ ] Los 20 niveles son jugables con dificultad perceptiblemente creciente
- [ ] El progreso del jugador (niveles completados, tiempos, puntuación) persiste al cerrar la app
- [ ] Un jugador nuevo puede completar el nivel 1 en menos de 5 minutos sin instrucciones externas
- [ ] Un jugador experimentado encuentra desafio real en los niveles 16–20
- [ ] La interfaz es usable con una sola mano en pantallas de 5" a 6.7"
