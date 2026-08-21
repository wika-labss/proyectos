export const colors = {
  background: '#F7F1E8',
  surface: '#FFFBF5',
  text: '#2C2416',
  textMuted: '#6B5E4E',
  accent: '#4F7A5A',
  accentMuted: '#DCE8E0',
  warning: '#C47B1A',
  error: '#B42318',
  border: '#E4D9C8',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
} as const;

export const fonts = {
  base: 'System',
  sizeSm: 13,
  sizeMd: 16,
  sizeLg: 22,
  weightRegular: '400' as const,
  weightBold: '700' as const,
};

export const theme = {
  colors,
  spacing,
  radius,
  fonts,
} as const;
