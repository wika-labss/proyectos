import type { RemoteCommand, StreamingAppId, TvDevice, TvStatus } from '../types';

const MOCK_LATENCY_MS = 150;

const MOCK_DEVICES: TvDevice[] = [
  { id: 'mock-tv-living', name: 'Vissius TV — Salón', ip: '192.168.1.50', port: 8080 },
  { id: 'mock-tv-bedroom', name: 'Vissius TV — Dormitorio', ip: '192.168.1.51', port: 8080 },
];

let connectedDevice: TvDevice | null = null;
let status: TvStatus = {
  power: true,
  volume: 25,
  activeApp: null,
  lastCommand: null,
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clampVolume(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function appFromCommand(command: RemoteCommand): StreamingAppId | null {
  if (command === 'launch_netflix') return 'netflix';
  if (command === 'launch_hbo') return 'hbo';
  if (command === 'launch_youtube') return 'youtube';
  if (command === 'launch_crunchyroll') return 'crunchyroll';
  return null;
}

export async function mockDiscoverTvs(): Promise<TvDevice[]> {
  await delay(MOCK_LATENCY_MS);
  return [...MOCK_DEVICES];
}

export async function mockConnect(device: TvDevice): Promise<TvStatus> {
  await delay(MOCK_LATENCY_MS);
  connectedDevice = device;
  status = {
    power: true,
    volume: 25,
    activeApp: null,
    lastCommand: null,
  };
  return { ...status };
}

export async function mockDisconnect(): Promise<void> {
  await delay(MOCK_LATENCY_MS);
  connectedDevice = null;
  status = {
    power: false,
    volume: 0,
    activeApp: null,
    lastCommand: null,
  };
}

export async function mockSendCommand(command: RemoteCommand): Promise<TvStatus> {
  if (!connectedDevice) {
    throw new Error('No hay TV conectada');
  }

  await delay(MOCK_LATENCY_MS);
  status.lastCommand = command;

  if (command === 'vol_up') {
    status.volume = clampVolume(status.volume + 5);
  } else if (command === 'vol_down') {
    status.volume = clampVolume(status.volume - 5);
  } else {
    const app = appFromCommand(command);
    if (app) {
      status.activeApp = app;
    }
  }

  return { ...status };
}
