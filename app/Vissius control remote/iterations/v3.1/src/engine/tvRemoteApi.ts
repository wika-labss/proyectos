import { logExec, logFail, logOk } from '../diagnostics/logger';
import type { RemoteCommand, TvDevice, TvProtocol, TvStatus } from '../types';
import {
  connectAndroidTv,
  disconnectAndroidTv,
  sendAndroidTvCommand,
} from './drivers/androidTvDriver';
import { connectRoku, sendRokuCommand } from './drivers/rokuDriver';
import { connectVissius, sendVissiusCommand } from './drivers/vissiusDriver';
import { discoverTvs } from './discovery';
import { discoverByIp, verifyDeviceReachable, type ProgressCallback } from './lanDiscovery';

export async function scanForTvs(onProgress?: ProgressCallback): Promise<TvDevice[]> {
  logExec('scanForTvs', 'start');
  const devices = await discoverTvs(onProgress);
  logOk('scanForTvs', `devices=${devices.length}`);
  return devices;
}

export async function findTvByIp(
  ip: string,
  protocol?: TvProtocol,
): Promise<TvDevice | null> {
  return discoverByIp(ip, protocol);
}

export async function connectToTv(device: TvDevice): Promise<TvStatus> {
  logExec('connectToTv', `id=${device.id} protocol=${device.protocol} ip=${device.ip}`);
  const reachable = await verifyDeviceReachable(device);
  if (!reachable) {
    logFail('connectToTv', 'TV no responde (verify failed)');
    throw new Error('La TV no responde. Comprueba IP, WiFi y que esté encendida.');
  }

  try {
    let status: TvStatus;
    if (device.protocol === 'androidtv') {
      status = await connectAndroidTv(device);
    } else if (device.protocol === 'roku') {
      status = await connectRoku(device);
    } else {
      status = await connectVissius(device);
    }
    logOk('connectToTv', `connected volume=${status.volume} muted=${status.muted}`);
    return status;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logFail('connectToTv', message);
    throw error;
  }
}

export async function disconnectFromTv(device: TvDevice | null): Promise<void> {
  logExec('disconnectFromTv', device ? `id=${device.id}` : 'null');
  if (device?.protocol === 'androidtv') {
    await disconnectAndroidTv(device.id);
  }
  logOk('disconnectFromTv', 'ok');
}

export async function sendRemoteCommand(
  device: TvDevice,
  command: RemoteCommand,
  status: TvStatus,
): Promise<TvStatus> {
  logExec('sendRemoteCommand', `cmd=${command} protocol=${device.protocol}`);
  try {
    let next: TvStatus;
    if (device.protocol === 'androidtv') {
      next = await sendAndroidTvCommand(
        device,
        command,
        status.volume,
        status.muted,
        status.activeInput,
      );
    } else if (device.protocol === 'roku') {
      next = await sendRokuCommand(
        device,
        command,
        status.volume,
        status.muted,
        status.activeInput,
      );
    } else {
      next = await sendVissiusCommand(
        device,
        command,
        status.volume,
        status.muted,
        status.activeInput,
      );
    }
    logOk('sendRemoteCommand', `ok cmd=${command} volume=${next.volume}`);
    return next;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logFail('sendRemoteCommand', message, { command });
    throw error;
  }
}
