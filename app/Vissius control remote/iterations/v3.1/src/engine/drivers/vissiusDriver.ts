import type {
  InputId,
  RemoteCommand,
  StreamingAppId,
  TvDevice,
  TvStatus,
} from '../../types';
import {
  COMMAND_TIMEOUT_MS,
  CONNECT_TIMEOUT_MS,
  fetchWithTimeout,
} from '../httpClient';
import { applyVolumeStep, normalizeVolumeLevel } from '../volumeLogic';

const BASE = (device: TvDevice) => `http://${device.ip}:${device.port}`;

interface VissiusInfoResponse {
  id: string;
  name: string;
  volume: number;
  muted?: boolean;
}

function appFromCommand(command: RemoteCommand): StreamingAppId | null {
  if (command === 'launch_netflix') return 'netflix';
  if (command === 'launch_hbo') return 'hbo';
  if (command === 'launch_youtube') return 'youtube';
  if (command === 'launch_crunchyroll') return 'crunchyroll';
  return null;
}

function inputFromCommand(command: RemoteCommand): InputId | null {
  if (command.startsWith('input_')) {
    return command.replace('input_', '') as InputId;
  }
  return null;
}

function toStatus(
  volumeLevel: number,
  muted: boolean,
  activeApp: StreamingAppId | null = null,
  activeInput: InputId | null = null,
  lastCommand: RemoteCommand | null = null,
): TvStatus {
  const normalized = normalizeVolumeLevel(volumeLevel, muted);
  return {
    power: true,
    ...normalized,
    activeApp,
    activeInput,
    lastCommand,
  };
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
  const response = await fetchWithTimeout(
    `${BASE(device)}/api/v1/info`,
    {},
    CONNECT_TIMEOUT_MS,
  );
  if (!response?.ok) {
    throw new Error('TV Vissius no responde');
  }
  const data = (await response.json()) as VissiusInfoResponse;
  return toStatus(data.volume, Boolean(data.muted));
}

export async function sendVissiusCommand(
  device: TvDevice,
  command: RemoteCommand,
  volume: number,
  muted: boolean,
  activeInput: InputId | null,
): Promise<TvStatus> {
  if (command === 'vol_up' || command === 'vol_down') {
    const next = applyVolumeStep(volume, muted, command);
    const response = await fetchWithTimeout(
      `${BASE(device)}/api/v1/volume`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: next.volume, muted: next.muted }),
      },
      COMMAND_TIMEOUT_MS,
    );
    if (!response?.ok) {
      throw new Error('Error de volumen en TV Vissius');
    }
    return toStatus(next.volume, next.muted, null, activeInput, command);
  }

  const response = await fetchWithTimeout(
    `${BASE(device)}/api/v1/command`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    },
    COMMAND_TIMEOUT_MS,
  );
  if (!response?.ok) {
    throw new Error('Comando rechazado por TV Vissius');
  }

  const launchedApp = appFromCommand(command);
  const nextInput = inputFromCommand(command) ?? activeInput;

  try {
    const data = (await response.json()) as Partial<VissiusInfoResponse>;
    if (typeof data.volume === 'number') {
      return toStatus(data.volume, Boolean(data.muted), launchedApp, nextInput, command);
    }
  } catch {
    // respuesta vacía OK
  }

  return toStatus(volume, muted, launchedApp, nextInput, command);
}
