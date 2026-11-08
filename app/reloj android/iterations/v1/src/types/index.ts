export type ColorPreset = 'green' | 'amber' | 'cyan' | 'red';

export interface ClockPreferences {
  format24h: boolean;
  showSeconds: boolean;
  showDate: boolean;
  colorPreset: ColorPreset;
  keepAwake: boolean;
}

export interface FormattedClock {
  time: string;
  ampm: string | null;
  date: string;
}

export const DEFAULT_PREFERENCES: ClockPreferences = {
  format24h: true,
  showSeconds: true,
  showDate: true,
  colorPreset: 'green',
  keepAwake: false,
};

export const STORAGE_KEY = '@reloj_android/preferences';

export const WIDGET_NAME = 'RetroClockWidget';

export const FONT_FAMILY = 'DSEG7Classic-Bold';
