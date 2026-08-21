import type { ColorPreset } from '../types';

export interface ColorTokens {
  display: string;
  displayGlow: string;
  displayDim: string;
}

export const colors = {
  background: '#0D0D0D',
  surface: '#1A1A1A',
  textPrimary: '#E0E0E0',
  textSecondary: '#888888',
  accent: '#FFB000',
  border: '#333333',
  bezelOuter: '#444444',
  bezelInner: '#111111',
} as const;

export const COLOR_PRESETS: Record<ColorPreset, ColorTokens> = {
  green: {
    display: '#39FF14',
    displayGlow: '#39FF1440',
    displayDim: '#39FF1430',
  },
  amber: {
    display: '#FFB000',
    displayGlow: '#FFB00040',
    displayDim: '#FFB00030',
  },
  cyan: {
    display: '#00FFFF',
    displayGlow: '#00FFFF40',
    displayDim: '#00FFFF30',
  },
  red: {
    display: '#FF3333',
    displayGlow: '#FF333340',
    displayDim: '#FF333330',
  },
};

export const PRESET_LABELS: Record<ColorPreset, string> = {
  green: 'Verde VFD',
  amber: 'Ámbar LCD',
  cyan: 'Cian CRT',
  red: 'Rojo LED',
};

export function getPresetTokens(preset: ColorPreset): ColorTokens {
  return COLOR_PRESETS[preset];
}
