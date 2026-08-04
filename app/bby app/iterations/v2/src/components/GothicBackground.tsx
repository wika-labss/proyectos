import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../constants/theme';

export function GothicBackground() {
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.gradientCenter} />
      <View style={[styles.corner, styles.topLeft]} />
      <View style={[styles.corner, styles.topRight]} />
      <View style={[styles.corner, styles.bottomLeft]} />
      <View style={[styles.corner, styles.bottomRight]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
  gradientCenter: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    right: '10%',
    bottom: '20%',
    backgroundColor: colors.surface,
    opacity: 0.55,
    borderRadius: 24,
  },
  corner: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderColor: colors.border,
    opacity: 0.3,
  },
  topLeft: {
    top: 24,
    left: 24,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  topRight: {
    top: 24,
    right: 24,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  bottomLeft: {
    bottom: 24,
    left: 24,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  bottomRight: {
    bottom: 24,
    right: 24,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
});
