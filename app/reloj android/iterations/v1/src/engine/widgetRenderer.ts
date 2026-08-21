import type { ClockPreferences, ColorPreset } from '../types';
import { formatWidgetTime } from './formatTime';

export interface WidgetRenderModel {
  timeText: string;
  colorPreset: ColorPreset;
  time: string;
  ampm: string | null;
}

export function buildWidgetModel(
  date: Date,
  preferences: ClockPreferences,
): WidgetRenderModel {
  const timeText = formatWidgetTime(date, preferences);
  const parts = timeText.split(' ');
  const time = parts[0] ?? timeText;
  const ampm = parts.length > 1 ? (parts[1] ?? null) : null;

  return {
    timeText,
    colorPreset: preferences.colorPreset,
    time,
    ampm,
  };
}
