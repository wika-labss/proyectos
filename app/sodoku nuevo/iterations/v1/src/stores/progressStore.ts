import { create } from 'zustand';
import { TOTAL_LEVELS } from '../constants/levels';
import { completeLevel, createInitialProgress, isLevelUnlocked } from '../modules/level-progression';
import { loadJson, saveJson, STORAGE_KEYS } from '../modules/local-storage';
import { ProgressData } from '../types';

interface ProgressState extends ProgressData {
  loaded: boolean;
  load: () => Promise<void>;
  isUnlocked: (levelId: number) => boolean;
  markCompleted: (levelId: number, score: number) => Promise<void>;
  addScore: (delta: number) => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  ...createInitialProgress(),
  loaded: false,
  load: async () => {
    const data = await loadJson(STORAGE_KEYS.progress, createInitialProgress());
    set({ ...data, loaded: true });
  },
  isUnlocked: (levelId) => isLevelUnlocked(get(), levelId),
  markCompleted: async (levelId, score) => {
    const next = completeLevel(get(), levelId, score);
    set(next);
    await saveJson(STORAGE_KEYS.progress, {
      unlockedLevels: next.unlockedLevels,
      levelProgress: next.levelProgress,
      totalScore: next.totalScore,
    });
  },
  addScore: async (delta) => {
    const totalScore = Math.max(0, get().totalScore + delta);
    const payload = {
      unlockedLevels: get().unlockedLevels,
      levelProgress: get().levelProgress,
      totalScore,
    };
    set(payload);
    await saveJson(STORAGE_KEYS.progress, payload);
  },
}));

export { TOTAL_LEVELS };
