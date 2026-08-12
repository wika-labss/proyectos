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
    logOk('scan.found', `protocol=${device.protocol} name="${device.name}" ip=${device.ip}:${device.port}`, {
      id: device.id,
    });
  }
  return device;
}

export async function scanLocalSubnet(
  onProgress?: ProgressCallback,
): Promise<TvDevice[]> {
  const started = Date.now();
  logExec('scan.start', 'Android TV :6467 · Vissius :8080 · Roku :8060');

  onProgress?.({
    scanned: 0,
    total: 254,
    found: 0,
    phase: 'Obteniendo IP del móvil…',
  });

  const ip = await Network.getIpAddressAsync().catch((error: unknown) => {
    logFail('scan.phoneIp', error instanceof Error ? error.message : String(error));
    return null;
  });

  if (!ip) {
    logFail('scan.phoneIp', 'null — sin IP local; usa IP manual');
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
  logOk('scan.phoneIp', `ip=${ip} subnet=${subnet ? `${subnet}.0/24` : 'invalid'}`);

  if (!subnet) {
    logFail('scan.abort', `IP inválida (${ip}) — usa IP manual`);
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
  logExec('scan.subnet', `${subnet}.0/24 hosts=254 batch=${BATCH_SIZE}`);

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
    logWarn(
      'scan.done',
      `found=0 phone=${ip} subnet=${subnet}.0/24 durationMs=${durationMs} — misma WiFi? prueba IP manual (TV Ajustes→Red)`,
    );
  } else {
    logOk(
      'scan.done',
      `found=${list.length} phone=${ip} durationMs=${durationMs}`,
      {
        devices: list.map((d) => ({
          id: d.id,
          name: d.name,
          ip: d.ip,
          protocol: d.protocol,
          port: d.port,
        })),
      },
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
  logExec('connect.byIp', `ip=${trimmed} protocol=${protocol ?? 'auto'}`);

  if (!parseSubnet(trimmed) && !/^\d{1,3}(\.\d{1,3}){3}$/.test(trimmed)) {
    logFail('connect.byIp', 'IP inválida');
    return null;
  }

  if (protocol === 'roku') {
    const device = await probeRoku(trimmed);
    if (device) {
      logOk('connect.byIp', `roku name=${device.name}`);
    } else {
      logFail('connect.byIp', `roku no responde en ${trimmed}:8060`);
    }
    return device;
  }
  if (protocol === 'vissius') {
    const device = await probeVissius(trimmed);
    if (device) {
      logOk('connect.byIp', `vissius name=${device.name}`);
    } else {
      logFail('connect.byIp', `vissius no responde en ${trimmed}:8080`);
    }
    return device;
  }
  if (protocol === 'androidtv') {
    const device = await probeAndroidTv(trimmed);
    if (device) {
      logOk('connect.byIp', `androidtv name=${device.name}`);
    } else {
      logFail('connect.byIp', `androidtv puerto 6467 cerrado en ${trimmed}`);
    }
    return device;
  }

  const [androidtv, vissius, roku] = await Promise.all([
    probeAndroidTv(trimmed),
    probeVissius(trimmed),
    probeRoku(trimmed),
  ]);
  const device = androidtv ?? vissius ?? roku;
  if (device) {
    logOk('connect.byIp', `auto protocol=${device.protocol} name=${device.name}`);
  } else {
    logFail(
      'connect.byIp',
      `auto: nada en ${trimmed} (6467/8080/8060) — revisa IP y WiFi`,
      { androidtv: Boolean(androidtv), vissius: Boolean(vissius), roku: Boolean(roku) },
    );
  }
  return device;
}

export async function verifyDeviceReachable(device: TvDevice): Promise<boolean> {
  logExec('connect.verify', `protocol=${device.protocol} ip=${device.ip}:${device.port}`);

  if (device.protocol === 'androidtv') {
    const ok = await probeAndroidTvPort(device.ip, CONNECT_TIMEOUT_MS);
    if (ok) {
      logOk('connect.verify', `androidtv 6467 open ${device.ip}`);
    } else {
      logFail('connect.verify', `androidtv 6467 closed ${device.ip}`);
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
    logOk('connect.verify', `http ${url} status=${response?.status}`);
  } else {
    logFail('connect.verify', `http ${url} no response`);
  }
  return ok;
}

export async function getLocalIpAddress(): Promise<string | null> {
  const ip = await Network.getIpAddressAsync().catch(() => null);
  logExec('scan.phoneIp', ip ?? 'null');
  return ip;
}
