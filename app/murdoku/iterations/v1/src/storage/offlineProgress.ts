import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  defaultCampaign,
  type CampaignState,
  type RoomId,
} from '../engine/roomCampaign';

const KEY = 'murdoku-progress-v1';

export type ProgressState = {
  version: 1;
  campaign: CampaignState;
};

export function defaultProgress(): ProgressState {
  return { version: 1, campaign: defaultCampaign() };
}

export async function loadProgress(): Promise<ProgressState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as ProgressState;
    if (parsed?.version !== 1 || !parsed.campaign) return defaultProgress();
    if (!Array.isArray(parsed.campaign.unlocked) || !parsed.campaign.unlocked.length) {
      return defaultProgress();
    }
    return parsed;
  } catch {
    return defaultProgress();
  }
}

export async function saveProgress(state: ProgressState): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}

export async function resetProgress(): Promise<ProgressState> {
  const fresh = defaultProgress();
  await saveProgress(fresh);
  return fresh;
}

export type { RoomId };
