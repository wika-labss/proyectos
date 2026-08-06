export const VOLUME_MIN = 0;
export const VOLUME_MAX = 100;
export const VOLUME_STEP = 5;
export const VOLUME_UNMUTE_LEVEL = 5;

export const volume = {
  min: VOLUME_MIN,
  max: VOLUME_MAX,
  step: VOLUME_STEP,
  unmuteLevel: VOLUME_UNMUTE_LEVEL,
} as const;
