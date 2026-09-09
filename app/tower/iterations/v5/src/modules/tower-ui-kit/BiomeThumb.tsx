import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  biomeAccents,
  colors,
  radius,
  type BiomeId,
} from '../../design-system/tokens';

type Props = {
  biome: BiomeId;
};

/** Painted-ish biome thumb — 5 families, not 25 unique maps. */
export function BiomeThumb({ biome }: Props) {
  const accent = biomeAccents[biome];
  return (
    <View style={[styles.root, { backgroundColor: colors.keepVoid }]}>
      <View style={[styles.sky, skyFor(biome)]} />
      <View style={[styles.ground, { backgroundColor: accent, opacity: 0.55 }]} />
      {biome === 'forest' && (
        <>
          <View style={[styles.tree, { left: 10, height: 28 }]} />
          <View style={[styles.tree, { left: 28, height: 36, width: 14 }]} />
          <View style={[styles.path]} />
        </>
      )}
      {biome === 'keep' && (
        <>
          <View style={styles.keepBody} />
          <View style={styles.keepGate} />
        </>
      )}
      {biome === 'desert' && (
        <>
          <View style={[styles.dune, { left: 6, width: 36, height: 18 }]} />
          <View style={[styles.dune, { left: 28, width: 32, height: 14, bottom: 8 }]} />
        </>
      )}
      {biome === 'frost' && (
        <>
          <View style={[styles.peak, { left: 8 }]} />
          <View style={[styles.peak, { left: 26, borderBottomWidth: 32 }]} />
        </>
      )}
      {biome === 'void' && (
        <>
          <View style={styles.crypt} />
          <View style={styles.cryptGlow} />
        </>
      )}
    </View>
  );
}

function skyFor(biome: BiomeId) {
  switch (biome) {
    case 'forest':
      return { backgroundColor: colors.archerGreen, opacity: 0.22 };
    case 'keep':
      return { backgroundColor: colors.ember, opacity: 0.18 };
    case 'desert':
      return { backgroundColor: colors.pathOchre, opacity: 0.28 };
    case 'frost':
      return { backgroundColor: colors.frost, opacity: 0.22 };
    default:
      return { backgroundColor: colors.sniperViolet, opacity: 0.22 };
  }
}

const styles = StyleSheet.create({
  root: {
    width: 88,
    height: 64,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  sky: { ...StyleSheet.absoluteFillObject },
  ground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 22,
  },
  tree: {
    position: 'absolute',
    bottom: 10,
    width: 12,
    backgroundColor: colors.archerGreen,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  path: {
    position: 'absolute',
    bottom: 4,
    left: 18,
    width: 52,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.pathOchre,
    opacity: 0.9,
  },
  keepBody: {
    position: 'absolute',
    bottom: 10,
    left: 22,
    width: 44,
    height: 36,
    backgroundColor: colors.stone,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  keepGate: {
    position: 'absolute',
    bottom: 10,
    left: 38,
    width: 12,
    height: 16,
    backgroundColor: colors.ember,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  dune: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: colors.pathOchre,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  peak: {
    position: 'absolute',
    bottom: 12,
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderBottomWidth: 28,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.frost,
  },
  crypt: {
    position: 'absolute',
    bottom: 8,
    left: 20,
    width: 48,
    height: 28,
    backgroundColor: colors.stone,
    borderRadius: 4,
  },
  cryptGlow: {
    position: 'absolute',
    bottom: 16,
    left: 36,
    width: 16,
    height: 12,
    backgroundColor: colors.sniperViolet,
    opacity: 0.8,
    borderRadius: 2,
  },
});
