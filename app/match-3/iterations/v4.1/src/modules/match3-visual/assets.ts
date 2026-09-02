import type { ImageSourcePropType } from 'react-native';
import type { CountryId } from '../../data/countries';
import type { SuitorSlot } from '../../data/suitors';

export const VisualAssets = {
  bgNight: require('../../../assets/recursos/screens/bg-night.png') as ImageSourcePropType,
  mapAmericas: require('../../../assets/recursos/screens/map-americas.png') as ImageSourcePropType,
  gems: require('../../../assets/recursos/ui/gems.png') as ImageSourcePropType,
  gemFrames: [
    require('../../../assets/recursos/ui/gems/0.png') as ImageSourcePropType,
    require('../../../assets/recursos/ui/gems/1.png') as ImageSourcePropType,
    require('../../../assets/recursos/ui/gems/2.png') as ImageSourcePropType,
    require('../../../assets/recursos/ui/gems/3.png') as ImageSourcePropType,
    require('../../../assets/recursos/ui/gems/4.png') as ImageSourcePropType,
  ] as const,
  gifts: require('../../../assets/recursos/ui/gifts.png') as ImageSourcePropType,
  buttons: require('../../../assets/recursos/ui/btn-8bit-sheet.png') as ImageSourcePropType,
  cast: {
    mx: require('../../../assets/recursos/cast/mx.png') as ImageSourcePropType,
    co: require('../../../assets/recursos/cast/co.png') as ImageSourcePropType,
    pe: require('../../../assets/recursos/cast/pe.png') as ImageSourcePropType,
    br: require('../../../assets/recursos/cast/br.png') as ImageSourcePropType,
    ar: require('../../../assets/recursos/cast/ar.png') as ImageSourcePropType,
  },
} as const;

export const SLOT_CELL: Record<SuitorSlot, { col: number; row: number }> = {
  h1: { col: 0, row: 0 },
  h2: { col: 1, row: 0 },
  m1: { col: 0, row: 1 },
  m2: { col: 1, row: 1 },
};

export function castSheet(countryId: CountryId): ImageSourcePropType {
  return VisualAssets.cast[countryId];
}
