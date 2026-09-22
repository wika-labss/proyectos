import AsyncStorage from '@react-native-async-storage/async-storage';
import { HIGH_SCORE_KEY } from '../constants/game';

export async function loadHighScore(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(HIGH_SCORE_KEY);
    if (raw == null) return 0;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

export async function saveHighScore(score: number): Promise<void> {
  try {
    await AsyncStorage.setItem(HIGH_SCORE_KEY, String(Math.max(0, Math.floor(score))));
  } catch {
    // offline-first: ignore persistence failures
  }
}
