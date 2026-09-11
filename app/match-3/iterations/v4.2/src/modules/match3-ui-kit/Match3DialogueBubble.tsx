import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, typography } from '../../design-system';
import { PixelPanel } from '../match3-visual/PixelPanel';

/** Chrome 8-bit vacío + copy en RN (español). */
export function Match3DialogueBubble({
  speaker,
  text,
  compact,
}: {
  speaker?: string;
  text: string;
  compact?: boolean;
}) {
  return (
    <PixelPanel style={compact ? styles.compact : undefined}>
      <View style={styles.body}>
        {speaker ? (
          <Text style={styles.speaker} numberOfLines={1}>
            {speaker.toUpperCase()}
          </Text>
        ) : null}
        <Text style={[styles.text, compact && styles.textCompact]}>{text}</Text>
      </View>
    </PixelPanel>
  );
}

const styles = StyleSheet.create({
  compact: {
    width: '100%',
  },
  body: {
    gap: 4,
  },
  speaker: {
    fontFamily: fonts.pixel,
    fontSize: 8,
    color: colors.cyanHi,
  },
  text: {
    fontFamily: fonts.pixel,
    fontSize: typography.sm,
    color: colors.star,
    lineHeight: 14,
  },
  textCompact: {
    fontSize: 7,
    lineHeight: 12,
  },
});
