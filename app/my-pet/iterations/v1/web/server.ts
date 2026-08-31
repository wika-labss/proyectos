import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';
import {
  alertsForPet,
  buildPublicUrl,
  formatDistance,
  getPetById,
  getPetByToken,
  haversineMeters,
  publicPetView,
  type CreatePetInput,
} from '../src/engine';
import { hubPage, landingPage, notFoundPage, ownerPage, printPage } from './pages';
import { FileStore } from './store';

const __dirname = dirname(fileURLToPath(import.meta.url));

export type StartOptions = {
  port?: number;
  host?: string;
  storePath?: string;
};

function send(res: ServerResponse, status: number, body: string, contentType: string): void {
  res.writeHead(status, {
    'content-type': contentType,
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
  });
  res.end(body);
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  send(res, status, JSON.stringify(payload), 'application/json; charset=utf-8');
}

function sendHtml(res: ServerResponse, status: number, html: string): void {
  send(res, status, html, 'text/html; charset=utf-8');
}

function originFrom(req: IncomingMessage, fallbackPort: number): string {
  const host = req.headers.host ?? `127.0.0.1:${fallbackPort}`;
  const protoHeader = req.headers['x-forwarded-proto'];
  const proto = typeof protoHeader === 'string' ? protoHeader.split(',')[0]!.trim() : 'http';
  return `${proto}://${host}`;
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  return JSON.parse(raw) as unknown;
}

