import type { ZodiacSlug } from '../../engine/zodiac';

export type UserProfile = {
  name: string;
  birthDate: string;
  signSlug: ZodiacSlug;
  signName: string;
  registeredAt: string;
};

export const STORAGE_KEY = '@horoscopo-alan:v1:profile';
