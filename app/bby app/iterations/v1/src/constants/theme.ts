export const colors = {
  background: '#0A0A0F',
  surface: '#1A1025',
  primary: '#6B2D5B',
  primaryDark: '#4A1A3E',
  accent: '#8B1A1A',
  accentGlow: '#C41E3A',
  button: '#FFFFFF',
  buttonText: '#0A0A0F',
  textPrimary: '#E8E0F0',
  textSecondary: '#9B8FA8',
  border: '#3D2B4F',
  glow: '#6B2D5B40',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const typography = {
  title: {
    fontFamily: 'serif',
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 2,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  label: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  sos: {
    fontFamily: 'serif',
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: 4,
  },
} as const;

export const layout = {
  torchButtonSize: 160,
  sliderHeight: 40,
  sosButtonHeight: 48,
} as const;
