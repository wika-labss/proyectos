import { useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Board } from '../src/components/Board';
import { DPad } from '../src/components/DPad';
import { Hud } from '../src/components/Hud';
import { colors } from '../src/constants/theme';
import { useGame } from '../src/hooks/GameProvider';

export default function GameScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const {
    status,
    engine,
    lives,
    score,
    queueDirection,
    pause,
    resume,
    startGame,
  } = useGame();

  useEffect(() => {
    if (!engine && status === 'idle') {
      startGame();
    }
  }, [engine, status, startGame]);

  useEffect(() => {
    if (status === 'gameOver') {
      router.replace('/game-over');
    }
  }, [status, router]);

  const cellSize = useMemo(() => {
    if (!engine) return 16;
    const maxW = Math.min(width - 32, 360);
    return Math.floor(maxW / engine.width) - 1;
  }, [engine, width]);

  const statusLabel =
    status === 'lifeLost'
      ? 'Vida perdida'
      : status === 'paused'
        ? 'Pausa'
        : undefined;

  return (
    <SafeAreaView style={styles.safe}>
      <Hud lives={lives} score={score} statusLabel={statusLabel} />

      <View style={styles.boardWrap}>
        {engine ? <Board engine={engine} cellSize={cellSize} /> : null}
      </View>

      <View style={styles.controls}>
        {status === 'paused' ? (
          <Pressable onPress={resume} style={styles.secondary}>
            <Text style={styles.secondaryText}>Reanudar</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={pause}
            disabled={status !== 'playing'}
            style={[styles.secondary, status !== 'playing' && styles.dim]}
          >
            <Text style={styles.secondaryText}>Pausa</Text>
          </Pressable>
        )}
        <DPad
          disabled={status !== 'playing'}
          onDirection={queueDirection}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.arena,
  },
  boardWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  controls: {
    paddingBottom: 16,
    gap: 10,
    alignItems: 'center',
  },
  secondary: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  secondaryText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  dim: {
    opacity: 0.4,
  },
});
