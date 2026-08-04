import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StoredTvPreferences, TvDevice } from '../types';

const STORAGE_KEY = '@vissius-remote/preferences';

const DEFAULT_PREFERENCES: StoredTvPreferences = {
  pairedDevice: null,
};

export async function loadPreferences(): Promise<StoredTvPreferences> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PREFERENCES;
    }

    const parsed = JSON.parse(raw) as Partial<StoredTvPreferences>;
    if (!parsed.pairedDevice) {
      return DEFAULT_PREFERENCES;
    }

    const device = parsed.pairedDevice;
    if (
      typeof device.id === 'string' &&
      typeof device.name === 'string' &&
      typeof device.ip === 'string' &&
      typeof device.port === 'number'
    ) {
      return { pairedDevice: device };
    }

    return DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function savePairedDevice(device: TvDevice | null): Promise<void> {
  const preferences: StoredTvPreferences = { pairedDevice: device };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

export async function clearPairedDevice(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
