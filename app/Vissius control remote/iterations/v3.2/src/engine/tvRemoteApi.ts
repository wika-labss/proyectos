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
  const devices = await discoverTvs(onProgress);
  return devices;
}

export async function findTvByIp(
  ip: string,
  protocol?: TvProtocol,
): Promise<TvDevice | null> {
  return discoverByIp(ip, protocol);
}

export async function connectToTv(device: TvDevice): Promise<TvStatus> {
  logExec(
    'connect.start',
    `protocol=${device.protocol} name="${device.name}" ip=${device.ip}:${device.port}`,
  );
  const reachable = await verifyDeviceReachable(device);
  if (!reachable) {
    logFail(
      'connect.fail',
      `verify failed — TV no responde en ${device.ip}:${device.port} (${device.protocol})`,
    );
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
    logOk(
      'connect.ok',
      `protocol=${device.protocol} ip=${device.ip} volume=${status.volume} muted=${status.muted}`,
    );
    return status;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logFail('connect.fail', message);
    throw error;
  }
}

export async function disconnectFromTv(device: TvDevice | null): Promise<void> {
  if (device?.protocol === 'androidtv') {
    await disconnectAndroidTv(device.id);
  }
  logExec('connect.disconnect', device ? `id=${device.id}` : 'null');
}

export async function sendRemoteCommand(
  device: TvDevice,
  command: RemoteCommand,
  status: TvStatus,
): Promise<TvStatus> {
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
    logOk('remote.command', `cmd=${command} protocol=${device.protocol} volume=${next.volume}`);
    return next;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logFail('remote.command', `cmd=${command} ${message}`);
    throw error;
  }
}
