/** sodoku-ui-kit — mapa de assets desde recursos/recursos sodoku/assets-generados */

export const UiAssets = {
  ctaFull: require('../../../assets/recursos/ui/btn_sodoku_cta_full@3x.png'),
  ctaCompact: require('../../../assets/recursos/ui/btn_sodoku_cta_compact@3x.png'),
  ctaMedium: require('../../../assets/recursos/ui/btn_sodoku_cta_medium@3x.png'),
  actionBar: require('../../../assets/recursos/ui/btn_sodoku_action_bar@3x.png'),
  actionBarSecondary: require('../../../assets/recursos/ui/btn_sodoku_action_bar_secondary@3x.png'),
  clearBar: require('../../../assets/recursos/ui/btn_sodoku_clear_bar@3x.png'),
  pillLink: require('../../../assets/recursos/ui/btn_sodoku_pill_link@3x.png'),
  chipPuntaje: require('../../../assets/recursos/ui/chip_sodoku_info_puntaje@3x.png'),
  chipHistorico: require('../../../assets/recursos/ui/chip_sodoku_info_historico@3x.png'),
  chipRegalos: require('../../../assets/recursos/ui/chip_sodoku_info_regalos@3x.png'),
  keyDigit: require('../../../assets/recursos/ui/key_sodoku_digit@3x.png'),
  tileUnlocked: require('../../../assets/recursos/ui/tile_sodoku_level_unlocked@3x.png'),
  tileDone: require('../../../assets/recursos/ui/tile_sodoku_level_done@3x.png'),
  tileLocked: require('../../../assets/recursos/ui/tile_sodoku_level_locked@3x.png'),
} as const;

export type SodokuButtonVariant =
  | 'ctaFull'
  | 'ctaCompact'
  | 'ctaMedium'
  | 'actionBar'
  | 'actionBarSecondary'
  | 'clearBar'
  | 'pillLink';

export const variantHeight: Record<SodokuButtonVariant, number> = {
  ctaFull: 72,
  ctaCompact: 56,
  ctaMedium: 48,
  actionBar: 48,
  actionBarSecondary: 48,
  clearBar: 44,
  pillLink: 40,
};
