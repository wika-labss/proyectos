# Problema

## Nombre del proyecto

Tower

## Descripción

Tower Defense Android offline. **V3** rebalancea la economía/combate (V2 se volvía injusto ~N10) y añade **evolución de torres por fusión**: juntar 2 torres de la misma clase y mismo nivel crea 1 torre del nivel siguiente (máx. nivel 4), mejorando daño y velocidad de ataque. El nivel 4 muestra un **nombre de evolución** distintivo.

## Usuarios

| Perfil | Necesidad |
|--------|-----------|
| Casual | Niveles pasables con progresión justa |
| Estratégico | Fusionar torres para potenciar DPS |
| Progresión | 25 mapas, dificultad creciente pero jugable |

## Objetivo

Entregar V3 (APK Release) con: balance jugable hasta N25, fusión 2→1 hasta L4 en las 4 clases, nombres de evolución visibles, colocación prep/entre/durante oleadas.

## Beneficios esperados

- Curva de dificultad justa (oro inicial vs HP enemigo).
- Progresión táctica de torres sin tienda de upgrades.
- Identidad clara por nivel de torre (L1–L4 / nombre).

## Restricciones

- Android only · Expo SDK 52 · offline · 25 niveles · 4 clases · max evolución L4.
- Fusión: misma `kind` + mismo `tier` · consume 2 pads · deja 1 torre en el pad destino.
- Entregable APK Release sin Metro.

## Criterios de éxito

- [ ] N10 pasable con estrategia razonable (no soft-lock por oro/DPS).
- [ ] Fusión L1→L2→L3→L4 en las 4 torres.
- [ ] L4 muestra nombre de evolución.
- [ ] 25 mapas · smoke/typecheck/export OK.
