import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { colors } from '../../design-system';
import { VisualAssets } from './assets';

export function NightScreen({ children }: { children: React.ReactNode }) {
  return (
    <ImageBackground
      source={VisualAssets.bgNight}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.scrim}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%' },
  scrim: {
    flex: 1,
    backgroundColor: colors.scrim,
  },
});
