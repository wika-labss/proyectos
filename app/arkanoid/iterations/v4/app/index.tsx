import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { menu } from '../src/constants/theme';
import { pack } from '../src/design-system/pack';
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
    <ImageBackground source={pack.boss} style={styles.root} resizeMode="cover">
      <View style={styles.scrim} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>WIKA ARCADE</Text>
          <Text style={styles.brand}>Arkanoid</Text>
          <Text style={styles.tagline}>
            Pack gráfico V4. Cada nivel tiene un jefe. Rompe el muro y derríbalo.
          </Text>
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: menu.void,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#050B18CC',
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
    borderRadius: menu.radius,
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
    borderRadius: menu.radius,
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
