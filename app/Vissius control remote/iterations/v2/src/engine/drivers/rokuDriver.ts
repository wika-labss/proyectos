import type { RemoteCommand, StreamingAppId, TvDevice, TvStatus } from '../../types';
import { volume as volumeConfig } from '../../constants/theme';
import { fetchWithTimeout } from '../httpClient';

const ROKU_PORT = 8060;

const KEY_MAP: Record<RemoteCommand, string | null> = {
  nav_up: 'Up',
  nav_down: 'Down',
  nav_left: 'Left',
  nav_right: 'Right',
  ok: 'Select',
  back: 'Back',
  vol_up: 'VolumeUp',
  vol_down: 'VolumeDown',
  launch_netflix: 'LaunchApp',
  launch_hbo: 'LaunchApp',
  launch_youtube: 'LaunchApp',
  launch_crunchyroll: 'LaunchApp',
};

const APP_IDS: Partial<Record<StreamingAppId, string>> = {
  netflix: '12',
  hbo: '61322',
  youtube: '837',
  crunchyroll: '2595',
};

export async function probeRoku(ip: string): Promise<TvDevice | null> {
  const response = await fetchWithTimeout(`http://${ip}:${ROKU_PORT}/query/device-info`);
  if (!response?.ok) {
    return null;
  }

  const xml = await response.text();
  const nameMatch = xml.match(/<friendly-device-name>([^<]+)<\/friendly-device-name>/);
  const idMatch = xml.match(/<device-id>([^<]+)<\/device-id>/);
  const name = nameMatch?.[1]?.trim() ?? `Roku (${ip})`;
  const id = idMatch?.[1]?.trim() ?? ip;

  return {
    id: `roku-${id}`,
    name,
    ip,
    port: ROKU_PORT,
    protocol: 'roku',
  };
}

export async function connectRoku(_device: TvDevice): Promise<TvStatus> {
  return {
    power: true,
    volume: 25,
    muted: false,
    activeApp: null,
    lastCommand: null,
  };
}

export async function sendRokuCommand(
  device: TvDevice,
  command: RemoteCommand,
  currentVolume: number,
  muted: boolean,
): Promise<TvStatus> {
  if (command === 'vol_up' || command === 'vol_down') {
    const next = applyVolumeStep(currentVolume, muted, command);
    const key = next.muted ? 'VolumeMute' : command === 'vol_up' ? 'VolumeUp' : 'VolumeDown';
    await postKey(device, key);
    if (next.muted && command === 'vol_down') {
      await postKey(device, 'VolumeMute');
    }
    return { ...next, lastCommand: command };
  }

  const key = KEY_MAP[command];
  if (!key) {
    throw new Error('Comando no soportado en Roku');
  }

  if (command.startsWith('launch_')) {
    const appId = APP_IDS[command.replace('launch_', '') as StreamingAppId];
    if (!appId) {
      throw new Error('App no mapeada en Roku');
    }
    await launchApp(device, appId);
  } else {
    await postKey(device, key);
  }

  return {
    power: true,
    volume: currentVolume,
    muted,
    activeApp: command.startsWith('launch_')
      ? (command.replace('launch_', '') as StreamingAppId)
      : null,
    lastCommand: command,
  };
}

async function postKey(device: TvDevice, key: string): Promise<void> {
  const response = await fetchWithTimeout(
    `http://${device.ip}:${device.port}/keypress/${key}`,
    { method: 'POST' },
  );
  if (!response?.ok) {
    throw new Error(`Roku rechazó tecla ${key}`);
  }
}

async function launchApp(device: TvDevice, appId: string): Promise<void> {
  const response = await fetchWithTimeout(`http://${device.ip}:${device.port}/launch/${appId}`, {
    method: 'POST',
  });
  if (!response?.ok) {
    throw new Error('Roku rechazó lanzar app');
  }
}

function applyVolumeStep(current: number, muted: boolean, command: 'vol_up' | 'vol_down'): TvStatus {
  if (command === 'vol_down') {
    if (muted || current <= volumeConfig.min) {
      return { power: true, volume: 0, muted: true, activeApp: null, lastCommand: 'vol_down' };
    }
    const next = Math.max(0, current - volumeConfig.step);
    return {
      power: true,
      volume: next,
      muted: next === 0,
      activeApp: null,
      lastCommand: 'vol_down',
    };
  }

  if (muted || current === 0) {
    return {
      power: true,
      volume: volumeConfig.unmuteLevel,
      muted: false,
      activeApp: null,
      lastCommand: 'vol_up',
    };
  }

  return {
    power: true,
    volume: Math.min(volumeConfig.max, current + volumeConfig.step),
    muted: false,
    activeApp: null,
    lastCommand: 'vol_up',
  };
}
