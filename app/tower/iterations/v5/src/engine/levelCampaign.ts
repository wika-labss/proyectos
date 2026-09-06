import { LEVEL_COUNT } from '../constants/game';
import type { CampaignProgress } from './types';

export function initialCampaign(): CampaignProgress {
  return { maxUnlockedLevel: 1, campaignComplete: false };
}

export function isUnlocked(level: number, maxUnlocked: number): boolean {
  return level >= 1 && level <= maxUnlocked && level <= LEVEL_COUNT;
}

export function onLevelWon(
  level: number,
  progress: CampaignProgress,
): CampaignProgress {
  const nextUnlocked = Math.max(progress.maxUnlockedLevel, Math.min(LEVEL_COUNT, level + 1));
  const campaignComplete = level >= LEVEL_COUNT || progress.campaignComplete;
  return {
    maxUnlockedLevel: nextUnlocked,
    campaignComplete: campaignComplete || level >= LEVEL_COUNT,
  };
}
