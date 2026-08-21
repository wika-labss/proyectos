import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ZodiacSlug } from '../../engine/zodiac';
import { STORAGE_KEY, type UserProfile } from './types';

const VALID_SLUGS = new Set<ZodiacSlug>([
  'aries',
  'tauro',
  'geminis',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'escorpio',
  'sagitario',
  'capricornio',
  'acuario',
  'piscis',
]);

function isUserProfile(value: unknown): value is UserProfile {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const profile = value as Record<string, unknown>;
  return (
    typeof profile.name === 'string' &&
    typeof profile.birthDate === 'string' &&
    typeof profile.signSlug === 'string' &&
    VALID_SLUGS.has(profile.signSlug as ZodiacSlug) &&
    typeof profile.signName === 'string' &&
    typeof profile.registeredAt === 'string'
  );
}

export async function loadUserProfile(): Promise<UserProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    return isUserProfile(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export async function clearUserProfile(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
