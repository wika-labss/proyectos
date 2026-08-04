import type { TvDevice } from '../types';
import { scanLocalSubnet } from './lanDiscovery';

export async function discoverTvs(): Promise<TvDevice[]> {
  return scanLocalSubnet();
}
