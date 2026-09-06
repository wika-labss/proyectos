/** Política de arranque del loop Castillo. Sin expo-av: el smoke la puede importar. */

export const AMBIENT_BOOT_DELAY_MS = 500;
export const AMBIENT_STARTS_ON_USER_GESTURE = true;
export const AMBIENT_MAX_RUNTIME_BYTES = 2_000_000;
export const AMBIENT_RUNTIME_FILE = 'ambient-castle.mp3';
export const AMBIENT_ANDROID_IMPLEMENTATION = 'MediaPlayer' as const;
export const AMBIENT_PROGRESS_UPDATE_MS = 15_000;

export function ambientInitialStatus(volume: number) {
  return {
    isLooping: true,
    volume,
    shouldPlay: false,
    progressUpdateIntervalMillis: AMBIENT_PROGRESS_UPDATE_MS,
    androidImplementation: AMBIENT_ANDROID_IMPLEMENTATION,
  };
}
