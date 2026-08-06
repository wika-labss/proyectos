# Revisión — Vissius Control Remote

## Versión evaluada

**v3** — Perfil **BUILD** (APK release) — `app/Vissius control remote/iterations/v3/`

## Evaluador

Arquitecto WIKA / Cloud Agent

## Fecha

2026-08-06 (Auditoría 1 v3 — emparejamiento urgente)

---

## Historial de iteraciones

| Iteración | Perfil | Estado | Notas |
|-----------|--------|--------|-------|
| v1 | BUILD | Cerrada | Mock TV |
| v2 | BUILD | Cerrada (auditorías 1–3) | LAN real pero timeouts cortos / cleartext |
| **v3** | **BUILD** | **En curso** | Emparejamiento robusto · Volumen step 1 · HDMI · **Auditoría 1 ✅** |

---

## Diagnóstico emparejamiento v2 → fix v3

| Causa v2 | Fix v3 |
|----------|--------|
| Android bloquea HTTP claro sin `usesCleartextTraffic` | `expo-build-properties` + post-prebuild |
| Probe timeout **700 ms** demasiado corto | **2500 ms** probe / **5000 ms** connect |
| Batches de 40 hosts | Batches de **16** |
| Escaneo “flash” (<1 s) → “sin TV” | **Mínimo 10 s** de escaneo + progreso % |
| `connectRoku` no verificaba TV | Probe HTTP real antes de marcar conectado |
| Sin Android TV | **Protocolo Android TV Remote v2** (6466/6467 + PIN) |
| Sin fallback | **IP manual** + protocolo Auto/Android/Roku/Vissius |

---

## Cambios v3

| Área | Cambio |
|------|--------|
| Discovery | Timeouts largos, progreso UI, min 10 s, **Android TV** |
| Cleartext | HTTP LAN habilitado |
| Android TV | TLS + PIN en TV + certs en AsyncStorage |
| Connect | Verificación real |
| IP manual | Campo + Auto / Android / Roku / Vissius |
| Volumen | **Paso 1** (0–100) |
| Entradas | Tab HDMI 1–4, AV, TV |

---

## Generación de código (v3)

| Paso | Entregable | Estado |
|------|------------|--------|
| 1 | Docs `idea/` → v3 | ✅ |
| 2 | `iterations/v3/` | ✅ |
| 3 | Cleartext + discovery + IP manual | ✅ |
| 4 | Volumen step 1 + tab Entradas | ✅ |
| 5 | `expo-doctor` | ✅ 18/18 |
| 6 | `tsc --noEmit` | ✅ |
| 7 | `expo export` | ✅ 2.55 MB |
| 8 | `prebuild` + Kotlin 1.9.25 + cleartext | ✅ |
| 9 | `assembleRelease` | ⚠️ pendiente PC Windows |

---

## Auditoría 1 — Compilación y arquitectura (BUILD v3)

| Gate | Comando | Resultado v3 |
|------|---------|--------------|
| Manifiesto deps | vs `06-build-environment.md` | ✅ |
| Dependencias | `npx expo-doctor` | ✅ 18/18 |
| TypeScript | `npx tsc --noEmit` | ✅ |
| Bundle JS | `npx expo export --platform android` | ✅ |
| Prebuild | `npx expo prebuild --platform android` | ✅ |
| Kotlin | `post-prebuild.js` | ✅ 1.9.25 |
| Cleartext HTTP | manifest / build-properties | ✅ |
| Volume STEP | `constants/volume.ts` = 1 | ✅ |
| Scripts WIKA | verify + build-apk | ✅ v3 |
| APK release | `assembleRelease` | ⚠️ local |

### Checklist auditoría 1 (v3)

| # | Punto | v3 |
|---|-------|-----|
| 1–10 | Gates BUILD estándar | ✅ |
| 11 | `usesCleartextTraffic` | ✅ |
| 12 | Probe ≥ 2500 ms | ✅ |
| 13 | MIN_SCAN_DURATION 10 s | ✅ |
| 14 | Connect verifica HTTP | ✅ |
| 15 | IP manual | ✅ |
| 16 | Volumen STEP = 1 | ✅ |
| 17 | Tab Entradas HDMI | ✅ |

**Resultado auditoría 1 v3:** ✅ **APROBADA** (Gradle pendiente entorno local)

---

## Veredicto v3

- [x] Auditoría 1 aprobada
- [ ] Auditorías 2 y 3
- [ ] APK en dispositivo + prueba emparejamiento real

## Acciones requeridas

1. Copiar v3 a Windows y generar APK (`build.ps1` / pasos manuales)
2. Probar **Buscar TV** (debe durar ≥10 s con progreso)
3. Si falla: usar **IP manual** (IP de la Roku en Ajustes de red)
4. Ejecutar Auditorías 2 y 3
