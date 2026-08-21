import AsyncStorage from '@react-native-async-storage/async-storage';
import { emptyState, type AppState } from '../../engine';

export const STORAGE_KEY = 'petcare:v1:state';

export type LoadResult =
  | { ok: true; state: AppState }
  | { ok: false; corrupt: boolean; state: AppState };

function isAppState(value: unknown): value is AppState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.pets) &&
    Array.isArray(v.events) &&
    Array.isArray(v.preventives) &&
    typeof v.healthByPetId === 'object' &&
    v.healthByPetId != null &&
    (v.activePetId === null || typeof v.activePetId === 'string')
  );
}

export async function loadState(): Promise<LoadResult> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw == null) {
      return { ok: true, state: emptyState() };
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isAppState(parsed)) {
      return { ok: false, corrupt: true, state: emptyState() };
    }
    return { ok: true, state: parsed };
  } catch {
    return { ok: false, corrupt: true, state: emptyState() };
  }
}

export async function saveState(state: AppState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // offline-first: ignore persistence failures
  }
}

export async function clearState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
