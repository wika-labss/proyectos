import type { RemoteCommand, TvDevice, TvStatus } from '../types';
import { connectRoku, sendRokuCommand } from './drivers/rokuDriver';
import { connectVissius, sendVissiusCommand } from './drivers/vissiusDriver';
import { discoverTvs } from './discovery';

export async function scanForTvs(): Promise<TvDevice[]> {
  return discoverTvs();
}

export async function connectToTv(device: TvDevice): Promise<TvStatus> {
  if (device.protocol === 'roku') {
    return connectRoku(device);
  }
  return connectVissius(device);
}

export async function disconnectFromTv(_device: TvDevice | null): Promise<void> {
  // HTTP stateless — no session teardown required in v2
}

export async function sendRemoteCommand(
  device: TvDevice,
  command: RemoteCommand,
  status: TvStatus,
): Promise<TvStatus> {
  if (device.protocol === 'roku') {
    return sendRokuCommand(device, command, status.volume, status.muted);
  }
  return sendVissiusCommand(device, command, status.volume, status.muted);
}
