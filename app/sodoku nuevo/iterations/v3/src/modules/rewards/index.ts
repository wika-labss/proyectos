import { REWARD_NAMES, RewardName } from '../../types';

/** rewards — regalo aleatorio al completar nivel */
export function rollReward(): RewardName {
  const index = Math.floor(Math.random() * REWARD_NAMES.length);
  return REWARD_NAMES[index];
}

export function isRewardName(value: string): value is RewardName {
  return (REWARD_NAMES as string[]).includes(value);
}
