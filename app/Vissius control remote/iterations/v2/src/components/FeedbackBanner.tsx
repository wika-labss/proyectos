import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { FeedbackTone } from '../types';
import { colors } from '../constants/theme';

interface FeedbackBannerProps {
  message: string;
  tone: FeedbackTone;
}

function toneColor(tone: FeedbackTone): string {
  switch (tone) {
    case 'success':
      return colors.feedbackSuccess;
    case 'warning':
      return colors.feedbackWarning;
    case 'error':
      return colors.feedbackError;
    default:
      return colors.backgroundStrong;
  }
}

export function FeedbackBanner({ message, tone }: FeedbackBannerProps) {
  return (
    <View style={[styles.banner, { backgroundColor: toneColor(tone) }]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  text: {
    color: colors.textOnStrong,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
