import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { colors } from '../../design-system/tokens';
import { defeatBg, keepBg, victoryBg } from './assets';

type Variant = 'menu' | 'victory' | 'defeat' | 'void';

const SOURCE: Record<Exclude<Variant, 'void'>, number> = {
  menu: keepBg,
  victory: victoryBg,
  defeat: defeatBg,
};

type Props = {
  variant?: Variant;
  children: React.ReactNode;
};

/** Dual layer: painted keep + bottom-weighted scrim so labels stay native. */
export function KeepBackdrop({ variant = 'menu', children }: Props) {
  if (variant === 'void') {
    return <View style={styles.void}>{children}</View>;
  }
  return (
    <ImageBackground source={SOURCE[variant]} style={styles.root} resizeMode="cover">
      <View pointerEvents="none" style={styles.wash} />
      <View pointerEvents="none" style={styles.bottomFade} />
      <View style={styles.content}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.keepVoid },
  void: { flex: 1, backgroundColor: colors.keepVoid },
  wash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.scrim,
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '42%',
    backgroundColor: colors.overlay,
  },
  content: { flex: 1 },
});
