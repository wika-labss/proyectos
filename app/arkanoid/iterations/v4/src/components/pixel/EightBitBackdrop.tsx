import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { CASTLE_PLAYFIELD_BG } from '../../constants/inspiration';
import { bit } from '../../constants/theme';

type Props = {
  children: React.ReactNode;
};

export function EightBitBackdrop({ children }: Props) {
  return (
    <ImageBackground source={CASTLE_PLAYFIELD_BG} resizeMode="cover" style={styles.root}>
      <View pointerEvents="none" style={styles.dim} />
      <View pointerEvents="none" style={styles.scanlines}>
        {Array.from({ length: 22 }, (_, i) => (
          <View key={i} style={styles.scan} />
        ))}
      </View>
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: bit.night,
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 4, 20, 0.35)',
  },
  scanlines: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-evenly',
  },
  scan: {
    height: 2,
    backgroundColor: '#00000055',
  },
});
