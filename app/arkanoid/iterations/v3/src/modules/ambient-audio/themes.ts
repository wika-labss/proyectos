export const AMBIENT_THEME_IDS = ['castle'] as const;

export type AmbientThemeId = (typeof AMBIENT_THEME_IDS)[number];

export type AmbientTheme = {
  id: AmbientThemeId;
  label: string;
  file: string;
};

export const DEFAULT_AMBIENT_THEME: AmbientThemeId = 'castle';
export const AMBIENT_THEME_KEY = 'arkanoid:v3:ambientTheme';

export const AMBIENT_THEMES: readonly AmbientTheme[] = [
  { id: 'castle', label: 'Castillo', file: 'ambient-castle.mp3' },
];

export function isAmbientThemeId(value: string): value is AmbientThemeId {
  return (AMBIENT_THEME_IDS as readonly string[]).includes(value);
}

/** Única pista: el MP3 subido (Castillo). Cualquier id extraño cae aquí. */
export function resolveAmbientTheme(_id?: string | null): AmbientTheme {
  return AMBIENT_THEMES[0]!;
}

export function nextAmbientTheme(_id: AmbientThemeId): AmbientThemeId {
  return DEFAULT_AMBIENT_THEME;
}

export function parseStoredTheme(_raw: string | null): AmbientThemeId {
  return DEFAULT_AMBIENT_THEME;
}
