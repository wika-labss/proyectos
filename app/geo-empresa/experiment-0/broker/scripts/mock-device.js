#!/usr/bin/env node
'use strict';

const WebSocket = require('ws');

const host = process.env.GEO_BROKER_HOST || '127.0.0.1';
const port = process.env.GEO_BROKER_PORT || 8787;
const deviceId = process.env.GEO_DEVICE_ID || 'android-mock-lab';

const url = `ws://${host}:${port}/ws/device?deviceId=${encodeURIComponent(deviceId)}`;
const ws = new WebSocket(url);

ws.on('open', () => {
  console.log('[mock-device] connected', deviceId);
  ws.send(
    JSON.stringify({
      kind: 'hello',
      model: 'MockPhone',
      appVersion: '0.1.0-mock',
      isDeviceOwner: true,
      androidSdk: 34,
    }),
  );
});

ws.on('message', (raw) => {
  const msg = JSON.parse(String(raw));
  if (msg.kind !== 'command') return;
  console.log('[mock-device] command', msg.type, msg.id);
  const ack = { kind: 'ack', commandId: msg.id, ok: true };
  if (msg.type === 'LOCATE') {
    ack.lat = -33.4171;
    ack.lng = -70.5956;
    ack.accuracyM = 12;
  }
  if (msg.type === 'LOCK') ack.kiosk = true;
  ws.send(JSON.stringify(ack));
});

ws.on('close', () => console.log('[mock-device] closed'));
ws.on('error', (e) => console.error('[mock-device] error', e.message));
