'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');
const { URL } = require('url');
const { WebSocketServer } = require('ws');

const config = require('./config');
const { Registry, COMMAND_TYPES } = require('./registry');

const ADMIN_DIR = path.resolve(__dirname, '..', 'admin');
const DEVICE_ID_RE = /^[A-Za-z0-9._:-]{3,80}$/;
const MAX_BODY_BYTES = 16 * 1024;

const registry = new Registry(config);

function sendJson(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(data),
  });
  res.end(data);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('body demasiado grande'), { code: 'TOO_LARGE' }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (chunks.length === 0) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch (_err) {
        reject(Object.assign(new Error('JSON inválido'), { code: 'BAD_JSON' }));
      }
    });
    req.on('error', reject);
  });
}

function serveAdmin(res) {
  const file = path.join(ADMIN_DIR, 'index.html');
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('admin/index.html no encontrado');
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(data);
  });
}

async function handleApi(req, res, url) {
  const parts = url.pathname.split('/').filter(Boolean);

  if (req.method === 'GET' && parts.length === 2 && parts[0] === 'api' && parts[1] === 'config') {
    return sendJson(res, 200, {
      baseLat: config.baseLat,
      baseLng: config.baseLng,
      fenceRadiusM: config.fenceRadiusM,
      commandTypes: COMMAND_TYPES,
      deviceTimeoutMs: config.deviceTimeoutMs,
    });
  }

  if (req.method === 'GET' && parts.length === 2 && parts[0] === 'api' && parts[1] === 'devices') {
    const all = url.searchParams.get('all') === '1';
    const devices = registry.listDevices().filter((d) => all || d.online);
    return sendJson(res, 200, { devices });
  }

  if (req.method === 'GET' && parts.length === 2 && parts[0] === 'api' && parts[1] === 'events') {
    const limit = Number(url.searchParams.get('limit') || 50);
    return sendJson(res, 200, { events: registry.listEvents(limit) });
  }

  if (
    req.method === 'POST' &&
    parts.length === 4 &&
    parts[0] === 'api' &&
    parts[1] === 'devices' &&
    parts[3] === 'commands'
  ) {
    const deviceId = decodeURIComponent(parts[2]);
    if (!DEVICE_ID_RE.test(deviceId)) {
      return sendJson(res, 400, { error: 'deviceId inválido' });
    }
    let body;
    try {
      body = await readJsonBody(req);
    } catch (err) {
      const code = err.code === 'BAD_JSON' ? 400 : 413;
      return sendJson(res, code, { error: err.message });
    }
    try {
      const result = registry.enqueueCommand(deviceId, body.type);
      return sendJson(res, 202, {
        commandId: result.command.id,
        type: result.command.type,
        delivered: result.delivered,
        online: result.online,
      });
    } catch (err) {
      if (err.code === 'INVALID_TYPE') {
        return sendJson(res, 400, { error: err.message, allowed: COMMAND_TYPES });
      }
      if (err.code === 'UNKNOWN_DEVICE') {
        return sendJson(res, 404, { error: err.message });
      }
      return sendJson(res, 500, { error: 'error interno' });
    }
  }

  return sendJson(res, 404, { error: 'not found' });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/admin' || url.pathname === '/admin/')) {
    return serveAdmin(res);
  }

  if (url.pathname.startsWith('/api/')) {
    try {
      return await handleApi(req, res, url);
    } catch (err) {
      console.error('[broker] api error', err);
      return sendJson(res, 500, { error: 'error interno' });
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('not found');
});

const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (url.pathname !== '/ws/device') {
    socket.destroy();
    return;
  }
  const deviceId = url.searchParams.get('deviceId') || '';
  if (!DEVICE_ID_RE.test(deviceId)) {
    socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => {
    ws.deviceId = deviceId;
    wss.emit('connection', ws, req);
  });
});

wss.on('connection', (ws) => {
  const deviceId = ws.deviceId;
  registry.attach(deviceId, ws);
  registry.flushPending(deviceId);

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(String(raw));
    } catch (_err) {
      return;
    }
    const kind = msg.kind || msg.type;
    if (kind === 'hello') {
      registry.setHello(deviceId, msg);
      return;
    }
    if (kind === 'ack') {
      registry.ackCommand(deviceId, {
        commandId: msg.commandId || msg.id,
        ok: Boolean(msg.ok),
        error: msg.error || null,
        kiosk: msg.kiosk,
        lat: msg.lat,
        lng: msg.lng,
        accuracyM: msg.accuracyM,
      });
      return;
    }
    if (kind === 'telemetry') {
      registry.setTelemetry(deviceId, msg);
      return;
    }
    if (kind === 'ping') {
      registry.touch(deviceId);
      try {
        ws.send(JSON.stringify({ kind: 'pong', ts: Date.now() }));
      } catch (_err) {
        /* ignore */
      }
    }
  });

  ws.on('close', () => registry.detach(deviceId, ws));
  ws.on('error', () => registry.detach(deviceId, ws));
});

setInterval(() => registry.sweep(), 5000);

server.listen(config.port, config.host, () => {
  console.log(`[geo-broker] admin http://${config.host}:${config.port}/`);
  console.log(`[geo-broker] ws   ws://${config.host}:${config.port}/ws/device?deviceId=android-xxx`);
});
