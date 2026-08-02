import { ThemeColors, ThemeMode } from '../types';

export const lightTheme: ThemeColors = {
  background: '#F8F9FA',
  surface: '#FFFFFF',
  primary: '#4A6CF7',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  accent: '#F59E0B',
  error: '#EF4444',
  success: '#10B981',
  gridLine: '#D1D5DB',
  gridLineBold: '#6B7280',
  highlight: '#DBEAFE',
  highlightSame: '#BFDBFE',
  buttonText: '#FFFFFF',
  locked: '#9CA3AF',
};

export const darkTheme: ThemeColors = {
  background: '#1A1B2E',
  surface: '#252640',
  primary: '#6B8AFF',
  text: '#E8E8F0',
  textSecondary: '#9CA3AF',
  accent: '#FBBF24',
  error: '#F87171',
  success: '#34D399',
  gridLine: '#374151',
  gridLineBold: '#9CA3AF',
  highlight: '#1E3A5F',
  highlightSame: '#2D4A6F',
  buttonText: '#FFFFFF',
  locked: '#6B7280',
};

export function getTheme(mode: ThemeMode): ThemeColors {
  return mode === 'dark' ? darkTheme : lightTheme;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  title: 24,
  body: 16,
  cell: 22,
  note: 10,
  small: 12,
};

export const touchTarget = 44;
