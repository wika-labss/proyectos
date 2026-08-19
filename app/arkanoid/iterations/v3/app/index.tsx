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
      <View style={styles.nebulaTop} />
      <View style={styles.nebulaBottom} />
      <View style={styles.scanlines} pointerEvents="none">
        {Array.from({ length: 18 }, (_, i) => (
          <View key={i} style={styles.scan} />
        ))}
      </View>
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>WIKA ARCADE</Text>
          <Text style={styles.brand}>Arkanoid</Text>
          <Text style={styles.tagline}>Cada nivel tiene un jefe. Rompe el muro y derríbalo.</Text>
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
  nebulaTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: menu.nebulaTop,
  },
  nebulaBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '58%',
    backgroundColor: menu.nebulaBottom,
  },
  scanlines: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-evenly',
    opacity: 0.08,
  },
  scan: {
    height: 1,
    backgroundColor: menu.neon,
  },
  safe: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  hero: {
    marginTop: 56,
    gap: 10,
  },
  kicker: {
    color: menu.magenta,
    fontSize: 12,
    letterSpacing: 4,
    fontWeight: '700',
  },
  brand: {
    color: menu.text,
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -1,
  },
  tagline: {
    color: menu.muted,
    fontSize: 17,
    fontWeight: '500',
    maxWidth: 280,
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
    color: menu.neon,
    fontSize: 48,
    fontWeight: '800',
  },
  actions: {
    gap: 12,
  },
  cta: {
    backgroundColor: menu.neon,
    borderRadius: 4,
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
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: menu.magenta,
    borderRadius: 4,
  },
  secondaryText: {
    color: menu.text,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});
