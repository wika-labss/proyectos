import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { typography } from '../constants/theme';
import { ThemeColors } from '../types';
import { formatTime } from '../hooks/useTimer';

interface TimerProps {
  seconds: number;
  colors: ThemeColors;
}

export function Timer({ seconds, colors }: TimerProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Tiempo</Text>
      <Text style={[styles.value, { color: colors.text }]}>{formatTime(seconds)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
  },
  value: {
    fontSize: typography.body,
    fontWeight: '700',
  },
});
