import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { menu } from '../src/constants/theme';
import { useGame } from '../src/hooks/GameProvider';

export default function VictoryScreen() {
  const router = useRouter();
  const { score, highScore, startGame } = useGame();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.title}>Victory</Text>
        <Text style={styles.sub}>Muro destruido</Text>
        <Text style={styles.label}>Puntaje</Text>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.label}>High score</Text>
        <Text style={styles.high}>{highScore}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            startGame();
            router.replace('/game');
          }}
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
        >
          <Text style={styles.primaryText}>Reintentar</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/')}
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
    backgroundColor: menu.void,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 36,
  },
  center: {
    marginTop: 80,
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: menu.neon,
    fontSize: 44,
    fontWeight: '800',
  },
  sub: {
    color: menu.muted,
    fontSize: 16,
    marginBottom: 20,
  },
  label: {
    color: menu.muted,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  score: {
    color: menu.magenta,
    fontSize: 48,
    fontWeight: '800',
    marginBottom: 16,
  },
  high: {
    color: menu.neon,
    fontSize: 32,
    fontWeight: '700',
  },
  actions: {
    gap: 12,
  },
  primary: {
    backgroundColor: menu.neon,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryText: {
    color: menu.void,
    fontSize: 18,
    fontWeight: '800',
  },
  secondary: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: menu.muted,
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
