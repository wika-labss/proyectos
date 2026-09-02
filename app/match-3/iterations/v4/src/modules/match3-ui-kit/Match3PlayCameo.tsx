import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CAMEO_BEAT_MS } from '../../constants/game';
import { spacing } from '../../design-system';
import type { Suitor } from '../../data/suitors';
import { Match3DialogueBubble } from './Match3DialogueBubble';
import { Match3SuitorBust } from './Match3SuitorBust';

/** Cameo flotante: 3 beats en 7s, no resta ancho al tablero. */
export function Match3PlayCameo({
  suitor,
  beats,
  side,
}: {
  suitor: Suitor;
  beats: [string, string, string];
  side: 'left' | 'right';
}) {
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    setBeat(0);
    const t1 = setTimeout(() => setBeat(1), CAMEO_BEAT_MS);
    const t2 = setTimeout(() => setBeat(2), CAMEO_BEAT_MS * 2);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [suitor.id]);

  return (
    <View
      pointerEvents="none"
      style={[styles.wrap, side === 'left' ? styles.left : styles.right]}
    >
      <Match3SuitorBust
        countryId={suitor.countryId}
        slot={suitor.slot}
        size={48}
      />
      <View style={styles.bubble}>
        <Match3DialogueBubble speaker={suitor.name} text={beats[beat]!} compact />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: spacing.md,
    maxWidth: 220,
    alignItems: 'center',
    gap: spacing.xs,
  },
  left: {
    left: spacing.sm,
  },
  right: {
    right: spacing.sm,
  },
  bubble: {
    width: 200,
  },
});
