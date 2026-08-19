import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { play } from '../src/constants/theme';
import { useGame } from '../src/hooks/GameProvider';

export default function LoseScreen() {
  const router = useRouter();
  const { score, highScore, startGame, goMenu } = useGame();

  const onRetry = () => {
    startGame();
    router.replace('/game');
  };

  const onMenu = () => {
    goMenu();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.kicker}>RUN FAILED</Text>
        <Text style={styles.title}>LOSER</Text>
        <Text style={styles.sub}>El muro te venció. El jefe sigue en pie.</Text>
        <Text style={styles.label}>Puntaje</Text>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.label}>Máximo</Text>
        <Text style={styles.high}>{highScore}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
        >
          <Text style={styles.primaryText}>Reintentar</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onMenu}
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryText}>Menú</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#14080E',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 36,
  },
  center: {
    marginTop: 72,
    alignItems: 'center',
    gap: 8,
  },
  kicker: {
    color: play.boss,
    letterSpacing: 4,
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    color: play.boss,
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: 2,
  },
  sub: {
    color: play.muted,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  label: {
    color: play.muted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  score: {
    color: play.hud,
    fontSize: 48,
    fontWeight: '800',
  },
  high: {
    color: play.paddle,
    fontSize: 28,
    fontWeight: '700',
  },
  actions: {
    gap: 12,
  },
  primary: {
    backgroundColor: play.boss,
    borderRadius: 4,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryText: {
    color: '#14080E',
    fontSize: 18,
    fontWeight: '800',
  },
  secondary: {
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: play.muted,
  },
  secondaryText: {
    color: play.hud,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});
