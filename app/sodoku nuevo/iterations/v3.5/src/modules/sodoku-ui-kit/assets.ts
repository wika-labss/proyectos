/** sodoku-ui-kit V3.5 — pack ui-v5 regenerado desde visual-expectation (99% fidelidad) */

import { componentHeights } from '../../design-system';

export const UiAssets = {
  ctaFull: require('../../../assets/recursos/ui-v5/btn_sodoku_cta_full.png'),
  ctaCompact: require('../../../assets/recursos/ui-v5/btn_sodoku_cta_compact.png'),
  ctaMedium: require('../../../assets/recursos/ui-v5/btn_sodoku_cta_medium.png'),
  actionBar: require('../../../assets/recursos/ui-v5/btn_sodoku_action_bar.png'),
  actionHint: require('../../../assets/recursos/ui-v5/btn_sodoku_action_hint.png'),
  actionBarSecondary: require('../../../assets/recursos/ui-v5/btn_sodoku_action_bar_secondary.png'),
  clearBar: require('../../../assets/recursos/ui-v5/btn_sodoku_clear_bar.png'),
  pillLink: require('../../../assets/recursos/ui-v5/btn_sodoku_pill_link.png'),
  chipPuntaje: require('../../../assets/recursos/ui-v5/chip_sodoku_info_puntaje.png'),
  chipHistorico: require('../../../assets/recursos/ui-v5/chip_sodoku_info_historico.png'),
  chipRegalos: require('../../../assets/recursos/ui-v5/chip_sodoku_info_regalos.png'),
  keyDigit: require('../../../assets/recursos/ui-v5/key_sodoku_digit.png'),
  tileUnlocked: require('../../../assets/recursos/ui-v5/tile_sodoku_level_unlocked.png'),
  tileDone: require('../../../assets/recursos/ui-v5/tile_sodoku_level_done.png'),
  tileLocked: require('../../../assets/recursos/ui-v5/tile_sodoku_level_locked.png'),
  bannerSodoku: require('../../../assets/recursos/ui-v5/banner_sodoku.png'),
} as const;

export type SodokuButtonVariant =
  | 'ctaFull'
  | 'ctaCompact'
  | 'ctaMedium'
  | 'actionBar'
  | 'actionHint'
  | 'actionBarSecondary'
  | 'clearBar'
  | 'pillLink';

export const variantHeight: Record<SodokuButtonVariant, number> = {
  ctaFull: componentHeights.ctaFull,
  ctaCompact: componentHeights.ctaCompact,
  ctaMedium: componentHeights.ctaMedium,
  actionBar: componentHeights.actionBar,
  actionHint: componentHeights.actionBar,
  actionBarSecondary: componentHeights.actionBar,
  clearBar: componentHeights.clearBar,
  pillLink: componentHeights.pillLink,
};
