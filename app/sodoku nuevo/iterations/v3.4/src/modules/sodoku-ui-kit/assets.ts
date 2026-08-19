/** sodoku-ui-kit — mapa de assets desde recursos/recursos sodoku/assets-generados
 * Nota Metro: NO usar `@2x`/`@3x` en el nombre literal del archivo en require();
 * Metro lo interpreta como escala de densidad y busca el base sin sufijo.
 */

import { componentHeights } from '../../design-system';

export const UiAssets = {
  ctaFull: require('../../../assets/recursos/ui/btn_sodoku_cta_full.png'),
  ctaCompact: require('../../../assets/recursos/ui/btn_sodoku_cta_compact.png'),
  ctaMedium: require('../../../assets/recursos/ui/btn_sodoku_cta_medium.png'),
  actionBar: require('../../../assets/recursos/ui/btn_sodoku_action_bar.png'),
  actionBarSecondary: require('../../../assets/recursos/ui/btn_sodoku_action_bar_secondary.png'),
  clearBar: require('../../../assets/recursos/ui/btn_sodoku_clear_bar.png'),
  pillLink: require('../../../assets/recursos/ui/btn_sodoku_pill_link.png'),
  chipPuntaje: require('../../../assets/recursos/ui/chip_sodoku_info_puntaje.png'),
  chipHistorico: require('../../../assets/recursos/ui/chip_sodoku_info_historico.png'),
  chipRegalos: require('../../../assets/recursos/ui/chip_sodoku_info_regalos.png'),
  keyDigit: require('../../../assets/recursos/ui/key_sodoku_digit.png'),
  tileUnlocked: require('../../../assets/recursos/ui/tile_sodoku_level_unlocked.png'),
  tileDone: require('../../../assets/recursos/ui/tile_sodoku_level_done.png'),
  tileLocked: require('../../../assets/recursos/ui/tile_sodoku_level_locked.png'),
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
  ctaFull: componentHeights.ctaFull,
  ctaCompact: componentHeights.ctaCompact,
  ctaMedium: componentHeights.ctaMedium,
  actionBar: componentHeights.actionBar,
  actionBarSecondary: componentHeights.actionBar,
  clearBar: componentHeights.clearBar,
  pillLink: componentHeights.pillLink,
};
