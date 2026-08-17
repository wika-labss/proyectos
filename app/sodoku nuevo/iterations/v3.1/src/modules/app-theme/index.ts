/**
 * app-theme V3.1 — Cute Pink Aesthetic
 * Fuente: recursos/backgrounds/2. Cute Pink Aesthetic/paleta de colores.md
 * + tokens de apoyo para UI (texto / acentos del btn)
 */
export const colors = {
  background: '#FFD6E7',
  softPink: '#FFB7D5',
  accentPink: '#FFA3C8',
  white: '#FFFFFF',
  blush: '#FFF5F8',
  surface: '#FFF5F8',
  text: '#5A2A3A',
  textOnPink: '#FFFFFF',
  textMuted: '#8A5A6A',
  accent: '#FFA3C8',
  secondary: '#FFB7D5',
  active: '#E87AA8',
  number: '#5A2A3A',
  border: '#FFA3C8',
  borderBold: '#E87AA8',
  error: '#EF0000',
  selected: '#FFD6E7',
  given: '#5A2A3A',
  locked: '#8A5A6A',
  buttonBg: '#FFA3C8',
  buttonBorder: '#E87AA8',
  buttonSecondaryBg: '#FFF5F8',
  buttonSecondaryBorder: '#FFB7D5',
  infoBg: 'rgba(255,245,248,0.88)',
  scrim: 'rgba(255,245,248,0.55)',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const typography = {
  title: 32,
  subtitle: 18,
  body: 16,
  cell: 20,
  small: 12,
} as const;
