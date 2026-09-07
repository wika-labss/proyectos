import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { bit } from '../src/constants/theme';
import { useGame } from '../src/hooks/GameProvider';

export default function MenuScreen() {
  const router = useRouter();
  const { highScore, highScoreLoaded, refreshHighScore, startGame } = useGame();

  useEffect(() => {
    void refreshHighScore();
  }, [refreshHighScore]);

  const onPlay = () => {
    startGame();
    router.push('/game');
  };

  return (
    <View style={styles.root}>
      <View style={styles.safe}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>WIKA 8-BIT</Text>
          <Text style={styles.brand}>ARKANOID</Text>
          <Text style={styles.tagline}>ROMPE EL MURO</Text>
        </View>

        <View style={styles.scoreBlock}>
          <Text style={styles.scoreLabel}>HI-SCORE</Text>
          {highScoreLoaded ? (
            <Text style={styles.scoreValue}>{highScore}</Text>
          ) : (
            <ActivityIndicator color={bit.gold} />
          )}
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={onPlay}
            style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          >
            <Text style={styles.ctaText}>JUGAR</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/how-to')}
            style={({ pressed }) => [styles.ghost, pressed && styles.pressed]}
          >
            <Text style={styles.ghostText}>COMO JUGAR</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: bit.night,
  },
  safe: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingTop: 36,
    paddingBottom: 36,
  },
  hero: {
    marginTop: 48,
    gap: 12,
    alignItems: 'center',
  },
  kicker: {
    color: bit.pink,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
  },
  brand: {
    color: bit.gold,
    fontSize: 36,
    fontWeight: '800',
  },
  tagline: {
    color: bit.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  scoreBlock: {
    alignItems: 'center',
    gap: 8,
  },
  scoreLabel: {
    color: bit.muted,
    fontSize: 12,
    letterSpacing: 2,
  },
  scoreValue: {
    color: bit.gold,
    fontSize: 28,
    fontWeight: '800',
  },
  actions: {
    gap: 12,
  },
  cta: {
    borderWidth: 3,
    borderColor: bit.gold,
    backgroundColor: bit.gold,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: {
    color: bit.night,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  ghost: {
    borderWidth: 3,
    borderColor: bit.gold,
    backgroundColor: bit.panel,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ghostText: {
    color: bit.gold,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
