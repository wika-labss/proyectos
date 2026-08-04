import { discoverTvs } from './discovery';
import {
  mockConnect,
  mockDisconnect,
  mockGetStatus,
  mockIsConnected,
  mockSendCommand,
} from './mockTv';
import type { RemoteCommand, TvDevice, TvStatus } from '../types';

export async function scanForTvs(): Promise<TvDevice[]> {
  return discoverTvs(true);
}

export async function connectToTv(device: TvDevice): Promise<TvStatus> {
  return mockConnect(device);
}

export async function disconnectFromTv(): Promise<void> {
  await mockDisconnect();
}

export async function sendRemoteCommand(command: RemoteCommand): Promise<TvStatus> {
  return mockSendCommand(command);
}

export function getTvStatus(): TvStatus {
  return mockGetStatus();
}

export function isTvConnected(): boolean {
  return mockIsConnected();
}
