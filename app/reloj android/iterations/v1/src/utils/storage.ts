import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_PREFERENCES, STORAGE_KEY, type ClockPreferences } from '../types';

export async function loadPreferences(): Promise<ClockPreferences> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PREFERENCES;
    }
    const parsed = JSON.parse(raw) as Partial<ClockPreferences>;
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function savePreferences(preferences: ClockPreferences): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}
