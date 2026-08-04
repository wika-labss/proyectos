import { create } from 'zustand';
import type { TvDevice } from '../types';
import { scanForTvs } from '../engine/tvRemoteApi';

interface PairingStore {
  devices: TvDevice[];
  scanning: boolean;
  scanError: string | null;
  scan: () => Promise<void>;
  clear: () => void;
}

export const usePairingStore = create<PairingStore>((set) => ({
  devices: [],
  scanning: false,
  scanError: null,

  scan: async () => {
    set({ scanning: true, scanError: null, devices: [] });
    try {
      const devices = await scanForTvs();
      set({ devices, scanning: false });
    } catch {
      set({
        scanning: false,
        scanError: 'No se pudieron buscar TVs en la red',
        devices: [],
      });
    }
  },

  clear: () => {
    set({ devices: [], scanning: false, scanError: null });
  },
}));
