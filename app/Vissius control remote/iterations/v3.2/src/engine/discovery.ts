import type { TvDevice } from '../types';
import { scanLocalSubnet, type ProgressCallback } from './lanDiscovery';

export async function discoverTvs(onProgress?: ProgressCallback): Promise<TvDevice[]> {
  return scanLocalSubnet(onProgress);
}
