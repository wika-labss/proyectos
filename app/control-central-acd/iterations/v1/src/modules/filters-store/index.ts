import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultFilter, normalizeFilter, type QueryFilter } from '../../engine/filters';

const KEY = 'acd:v1:filters';

export async function loadFilters(): Promise<QueryFilter> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return defaultFilter();
    return normalizeFilter(JSON.parse(raw) as Partial<QueryFilter>);
  } catch {
    return defaultFilter();
  }
}

export async function saveFilters(filter: QueryFilter): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(normalizeFilter(filter)));
}
