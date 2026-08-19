import AsyncStorage from '@react-native-async-storage/async-storage';

/** local-storage — persistencia local sin red (keys V3) */
export async function saveJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function loadJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function removeKey(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export const STORAGE_KEYS = {
  progress: 'sodoku-nuevo:v3.5:progress',
  activeGame: 'sodoku-nuevo:v3.5:activeGame',
} as const;
