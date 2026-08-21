import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'chess-wars/progress/v1';

export type Progress = {
  maxUnlockedBattle: number;
  wins: number;
};

const DEFAULT_PROGRESS: Progress = {
  maxUnlockedBattle: 1,
  wins: 0,
};

export async function loadProgress(): Promise<Progress> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      maxUnlockedBattle: Math.min(10, Math.max(1, parsed.maxUnlockedBattle ?? 1)),
      wins: Math.max(0, parsed.wins ?? 0),
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export async function saveProgress(progress: Progress): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(progress));
}

export async function markBattleWon(battleId: number): Promise<Progress> {
  const current = await loadProgress();
  const next: Progress = {
    maxUnlockedBattle: Math.min(10, Math.max(current.maxUnlockedBattle, battleId + 1)),
    wins: current.wins + 1,
  };
  // If won battle 10, keep unlocked at 10
  if (battleId >= 10) next.maxUnlockedBattle = 10;
  await saveProgress(next);
  return next;
}

export async function resetProgress(): Promise<Progress> {
  await saveProgress({ ...DEFAULT_PROGRESS });
  return { ...DEFAULT_PROGRESS };
}
