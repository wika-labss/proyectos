# Review — Geo Empresa iterations/v1

As-built de lab. El agente de construcción no auto-aprueba Release.

**Fecha:** 2026-09-24  
**Arquitecto (pedido de congelación):** Vissiuss  
**Release:** ver `audits/auditoria-release-v1.md` — CONGELADO, no APROBADO.

## Checklist

- [x] APK release compilado (`com.wika.geoempresa`)
- [x] Registro + ping + geocerca visibles en panel (Verox, Joaquin, `dentro`)
- [x] Panel TI login (`pureba`) y tabla de flota
- [x] Sideload / Admin reporta Owner = `no` (no finge seguridad)
- [ ] Features FEAT-06–08 (Owner, autolock, PIN, reboot) ejercitadas en lab Device Owner
- [ ] Ciclo completo aprobar → lock físico → unlock_policy → reset_pin → reboot

## Notas de lab

1. Instalar el APK **no** pide reboot.
2. `adb` primero tiene que decir `device`. `unauthorized` = el teléfono no aceptó depuración USB.
3. En Galaxy con cuentas:

   ```
   GeoDeviceAdminReceiver was already an admin for user 0.
   Not allowed to set the device owner because there are already some accounts on the device.
   ```

   Quedó **Device Admin**, no Owner. `lockNow()` remoto es lo único de política que aplica. Reboot/PIN/autolock/anti-uninstall no.

4. No se pueden borrar cuentas Google/Samsung por PowerShell. Factory reset u omitir cuentas en el asistente (sin Wi‑Fi/SIM).
5. Botones de TI: clic en el **nombre** del dispositivo, no en la tabla de flota.

## Congelado

No seguir implementando en `iterations/v1/`. Owner en teléfono limpio = evidencia para firmar release o abrir V1.1.
