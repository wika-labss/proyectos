import React from 'react';
import { StyleSheet, View } from 'react-native';
import { bit } from '../constants/theme';
import { PixelButton } from './pixel/PixelButton';
import { PixelText } from './pixel/PixelText';

type Props = {
  tone?: 'retro' | 'future';
  title: string;
  subtitle?: string;
  score?: number;
  highScore?: number;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

export function ResultOverlay({
  title,
  subtitle,
  score,
  highScore,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: Props) {
  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <PixelText size="md" color={bit.gold} style={styles.center}>
          {title}
        </PixelText>
        {subtitle ? (
          <PixelText size="xs" color={bit.muted} style={styles.center}>
            {subtitle}
          </PixelText>
        ) : null}
        {score != null ? (
          <>
            <PixelText size="xs" color={bit.muted}>
              PUNTAJE
            </PixelText>
            <PixelText size="lg" color={bit.gold}>
              {score}
            </PixelText>
          </>
        ) : null}
        {highScore != null ? (
          <>
            <PixelText size="xs" color={bit.muted}>
              HI-SCORE
            </PixelText>
            <PixelText size="md" color={bit.cyan}>
              {highScore}
            </PixelText>
          </>
        ) : null}
        <View style={styles.actions}>
          <PixelButton label={primaryLabel} onPress={onPrimary} />
          {secondaryLabel && onSecondary ? (
            <PixelButton label={secondaryLabel} variant="ghost" onPress={onSecondary} />
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: bit.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    paddingHorizontal: 16,
  },
  panel: {
    width: '100%',
    borderWidth: 4,
    borderColor: bit.gold,
    backgroundColor: bit.panel,
    padding: 16,
    alignItems: 'center',
    gap: 10,
  },
  center: {
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
});
