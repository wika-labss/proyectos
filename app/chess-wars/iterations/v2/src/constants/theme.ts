export const colors = {
  background: '#0B1020',
  backgroundAlt: '#121A33',
  backgroundWarm: '#1A1430',
  surface: '#1C2744',
  accent: '#5CE1E6',
  accentSecondary: '#A78BFA',
  text: '#E8EEF8',
  textMuted: '#8B97B0',
  success: '#3DDC97',
  danger: '#FF5C7A',
  boardLight: '#2A3555',
  boardDark: '#161D33',
  node: '#F5C542',
  legal: 'rgba(92, 225, 230, 0.53)',
  selected: '#F5C542',
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
    fontSize: 34,
    letterSpacing: 1.5,
    fontWeight: '700' as const,
  },
  title: {
    fontFamily: 'serif',
    fontSize: 22,
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
