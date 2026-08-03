import { create } from 'zustand';
import type { TorchMode } from '../types';

interface TorchStoreState {
  mode: TorchMode;
  intensity: number;
  isFlashAvailable: boolean;
  loaded: boolean;
  recheckToken: number;
  setMode: (mode: TorchMode) => void;
  setIntensity: (value: number) => void;
  setFlashAvailable: (available: boolean) => void;
  setLoaded: (loaded: boolean) => void;
  requestRecheck: () => void;
}

export const useTorchStore = create<TorchStoreState>((set) => ({
  mode: 'off',
  intensity: 100,
  isFlashAvailable: false,
  loaded: false,
  recheckToken: 0,
  setMode: (mode) => set({ mode }),
  setIntensity: (value) => set({ intensity: Math.max(0, Math.min(100, Math.round(value))) }),
  setFlashAvailable: (available) => set({ isFlashAvailable: available }),
  setLoaded: (loaded) => set({ loaded }),
  requestRecheck: () => set((state) => ({ recheckToken: state.recheckToken + 1 })),
}));
