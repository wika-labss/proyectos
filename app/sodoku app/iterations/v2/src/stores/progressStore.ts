import { create } from 'zustand';
import { calculateStars } from '../engine/difficulty';
import { LevelProgress, ProgressData, GameStatistics } from '../types';
import { loadJson, saveJson, STORAGE_KEYS } from '../utils/storage';

const defaultStatistics: GameStatistics = {
  gamesPlayed: 0,
  gamesWon: 0,
  totalTimeSeconds: 0,
  bestStreak: 0,
  currentStreak: 0,
};

const defaultProgress: ProgressData = {
  unlockedLevels: [1],
  levelProgress: {},
  statistics: defaultStatistics,
};

interface ProgressStore extends ProgressData {
  loaded: boolean;
  load: () => Promise<void>;
  isLevelUnlocked: (levelId: number) => boolean;
  getLevelProgress: (levelId: number) => LevelProgress;
  completeLevel: (levelId: number, elapsedSeconds: number, hintsUsed: number) => Promise<void>;
  resetProgress: () => Promise<void>;
}

async function persistProgress(data: ProgressData): Promise<void> {
  await saveJson(STORAGE_KEYS.progress, data);
}

function createLevelProgress(): LevelProgress {
  return {
    completed: false,
    bestTime: null,
    stars: 0,
  };
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  ...defaultProgress,
  loaded: false,
  load: async () => {
    const progress = await loadJson<ProgressData>(STORAGE_KEYS.progress, defaultProgress);
    set({ ...progress, loaded: true });
  },
  isLevelUnlocked: (levelId) => get().unlockedLevels.includes(levelId),
  getLevelProgress: (levelId) => get().levelProgress[levelId] ?? createLevelProgress(),
  completeLevel: async (levelId, elapsedSeconds, hintsUsed) => {
    const state = get();
    const stars = calculateStars(levelId, elapsedSeconds, hintsUsed);
    const previous = state.levelProgress[levelId] ?? createLevelProgress();
    const nextLevelId = levelId + 1;

    const levelProgress: LevelProgress = {
      completed: true,
      bestTime:
        previous.bestTime === null
          ? elapsedSeconds
          : Math.min(previous.bestTime, elapsedSeconds),
      stars: Math.max(previous.stars, stars),
    };

    const unlockedLevels = [...state.unlockedLevels];
    if (nextLevelId <= 20 && !unlockedLevels.includes(nextLevelId)) {
      unlockedLevels.push(nextLevelId);
    }

    const statistics: GameStatistics = {
      ...state.statistics,
      gamesPlayed: state.statistics.gamesPlayed + 1,
      gamesWon: state.statistics.gamesWon + 1,
      totalTimeSeconds: state.statistics.totalTimeSeconds + elapsedSeconds,
      currentStreak: state.statistics.currentStreak + 1,
      bestStreak: Math.max(state.statistics.bestStreak, state.statistics.currentStreak + 1),
    };

    const nextState: ProgressData = {
      unlockedLevels,
      levelProgress: {
        ...state.levelProgress,
        [levelId]: levelProgress,
      },
      statistics,
    };

    set(nextState);
    await persistProgress(nextState);
  },
  resetProgress: async () => {
    set(defaultProgress);
    await persistProgress(defaultProgress);
  },
}));
