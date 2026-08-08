import { create } from 'zustand';

import { loadPreferences, savePreferences } from '../utils/storage';
import { DEFAULT_PREFERENCES, type ClockPreferences } from '../types';

interface ClockStore extends ClockPreferences {
  loaded: boolean;
  hydrate: () => Promise<void>;
  setPreference: <K extends keyof ClockPreferences>(key: K, value: ClockPreferences[K]) => Promise<void>;
}

export const useClockStore = create<ClockStore>((set, get) => ({
  ...DEFAULT_PREFERENCES,
  loaded: false,
  hydrate: async () => {
    const preferences = await loadPreferences();
    set({ ...preferences, loaded: true });
  },
  setPreference: async (key, value) => {
    const next = { ...get(), [key]: value };
    set({ [key]: value });
    const { loaded: _loaded, hydrate: _hydrate, setPreference: _setPreference, ...prefs } = next;
    await savePreferences(prefs);
  },
}));

export function getClockPreferencesSnapshot(): ClockPreferences {
  const { loaded: _loaded, hydrate: _hydrate, setPreference: _setPreference, ...prefs } =
    useClockStore.getState();
  return prefs;
}
