export const AMBIENT_THEME_IDS = ['nebula', 'castle'] as const;

export type AmbientThemeId = (typeof AMBIENT_THEME_IDS)[number];

export type AmbientTheme = {
  id: AmbientThemeId;
  label: string;
  file: string;
};

export const DEFAULT_AMBIENT_THEME: AmbientThemeId = 'nebula';
export const AMBIENT_THEME_KEY = 'arkanoid:v3:ambientTheme';

export const AMBIENT_THEMES: readonly AmbientTheme[] = [
  { id: 'nebula', label: 'Nebula', file: 'ambient-loop.mp3' },
  { id: 'castle', label: 'Castillo', file: 'ambient-castle.mp3' },
];

export function isAmbientThemeId(value: string): value is AmbientThemeId {
  return (AMBIENT_THEME_IDS as readonly string[]).includes(value);
}

/** Busca el tema por id. Si no existe, vuelve al default. */
export function resolveAmbientTheme(id: string | null | undefined): AmbientTheme {
  const found = AMBIENT_THEMES.find((theme) => theme.id === id);
  return found ?? AMBIENT_THEMES[0]!;
}

export function nextAmbientTheme(id: AmbientThemeId): AmbientThemeId {
  const index = AMBIENT_THEMES.findIndex((theme) => theme.id === id);
  const next = AMBIENT_THEMES[(index + 1) % AMBIENT_THEMES.length];
  return next!.id;
}

export function parseStoredTheme(raw: string | null): AmbientThemeId {
  if (raw && isAmbientThemeId(raw)) return raw;
  return DEFAULT_AMBIENT_THEME;
}
