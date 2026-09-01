export const colors = {
  background: '#0B3D2E',
  backgroundAlt: '#145A32',
  backgroundDeep: '#1A5276',
  surface: '#F4F7F5',
  accent: '#E67E22',
  accentSecondary: '#2980B9',
  text: '#1C2833',
  textOnDark: '#F8F9F9',
  muted: '#AAB7B8',
  danger: '#C0392B',
  hint: '#F1C40F',
  gemRed: '#E74C3C',
  gemBlue: '#3498DB',
  gemGreen: '#27AE60',
  gemYellow: '#F4D03F',
  gemPurple: '#8E44AD',
  locked: '#566573',
  relationNone: '#566573',
  relationAmigos: '#27AE60',
  relationLigue: '#F4D03F',
  relationPareja: '#E67E22',
  relationMatrimonio: '#8E44AD',
  relationAmorio: '#E74C3C',
  relationInfidelidad: '#C0392B',
  slotH1: '#2980B9',
  slotH2: '#1A5276',
  slotM1: '#E67E22',
  slotM2: '#C0392B',
} as const;

export const relationColors = {
  none: colors.relationNone,
  amigos: colors.relationAmigos,
  ligue: colors.relationLigue,
  pareja: colors.relationPareja,
  matrimonio: colors.relationMatrimonio,
  amorio: colors.relationAmorio,
  infidelidad_culposa: colors.relationInfidelidad,
} as const;

export const slotColors = {
  h1: colors.slotH1,
  h2: colors.slotH2,
  m1: colors.slotM1,
  m2: colors.slotM2,
} as const;

export const gemColors = [
  colors.gemRed,
  colors.gemBlue,
  colors.gemGreen,
  colors.gemYellow,
  colors.gemPurple,
] as const;

export const spacing = {
  md: 16,
  lg: 24,
} as const;

export const radius = {
  md: 12,
} as const;

/** Android generic families — not Inter/Roboto/system UI defaults. */
export const fonts = {
  brand: 'serif',
  body: 'sans-serif',
} as const;
