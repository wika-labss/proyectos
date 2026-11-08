import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors } from '../constants/theme';

interface RetroBezelProps extends ViewProps {
  compact?: boolean;
}

export function RetroBezel({ children, compact = false, style, ...rest }: RetroBezelProps) {
  return (
    <View style={[styles.outer, compact && styles.outerCompact, style]} {...rest}>
      <View style={[styles.inner, compact && styles.innerCompact]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderWidth: 3,
    borderColor: colors.bezelOuter,
    borderRadius: 12,
    padding: 4,
    backgroundColor: colors.border,
  },
  outerCompact: {
    borderRadius: 8,
    padding: 2,
  },
  inner: {
    backgroundColor: colors.bezelInner,
    borderRadius: 8,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCompact: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
});
