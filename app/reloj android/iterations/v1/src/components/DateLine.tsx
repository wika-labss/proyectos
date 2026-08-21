import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { FONT_FAMILY } from '../types';

interface DateLineProps {
  value: string;
  color: string;
}

export function DateLine({ value, color }: DateLineProps) {
  return <Text style={[styles.date, { color }]}>{value}</Text>;
}

const styles = StyleSheet.create({
  date: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    letterSpacing: 2,
    marginTop: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
});
