export const colors = {
  background: '#12161C',
  backgroundAlt: '#1A2330',
  backgroundWarm: '#2A1F18',
  surface: '#243040',
  accent: '#C4A35A',
  accentSecondary: '#6B8F71',
  text: '#E8E6E3',
  textMuted: '#9AA3AD',
  danger: '#B33A3A',
  success: '#3D8B6E',
  boardLight: '#D6C4A8',
  boardDark: '#6B4F3A',
  legal: 'rgba(196, 163, 90, 0.53)',
  selected: '#E8C547',
} as const;

export const spacing = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  md: 12,
  lg: 16,
} as const;

export const typography = {
  brand: {
    fontFamily: 'serif',
    fontSize: 40,
    letterSpacing: 2,
    fontWeight: '700' as const,
  },
  title: {
    fontFamily: 'serif',
    fontSize: 24,
    fontWeight: '600' as const,
  },
  body: {
    fontFamily: 'sans-serif',
    fontSize: 16,
    fontWeight: '400' as const,
  },
  caption: {
    fontFamily: 'sans-serif',
    fontSize: 13,
    fontWeight: '400' as const,
  },
} as const;

export const theme = { colors, spacing, radius, typography } as const;
