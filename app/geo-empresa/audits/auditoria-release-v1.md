# Auditoría de Release V1 — Geo Empresa

## Proyecto
Geo Empresa — Seguridad de flota corporativa (`v2.0.0` de contrato, construcción 2026-09-24)

## Fecha
2026-09-24

## Objetivo
Validar si la construcción es apta para `final/` o publicación. Referencia: `wika-fundaments` → `docs/auditoria-release-v1.md`.

Un agente IA **no** escribe veredicto **APROBADO**.

---

## Entradas

- [x] `idea/01`–`05` con gates de construcción en `true` (firma Vissiuss 2026-09-24)
- [x] Código `iterations/v1/` + `admin/v1/`
- [x] `iterations/v1/review.md` (as-built de lab)
- [x] APK release `com.wika.geoempresa` generado en el entorno de construcción
- [x] Auditorías Gates 1–3B en `audits/`
- [x] Migración `003_security_fleet.sql` aplicada en `ugzprmopgmbjjxsbjmti`
- [x] `STATUS.md` (congelación)

---

## Compilación y toolchain

| Check | Resultado |
|---|---|
| Scaffold Expo 52 / RN 0.76 / pin `~` | Cumple el plan |
| Módulo Kotlin + config plugin Device Admin | Compiló (tras `useExpoPublishing` + `query-string`) |
| APK release (sin Metro) | Generado |
| Panel Next.js typecheck | Usado en el entorno de construcción |
| Smoke engine (`fence`, `deviceState`) | Incluido en `iterations/v1/scripts/smoke-v1.ts` |

`npm run verify` del agente se corrió en el ciclo de build del APK. No se re-ejecuta en esta congelación.

---

## Funcionalidad y BDD (`01-problem.md`)

| Escenario | Resultado lab 2026-09-24 |
|---|---|
| 1 Enrollment Device Owner | **No cumplido.** `dpm set-device-owner` falló: cuentas en el dispositivo. Quedó Device Admin. |
| 2 Aprobación TI | Código + UI listos. Enrollment visto en `pendiente`. Aprobar vive en la **ficha**, no en la tabla. |
| 3 Lock por geocerca | Código gated a `isDeviceOwner`. No ejercitado. |
| 4 Lock remoto | Código: Admin activo basta. No se confirmó el lock físico en esta sesión. |
| 5 unlock_policy + reset_pin | unlock_policy encola y apaga autolock. `reset_pin` exige Owner. No ejercitado. |
| 6 Reboot | Exige Owner. No ejercitado. |
| 7 Sideload no finge seguridad | **Cumplido en panel:** Owner = `no` para Verox y Joaquin. |
| 8 Tokens visuales | Theme local en agente y panel. |

---

## Arquitectura

- RTM FEAT-01–11 → módulos `MOD-01`–`11` → `iterations/v1` + `admin/v1`.
- `src/engine/` del agente sin React.
- RPCs agente (anon + fingerprint) separadas de RPCs TI (JWT + `perfiles.rol = ti`).
- `service_role` no va en el cliente ni en el APK.

---

## Seguridad

- Permisos: ubicación + foreground service + Device Admin declarados.
- Anon key por env (`.env` / `.env.local`); no commitear.
- PIN de reset no se lista en RPCs TI; se nullifica al acusar.
- Device Admin es **revocable** por el usuario. No cumple anti-desinstalación (ERR-08) hasta Owner.

---

## Documentación

- [x] `STATUS.md` describe as-built y reglas de congelación
- [x] `review.md` con notas de lab
- [x] Este registro
- [ ] Firma humana **APROBADO** — pendiente. Congelar ≠ publicar.

---

## Hallazgos (bloquean `final/`)

1. Device Owner no se provisionó en lab. Android bloquea `set-device-owner` con cuentas.
2. Autolock, reboot y reset PIN no tienen evidencia en dispositivo.
3. La home del panel no tiene acciones; hay que entrar al nombre. Operable, fácil de perder.

No son fallas de contrato: el código distingue Admin vs Owner. Falta el teléfono limpio.

---

## Resultado

## CONGELADO — REQUIERE EVIDENCIA OWNER PARA APROBAR RELEASE

Construcción V1 **cerrada**. No más features en esta iteración.

- **No** se copia a `final/`.
- **No** se publica como flota segura Device Owner.
- Uso actual: monitoreo GPS + panel TI + lock remoto **si** Admin está activo y TI aprobó.

Para APROBADO el arquitecto debe:

1. Provisionar Owner en un equipo sin cuentas.
2. Correr escenarios 1–6.
3. Cambiar este veredicto a **APROBADO** y firmar.

- **Registrado por:** agente de construcción (as-built)
- **Arquitecto:** Vissiuss — pidió documentar y congelar el 2026-09-24
- **Firma APROBADO:** `________________` Fecha: `____`
