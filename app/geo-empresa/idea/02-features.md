---
id: "FEAT-002"
title: "Geo Empresa Features V2"
status: "APROBADO"
audit_1_passed: true
---

# [02] Features V2

- FEAT-01: Registro solo **nombre**; base GPS automática; **una sola vez** por `device_fingerprint` (Android ID)
- FEAT-02: Ping cada **5 min** en background (foreground service)
- FEAT-03: Radio **120 m** vía Supabase
- FEAT-04: Reporte inmediato encendido/apagado (AppState)
- FEAT-05: PIN test **1312** para desbloquear pantalla de seguridad (snooze 15 min)
- FEAT-06: **SecurityLockOverlay** si fuera de perímetro, modo avión o teléfono apagado/inactivo
- FEAT-07: Tras registro, abrir app = **solo splash vissiuss** (~3 s) → minimizar a background
- FEAT-08: Histórico `ubicacion_reportes` **solo en anomalías** (`telefono_encendido=false` OR `dentro_perimetro=false`)
