import type { RemoteCommand, TvDevice, TvStatus } from '../../types';
import { fetchWithTimeout } from '../httpClient';

const BASE = (device: TvDevice) => `http://${device.ip}:${device.port}`;

interface VissiusInfoResponse {
  id: string;
  name: string;
  volume: number;
  muted?: boolean;
}

export async function probeVissius(ip: string): Promise<TvDevice | null> {
  const response = await fetchWithTimeout(`http://${ip}:8080/api/v1/info`);
  if (!response?.ok) {
    return null;
  }

  try {
    const data = (await response.json()) as VissiusInfoResponse;
    if (!data.id || !data.name) {
      return null;
    }
    return {
      id: `vissius-${data.id}`,
      name: data.name,
      ip,
      port: 8080,
      protocol: 'vissius',
    };
  } catch {
    return null;
  }
}

export async function connectVissius(device: TvDevice): Promise<TvStatus> {
  const response = await fetchWithTimeout(`${BASE(device)}/api/v1/info`);
  if (!response?.ok) {
    throw new Error('TV Vissius no responde');
  }
  const data = (await response.json()) as VissiusInfoResponse;
  return normalizeStatus(data.volume, Boolean(data.muted));
}

export async function sendVissiusCommand(
  device: TvDevice,
  command: RemoteCommand,
  volume: number,
  muted: boolean,
): Promise<TvStatus> {
  if (command === 'vol_up' || command === 'vol_down') {
    const next = applyVolumeStep(volume, muted, command);
    const response = await fetchWithTimeout(`${BASE(device)}/api/v1/volume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level: next.volume, muted: next.muted }),
    });
    if (!response?.ok) {
      throw new Error('Error de volumen en TV Vissius');
    }
    return next;
  }

  const response = await fetchWithTimeout(`${BASE(device)}/api/v1/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command }),
  });
  if (!response?.ok) {
    throw new Error('Comando rechazado por TV Vissius');
  }

  try {
    const data = (await response.json()) as Partial<VissiusInfoResponse>;
    if (typeof data.volume === 'number') {
      return normalizeStatus(data.volume, Boolean(data.muted));
    }
  } catch {
    // status parcial OK
  }

  return normalizeStatus(volume, muted);
}

function applyVolumeStep(current: number, muted: boolean, command: 'vol_up' | 'vol_down'): TvStatus {
  if (command === 'vol_down') {
    if (muted || current <= 0) {
      return normalizeStatus(0, true);
    }
    const next = Math.max(0, current - 5);
    return normalizeStatus(next, next === 0);
  }

  if (muted || current === 0) {
    return normalizeStatus(5, false);
  }
  return normalizeStatus(Math.min(100, current + 5), false);
}

function normalizeStatus(volumeLevel: number, muted: boolean): TvStatus {
  const clamped = Math.max(0, Math.min(100, Math.round(volumeLevel)));
  const isMuted = muted || clamped === 0;
  return {
    power: true,
    volume: isMuted ? 0 : clamped,
    muted: isMuted,
    activeApp: null,
    lastCommand: null,
  };
}
