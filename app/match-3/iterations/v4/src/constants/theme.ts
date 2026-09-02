/**
 * Theme runtime — aliases sobre tokens night-cyan (0% hex fuera de design-system).
 */
import { colors as c } from '../design-system/tokens';

export {
  borderWidth,
  colors,
  fonts,
  layout,
  radius,
  spacing,
  typography,
} from '../design-system';

export const relationColors = {
  none: c.muted,
  amigos: c.amigos,
  ligue: c.ligue,
  pareja: c.pareja,
  matrimonio: c.matrimonio,
  amorio: c.amorio,
  infidelidad_culposa: c.infidelidad,
} as const;

export const slotColors = {
  h1: c.cobalt,
  h2: c.night,
  m1: c.coin,
  m2: c.panic,
} as const;

export const gemColors = [
  c.gemRed,
  c.gemBlue,
  c.gemGreen,
  c.gemYellow,
  c.gemPurple,
] as const;
