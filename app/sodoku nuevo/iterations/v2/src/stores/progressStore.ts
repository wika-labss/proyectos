import { create } from 'zustand';
import { TOTAL_LEVELS } from '../constants/levels';
import {
  completeLevel,
  countCompletedLevels,
  createInitialProgress,
  isLevelUnlocked,
} from '../modules/level-progression';
import { loadJson, saveJson, STORAGE_KEYS } from '../modules/local-storage';
import { HistoryEntry, ProgressData } from '../types';

interface ProgressState extends ProgressData {
  loaded: boolean;
  load: () => Promise<void>;
  isUnlocked: (levelId: number) => boolean;
  completedCount: () => number;
  markCompleted: (levelId: number, score: number) => Promise<void>;
}

function persistPayload(state: ProgressData) {
  return {
    unlockedLevels: state.unlockedLevels,
    levelProgress: state.levelProgress,
    totalScore: state.totalScore,
    history: state.history ?? [],
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
      loaded: true,
    });
  },
  isUnlocked: (levelId) => isLevelUnlocked(get(), levelId),
  completedCount: () => countCompletedLevels(get()),
  markCompleted: async (levelId, score) => {
    const next = completeLevel(get(), levelId, score);
    set(next);
    await saveJson(STORAGE_KEYS.progress, persistPayload(next));
  },
}));

export { TOTAL_LEVELS };
export type { HistoryEntry };
