import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../constants/theme';

export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>{children}</SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
    padding: spacing.md,
  },
});
