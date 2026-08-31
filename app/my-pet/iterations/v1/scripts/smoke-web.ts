/**
 * Smoke HTTP de la web de prueba. Levanta el server en un puerto efímero.
 * Run: npm run smoke:web
 */
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startServer } from '../web/server';

async function json(res: Response): Promise<any> {
  return res.json();
}

async function main() {
  const dir = mkdtempSync(join(tmpdir(), 'mypet-web-'));
  const { server, port } = await startServer({
    port: 0,
    host: '127.0.0.1',
    storePath: join(dir, 'store.json'),
  });
  const addr = server.address();
  const actualPort = typeof addr === 'object' && addr ? addr.port : port;
  const base = `http://127.0.0.1:${actualPort}`;

  try {
    const health = await fetch(`${base}/health`);
    assert.equal(health.status, 200);

    const landing = await fetch(`${base}/p/demo-luna`);
    const html = await landing.text();
    assert.equal(landing.status, 200);
    assert.match(html, /Encontré tu mascota/);
    assert.match(html, /Luna/);
    assert.doesNotMatch(html, /Av\. Demo 123/);

    const missing = await fetch(`${base}/p/no-existe`);
    assert.equal(missing.status, 404);

    const qr = await fetch(`${base}/qr/demo-luna.png`);
    assert.equal(qr.status, 200);
    assert.equal(qr.headers.get('content-type'), 'image/png');
    const bytes = Buffer.from(await qr.arrayBuffer());
    assert.ok(bytes.length > 100);
    assert.equal(bytes[0], 0x89);

    const alertRes = await fetch(`${base}/api/p/demo-luna/alert`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        foundLat: -33.4489,
        foundLng: -70.6693,
        accuracyMeters: 10,
        usedDemoLocation: true,
      }),
    });
    assert.equal(alertRes.status, 201);
    const created = await json(alertRes);
    assert.equal(created.alert.foundLat, -33.4489);

    const cooldown = await fetch(`${base}/api/p/demo-luna/alert`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ foundLat: -33.45, foundLng: -70.67 }),
    });
    assert.equal(cooldown.status, 400);
    const coolBody = await json(cooldown);
    assert.equal(coolBody.error.code, 'ALERT_COOLDOWN');

    const pets = await json(await fetch(`${base}/api/pets`));
    const luna = pets.pets.find((p: { publicToken: string }) => p.publicToken === 'demo-luna');
    const alerts = await json(await fetch(`${base}/api/pets/${luna.id}/alerts`));
    assert.equal(alerts.alerts.length, 1);

    const createdPet = await fetch(`${base}/api/pets`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Mora',
        species: 'gato',
        address: 'Calle Falsa 123',
        homeLat: -33.41,
        homeLng: -70.64,
      }),
    });
    assert.equal(createdPet.status, 201);

    const print = await fetch(`${base}/print/demo-luna`);
    assert.equal(print.status, 200);
    assert.match(await print.text(), /Si me encuentras/);

    console.log('smoke-web: all passed');
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    rmSync(dir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
