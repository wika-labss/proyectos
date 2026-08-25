export const colors = {
  background: '#0F1720',
  surface: '#1B2733',
  text: '#F4F7FA',
  textMuted: '#9AA8B5',
  accent: '#3DDC97',
  error: '#F07167',
  border: '#2C3A47',
  overlay: 'rgba(15, 23, 32, 0.92)',
  estado: {
    publicada: '#5B8DEF',
    cerrada: '#C9A227',
    adjudicada: '#3DDC97',
    desierta: '#F07167',
    otro: '#9AA8B5',
  },
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
  lg: 20,
  pill: 999,
} as const;

export const fonts = {
  title: 24,
  heading: 18,
  body: 16,
  caption: 13,
} as const;

export const touchMin = 44;

export const appTitle = 'Control Central ACD';
