'use strict';

const crypto = require('crypto');

// Comandos que el admin puede emitir. La APK ignora cualquier otro tipo.
const COMMAND_TYPES = ['LOCK', 'UNLOCK', 'LOCATE', 'REBOOT', 'STATUS'];

function haversineMeters(aLat, aLng, bLat, bLng) {
  if ([aLat, aLng, bLat, bLng].some((v) => typeof v !== 'number' || Number.isNaN(v))) {
    return null;
  }
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Estado en memoria: dispositivos conectados, comandos pendientes y eventos.
// Reiniciar el proceso borra todo. Es intencional para el experimento 0.
class Registry {
  constructor(config) {
    this.config = config;
    this.devices = new Map();
    this.events = [];
  }

  logEvent(kind, deviceId, detail) {
    const event = {
      ts: new Date().toISOString(),
      kind,
      deviceId: deviceId || null,
      detail: detail || null,
    };
    this.events.unshift(event);
    if (this.events.length > this.config.eventLogLimit) {
      this.events.length = this.config.eventLogLimit;
    }
    return event;
  }

  listEvents(limit) {
    const n = Math.max(1, Math.min(limit || 50, this.config.eventLogLimit));
    return this.events.slice(0, n);
  }

  // Un dispositivo conecta por WebSocket. Si ya existía (reconexión), se
  // reemplaza el socket y se conservan los comandos aún pendientes.
  attach(deviceId, ws) {
    let device = this.devices.get(deviceId);
    if (!device) {
      device = {
        deviceId,
        ws: null,
        meta: {},
        lastSeen: Date.now(),
        connectedAt: Date.now(),
        kiosk: false,
        lastLocation: null,
        lastStatus: null,
        pending: new Map(),
      };
      this.devices.set(deviceId, device);
    }
    device.ws = ws;
    device.lastSeen = Date.now();
    device.connectedAt = Date.now();
    this.logEvent('device_connected', deviceId);
    return device;
  }

  detach(deviceId, ws) {
    const device = this.devices.get(deviceId);
    if (!device) return;
    // Solo desconectar si el socket es el actual (evita cerrar una reconexión).
    if (ws && device.ws && device.ws !== ws) return;
    device.ws = null;
    this.logEvent('device_disconnected', deviceId);
  }

  touch(deviceId) {
    const device = this.devices.get(deviceId);
    if (device) device.lastSeen = Date.now();
  }

  setHello(deviceId, meta) {
    const device = this.devices.get(deviceId);
    if (!device) return;
    device.meta = {
      model: meta.model || null,
      appVersion: meta.appVersion || null,
      isDeviceOwner: Boolean(meta.isDeviceOwner),
      androidSdk: meta.androidSdk || null,
    };
    device.lastSeen = Date.now();
  }

  isOnline(device) {
    if (!device.ws || device.ws.readyState !== 1) return false;
    return Date.now() - device.lastSeen < this.config.deviceTimeoutMs;
  }

  snapshot(device) {
    const loc = device.lastLocation;
    let distanceM = null;
    let inside = null;
    if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
      distanceM = haversineMeters(this.config.baseLat, this.config.baseLng, loc.lat, loc.lng);
      if (distanceM !== null) inside = distanceM <= this.config.fenceRadiusM;
    }
    return {
      deviceId: device.deviceId,
      online: this.isOnline(device),
      lastSeen: new Date(device.lastSeen).toISOString(),
      model: device.meta.model || null,
      appVersion: device.meta.appVersion || null,
      isDeviceOwner: device.meta.isDeviceOwner || false,
      kiosk: device.kiosk,
      lastLocation: loc,
      distanceM: distanceM === null ? null : Math.round(distanceM * 10) / 10,
      insideFence: inside,
      lastStatus: device.lastStatus,
      pendingCount: device.pending.size,
    };
  }

  listDevices() {
    return Array.from(this.devices.values()).map((d) => this.snapshot(d));
  }

  getDevice(deviceId) {
    return this.devices.get(deviceId) || null;
  }

  // Encola y, si está online, envía el comando por WebSocket.
  enqueueCommand(deviceId, type) {
    const upper = String(type || '').toUpperCase();
    if (!COMMAND_TYPES.includes(upper)) {
      const err = new Error('tipo de comando inválido');
      err.code = 'INVALID_TYPE';
      throw err;
    }
    const device = this.devices.get(deviceId);
    if (!device) {
      const err = new Error('dispositivo desconocido');
      err.code = 'UNKNOWN_DEVICE';
      throw err;
    }
    const command = {
      id: crypto.randomUUID(),
      type: upper,
      createdAt: Date.now(),
      status: 'pendiente',
    };
    device.pending.set(command.id, command);
    this.logEvent('command_enqueued', deviceId, { id: command.id, type: upper });

    const delivered = this.deliver(device, command);
    return { command, delivered, online: this.isOnline(device) };
  }

  deliver(device, command) {
    if (!device.ws || device.ws.readyState !== 1) return false;
    try {
      device.ws.send(JSON.stringify({ kind: 'command', id: command.id, type: command.type }));
      command.status = 'enviado';
      return true;
    } catch (_err) {
      return false;
    }
  }

  // Reenvía comandos aún pendientes cuando un dispositivo reconecta.
  flushPending(deviceId) {
    const device = this.devices.get(deviceId);
    if (!device) return;
    for (const command of device.pending.values()) {
      this.deliver(device, command);
    }
  }

  ackCommand(deviceId, ack) {
    const device = this.devices.get(deviceId);
    if (!device) return;
    device.lastSeen = Date.now();

    if (ack.kiosk !== undefined) device.kiosk = Boolean(ack.kiosk);
    if (typeof ack.lat === 'number' && typeof ack.lng === 'number') {
      device.lastLocation = {
        lat: ack.lat,
        lng: ack.lng,
        accuracyM: typeof ack.accuracyM === 'number' ? ack.accuracyM : null,
        ts: new Date().toISOString(),
      };
    }

    const command = device.pending.get(ack.commandId);
    if (command) {
      command.status = ack.ok ? 'ejecutado' : 'fallido';
      command.error = ack.ok ? null : ack.error || 'error';
      device.pending.delete(ack.commandId);
    }
    this.logEvent('command_ack', deviceId, {
      id: ack.commandId,
      ok: Boolean(ack.ok),
      error: ack.ok ? null : ack.error || null,
    });
  }

  setTelemetry(deviceId, data) {
    const device = this.devices.get(deviceId);
    if (!device) return;
    device.lastSeen = Date.now();
    if (data.kiosk !== undefined) device.kiosk = Boolean(data.kiosk);
    if (typeof data.lat === 'number' && typeof data.lng === 'number') {
      device.lastLocation = {
        lat: data.lat,
        lng: data.lng,
        accuracyM: typeof data.accuracyM === 'number' ? data.accuracyM : null,
        ts: new Date().toISOString(),
      };
    }
    device.lastStatus = {
      airplane: data.airplane ?? null,
      gpsOn: data.gpsOn ?? null,
      networkOk: data.networkOk ?? null,
      isDeviceOwner: data.isDeviceOwner ?? device.meta.isDeviceOwner ?? null,
      ts: new Date().toISOString(),
    };
  }

  // Limpieza periódica: expira comandos viejos y purga dispositivos que
  // llevan mucho tiempo sin socket.
  sweep() {
    const now = Date.now();
    for (const device of this.devices.values()) {
      for (const [id, command] of device.pending) {
        if (now - command.createdAt > this.config.commandTtlMs) {
          command.status = 'expirado';
          device.pending.delete(id);
          this.logEvent('command_expired', device.deviceId, { id, type: command.type });
        }
      }
      const stale = !device.ws && now - device.lastSeen > this.config.deviceTimeoutMs * 4;
      if (stale) {
        this.devices.delete(device.deviceId);
        this.logEvent('device_purged', device.deviceId);
      }
    }
  }
}

module.exports = { Registry, COMMAND_TYPES, haversineMeters };
