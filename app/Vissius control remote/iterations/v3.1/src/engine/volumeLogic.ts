import type { TvStatus, VolumeCommand } from '../types';
import {
  VOLUME_MAX,
  VOLUME_MIN,
  VOLUME_STEP,
  VOLUME_UNMUTE_LEVEL,
} from '../constants/volume';

export function applyVolumeStep(
  current: number,
  muted: boolean,
  command: VolumeCommand,
): Pick<TvStatus, 'volume' | 'muted'> {
  if (command === 'vol_down') {
    if (muted || current <= VOLUME_MIN) {
      return { volume: 0, muted: true };
    }
    const next = Math.max(VOLUME_MIN, current - VOLUME_STEP);
    return { volume: next, muted: next === 0 };
  }

  if (muted || current === 0) {
    return { volume: VOLUME_UNMUTE_LEVEL, muted: false };
  }

  return { volume: Math.min(VOLUME_MAX, current + VOLUME_STEP), muted: false };
}

export function normalizeVolumeLevel(
  volumeLevel: number,
  muted: boolean,
): Pick<TvStatus, 'volume' | 'muted'> {
  const clamped = Math.max(VOLUME_MIN, Math.min(VOLUME_MAX, Math.round(volumeLevel)));
  const isMuted = muted || clamped === 0;
  return { volume: isMuted ? 0 : clamped, muted: isMuted };
}
