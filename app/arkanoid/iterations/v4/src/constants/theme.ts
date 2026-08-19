import overrides from '../design-system/tokens/overrides.json';

const c = overrides.colors;
const radius = overrides.radius.cta;

export const menu = {
  void: c.void,
  nebulaTop: c.nebulaTop,
  nebulaBottom: c.nebulaBottom,
  neon: c.neon,
  magenta: c.magenta,
  text: c.text,
  muted: c.muted,
  radius,
} as const;

export const play = {
  crt: c.crt,
  paddle: c.paddle,
  ball: c.ball,
  hud: c.hud,
  muted: '#9A8A78',
  wall: '#3A2A38',
  overlay: '#000000CC',
  boss: c.boss,
  bossCore: c.bossCore,
  loseBg: c.loseBg,
  radius,
} as const;

export const brickRow = [
  '#E74C3C',
  '#E67E22',
  '#F1C40F',
  '#2ECC71',
  '#3498DB',
  '#9B59B6',
] as const;

export const colors = {
  ...menu,
  ...play,
} as const;
