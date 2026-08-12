# Funcionalidades

## Iteración v3.2 — cambios respecto a v3.1

| Área | v3.1 | v3.2 |
|------|------|------|
| Mock v1 | Podía quedar `mock-tv-bedroom` en storage | **Purga automática** al migrar/cargar |
| Logs | Un fail por cada IP del /24 (buffer 800) | **Solo alto nivel** (buffer 120) + guía v4 |
| Export | Ruido inutilizable | `scan.*` / `connect.*` legible |

## Iteración v3.1 — cambios respecto a v3

| Área | v3 | v3.1 |
|------|----|------|
| Diagnóstico | Feedback UI | Módulo logs exportables |
| Pantalla Logs | No | `/logs` |

## Priorización v3.2

| Prioridad | Funcionalidad |
|-----------|---------------|
| **P0** | Limpiar mock de versiones anteriores |
| **P0** | Logs claros para definir conexión en v4 |
| P1 | Fix discovery profundo (tras logs limpios + IP manual) |
