/**
 * ember-keep — sync from design-system/tokens/ember-keep/
 * Expectativa: visual-expectation/tower-v4/
 */
export const tokenMeta = {
  family: 'ember-keep',
  status: 'approved',
  approvedAt: '2026-09-06',
  approvalRef: 'visual-expectation/tower-v4/approval.md',
} as const;

export const colors = {
  keepVoid: '#0A0E16',
  stone: '#2A3344',
  stoneHi: '#3D4A5C',
  ember: '#E85D04',
  torchGold: '#F0C14B',
  mist: '#E8EEF7',
  muted: '#8A9BB0',
  pathOchre: '#C4A574',
  archerGreen: '#5DBB63',
  cannonRust: '#E07A3D',
  frost: '#4FC3F7',
  sniperViolet: '#9B59B6',
  breach: '#8B1E1E',
  danger: '#D62828',
  scrim: 'rgba(10, 14, 22, 0.55)',
  overlay: 'rgba(10, 14, 22, 0.72)',
  night: '#0A0E16',
  steel: '#2A3344',
  gold: '#F0C14B',
  surface: '#2A3344',
  pad: '#3D4A5C',
  padHot: '#E85D04',
  path: '#C4A574',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const layout = {
  ctaMaxWidth: 340,
  touchMin: 44,
  hudHeight: 56,
  towerSlot: 72,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 20,
} as const;

export const borderWidth = {
  thin: 1,
  medium: 2,
  thick: 3,
} as const;

export const typography = {
  xs: 10,
  sm: 12,
  body: 16,
  subtitle: 18,
  title: 32,
  display: 56,
} as const;

export const fonts = {
  display: 'System',
  body: 'System',
} as const;

export const towerTint = {
  archer: colors.archerGreen,
  cannon: colors.cannonRust,
  frost: colors.frost,
  sniper: colors.sniperViolet,
} as const;
