export type AudioChannel = 'ambient' | 'sfx';

export const DEFAULT_AMBIENT_VOLUME = 0.45;
export const DEFAULT_SFX_VOLUME = 0.8;
export const AMBIENT_VOLUME_KEY = 'arkanoid:v3:ambientVolume';
export const SFX_VOLUME_KEY = 'arkanoid:v3:sfxVolume';

const DEFAULTS: Record<AudioChannel, number> = {
  ambient: DEFAULT_AMBIENT_VOLUME,
  sfx: DEFAULT_SFX_VOLUME,
};

export function clampVolume(value: number, fallback = DEFAULT_AMBIENT_VOLUME): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(1, value));
}

export function parseStoredVolume(raw: string | null, channel: AudioChannel): number {
  if (raw == null) return DEFAULTS[channel];
  return clampVolume(Number(raw), DEFAULTS[channel]);
}

export function defaultVolume(channel: AudioChannel): number {
  return DEFAULTS[channel];
}
