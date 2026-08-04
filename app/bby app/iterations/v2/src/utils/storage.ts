import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StoredPreferences } from '../types';

const STORAGE_KEY = '@bby-light/preferences';

const DEFAULT_PREFERENCES: StoredPreferences = {
  intensity: 100,
};

export async function loadPreferences(): Promise<StoredPreferences> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PREFERENCES;
    }

    const parsed = JSON.parse(raw) as Partial<StoredPreferences>;
    return {
      intensity:
        typeof parsed.intensity === 'number'
          ? Math.max(0, Math.min(100, Math.round(parsed.intensity)))
          : DEFAULT_PREFERENCES.intensity,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function saveIntensity(intensity: number): Promise<void> {
  const preferences: StoredPreferences = {
    intensity: Math.max(0, Math.min(100, Math.round(intensity))),
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}
