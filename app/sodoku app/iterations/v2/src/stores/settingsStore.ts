import { create } from 'zustand';
import { SettingsData } from '../types';
import { loadJson, saveJson, STORAGE_KEYS } from '../utils/storage';

const defaultSettings: SettingsData = {
  darkMode: false,
  soundEnabled: true,
  vibrationEnabled: true,
};

interface SettingsStore extends SettingsData {
  loaded: boolean;
  load: () => Promise<void>;
  setDarkMode: (value: boolean) => Promise<void>;
  setSoundEnabled: (value: boolean) => Promise<void>;
  setVibrationEnabled: (value: boolean) => Promise<void>;
}

async function persistSettings(settings: SettingsData): Promise<void> {
  await saveJson(STORAGE_KEYS.settings, settings);
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...defaultSettings,
  loaded: false,
  load: async () => {
    const settings = await loadJson<SettingsData>(STORAGE_KEYS.settings, defaultSettings);
    set({ ...settings, loaded: true });
  },
  setDarkMode: async (value) => {
    const next = { ...get(), darkMode: value };
    set({ darkMode: value });
    await persistSettings({
      darkMode: next.darkMode,
      soundEnabled: next.soundEnabled,
      vibrationEnabled: next.vibrationEnabled,
    });
  },
  setSoundEnabled: async (value) => {
    const next = { ...get(), soundEnabled: value };
    set({ soundEnabled: value });
    await persistSettings({
      darkMode: next.darkMode,
      soundEnabled: next.soundEnabled,
      vibrationEnabled: next.vibrationEnabled,
    });
  },
  setVibrationEnabled: async (value) => {
    const next = { ...get(), vibrationEnabled: value };
    set({ vibrationEnabled: value });
    await persistSettings({
      darkMode: next.darkMode,
      soundEnabled: next.soundEnabled,
      vibrationEnabled: next.vibrationEnabled,
    });
  },
}));
