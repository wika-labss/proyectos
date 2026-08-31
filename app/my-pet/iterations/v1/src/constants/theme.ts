export const colors = {
  background: '#F4F7F5',
  surface: '#FFFFFF',
  text: '#1C2B24',
  textMuted: '#5C6B64',
  accent: '#1F7A5C',
  accentMuted: '#D5EDE4',
  alert: '#C45C26',
  error: '#B42318',
  border: '#D5E0DA',
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
