import React from 'react';
import { StyleSheet, View } from 'react-native';
import { layout, spacing } from '../../design-system';
import type { CountryId } from '../../data/countries';
import type { SuitorSlot } from '../../data/suitors';
import { Match3DialogueBubble } from './Match3DialogueBubble';
import { Match3SuitorBust } from './Match3SuitorBust';

/** Busto + burbuja al costado; no tapa el tablero. */
export function Match3PlayOverlay({
  countryId,
  slot,
  speaker,
  line,
}: {
  countryId: CountryId;
  slot: SuitorSlot;
  speaker: string;
  line: string;
}) {
  return (
    <View style={styles.wrap}>
      <Match3SuitorBust countryId={countryId} slot={slot} size={56} />
      <Match3DialogueBubble speaker={speaker} text={line} compact />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: layout.playOverlayWidth,
    gap: spacing.xs,
    alignItems: 'center',
  },
});
