import React from 'react';
import { ImageBackground, StyleSheet, type ViewStyle } from 'react-native';
import { spacing } from '../../design-system/tokens';
import { chromePlaqueHud } from './assets';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function StonePlate({ children, style }: Props) {
  return (
    <ImageBackground
      source={chromePlaqueHud}
      style={[styles.plate, style]}
      imageStyle={styles.img}
      resizeMode="stretch"
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  plate: {
    overflow: 'hidden',
    padding: spacing.md,
  },
  img: {},
});
