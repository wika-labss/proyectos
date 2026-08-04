import * as Network from 'expo-network';
import type { TvDevice } from '../types';
import { probeRoku } from './drivers/rokuDriver';
import { probeVissius } from './drivers/vissiusDriver';
import { BATCH_SIZE, mapInBatches, parseSubnet } from './httpClient';

async function probeHost(ip: string): Promise<TvDevice | null> {
  const vissius = await probeVissius(ip);
  if (vissius) {
    return vissius;
  }
  return probeRoku(ip);
}

export async function scanLocalSubnet(): Promise<TvDevice[]> {
  const ip = await Network.getIpAddressAsync();
  if (!ip) {
    return [];
  }

  const subnet = parseSubnet(ip);
  if (!subnet) {
    return [];
  }

  const hosts = Array.from({ length: 254 }, (_, index) => `${subnet}.${index + 1}`);
  const probes = await mapInBatches(hosts, BATCH_SIZE, probeHost);

  const byId = new Map<string, TvDevice>();
  for (const device of probes) {
    if (device) {
      byId.set(device.id, device);
    }
  }

  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getLocalIpAddress(): Promise<string | null> {
  return Network.getIpAddressAsync();
}
