# Auditoría de audio y arranque — Arkanoid V3

## Proyecto
Arkanoid

## Versión evaluada
`iterations/v3/` — 2026-09-06 (post 3.0.1)

## Evaluador
Arquitecto WIKA / Cloud Agent

## Etapa WIKA
Auditoría 2 incremental (runtime Feature 24 vs Feature 01/15).  
Referencia: `wika-fundaments/workflows/application-lifecycle.md` (Etapa 5).  
Contrato oficial: `idea/01`–`05` (actualizado en este ciclo).

## Objetivo
El MP3 Castillo debe sonar **sin tumbar el proceso** y el usuario debe poder **iniciar la partida**.

---

# Entradas

- `idea/01-problem.md` — restricción audio/arranque
- `idea/02-features.md` — Feature 24 BDD
- `idea/03-module-discovery.md` — `ambient-audio`
- `idea/04-application-design.md` — play Android / post-primer-frame
- Código `iterations/v3/src/modules/ambient-audio/`
- APK instalado por el arquitecto (cierre / pantalla negra al abrir)
- Gates de este entorno

---

# Hallazgos (antes de remediación)

## H1 — Bloqueante · Decode nativo en el arranque

`Audio.Sound.createAsync(require(mp3), { shouldPlay: true })` con ExoPlayer (default expo-av) sobre **4,51 MB / 192 kbps / 188 s / stereo 44.1 kHz**.

Pico aproximado si se materializa PCM:

`188 s × 44100 × 2 ch × 2 bytes ≈ 33 MB` + copia del asset + heap de RN.

En API 24+ de gama baja eso es OOM / ANR. `try/catch` JS **no** cubre el abort nativo.

## H2 — Bloqueante · Feature 24 vs “abrir y jugar”

BDD anterior: “cuando el layout monta, suena el MP3”. Eso metía `expo-av` en el primer frame. Feature 01 exige menú usable en segundos. El camino **Jugar** no puede esperar al decode.

## H3 — No bloqueante · Presupuesto de tamaño

`idea/01` pide APK &lt; 25 MB. El runtime Expo 52 ya lo supera (~67 MB). El MP3 a 192 kbps empeora el pico de memoria sin cambiar la pista.

## H4 — Parcialmente remedido en 3.0.1

El barrel de `ambient-audio` ya no reexporta el manager. El delay de 900 ms evita el import en el primer paint, pero `createAsync` + ExoPlayer seguía pudiendo matar el proceso un segundo después.

---

# Contrato (idea/ actualizada)

| Regla | Dónde |
|-------|--------|
| Menú pinta antes de decodificar | `idea/01`, Feature 24 |
| Jugar no espera al audio | Feature 24 BDD |
| Runtime ≤ 2 MB / ≤ 64 kbps (misma pieza Castillo) | Feature 24, `03` |
| Android: MediaPlayer + URI local + `downloadFirst: false` | `03`, `04` |
| `expo-av` solo dentro de `playResolved` | `03` |
| Fallo de audio no tumba ni bloquea partida | Feature 24 BDD |

---

# Remediación (código)

| Cambio | Archivo |
|--------|---------|
| Política pura (delay, techo, MediaPlayer) | `src/modules/ambient-audio/playbackPolicy.ts` |
| Play diferido: Asset URI → MediaPlayer → `playAsync` | `audioManager.ts` |
| Boot tras `InteractionManager` + delay | `AmbientAudioProvider.tsx` |
| Encode runtime 64 kbps (catálogo intacto) | `assets/recursos/audio/ambient-castle.mp3` |
| Smoke: techo de bytes + política | `scripts/smoke-v1.ts` |
| `largeHeap` post-prebuild | `scripts/post-prebuild.js` |

El catálogo `recursos/audio/arkanoid-ambient-castle.mp3` **no se sustituye**. Sigue siendo la pieza original.

---

# Validaciones

## Documentación
- [x] Feature 24 ya no exige audio en el mount síncrono
- [x] BDD cubre fallo de audio + Jugar
- [x] Módulo documenta MediaPlayer y aislamiento de `expo-av`

## Arquitectura
- [x] `ambient-audio` no importa el engine
- [x] `index.ts` del módulo no carga `audioManager`
- [x] `audioManager` no importa `expo-av` en el top-level
- [x] GameProvider / Jugar no leen `ready` del audio

## Runtime (este entorno)
- [x] Runtime MP3 ≤ `AMBIENT_MAX_RUNTIME_BYTES`
- [x] Política: `MediaPlayer`, `shouldPlay: false`, `downloadFirst: false`
- [x] `npm run smoke` incluye techo + política
- [x] `npm run typecheck`
- [ ] Sideload en dispositivo físico (misma deuda que Release)

---

# Resultado

## APROBADO (código y contrato)

El hallazgo H1/H2 queda cerrado en documentación y en implementación.  
El sideload físico sigue abierto en `auditoria-release-v3.md`.

## Qué debe ver el arquitecto en el APK 3.0.2

1. Desinstalar `com.wika.arkanoid`.
2. Instalar 3.0.2.
3. El menú aparece (JUGAR visible) aunque el Castillo tarde ~1 s.
4. Tocar **JUGAR** abre LV 1 aunque el MP3 aún no suene.
5. Tras el delay, el Castillo entra en loop; el slider Ambiente cambia solo el volumen.

---

# Siguiente paso

Sideload 3.0.2 → re-auditar Release → `final/` con visto del arquitecto.
