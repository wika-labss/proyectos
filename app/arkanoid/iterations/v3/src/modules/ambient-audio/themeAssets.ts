import type { AmbientThemeId } from './themes';
import { resolveAmbientTheme } from './themes';

const THEME_ASSETS: Record<AmbientThemeId, number> = {
  nebula: require('../../../assets/recursos/audio/ambient-loop.mp3') as number,
  castle: require('../../../assets/recursos/audio/ambient-castle.mp3') as number,
};

export function resolveAmbientAsset(id: string | null | undefined): number {
  const theme = resolveAmbientTheme(id);
  return THEME_ASSETS[theme.id];
}
