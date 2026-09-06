import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEY, STORAGE_SHOP_KEY } from '../constants/game';
import { initialCampaign } from '../engine/levelCampaign';
import { defaultShopFlags, type ShopFlags } from '../engine/shopCatalog';
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
      maxUnlockedLevel: Math.max(1, Math.min(25, parsed.maxUnlockedLevel)),
      campaignComplete: parsed.campaignComplete,
    };
  } catch {
    return initialCampaign();
  }
}

export async function saveCampaign(progress: CampaignProgress): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export async function loadShopFlags(): Promise<ShopFlags> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_SHOP_KEY);
    if (!raw) return defaultShopFlags();
    const parsed = JSON.parse(raw) as ShopFlags;
    return {
      infiniteOwned: !!parsed.infiniteOwned,
      contentPackOwned: !!parsed.contentPackOwned,
    };
  } catch {
    return defaultShopFlags();
  }
}

/** V4: compra visual — no cambia owned (IAP futuro). */
export async function saveShopFlags(flags: ShopFlags): Promise<void> {
  await AsyncStorage.setItem(STORAGE_SHOP_KEY, JSON.stringify(flags));
}
