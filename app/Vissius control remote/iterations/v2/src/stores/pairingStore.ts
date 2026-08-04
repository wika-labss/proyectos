import { create } from 'zustand';
import type { TvDevice } from '../types';
import { scanForTvs } from '../engine/tvRemoteApi';

interface PairingStore {
  devices: TvDevice[];
  scanning: boolean;
  scanError: string | null;
  scanEmpty: boolean;
  scan: () => Promise<void>;
  clear: () => void;
}

export const usePairingStore = create<PairingStore>((set) => ({
  devices: [],
  scanning: false,
  scanError: null,
  scanEmpty: false,

  scan: async () => {
    set({ scanning: true, scanError: null, scanEmpty: false, devices: [] });
    try {
      const devices = await scanForTvs();
      set({
        devices,
        scanning: false,
        scanEmpty: devices.length === 0,
      });
    } catch {
      set({
        scanning: false,
        scanError: 'No se pudieron buscar TVs en la red',
        scanEmpty: true,
        devices: [],
      });
    }
  },

  clear: () => {
    set({ devices: [], scanning: false, scanError: null, scanEmpty: false });
  },
}));
