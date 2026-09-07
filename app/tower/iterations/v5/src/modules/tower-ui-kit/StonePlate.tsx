import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { borderWidth, colors, radius, spacing } from '../../design-system/tokens';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function StonePlate({ children, style }: Props) {
  return <View style={[styles.plate, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  plate: {
    backgroundColor: colors.stone,
    borderRadius: radius.md,
    borderWidth: borderWidth.thin,
    borderColor: colors.stoneHi,
    padding: spacing.md,
  },
});
