import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/theme';

interface SettingsRowProps {
  label: string;
  children: React.ReactNode;
}

export function SettingsRow({ label, children }: SettingsRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.control}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: 'monospace',
    flex: 1,
    paddingRight: 12,
  },
  control: {
    alignItems: 'flex-end',
  },
});
