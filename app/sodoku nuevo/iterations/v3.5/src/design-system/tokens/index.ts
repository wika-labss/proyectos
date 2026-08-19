/**
 * Resuelve tokens WIKA desde JSON oficial (design-system).
 */

import colorsJson from './cute-pink/colors.json';
import spacingJson from './cute-pink/spacing.json';
import typographyJson from './cute-pink/typography.json';
import radiusJson from './cute-pink/radius.json';
import overridesJson from './sodoku-overrides.json';

type TokenValue = { value: string | number; alias?: string };

function pickNumber(map: Record<string, TokenValue>, key: string): number {
  const entry = map[key];
  return typeof entry.value === 'number' ? entry.value : Number(entry.value);
}

function pickString(map: Record<string, TokenValue>, key: string): string {
  return String(map[key].value);
}

function resolveColors(raw: Record<string, TokenValue>) {
  const get = (key: string): string => {
    const entry = raw[key];
    if (entry.alias) return get(entry.alias);
    return pickString(raw, key);
  };

  return {
    background: get('background'),
    softPink: get('soft-pink'),
    accentPink: get('accent-pink'),
    white: get('white'),
    blush: get('blush'),
    surface: get('surface'),
    text: get('text'),
    textOnPink: get('text-on-pink'),
    textMuted: get('text-muted'),
    accent: get('accent'),
    secondary: get('secondary'),
    active: get('active'),
    number: get('number'),
    border: get('border'),
    borderBold: get('border-bold'),
    error: get('error'),
    selected: get('selected'),
    given: get('given'),
    locked: get('locked'),
    buttonBg: get('button-bg'),
    buttonBorder: get('button-border'),
    buttonSecondaryBg: get('button-secondary-bg'),
    buttonSecondaryBorder: get('button-secondary-border'),
    infoBg: get('info-bg'),
    scrim: get('scrim'),
    textShadow: get('text-shadow'),
  } as const;
}

export const tokenMeta = {
  family: colorsJson.family,
  status: colorsJson.status,
  approvedAt: colorsJson.approvedAt,
  approvalRef: colorsJson.approvalRef,
  schema: colorsJson.$schema,
} as const;

export const colors = resolveColors(colorsJson.colors as Record<string, TokenValue>);

export const spacing = {
  xs: pickNumber(spacingJson.spacing as Record<string, TokenValue>, 'xs'),
  sm: pickNumber(spacingJson.spacing as Record<string, TokenValue>, 'sm'),
  md: pickNumber(spacingJson.spacing as Record<string, TokenValue>, 'md'),
  lg: pickNumber(spacingJson.spacing as Record<string, TokenValue>, 'lg'),
  xl: pickNumber(spacingJson.spacing as Record<string, TokenValue>, 'xl'),
} as const;

export const layout = {
  ctaMaxWidth: pickNumber(spacingJson.layout as Record<string, TokenValue>, 'cta-max-width'),
  chipWidth: pickNumber(spacingJson.layout as Record<string, TokenValue>, 'chip-width'),
  chipHeight: pickNumber(spacingJson.layout as Record<string, TokenValue>, 'chip-height'),
  tileSize: pickNumber(spacingJson.layout as Record<string, TokenValue>, 'tile-size'),
  keyWidth: pickNumber(spacingJson.layout as Record<string, TokenValue>, 'key-width'),
  keyHeight: pickNumber(spacingJson.layout as Record<string, TokenValue>, 'key-height'),
  touchMin: pickNumber(spacingJson.layout as Record<string, TokenValue>, 'touch-min'),
} as const;

export const typography = {
  xs: pickNumber(typographyJson.fontSize as Record<string, TokenValue>, 'xs'),
  sm: pickNumber(typographyJson.fontSize as Record<string, TokenValue>, 'sm'),
  body: pickNumber(typographyJson.fontSize as Record<string, TokenValue>, 'body'),
  subtitle: pickNumber(typographyJson.fontSize as Record<string, TokenValue>, 'subtitle'),
  cell: pickNumber(typographyJson.fontSize as Record<string, TokenValue>, 'cell'),
  title: pickNumber(typographyJson.fontSize as Record<string, TokenValue>, 'title'),
  displaySm: pickNumber(typographyJson.fontSize as Record<string, TokenValue>, 'display-sm'),
  small: pickNumber(typographyJson.fontSize as Record<string, TokenValue>, 'sm'),
} as const;

export const fontWeight = {
  regular: pickNumber(typographyJson.fontWeight as Record<string, TokenValue>, 'regular'),
  semibold: pickNumber(typographyJson.fontWeight as Record<string, TokenValue>, 'semibold'),
  bold: pickNumber(typographyJson.fontWeight as Record<string, TokenValue>, 'bold'),
  extrabold: pickNumber(typographyJson.fontWeight as Record<string, TokenValue>, 'extrabold'),
  black: pickNumber(typographyJson.fontWeight as Record<string, TokenValue>, 'black'),
} as const;

export const radius = {
  sm: pickNumber(radiusJson.radius as Record<string, TokenValue>, 'sm'),
  md: pickNumber(radiusJson.radius as Record<string, TokenValue>, 'md'),
  lg: pickNumber(radiusJson.radius as Record<string, TokenValue>, 'lg'),
  xl: pickNumber(radiusJson.radius as Record<string, TokenValue>, 'xl'),
  pill: pickNumber(radiusJson.radius as Record<string, TokenValue>, 'pill'),
} as const;

export const lineWidth = {
  thin: pickNumber(radiusJson.borderWidth as Record<string, TokenValue>, 'thin'),
  medium: pickNumber(radiusJson.borderWidth as Record<string, TokenValue>, 'medium'),
  thick: pickNumber(radiusJson.borderWidth as Record<string, TokenValue>, 'thick'),
} as const;

const heights = overridesJson.componentHeights as Record<string, number>;

export const componentHeights = {
  ctaFull: heights['cta-full'],
  ctaCompact: heights['cta-compact'],
  ctaMedium: heights['cta-medium'],
  actionBar: heights['action-bar'],
  clearBar: heights['clear-bar'],
  pillLink: heights['pill-link'],
} as const;

export const interaction = {
  pressedOpacity: 0.88,
  pressedScale: 0.98,
  chipPressedOpacity: 0.9,
  chipPressedScale: 0.97,
} as const;
