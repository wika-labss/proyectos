import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { menu, play } from '../constants/theme';

type Props = {
  tone: 'retro' | 'future';
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
  tone,
  title,
  subtitle,
  score,
  highScore,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: Props) {
  const future = tone === 'future';
  return (
    <View style={[styles.overlay, future && styles.overlayFuture]}>
      <Text style={[styles.title, future && styles.titleFuture]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.sub, future && styles.subFuture]}>{subtitle}</Text>
      ) : null}
      {score != null ? (
        <>
          <Text style={[styles.label, future && styles.labelFuture]}>Puntaje</Text>
          <Text style={[styles.score, future && styles.scoreFuture]}>{score}</Text>
        </>
      ) : null}
      {highScore != null ? (
        <>
          <Text style={[styles.label, future && styles.labelFuture]}>Máximo</Text>
          <Text style={[styles.high, future && styles.highFuture]}>{highScore}</Text>
        </>
      ) : null}
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.cta,
          future && styles.ctaFuture,
          pressed && styles.pressed,
        ]}
        onPress={onPrimary}
      >
        <Text style={[styles.ctaText, future && styles.ctaTextFuture]}>
          {primaryLabel}
        </Text>
      </Pressable>
      {secondaryLabel && onSecondary ? (
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
          onPress={onSecondary}
        >
          <Text style={[styles.secondaryText, future && styles.subFuture]}>
            {secondaryLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: play.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    zIndex: 20,
    paddingHorizontal: 24,
  },
  overlayFuture: {
    backgroundColor: '#050B18EE',
  },
  title: {
    color: play.hud,
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  titleFuture: {
    color: menu.neon,
  },
  sub: {
    color: play.muted,
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  subFuture: {
    color: menu.muted,
  },
  label: {
    color: play.muted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  labelFuture: {
    color: menu.muted,
  },
  score: {
    color: play.hud,
    fontSize: 44,
    fontWeight: '800',
    marginBottom: 8,
  },
  scoreFuture: {
    color: menu.text,
  },
  high: {
    color: play.paddle,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  highFuture: {
    color: menu.magenta,
  },
  cta: {
    backgroundColor: play.paddle,
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 220,
    alignItems: 'center',
    marginTop: 8,
  },
  ctaFuture: {
    backgroundColor: menu.neon,
  },
  ctaText: {
    color: play.crt,
    fontWeight: '800',
    fontSize: 16,
  },
  ctaTextFuture: {
    color: menu.void,
  },
  secondary: {
    paddingVertical: 12,
  },
  secondaryText: {
    color: play.muted,
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
