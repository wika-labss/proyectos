import type { InputId, RemoteCommand, StreamingAppId, TvDevice, TvStatus } from '../../types';
import { applyVolumeStep } from '../volumeLogic';
import { generateClientCertificate, type PemCertificate } from '../androidtv/certs';
import {
  AndroidTvRemoteSession,
  fetchCastFriendlyName,
  pairAndroidTv,
  probeAndroidTvPort,
  RemoteKeyCode,
} from '../androidtv/session';

const sessions = new Map<string, AndroidTvRemoteSession>();
const certStore = new Map<string, PemCertificate>();

type PinProvider = () => Promise<string>;

let pinProvider: PinProvider | null = null;

/** La UI de emparejamiento registra el callback del PIN (modal). */
export function setAndroidTvPinProvider(provider: PinProvider | null): void {
  pinProvider = provider;
}

export function storeAndroidTvCert(deviceId: string, cert: PemCertificate): void {
  certStore.set(deviceId, cert);
}

export function getAndroidTvCert(deviceId: string): PemCertificate | undefined {
  return certStore.get(deviceId);
}

export async function probeAndroidTv(ip: string): Promise<TvDevice | null> {
  const open = await probeAndroidTvPort(ip);
  if (!open) {
    return null;
  }
  const name = (await fetchCastFriendlyName(ip)) ?? `Android TV (${ip})`;
  return {
    id: `androidtv-${ip}`,
    name,
    ip,
    port: 6467,
    protocol: 'androidtv',
  };
}

export async function connectAndroidTv(device: TvDevice): Promise<TvStatus> {
  const existing = sessions.get(device.id);
  if (existing) {
    existing.stop();
    sessions.delete(device.id);
  }

  let cert = certStore.get(device.id);
  const needsPairing = !cert;

  if (!cert) {
    cert = generateClientCertificate('Vissiuss Remote');
  }

  if (needsPairing) {
    if (!pinProvider) {
      throw new Error('Se requiere PIN de Android TV. Vuelve a tocar Conectar.');
    }
    const paired = await pairAndroidTv(device.ip, cert, pinProvider);
    if (!paired) {
      throw new Error('Emparejamiento Android TV cancelado o PIN incorrecto');
    }
    certStore.set(device.id, cert);
  }

  const session = new AndroidTvRemoteSession(device.ip, cert);
  try {
    await session.start();
  } catch (error) {
    // Cert inválido / TV pide re-emparejar
    certStore.delete(device.id);
    if (!pinProvider) {
      throw error;
    }
    const fresh = generateClientCertificate('Vissiuss Remote');
    const paired = await pairAndroidTv(device.ip, fresh, pinProvider);
    if (!paired) {
      throw new Error('Re-emparejamiento Android TV falló');
    }
    certStore.set(device.id, fresh);
    const retry = new AndroidTvRemoteSession(device.ip, fresh);
    await retry.start();
    sessions.set(device.id, retry);
    const status = retry.getStatus();
    return {
      power: true,
      volume: status.volume,
      muted: status.muted,
      activeApp: null,
      activeInput: null,
      lastCommand: null,
    };
  }

  sessions.set(device.id, session);
  const status = session.getStatus();
  return {
    power: true,
    volume: status.volume,
    muted: status.muted,
    activeApp: null,
    activeInput: null,
    lastCommand: null,
  };
}

export async function disconnectAndroidTv(deviceId: string): Promise<void> {
  const session = sessions.get(deviceId);
  session?.stop();
  sessions.delete(deviceId);
}

const KEY_MAP: Partial<Record<RemoteCommand, number>> = {
  nav_up: RemoteKeyCode.KEYCODE_DPAD_UP,
  nav_down: RemoteKeyCode.KEYCODE_DPAD_DOWN,
  nav_left: RemoteKeyCode.KEYCODE_DPAD_LEFT,
  nav_right: RemoteKeyCode.KEYCODE_DPAD_RIGHT,
  ok: RemoteKeyCode.KEYCODE_DPAD_CENTER,
  back: RemoteKeyCode.KEYCODE_BACK,
  vol_up: RemoteKeyCode.KEYCODE_VOLUME_UP,
  vol_down: RemoteKeyCode.KEYCODE_VOLUME_DOWN,
  input_hdmi1: RemoteKeyCode.KEYCODE_TV_INPUT_HDMI_1,
  input_hdmi2: RemoteKeyCode.KEYCODE_TV_INPUT_HDMI_2,
  input_hdmi3: RemoteKeyCode.KEYCODE_TV_INPUT_HDMI_3,
  input_hdmi4: RemoteKeyCode.KEYCODE_TV_INPUT_HDMI_4,
  input_av: RemoteKeyCode.KEYCODE_TV_INPUT_COMPOSITE_1,
  input_tv: RemoteKeyCode.KEYCODE_TV,
};

const APP_LINKS: Record<StreamingAppId, string> = {
  netflix: 'https://www.netflix.com/title',
  hbo: 'https://play.hbomax.com',
  youtube: 'https://www.youtube.com',
  crunchyroll: 'https://www.crunchyroll.com',
};

function inputFromCommand(command: RemoteCommand): InputId | null {
  if (command.startsWith('input_')) {
    return command.replace('input_', '') as InputId;
  }
  return null;
}

export async function sendAndroidTvCommand(
  device: TvDevice,
  command: RemoteCommand,
  volume: number,
  muted: boolean,
  activeInput: InputId | null,
): Promise<TvStatus> {
  const session = sessions.get(device.id);
  if (!session) {
    throw new Error('Sesión Android TV no activa — vuelve a conectar');
  }

  if (command === 'vol_up' || command === 'vol_down') {
    const next = applyVolumeStep(volume, muted, command);
    if (next.muted && command === 'vol_down') {
      session.sendKey(RemoteKeyCode.KEYCODE_VOLUME_MUTE);
    } else {
      session.sendKey(
        command === 'vol_up'
          ? RemoteKeyCode.KEYCODE_VOLUME_UP
          : RemoteKeyCode.KEYCODE_VOLUME_DOWN,
      );
    }
    return {
      power: true,
      ...next,
      activeApp: null,
      activeInput,
      lastCommand: command,
    };
  }

  if (command.startsWith('launch_')) {
    const appId = command.replace('launch_', '') as StreamingAppId;
    const link = APP_LINKS[appId];
    if (!link) {
      throw new Error('App no mapeada');
    }
    session.sendAppLink(link);
    return {
      power: true,
      volume,
      muted,
      activeApp: appId,
      activeInput,
      lastCommand: command,
    };
  }

  const key = KEY_MAP[command];
  if (key == null) {
    throw new Error('Comando no soportado en Android TV');
  }
  session.sendKey(key);

  return {
    power: true,
    volume,
    muted,
    activeApp: null,
    activeInput: inputFromCommand(command) ?? activeInput,
    lastCommand: command,
  };
}
