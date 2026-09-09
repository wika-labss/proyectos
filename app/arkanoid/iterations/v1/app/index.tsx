import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { menu } from '../src/constants/theme';
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
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <Text style={styles.brand}>Arkanoid</Text>
          <Text style={styles.tagline}>Rompe el muro. Sobrevive al rebote.</Text>
        </View>

        <View style={styles.scoreBlock}>
          <Text style={styles.scoreLabel}>High score</Text>
          {highScoreLoaded ? (
            <Text style={styles.scoreValue}>{highScore}</Text>
          ) : (
            <ActivityIndicator color={menu.neon} />
          )}
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={onPlay}
            style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          >
            <Text style={styles.ctaText}>Jugar</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/how-to')}
            style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryText}>Cómo jugar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: menu.void,
  },
  glowTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: menu.nebula,
    opacity: 0.85,
  },
  glowBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    backgroundColor: menu.nebulaDeep,
    opacity: 0.95,
  },
  safe: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 36,
  },
  hero: {
    marginTop: 56,
    gap: 10,
  },
  brand: {
    color: menu.text,
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: 1,
    textShadowColor: menu.neon,
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 0 },
  },
  tagline: {
    color: menu.muted,
    fontSize: 16,
    fontWeight: '500',
  },
  scoreBlock: {
    alignItems: 'center',
    gap: 6,
  },
  scoreLabel: {
    color: menu.muted,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  scoreValue: {
    color: menu.magenta,
    fontSize: 44,
    fontWeight: '800',
  },
  actions: {
    gap: 12,
  },
  cta: {
    backgroundColor: menu.neon,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: {
    color: menu.void,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  secondary: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: menu.neon,
  },
  secondaryText: {
    color: menu.neon,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});
