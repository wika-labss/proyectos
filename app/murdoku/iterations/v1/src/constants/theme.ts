export const colors = {
  background: '#1A1520',
  surface: '#2A2333',
  text: '#F2EDE6',
  textMuted: '#A89B8C',
  accent: '#C4A35A',
  error: '#C45C5C',
  border: '#3D3448',
  victim: '#E8D5A3',
  suspect: '#7A9EBF',
  killer: '#8B3A4A',
  locked: '#564C5E',
  conflictFill: '#3A2228',
  selectedFill: '#342C40',
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
} as const;

export const fonts = {
  brand: 'serif',
  body: 'sans-serif',
} as const;

export const skins = {
  library: { background: '#1F1A24', surface: '#2E2836' },
  kitchen: { background: '#1C1714', surface: '#2C241E' },
  basement: { background: '#121018', surface: '#1E1A26' },
  garden: { background: '#141A16', surface: '#1E2820' },
} as const;
