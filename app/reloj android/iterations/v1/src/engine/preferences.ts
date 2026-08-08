import type { ClockPreferences, ColorPreset } from '../types';
import { DEFAULT_PREFERENCES } from '../types';

const VALID_PRESETS = new Set<ColorPreset>(['green', 'amber', 'cyan', 'red']);

export function normalizePreferences(partial: Partial<ClockPreferences>): ClockPreferences {
  const colorPreset =
    partial.colorPreset && VALID_PRESETS.has(partial.colorPreset)
      ? partial.colorPreset
      : DEFAULT_PREFERENCES.colorPreset;

  return {
    format24h: partial.format24h ?? DEFAULT_PREFERENCES.format24h,
    showSeconds: partial.showSeconds ?? DEFAULT_PREFERENCES.showSeconds,
    showDate: partial.showDate ?? DEFAULT_PREFERENCES.showDate,
    colorPreset,
    keepAwake: partial.keepAwake ?? DEFAULT_PREFERENCES.keepAwake,
  };
}

export function pickPreferences(state: ClockPreferences): ClockPreferences {
  return {
    format24h: state.format24h,
    showSeconds: state.showSeconds,
    showDate: state.showDate,
    colorPreset: state.colorPreset,
    keepAwake: state.keepAwake,
  };
}
