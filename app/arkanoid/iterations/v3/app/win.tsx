import { useRouter } from 'expo-router';
import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { menu } from '../src/constants/theme';
import { useGame } from '../src/hooks/GameProvider';

export default function WinScreen() {
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
    <ImageBackground
      source={require('../assets/win.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.scrim} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.kicker}>BOSS DOWN</Text>
          <Text style={styles.title}>WIN</Text>
          <Text style={styles.sub}>El jefe cayó. El muro es tuyo.</Text>
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
            <Text style={styles.primaryText}>Jugar de nuevo</Text>
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: menu.void,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#050B18AA',
  },
  safe: {
    flex: 1,
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
    color: menu.magenta,
    letterSpacing: 4,
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    color: menu.neon,
    fontSize: 64,
    fontWeight: '800',
    letterSpacing: 6,
  },
  sub: {
    color: menu.muted,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  label: {
    color: menu.muted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  score: {
    color: menu.text,
    fontSize: 48,
    fontWeight: '800',
  },
  high: {
    color: menu.magenta,
    fontSize: 28,
    fontWeight: '700',
  },
  actions: {
    gap: 12,
  },
  primary: {
    backgroundColor: menu.neon,
    borderRadius: 4,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryText: {
    color: menu.void,
    fontSize: 18,
    fontWeight: '800',
  },
  secondary: {
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: menu.magenta,
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
