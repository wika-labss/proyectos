import { TOTAL_LEVELS } from '../../constants/levels';
import { addGift } from '../inventory';
import { rollReward } from '../rewards';
import { HistoryEntry, HISTORY_LIMIT, LevelProgress, ProgressData, RewardName } from '../../types';

/** level-progression — 100 niveles, desbloqueo secuencial; dificultad oculta */
export function createInitialProgress(): ProgressData {
  return {
    unlockedLevels: [1],
    levelProgress: {},
    totalScore: 0,
    history: [],
    inventory: [],
    lastReward: null,
  };
}

export function isLevelUnlocked(progress: ProgressData, levelId: number): boolean {
  return progress.unlockedLevels.includes(levelId);
}

export function countCompletedLevels(progress: ProgressData): number {
  return Object.values(progress.levelProgress).filter((p) => p.completed).length;
}

/** Primer nivel desbloqueado no completado; si todos completados, el último desbloqueado */
export function getContinueLevelId(progress: ProgressData): number {
  const unlocked = [...progress.unlockedLevels].sort((a, b) => a - b);
  for (const id of unlocked) {
    if (!progress.levelProgress[id]?.completed) return id;
  }
  return unlocked[unlocked.length - 1] ?? 1;
}

export function completeLevel(
  progress: ProgressData,
  levelId: number,
  score: number,
  reward?: RewardName
): ProgressData {
  const unlocked = new Set(progress.unlockedLevels);
  if (levelId < TOTAL_LEVELS) {
    unlocked.add(levelId + 1);
  }

  const previous: LevelProgress = progress.levelProgress[levelId] ?? {
    completed: false,
    bestScore: 0,
  };

  const granted = reward ?? rollReward();
  const inventory = addGift(progress.inventory ?? [], granted);

  const entry: HistoryEntry = {
    levelId,
    score,
    at: new Date().toISOString(),
    reward: granted,
  };

  const history = [entry, ...(progress.history ?? [])].slice(0, HISTORY_LIMIT);

  return {
    unlockedLevels: Array.from(unlocked).sort((a, b) => a - b),
    totalScore: progress.totalScore + score,
    levelProgress: {
      ...progress.levelProgress,
      [levelId]: {
        completed: true,
        bestScore: Math.max(previous.bestScore, score),
      },
    },
    history,
    inventory,
    lastReward: granted,
  };
}
