---
id: "FEAT-001"
title: "Horóscopo Alan — Features V1"
status: "APROBADO"
version: "1.0.0"
audit_1_passed: true
---

# [02] Features V1

## FEAT-01: Registro único

- Pantalla con nombre (texto) y fecha de nacimiento (date picker)
- Validación: nombre no vacío, fecha válida
- Persistencia AsyncStorage `@horoscopo-alan:v1:profile`
- Solo se muestra si no hay perfil guardado

## FEAT-02: Cálculo de signo zodiacal

- Engine puro en `src/engine/zodiac.ts`
- 12 signos con rangos documentados (Capricornio cruza año)
- Output: `{ slug, nombre, elemento, rango }`

## FEAT-03: Consulta horóscopo del día

- `GET /functions/v1/horoscopo?signo={slug}`
- Muestra: amor, salud, dinero, color, numero, elemento, rango, animo
- Título y fecha del día desde API

## FEAT-04: Actualizar horóscopo

- Pull-to-refresh + botón "Actualizar"
- Refetch al abrir home si hay red

## FEAT-05: Guard de conexión

- `expo-network` verifica conectividad
- Banner/modal si no hay internet; no inventar datos

## FEAT-06: Splash de carga

- Texto "vissiuss" estirado, 4 segundos, cada apertura de app
