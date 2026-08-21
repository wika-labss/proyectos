# Generation / validation report — Tower V2

## Date
2026-08-21

## Gates

| Gate | Result |
|------|--------|
| `npm run smoke` | **PASSED** (25 maps, pad range, preparing, place phases, combat, campaign) |
| `npm run typecheck` | **PASSED** |
| `npx expo export --platform android` | **PASSED** |
| `npm run apk` | Pendiente local (JDK 17 + Android SDK) |

## Cambios vs V1

| Ítem | V2 |
|------|----|
| Niveles | 25 mapas distintos |
| Alcance | Pads auto cerca del path; Cañón range 26; contrato assertAllPadsInRange |
| Preparación | Estado `preparing` + CTA Iniciar oleadas |
| Colocación | Prep + entre oleadas + durante oleada |
| UI torres | Forma + tag Arq/Cañ/Hie/Fra |
| Persistencia | `tower:v2:campaign` |

## Stack
Expo SDK 52 · React Native 0.76.9 · package `com.wika.tower`
