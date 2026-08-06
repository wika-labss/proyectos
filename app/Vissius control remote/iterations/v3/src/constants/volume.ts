export const VOLUME_MIN = 0;
export const VOLUME_MAX = 100;
/** v3: un punto por toque para volumen estable */
export const VOLUME_STEP = 1;
export const VOLUME_UNMUTE_LEVEL = 1;

export const volume = {
  min: VOLUME_MIN,
  max: VOLUME_MAX,
  step: VOLUME_STEP,
  unmuteLevel: VOLUME_UNMUTE_LEVEL,
} as const;
