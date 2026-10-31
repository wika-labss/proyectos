import type { AmbientThemeId } from './themes';

const THEME_ASSETS: Record<AmbientThemeId, number> = {
  castle: require('../../../assets/recursos/audio/ambient-castle.mp3') as number,
};

export function resolveAmbientAsset(_id?: string | null): number {
  return THEME_ASSETS.castle;
}
