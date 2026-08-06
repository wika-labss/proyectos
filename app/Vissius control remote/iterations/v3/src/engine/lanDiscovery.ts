import * as Network from 'expo-network';
import type { ScanProgress, TvDevice, TvProtocol } from '../types';
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

export type ProgressCallback = (progress: ScanProgress) => void;

async function probeHost(ip: string): Promise<TvDevice | null> {
  // Probar ambos protocolos en paralelo (más rápido y fiable que secuencial)
  const [vissius, roku] = await Promise.all([probeVissius(ip), probeRoku(ip)]);
  return vissius ?? roku;
}

export async function scanLocalSubnet(
  onProgress?: ProgressCallback,
): Promise<TvDevice[]> {
  const started = Date.now();

  onProgress?.({
    scanned: 0,
    total: 254,
    found: 0,
    phase: 'Obteniendo IP del móvil…',
  });

  const ip = await Network.getIpAddressAsync().catch(() => null);
  if (!ip) {
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
  if (!subnet) {
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
    phase: `Escaneando ${subnet}.0/24…`,
  });

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

  onProgress?.({
    scanned: 254,
    total: 254,
    found: byId.size,
    phase: byId.size > 0 ? `Encontradas ${byId.size} TV(s)` : 'Escaneo terminado',
  });

  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
}

async function ensureMinScanDuration(started: number): Promise<void> {
  const elapsed = Date.now() - started;
  if (elapsed < MIN_SCAN_DURATION_MS) {
    await delay(MIN_SCAN_DURATION_MS - elapsed);
  }
}

/** Conectar por IP manual: prueba el protocolo indicado o ambos. */
export async function discoverByIp(
  ip: string,
  protocol?: TvProtocol,
): Promise<TvDevice | null> {
  const trimmed = ip.trim();
  if (!parseSubnet(trimmed) && !/^\d{1,3}(\.\d{1,3}){3}$/.test(trimmed)) {
    return null;
  }

  if (protocol === 'roku') {
    return probeRoku(trimmed);
  }
  if (protocol === 'vissius') {
    return probeVissius(trimmed);
  }

  const [vissius, roku] = await Promise.all([probeVissius(trimmed), probeRoku(trimmed)]);
  return vissius ?? roku;
}

export async function verifyDeviceReachable(device: TvDevice): Promise<boolean> {
  const url =
    device.protocol === 'roku'
      ? `http://${device.ip}:${device.port}/query/device-info`
      : `http://${device.ip}:${device.port}/api/v1/info`;
  const response = await fetchWithTimeout(url, {}, CONNECT_TIMEOUT_MS);
  return Boolean(response?.ok);
}

export async function getLocalIpAddress(): Promise<string | null> {
  return Network.getIpAddressAsync().catch(() => null);
}
