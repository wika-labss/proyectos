/** Paleta y motion 1:1 con tokens/arkanoid-v4/overrides.json + design-summary.md */
export const fontPixel = 'PressStart2P';

export const bit = {
  night: '#100828',
  panel: '#1C0C40',
  pink: '#F878F8',
  cyan: '#78B8F8',
  purple: '#B878F8',
  gold: '#F8D878',
  hot: '#F83878',
  ink: '#F8F8F8',
  muted: '#A078B8',
  outline: '#000000',
  peach: '#F8B878',
  blue: '#3878F8',
  white: '#F8F8F8',
  overlay: '#100828DD',
} as const;

export const motion = {
  railExpandMs: 240,
  paddleLerpMs: 70,
  pressOpacity: 0.8,
} as const;

export const chrome = {
  outline: 3,
  hairline: 2,
  hit: 44,
  railCollapsed: 48,
  railExpanded: 168,
  avatarCell: 3,
  avatarHudCell: 2,
} as const;

export const menu = {
  void: bit.night,
  nebulaTop: bit.panel,
  nebulaBottom: bit.night,
  neon: bit.cyan,
  magenta: bit.pink,
  text: bit.ink,
  muted: bit.muted,
} as const;

export const play = {
  crt: bit.night,
  paddle: bit.cyan,
  ball: bit.ink,
  hud: bit.gold,
  muted: bit.muted,
  wall: bit.cyan,
  overlay: bit.overlay,
} as const;

/** Ladrillos cuantizados (peach/cyan/blue), no rampa NES v4. */
export const brickRow = [
  bit.hot,
  bit.peach,
  bit.gold,
  bit.cyan,
  bit.blue,
  bit.purple,
] as const;

export const capsuleColor = {
  L: bit.hot,
  E: bit.cyan,
  C: bit.blue,
  S: bit.peach,
  B: bit.pink,
  D: bit.purple,
  P: bit.ink,
} as const;

export const colors = {
  ...menu,
  ...play,
} as const;
