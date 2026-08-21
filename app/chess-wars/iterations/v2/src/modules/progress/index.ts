import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'ai-chess-wars/meta/v2';

export type MetaProgress = {
  gamesPlayed: number;
  wins: number;
  tutorialDone: boolean;
};

const DEFAULT: MetaProgress = {
  gamesPlayed: 0,
  wins: 0,
  tutorialDone: false,
};

export async function loadMeta(): Promise<MetaProgress> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT };
    const parsed = JSON.parse(raw) as Partial<MetaProgress>;
    return {
      gamesPlayed: Math.max(0, parsed.gamesPlayed ?? 0),
      wins: Math.max(0, parsed.wins ?? 0),
      tutorialDone: !!parsed.tutorialDone,
    };
  } catch {
    return { ...DEFAULT };
  }
}

export async function saveMeta(meta: MetaProgress): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(meta));
}

export async function recordGame(won: boolean): Promise<MetaProgress> {
  const cur = await loadMeta();
  const next = {
    ...cur,
    gamesPlayed: cur.gamesPlayed + 1,
    wins: cur.wins + (won ? 1 : 0),
  };
  await saveMeta(next);
  return next;
}

export async function markTutorialDone(): Promise<MetaProgress> {
  const cur = await loadMeta();
  const next = { ...cur, tutorialDone: true };
  await saveMeta(next);
  return next;
}
