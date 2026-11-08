/** Futuristic menu tokens + retro playfield tokens (idea/04). */
export const menu = {
  void: '#050B18',
  nebula: '#0E1A33',
  nebulaDeep: '#1A0B2E',
  neon: '#2EE6D6',
  magenta: '#E84AFF',
  text: '#E8F4FF',
  muted: '#7A8FA8',
} as const;

export const retro = {
  crt: '#1A1020',
  paddle: '#ECF0F1',
  ball: '#FFFFFF',
  hud: '#F5EE9E',
  muted: '#A898B0',
  danger: '#E74C3C',
  accent: '#F1C40F',
  bricks: ['#E74C3C', '#E67E22', '#F1C40F', '#2ECC71', '#3498DB', '#9B59B6'] as const,
  hardBrick: '#BDC3C7',
  hardBrickHit: '#7F8C8D',
} as const;

export const colors = {
  ...menu,
  arena: menu.void,
  accent: menu.neon,
  hud: retro.hud,
  muted: menu.muted,
} as const;
