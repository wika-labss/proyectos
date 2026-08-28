---
id: "PROB-001"
title: "Geo Empresa — Monitoreo de dispositivos corporativos"
status: "APROBADO"
version: "1.0.0"
owner: "Vissiuss / Equipo WIKA"
created_at: "2026-08-27"
updated_at: "2026-08-27"
audit_1_passed: true
---

# [01] Definición del Problema, Alcance y Metas

## 1. Identificación

- **Nombre del Proyecto:** Geo Empresa
- **Repositorio:** `proyectos/app/geo-empresa/`
- **Backend:** Supabase `geo-empresa` (`ugzprmopgmbjjxsbjmti`, región `sa-east-1`)
- **Stakeholders:** Vissiuss (producto / ingeniería), administrador de flota corporativa

---

## 2. Problema

La compañía entrega teléfonos Android a colaboradores y necesita **resguardarlos** verificando que permanezcan cerca de un punto base autorizado (oficina, bodega, faena).

Hoy no existe:
- Registro único del dispositivo con nombre y coordenadas base
- Reporte periódico de ubicación en segundo plano
- Estado centralizado: teléfono encendido/apagado y si está dentro del perímetro

---

## 3. Gap Analysis

| Estado actual | Estado deseado V1 |
|---------------|-------------------|
| Sin backend de geolocalización | Supabase con RPCs `registrar_dispositivo` y `reportar_ubicacion` |
| Sin histórico | Tabla `ubicacion_reportes` con cada ping |
| Sin flags booleanos | `telefono_encendido` y `dentro_perimetro` en estado actual + histórico |

---

## 4. RTM Inicial

| ID | Dolor | Feature | Módulo |
|----|-------|---------|--------|
| ERR-01 | No hay registro único del móvil | FEAT-01 | mod-registration |
| ERR-02 | No se guardan coordenadas base | FEAT-01 | mod-registration |
| ERR-03 | No hay ping periódico en background | FEAT-02 | mod-location-agent |
| ERR-04 | No se calcula si está dentro de 120 m | FEAT-03 | mod-fence-engine |
| ERR-05 | No se distingue teléfono apagado/encendido | FEAT-04 | mod-device-state |
| ERR-06 | Admin no consulta estado central | FEAT-05 | mod-api (RPC obtener) |

---

## 5. Alcance V1

**Incluido:**
- Supabase: tablas, RPCs, RLS (solo vía RPC)
- App Android agente: registro una vez + background location
- Geocerca circular **120 m** (configurable por dispositivo en registro)
- Campos booleanos: `telefono_encendido`, `dentro_perimetro`

**Excluido V1:**
- Panel web admin (V1.1)
- iOS, MDM / Device Owner
- Bloqueo de desinstalación
- Alertas push al supervisor
- Supabase Auth / multi-tenant

---

## 6. Criterios de Éxito (BDD)

### Escenario 1: Registro único

- **Dado que** el dispositivo abre la app por primera vez con red
- **Cuando** ingresa nombre, coordenadas base y confirma registro
- **Entonces** `registrar_dispositivo` crea fila en `dispositivos` con fingerprint único

### Escenario 2: Reporte en background

- **Dado que** el dispositivo ya está registrado
- **Cuando** el agente envía ubicación cada N minutos
- **Entonces** `reportar_ubicacion` actualiza flags y guarda fila en `ubicacion_reportes`

### Escenario 3: Fuera de perímetro

- **Dado que** la distancia a la base supera 120 m
- **Cuando** llega un ping
- **Entonces** `dentro_perimetro = false` en dispositivo e histórico

---

## 7. Restricciones técnicas

| Categoría | Restricción |
|-----------|-------------|
| Stack móvil | Expo SDK 52, RN 0.76.x, TypeScript |
| Plataforma V1 | Android APK release |
| Backend | Solo RPCs sobre Supabase `geo-empresa` |
| Package | `com.wika.geoempresa` |
| Radio default | 120 m |

---

## 8. Puerta de enlace

- **audit_1_passed:** `true`
- Aprobado por: Vissiuss
- Fecha: 2026-08-27
