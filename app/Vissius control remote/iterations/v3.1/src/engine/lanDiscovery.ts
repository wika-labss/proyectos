import * as Network from 'expo-network';
import { logExec, logFail, logOk, logWarn } from '../diagnostics/logger';
import type { ScanProgress, TvDevice, TvProtocol } from '../types';
import { probeAndroidTv } from './drivers/androidTvDriver';
import { probeRoku } from './drivers/rokuDriver';
import { probeVissius } from './drivers/vissiusDriver';
import {
  BATCH_SIZE,
  CONNECT_TIMEOUT_MS,
  MIN_SCAN_DURATION_MS,
  delay,
  fetchWithTimeout,
  mapInBatches,
  parseSubnet,
} from './httpClient';
import { probeAndroidTvPort } from './androidtv/session';

export type ProgressCallback = (progress: ScanProgress) => void;

async function probeHost(ip: string): Promise<TvDevice | null> {
  const [androidtv, vissius, roku] = await Promise.all([
    probeAndroidTv(ip),
    probeVissius(ip),
    probeRoku(ip),
  ]);
  const device = androidtv ?? vissius ?? roku;
  if (device) {
    logOk(`probeHost(${ip})`, `found protocol=${device.protocol} name="${device.name}"`, {
      id: device.id,
      port: device.port,
    });
  }
  return device;
}

export async function scanLocalSubnet(
  onProgress?: ProgressCallback,
): Promise<TvDevice[]> {
  const started = Date.now();
  logExec('scanLocalSubnet', 'start');

  onProgress?.({
    scanned: 0,
    total: 254,
    found: 0,
    phase: 'Obteniendo IP del móvil…',
  });

  const ip = await Network.getIpAddressAsync().catch((error: unknown) => {
    logFail('getIpAddressAsync', error instanceof Error ? error.message : String(error));
    return null;
  });

  logExec('getIpAddressAsync', ip ? `ip=${ip}` : 'null');

  if (!ip) {
    logWarn('scanLocalSubnet', 'abort — sin IP local');
    onProgress?.({
      scanned: 0,
      total: 0,
      found: 0,
      phase: 'Sin IP local — usa IP manual',
    });
    await ensureMinScanDuration(started);
    return [];
  }

  const subnet = parseSubnet(ip);
  logExec('parseSubnet', subnet ? `subnet=${subnet}.0/24` : `invalid ip=${ip}`);

  if (!subnet) {
    logWarn('scanLocalSubnet', `abort — IP inválida (${ip})`);
    onProgress?.({
      scanned: 0,
      total: 0,
      found: 0,
      phase: `IP inválida (${ip}) — usa IP manual`,
    });
    await ensureMinScanDuration(started);
    return [];
  }

  onProgress?.({
    scanned: 0,
    total: 254,
    found: 0,
    phase: `Escaneando ${subnet}.0/24 (Android TV / Roku / Vissius)…`,
  });
  logExec('scanLocalSubnet.batch', `hosts=254 batchSize=${BATCH_SIZE}`);

  const hosts = Array.from({ length: 254 }, (_, index) => `${subnet}.${index + 1}`);
  const foundSoFar = new Map<string, TvDevice>();

  const probes = await mapInBatches(
    hosts,
    BATCH_SIZE,
    async (host) => {
      const device = await probeHost(host);
      if (device) {
        foundSoFar.set(device.id, device);
      }
      return device;
    },
    (done, total) => {
      onProgress?.({
        scanned: done,
        total,
        found: foundSoFar.size,
        phase: `Escaneando… ${Math.round((done / total) * 100)}%`,
      });
    },
  );

  const byId = new Map<string, TvDevice>();
  for (const device of probes) {
    if (device) {
      byId.set(device.id, device);
    }
  }

  await ensureMinScanDuration(started);
  const durationMs = Date.now() - started;
  const list = Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));

  onProgress?.({
    scanned: 254,
    total: 254,
    found: list.length,
    phase: list.length > 0 ? `Encontradas ${list.length} TV(s)` : 'Escaneo terminado',
  });

  if (list.length === 0) {
    logWarn('scanLocalSubnet', `found=0 durationMs=${durationMs}`);
  } else {
    logOk(
      'scanLocalSubnet',
      `found=${list.length} durationMs=${durationMs}`,
      { devices: list.map((d) => ({ id: d.id, ip: d.ip, protocol: d.protocol })) },
    );
  }

  return list;
}

async function ensureMinScanDuration(started: number): Promise<void> {
  const elapsed = Date.now() - started;
  if (elapsed < MIN_SCAN_DURATION_MS) {
    await delay(MIN_SCAN_DURATION_MS - elapsed);
  }
}

export async function discoverByIp(
  ip: string,
  protocol?: TvProtocol,
): Promise<TvDevice | null> {
  const trimmed = ip.trim();
  logExec('discoverByIp', `ip=${trimmed} protocol=${protocol ?? 'auto'}`);

  if (!parseSubnet(trimmed) && !/^\d{1,3}(\.\d{1,3}){3}$/.test(trimmed)) {
    logFail('discoverByIp', 'IP inválida');
    return null;
  }

  if (protocol === 'roku') {
    const device = await probeRoku(trimmed);
    logExec('discoverByIp.roku', device ? `ok name=${device.name}` : 'null');
    return device;
  }
  if (protocol === 'vissius') {
    const device = await probeVissius(trimmed);
    logExec('discoverByIp.vissius', device ? `ok name=${device.name}` : 'null');
    return device;
  }
  if (protocol === 'androidtv') {
    const device = await probeAndroidTv(trimmed);
    logExec('discoverByIp.androidtv', device ? `ok name=${device.name}` : 'null');
    return device;
  }

  const [androidtv, vissius, roku] = await Promise.all([
    probeAndroidTv(trimmed),
    probeVissius(trimmed),
    probeRoku(trimmed),
  ]);
  const device = androidtv ?? vissius ?? roku;
  logExec(
    'discoverByIp.auto',
    device ? `ok protocol=${device.protocol} name=${device.name}` : 'null — ningún protocolo respondió',
    {
      androidtv: Boolean(androidtv),
      vissius: Boolean(vissius),
      roku: Boolean(roku),
    },
  );
  return device;
}

export async function verifyDeviceReachable(device: TvDevice): Promise<boolean> {
  logExec('verifyDeviceReachable', `protocol=${device.protocol} ip=${device.ip}:${device.port}`);

  if (device.protocol === 'androidtv') {
    const ok = await probeAndroidTvPort(device.ip, CONNECT_TIMEOUT_MS);
    if (ok) {
      logOk('verifyDeviceReachable.androidtv', `port 6467 open on ${device.ip}`);
    } else {
      logFail('verifyDeviceReachable.androidtv', `port 6467 closed/timeout on ${device.ip}`);
    }
    return ok;
  }

  const url =
    device.protocol === 'roku'
      ? `http://${device.ip}:${device.port}/query/device-info`
      : `http://${device.ip}:${device.port}/api/v1/info`;
  const response = await fetchWithTimeout(url, {}, CONNECT_TIMEOUT_MS);
  const ok = Boolean(response?.ok);
  if (ok) {
    logOk('verifyDeviceReachable.http', `url=${url} status=${response?.status}`);
  } else {
    logFail('verifyDeviceReachable.http', `url=${url} no response`);
  }
  return ok;
}

export async function getLocalIpAddress(): Promise<string | null> {
  const ip = await Network.getIpAddressAsync().catch(() => null);
  logExec('getLocalIpAddress', ip ?? 'null');
  return ip;
}
