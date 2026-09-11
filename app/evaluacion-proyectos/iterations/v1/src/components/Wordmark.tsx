import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '../constants/theme';

type WordmarkProps = {
  size?: 'hero' | 'compact';
};

export function Wordmark({ size = 'hero' }: WordmarkProps) {
  return (
    <View style={styles.wrap} accessibilityRole="text">
      <Text style={[styles.mark, size === 'compact' && styles.compact]}>VISSIUSS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  mark: {
    color: colors.text,
    fontSize: fonts.wordmark,
    fontWeight: '300',
    letterSpacing: 10,
    textTransform: 'uppercase',
  },
  compact: {
    fontSize: 18,
    letterSpacing: 6,
  },
});
