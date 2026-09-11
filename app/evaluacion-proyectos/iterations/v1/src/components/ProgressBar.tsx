import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '../constants/theme';

type ProgressBarProps = {
  progress: Animated.AnimatedInterpolation<string | number> | Animated.AnimatedValue;
};

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <View style={styles.track} accessibilityRole="progressbar">
      <Animated.View style={[styles.fill, { width: progress }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 2,
    width: '72%',
    maxWidth: 280,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: 2,
    backgroundColor: colors.accent,
  },
});
