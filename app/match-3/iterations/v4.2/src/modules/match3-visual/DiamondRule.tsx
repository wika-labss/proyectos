import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../design-system';

/** Divisor cian con diamante central (hero-home / hero-suitors). */
export function DiamondRule() {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <View style={styles.diamond} />
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 8,
    marginVertical: 8,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: colors.cyan,
  },
  diamond: {
    width: 8,
    height: 8,
    backgroundColor: colors.cyan,
    transform: [{ rotate: '45deg' }],
  },
});
