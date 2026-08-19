import { create } from 'zustand';
import { TOTAL_LEVELS } from '../constants/levels';
import { countGifts } from '../modules/inventory';
import {
  completeLevel,
  countCompletedLevels,
  createInitialProgress,
  getContinueLevelId,
  isLevelUnlocked,
} from '../modules/level-progression';
import { loadJson, saveJson, STORAGE_KEYS } from '../modules/local-storage';
import { rollReward } from '../modules/rewards';
import { HistoryEntry, ProgressData, RewardName } from '../types';

interface ProgressState extends ProgressData {
  loaded: boolean;
  load: () => Promise<void>;
  isUnlocked: (levelId: number) => boolean;
  completedCount: () => number;
  giftsCount: () => number;
  continueLevelId: () => number;
  markCompleted: (levelId: number, score: number) => Promise<RewardName>;
}

function persistPayload(state: ProgressData) {
  return {
    unlockedLevels: state.unlockedLevels,
    levelProgress: state.levelProgress,
    totalScore: state.totalScore,
    history: state.history ?? [],
    inventory: state.inventory ?? [],
    lastReward: state.lastReward ?? null,
  };
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  ...createInitialProgress(),
  loaded: false,
  load: async () => {
    const data = await loadJson(STORAGE_KEYS.progress, createInitialProgress());
    set({
      ...createInitialProgress(),
      ...data,
      history: data.history ?? [],
      inventory: data.inventory ?? [],
      lastReward: data.lastReward ?? null,
      loaded: true,
    });
  },
  isUnlocked: (levelId) => isLevelUnlocked(get(), levelId),
  completedCount: () => countCompletedLevels(get()),
  giftsCount: () => countGifts(get().inventory ?? []),
  continueLevelId: () => getContinueLevelId(get()),
  markCompleted: async (levelId, score) => {
    const reward = rollReward();
    const next = completeLevel(get(), levelId, score, reward);
    set(next);
    await saveJson(STORAGE_KEYS.progress, persistPayload(next));
    return reward;
  },
}));

export { TOTAL_LEVELS };
export type { HistoryEntry, RewardName };
