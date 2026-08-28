# DS Implementation — Geo Empresa v1 → v2

## Entregado

- `iterations/v2/` app Android 2.0.0
- Supabase migración `v2_registro_unico_y_historial_anomalias`
- Registro único por fingerprint Android
- Histórico `ubicacion_reportes` solo si `telefono_encendido=false` OR `dentro_perimetro=false`
- Splash vissiuss post-registro → background
- `SecurityLockOverlay` + `SecurityLockActivity` con PIN `1312`

## Verificación

- [x] `npm run typecheck`
- [x] `npm run smoke`
- [x] `bash scripts/build-apk.sh` → `geo-empresa-v2-release.apk` (~61 MB)
- [x] Supabase smoke: registro único, histórico selectivo
