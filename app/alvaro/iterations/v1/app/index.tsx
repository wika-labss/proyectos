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

export default function HomeScreen() {
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
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <Text style={styles.brand}>Alvaro</Text>
          <Text style={styles.tagline}>Snake — sobrevive y crece</Text>
        </View>

        <View style={styles.scoreBlock}>
          <Text style={styles.scoreLabel}>Máximo puntaje</Text>
          {highScoreLoaded ? (
            <Text style={styles.scoreValue}>{highScore}</Text>
          ) : (
            <ActivityIndicator color={colors.accent} />
          )}
          <Text style={styles.hint}>Puntos por tiempo vivo × 10</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onPlay}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        >
          <Text style={styles.ctaText}>Jugar</Text>
        </Pressable>

        <Text style={styles.rules}>
          3 vidas · crece al comer · sin 180°
        </Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.arena,
  },
  bgTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0B1F17',
  },
  bgBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
    backgroundColor: '#0F2A1F',
    opacity: 0.9,
  },
  safe: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 36,
  },
  hero: {
    marginTop: 48,
    gap: 8,
  },
  brand: {
    color: colors.head,
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: -1,
  },
  tagline: {
    color: colors.muted,
    fontSize: 18,
    fontWeight: '500',
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
    color: colors.accent,
    fontSize: 48,
    fontWeight: '800',
  },
  hint: {
    color: colors.muted,
    fontSize: 13,
  },
  cta: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaText: {
    color: colors.arena,
    fontSize: 20,
    fontWeight: '800',
  },
  rules: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 13,
  },
});
