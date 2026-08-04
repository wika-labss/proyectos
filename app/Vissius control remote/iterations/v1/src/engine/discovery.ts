import type { TvDevice } from '../types';
import { mockDiscoverTvs } from './mockTv';

export async function discoverTvs(): Promise<TvDevice[]> {
  // v1: mock only; LAN real en v2
  return mockDiscoverTvs();
}
