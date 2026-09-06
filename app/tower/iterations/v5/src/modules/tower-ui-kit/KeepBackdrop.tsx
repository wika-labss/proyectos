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

export function KeepBackdrop({ variant = 'menu', children }: Props) {
  if (variant === 'void') {
    return <View style={styles.void}>{children}</View>;
  }
  return (
    <ImageBackground source={SOURCE[variant]} style={styles.root} resizeMode="cover">
      <View style={styles.scrim}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.keepVoid },
  void: { flex: 1, backgroundColor: colors.keepVoid },
  scrim: { flex: 1, backgroundColor: colors.scrim },
});
