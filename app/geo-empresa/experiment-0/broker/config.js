'use strict';

// Configuración del experimento 0. Todo vive en memoria; no hay base de datos.
// Las coordenadas base solo se usan para pintar "dentro/fuera" en la consola
// después de un LOCATE. No disparan bloqueos por sí solas.
module.exports = {
  host: process.env.GEO_BROKER_HOST || '0.0.0.0',
  port: Number(process.env.GEO_BROKER_PORT || 8787),

  // Un dispositivo se considera offline si su WebSocket se cae o si no manda
  // nada (ni ping) en este intervalo.
  deviceTimeoutMs: Number(process.env.GEO_DEVICE_TIMEOUT_MS || 30000),

  // Cuánto tiempo guardar un comando en cola si el dispositivo está online pero
  // aún no acusa. Pasado esto, se marca como expirado.
  commandTtlMs: Number(process.env.GEO_COMMAND_TTL_MS || 60000),

  // Tamaño del log de eventos en memoria.
  eventLogLimit: Number(process.env.GEO_EVENT_LOG_LIMIT || 200),

  // Geocerca de referencia para la consola (sin efecto sobre el bloqueo).
  baseLat: process.env.GEO_BASE_LAT ? Number(process.env.GEO_BASE_LAT) : -33.4171287,
  baseLng: process.env.GEO_BASE_LNG ? Number(process.env.GEO_BASE_LNG) : -70.5956645,
  fenceRadiusM: Number(process.env.GEO_FENCE_RADIUS_M || 20),
};
