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
  return discoverTvs(onProgress);
}

export async function findTvByIp(
  ip: string,
  protocol?: TvProtocol,
): Promise<TvDevice | null> {
  return discoverByIp(ip, protocol);
}

export async function connectToTv(device: TvDevice): Promise<TvStatus> {
  const reachable = await verifyDeviceReachable(device);
  if (!reachable) {
    throw new Error('La TV no responde. Comprueba IP, WiFi y que esté encendida.');
  }

  if (device.protocol === 'androidtv') {
    return connectAndroidTv(device);
  }
  if (device.protocol === 'roku') {
    return connectRoku(device);
  }
  return connectVissius(device);
}

export async function disconnectFromTv(device: TvDevice | null): Promise<void> {
  if (device?.protocol === 'androidtv') {
    await disconnectAndroidTv(device.id);
  }
}

export async function sendRemoteCommand(
  device: TvDevice,
  command: RemoteCommand,
  status: TvStatus,
): Promise<TvStatus> {
  if (device.protocol === 'androidtv') {
    return sendAndroidTvCommand(
      device,
      command,
      status.volume,
      status.muted,
      status.activeInput,
    );
  }
  if (device.protocol === 'roku') {
    return sendRokuCommand(
      device,
      command,
      status.volume,
      status.muted,
      status.activeInput,
    );
  }
  return sendVissiusCommand(
    device,
    command,
    status.volume,
    status.muted,
    status.activeInput,
  );
}
