import { TOTAL_LEVELS } from '../../constants/levels';
import { LevelProgress, ProgressData } from '../../types';

/** level-progression — 20 niveles, desbloqueo y reinicio */
export function createInitialProgress(): ProgressData {
  return {
    unlockedLevels: [1],
    levelProgress: {},
    totalScore: 0,
  };
}

export function isLevelUnlocked(progress: ProgressData, levelId: number): boolean {
  return progress.unlockedLevels.includes(levelId);
}

export function completeLevel(
  progress: ProgressData,
  levelId: number,
  score: number
): ProgressData {
  const unlocked = new Set(progress.unlockedLevels);
  if (levelId < TOTAL_LEVELS) {
    unlocked.add(levelId + 1);
  }

  const previous: LevelProgress = progress.levelProgress[levelId] ?? {
    completed: false,
    bestScore: 0,
  };

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
  };
}
