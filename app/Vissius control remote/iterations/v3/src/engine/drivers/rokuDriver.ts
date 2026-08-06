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

const ROKU_PORT = 8060;

const KEY_MAP: Partial<Record<RemoteCommand, string>> = {
  nav_up: 'Up',
  nav_down: 'Down',
  nav_left: 'Left',
  nav_right: 'Right',
  ok: 'Select',
  back: 'Back',
  vol_up: 'VolumeUp',
  vol_down: 'VolumeDown',
  input_hdmi1: 'InputHDMI1',
  input_hdmi2: 'InputHDMI2',
  input_hdmi3: 'InputHDMI3',
  input_hdmi4: 'InputHDMI4',
  input_av: 'InputAV1',
  input_tv: 'InputTuner',
};

const APP_IDS: Partial<Record<StreamingAppId, string>> = {
  netflix: '12',
  hbo: '61322',
  youtube: '837',
  crunchyroll: '2595',
};

function inputFromCommand(command: RemoteCommand): InputId | null {
  if (command.startsWith('input_')) {
    return command.replace('input_', '') as InputId;
  }
  return null;
}

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

/** v3: verificar que la TV responde antes de marcar conectado */
export async function connectRoku(device: TvDevice): Promise<TvStatus> {
  const probed = await probeRoku(device.ip);
  if (!probed) {
    throw new Error('TV Roku no responde en la red');
  }

  // Comando ligero de verificación (Home no cambia mucho el estado)
  const ping = await fetchWithTimeout(
    `http://${device.ip}:${device.port}/query/device-info`,
    {},
    CONNECT_TIMEOUT_MS,
  );
  if (!ping?.ok) {
    throw new Error('No se pudo verificar la conexión con Roku');
  }

  return {
    power: true,
    volume: 25,
    muted: false,
    activeApp: null,
    activeInput: null,
    lastCommand: null,
  };
}

export async function sendRokuCommand(
  device: TvDevice,
  command: RemoteCommand,
  currentVolume: number,
  muted: boolean,
  activeInput: InputId | null,
): Promise<TvStatus> {
  if (command === 'vol_up' || command === 'vol_down') {
    const volumeState = applyVolumeStep(currentVolume, muted, command);
    const key =
      volumeState.muted && command === 'vol_down'
        ? 'VolumeMute'
        : command === 'vol_up'
          ? 'VolumeUp'
          : 'VolumeDown';
    await postKey(device, key);
    return {
      power: true,
      ...volumeState,
      activeApp: null,
      activeInput,
      lastCommand: command,
    };
  }

  if (command.startsWith('launch_')) {
    const appId = APP_IDS[command.replace('launch_', '') as StreamingAppId];
    if (!appId) {
      throw new Error('App no mapeada en Roku');
    }
    await launchApp(device, appId);
    return {
      power: true,
      volume: currentVolume,
      muted,
      activeApp: command.replace('launch_', '') as StreamingAppId,
      activeInput,
      lastCommand: command,
    };
  }

  const key = KEY_MAP[command];
  if (!key) {
    throw new Error('Comando no soportado en Roku');
  }
  await postKey(device, key);

  const nextInput = inputFromCommand(command) ?? activeInput;

  return {
    power: true,
    volume: currentVolume,
    muted,
    activeApp: null,
    activeInput: nextInput,
    lastCommand: command,
  };
}

async function postKey(device: TvDevice, key: string): Promise<void> {
  const response = await fetchWithTimeout(
    `http://${device.ip}:${device.port}/keypress/${key}`,
    { method: 'POST' },
    COMMAND_TIMEOUT_MS,
  );
  if (!response?.ok) {
    throw new Error(`Roku rechazó tecla ${key}`);
  }
}

async function launchApp(device: TvDevice, appId: string): Promise<void> {
  const response = await fetchWithTimeout(
    `http://${device.ip}:${device.port}/launch/${appId}`,
    { method: 'POST' },
    COMMAND_TIMEOUT_MS,
  );
  if (!response?.ok) {
    throw new Error('Roku rechazó lanzar app');
  }
}
