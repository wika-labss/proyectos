import type { TvDevice } from '../types';
import { mockDiscoverTvs } from './mockTv';

export async function discoverTvs(useMock: boolean): Promise<TvDevice[]> {
  if (useMock) {
    return mockDiscoverTvs();
  }

  // v1: solo mock; descubrimiento LAN real en v2
  return mockDiscoverTvs();
}
