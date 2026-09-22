import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AVATAR_IDS,
  AVATAR_KEY,
  DEFAULT_AVATAR,
  type AvatarId,
} from '../constants/avatars';

function isAvatarId(value: string): value is AvatarId {
  return (AVATAR_IDS as readonly string[]).includes(value);
}

export async function loadAvatarId(): Promise<AvatarId> {
  try {
    const raw = await AsyncStorage.getItem(AVATAR_KEY);
    if (raw && isAvatarId(raw)) return raw;
    return DEFAULT_AVATAR;
  } catch {
    return DEFAULT_AVATAR;
  }
}

export async function saveAvatarId(id: AvatarId): Promise<void> {
  try {
    await AsyncStorage.setItem(AVATAR_KEY, id);
  } catch {
    // offline-first
  }
}
