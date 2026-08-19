export const menu = {
  void: '#050B18',
  nebulaTop: '#0E1A33',
  nebulaBottom: '#1A0B2E',
  neon: '#2EE6D6',
  magenta: '#E84AFF',
  text: '#E8F4FF',
  muted: '#7A93B0',
} as const;

export const play = {
  crt: '#1A1020',
  paddle: '#ECF0F1',
  ball: '#FFFFFF',
  hud: '#F5EE9E',
  muted: '#9A8A78',
  wall: '#3A2A38',
  overlay: '#000000CC',
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
