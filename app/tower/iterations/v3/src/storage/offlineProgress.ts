import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEY } from '../constants/game';
import { initialCampaign } from '../engine/levelCampaign';
import type { CampaignProgress } from '../engine/types';

export async function loadCampaign(): Promise<CampaignProgress> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return initialCampaign();
    const parsed = JSON.parse(raw) as CampaignProgress;
    if (
      typeof parsed.maxUnlockedLevel !== 'number' ||
      typeof parsed.campaignComplete !== 'boolean'
    ) {
      return initialCampaign();
    }
    return {
      maxUnlockedLevel: Math.max(1, Math.min(15, parsed.maxUnlockedLevel)),
      campaignComplete: parsed.campaignComplete,
    };
  } catch {
    return initialCampaign();
  }
}

export async function saveCampaign(progress: CampaignProgress): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}
