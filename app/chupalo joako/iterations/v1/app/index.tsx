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
import { colors } from '../src/constants/theme';
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
      <View style={styles.glowCyan} />
      <View style={styles.glowMagenta} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <Text style={styles.brand}>Chupalo joako</Text>
          <Text style={styles.tagline}>Tetris. Colores. Puntos. Velocidad.</Text>
        </View>

        <View style={styles.scoreBlock}>
          <Text style={styles.scoreLabel}>Máximo puntaje</Text>
          {highScoreLoaded ? (
            <Text style={styles.scoreValue}>{highScore}</Text>
          ) : (
            <ActivityIndicator color={colors.accent} />
          )}
          <Text style={styles.hint}>Cada 500 pts el juego se acelera</Text>
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
    backgroundColor: colors.void,
  },
  glowCyan: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#00F0FF22',
  },
  glowMagenta: {
    position: 'absolute',
    bottom: 80,
    left: -50,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#FF2BD618',
  },
  safe: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 36,
  },
  hero: {
    marginTop: 48,
    gap: 10,
  },
  brand: {
    color: colors.accent,
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    color: colors.neonText,
    fontSize: 18,
    fontWeight: '600',
  },
  scoreBlock: {
    alignItems: 'center',
    gap: 6,
  },
  scoreLabel: {
    color: colors.muted,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  scoreValue: {
    color: '#FF2BD6',
    fontSize: 52,
    fontWeight: '800',
  },
  hint: {
    color: colors.muted,
    fontSize: 13,
  },
  actions: {
    gap: 12,
  },
  cta: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: {
    color: colors.void,
    fontSize: 20,
    fontWeight: '800',
  },
  secondary: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.muted,
  },
  secondaryText: {
    color: colors.hud,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});
