/** Paleta 8-bit unificada (NES / CRT). Una sola atmósfera en menú y partida. */
export const fontPixel = 'PressStart2P';

export const bit = {
  night: '#0C0820',
  panel: '#140C28',
  wall: '#5C4A6E',
  ink: '#F8F8F8',
  muted: '#A0A0B8',
  gold: '#F8D878',
  red: '#F83800',
  orange: '#FC9838',
  yellow: '#F8D878',
  green: '#00B800',
  cyan: '#3CBCFC',
  purple: '#B8B8F8',
  pink: '#F878F8',
  white: '#F8F8F8',
  overlay: '#000000DD',
} as const;

export const menu = {
  void: bit.night,
  nebulaTop: bit.panel,
  nebulaBottom: bit.night,
  neon: bit.gold,
  magenta: bit.pink,
  text: bit.ink,
  muted: bit.muted,
} as const;

export const play = {
  crt: bit.night,
  paddle: bit.white,
  ball: bit.white,
  hud: bit.gold,
  muted: bit.muted,
  wall: bit.wall,
  overlay: bit.overlay,
} as const;

export const brickRow = [
  bit.red,
  bit.orange,
  bit.yellow,
  bit.green,
  bit.cyan,
  bit.purple,
] as const;

export const capsuleColor = {
  L: bit.red,
  E: bit.green,
  C: bit.cyan,
  S: bit.orange,
  B: bit.pink,
  D: bit.purple,
  P: bit.white,
} as const;

export const colors = {
  ...menu,
  ...play,
} as const;
