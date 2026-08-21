import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  REWARD_POOL_SIZE,
  REWARDS_TO_UNLOCK_COUNTRY,
  STORAGE_KEY,
} from '../../constants/game';
import { COUNTRIES, type CountryId } from '../../data/countries';

export type RewardItem = {
  id: string;
  grantedAt: number;
};

export type HistoryEntry = {
  countryId: CountryId;
  levelIndex: number;
  score: number;
  at: number;
};

export type ProgressState = {
  unlockedCountryIndex: number;
  unlockedLevelByCountry: Record<CountryId, number>;
  totalScore: number;
  inventory: RewardItem[];
  history: HistoryEntry[];
};

export function defaultProgress(): ProgressState {
  return {
    unlockedCountryIndex: 0,
    unlockedLevelByCountry: {
      mx: 0,
      co: -1,
      pe: -1,
      br: -1,
      ar: -1,
    },
    totalScore: 0,
    inventory: [],
    history: [],
  };
}

export async function loadProgress(): Promise<ProgressState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as ProgressState;
    return {
      ...defaultProgress(),
      ...parsed,
      unlockedLevelByCountry: {
        ...defaultProgress().unlockedLevelByCountry,
        ...parsed.unlockedLevelByCountry,
      },
      inventory: parsed.inventory ?? [],
      history: parsed.history ?? [],
    };
  } catch {
    return defaultProgress();
  }
}

export async function saveProgress(state: ProgressState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function grantRandomReward(
  state: ProgressState,
  rng: () => number = Math.random,
): ProgressState {
  const n = 1 + Math.floor(rng() * REWARD_POOL_SIZE);
  const item: RewardItem = {
    id: `recompensa ${n}`,
    grantedAt: Date.now(),
  };
  return { ...state, inventory: [...state.inventory, item] };
}

export function isCountryUnlocked(
  state: ProgressState,
  countryIndex: number,
): boolean {
  return countryIndex <= state.unlockedCountryIndex;
}

export function isLevelUnlocked(
  state: ProgressState,
  countryId: CountryId,
  levelIndex: number,
): boolean {
  const max = state.unlockedLevelByCountry[countryId] ?? -1;
  return levelIndex <= max;
}

export function applyVictory(
  state: ProgressState,
  countryId: CountryId,
  levelIndex: number,
  score: number,
  rng: () => number = Math.random,
): ProgressState {
  let next = grantRandomReward(state, rng);
  next = {
    ...next,
    totalScore: next.totalScore + score,
    history: [
      { countryId, levelIndex, score, at: Date.now() },
      ...next.history,
    ].slice(0, 50),
  };

  const currentUnlock = next.unlockedLevelByCountry[countryId] ?? -1;
  if (levelIndex >= currentUnlock && levelIndex < 9) {
    next = {
      ...next,
      unlockedLevelByCountry: {
        ...next.unlockedLevelByCountry,
        [countryId]: levelIndex + 1,
      },
    };
  } else if (levelIndex === 9) {
    // Completó los 10 del país: intentar unlock siguiente país
    const countryOrder = COUNTRIES.find((c) => c.id === countryId)?.order ?? 0;
    if (
      countryOrder === next.unlockedCountryIndex &&
      next.inventory.length >= REWARDS_TO_UNLOCK_COUNTRY &&
      countryOrder < COUNTRIES.length - 1
    ) {
      const nextCountry = COUNTRIES[countryOrder + 1]!;
      next = {
        ...next,
        unlockedCountryIndex: countryOrder + 1,
        unlockedLevelByCountry: {
          ...next.unlockedLevelByCountry,
          [nextCountry.id]: 0,
        },
      };
    }
  }

  return next;
}

export function rewardsNeededForNextCountry(state: ProgressState): number {
  return Math.max(0, REWARDS_TO_UNLOCK_COUNTRY - state.inventory.length);
}