export function createHandler(store: FileStore, listenPort: number) {
  return async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const method = req.method ?? 'GET';
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${listenPort}`);
    const path = url.pathname;
    const origin = originFrom(req, listenPort);

    if (method === 'OPTIONS') {
      send(res, 204, '', 'text/plain');
      return;
    }

    try {
      if (method === 'GET' && (path === '/' || path === '/index.html')) {
        sendHtml(res, 200, hubPage(origin));
        return;
      }

      if (method === 'GET' && path === '/health') {
        sendJson(res, 200, { ok: true, service: 'my-pet-web-test' });
        return;
      }

      if (method === 'GET' && path === '/api/pets') {
        sendJson(res, 200, { pets: store.load().pets });
        return;
      }

      if (method === 'POST' && path === '/api/pets') {
        const body = (await readJson(req)) as Partial<CreatePetInput>;
        const result = store.addPet({
          name: String(body.name ?? ''),
          species: String(body.species ?? ''),
          address: String(body.address ?? ''),
          homeLat: Number(body.homeLat),
          homeLng: Number(body.homeLng),
        });
        if (!result.ok) {
          sendJson(res, 400, { error: result.error });
          return;
        }
        const pet = result.state.pets[result.state.pets.length - 1]!;
        sendJson(res, 201, { pet });
        return;
      }

      const petIdMatch = path.match(/^\/api\/pets\/([^/]+)$/);
      if (method === 'GET' && petIdMatch) {
        const pet = getPetById(store.load(), decodeURIComponent(petIdMatch[1]!));
        if (!pet) {
          sendJson(res, 404, { error: { code: 'PET_NOT_FOUND', message: 'Mascota no encontrada' } });
          return;
        }
        sendJson(res, 200, { pet });
        return;
      }

      const petAlertsMatch = path.match(/^\/api\/pets\/([^/]+)\/alerts$/);
      if (method === 'GET' && petAlertsMatch) {
        const current = store.load();
        const pet = getPetById(current, decodeURIComponent(petAlertsMatch[1]!));
        if (!pet) {
          sendJson(res, 404, { error: { code: 'PET_NOT_FOUND', message: 'Mascota no encontrada' } });
          return;
        }
        sendJson(res, 200, { alerts: alertsForPet(current, pet.id) });
        return;
      }

      if (method === 'GET' && path === '/api/alerts') {
        const current = store.load();
        sendJson(res, 200, { alerts: current.alerts.slice().reverse() });
        return;
      }

      const alertPost = path.match(/^\/api\/p\/([^/]+)\/alert$/);
      if (method === 'POST' && alertPost) {
        const token = decodeURIComponent(alertPost[1]!);
        const body = (await readJson(req)) as {
          foundLat?: number | null;
          foundLng?: number | null;
          accuracyMeters?: number | null;
          usedDemoLocation?: boolean;
        };
        const result = store.addAlert({
          token,
          foundLat: body.foundLat ?? null,
          foundLng: body.foundLng ?? null,
          accuracyMeters: body.accuracyMeters ?? null,
          usedDemoLocation: Boolean(body.usedDemoLocation),
        });
        if (!result.ok) {
          const status = result.error.code === 'ALERT_UNKNOWN_TOKEN' ? 404 : 400;
          sendJson(res, status, { error: result.error });
          return;
        }
        const alert = result.state.alerts[result.state.alerts.length - 1]!;
        sendJson(res, 201, { alert });
        return;
      }

      const landingMatch = path.match(/^\/p\/([^/]+)$/);
      if (method === 'GET' && landingMatch) {
        const pet = getPetByToken(store.load(), decodeURIComponent(landingMatch[1]!));
        if (!pet) {
          sendHtml(res, 404, notFoundPage());
          return;
        }
        sendHtml(res, 200, landingPage(pet));
        return;
      }

      const printMatch = path.match(/^\/print\/([^/]+)$/);
      if (method === 'GET' && printMatch) {
        const token = decodeURIComponent(printMatch[1]!);
        const pet = getPetByToken(store.load(), token);
        if (!pet) {
          sendHtml(res, 404, notFoundPage());
          return;
        }
        const publicUrl = buildPublicUrl(origin, pet.publicToken);
        sendHtml(res, 200, printPage(pet, `/qr/${encodeURIComponent(pet.publicToken)}.png`, publicUrl));
        return;
      }

      const qrMatch = path.match(/^\/qr\/([^/]+)\.png$/);
      if (method === 'GET' && qrMatch) {
        const token = decodeURIComponent(qrMatch[1]!);
        const pet = getPetByToken(store.load(), token);
        if (!pet) {
          send(res, 404, 'not found', 'text/plain');
          return;
        }
        const publicUrl = buildPublicUrl(origin, pet.publicToken);
        const png = await QRCode.toBuffer(publicUrl, { type: 'png', width: 512, margin: 2 });
        res.writeHead(200, {
          'content-type': 'image/png',
          'cache-control': 'no-store',
          'access-control-allow-origin': '*',
        });
        res.end(png);
        return;
      }

      if (method === 'GET' && path === '/owner') {
        const current = store.load();
        const alertsHtml = current.alerts
          .slice()
          .reverse()
          .map((a) => {
            const pet = getPetById(current, a.petId);
            let extra = 'sin coordenadas';
            if (a.foundLat != null && a.foundLng != null && pet) {
              const meters = haversineMeters(
                { lat: pet.homeLat, lng: pet.homeLng },
                { lat: a.foundLat, lng: a.foundLng },
              );
              extra = `${a.foundLat.toFixed(5)}, ${a.foundLng.toFixed(5)} · ${formatDistance(meters)} de casa`;
            }
            return `<li><strong>${pet ? pet.name : a.petId}</strong> · ${a.status}<br/>
              <span class="muted">${a.createdAt} · ${extra}${a.usedDemoLocation ? ' · demo' : ''}</span></li>`;
          })
          .join('');
        sendHtml(res, 200, ownerPage(origin, current.pets, alertsHtml));
        return;
      }

      const publicApi = path.match(/^\/api\/p\/([^/]+)$/);
      if (method === 'GET' && publicApi) {
        const pet = getPetByToken(store.load(), decodeURIComponent(publicApi[1]!));
        if (!pet) {
          sendJson(res, 404, { error: { code: 'ALERT_UNKNOWN_TOKEN', message: 'Mascota no encontrada' } });
          return;
        }
        sendJson(res, 200, { pet: publicPetView(pet) });
        return;
      }

      if (method === 'POST' && path === '/api/reset-demo') {
        sendJson(res, 200, { store: store.resetDemo() });
        return;
      }

      sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'Ruta no encontrada' } });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'error';
      sendJson(res, 500, { error: { code: 'SERVER_ERROR', message } });
    }
  };
}

export function startServer(options: StartOptions = {}) {
  const port = options.port ?? Number(process.env.PORT ?? 8787);
  const host = options.host ?? process.env.HOST ?? '0.0.0.0';
  const storePath = options.storePath ?? join(__dirname, 'data', 'store.json');
  const store = new FileStore(storePath);
  store.load();
  const handler = createHandler(store, port);
  const server = createServer((req, res) => {
    void handler(req, res);
  });
  return new Promise<{ server: ReturnType<typeof createServer>; port: number; store: FileStore }>(
    (resolve) => {
      server.listen(port, host, () => {
        resolve({ server, port, store });
      });
    },
  );
}
