import { create } from 'zustand';

import { pickPreferences } from '../engine/preferences';
import { loadPreferences, savePreferences } from '../utils/storage';
import { DEFAULT_PREFERENCES, type ClockPreferences } from '../types';

const SAVE_DEBOUNCE_MS = 400;

interface ClockStore extends ClockPreferences {
  loaded: boolean;
  hydrate: () => Promise<void>;
  setPreference: <K extends keyof ClockPreferences>(key: K, value: ClockPreferences[K]) => void;
  flushPreferences: () => Promise<void>;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let pendingPreferences: ClockPreferences | null = null;

function scheduleSave(preferences: ClockPreferences): void {
  pendingPreferences = preferences;
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  saveTimer = setTimeout(() => {
    saveTimer = null;
    const snapshot = pendingPreferences;
    pendingPreferences = null;
    if (snapshot) {
      void savePreferences(snapshot);
    }
  }, SAVE_DEBOUNCE_MS);
}

export const useClockStore = create<ClockStore>((set, get) => ({
  ...DEFAULT_PREFERENCES,
  loaded: false,
  hydrate: async () => {
    const preferences = await loadPreferences();
    set({ ...preferences, loaded: true });
  },
  setPreference: (key, value) => {
    set({ [key]: value });
    const state = get();
    scheduleSave(pickPreferences(state));
  },
  flushPreferences: async () => {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    const snapshot = pendingPreferences ?? pickPreferences(get());
    pendingPreferences = null;
    await savePreferences(snapshot);
  },
}));

export function selectPreferences(state: ClockStore): ClockPreferences {
  return pickPreferences(state);
}
