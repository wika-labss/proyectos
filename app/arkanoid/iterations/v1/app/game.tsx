import { useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Hud } from '../src/components/Hud';
import { Playfield } from '../src/components/Playfield';
import { WORLD_WIDTH } from '../src/constants/game';
import { retro } from '../src/constants/theme';
import { useGame } from '../src/hooks/GameProvider';

export default function GameScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const {
    status,
    world,
    lives,
    score,
    levelIndex,
    setPaddleCenter,
    launch,
    pause,
    resume,
    startGame,
  } = useGame();

  useEffect(() => {
    if (!world && status === 'menu') {
      startGame();
    }
  }, [world, status, startGame]);

  useEffect(() => {
    if (status === 'gameOver') router.replace('/game-over');
    if (status === 'victory') router.replace('/victory');
    if (status === 'levelClear') router.replace('/level-clear');
  }, [status, router]);

  const scale = useMemo(() => {
    const maxW = Math.min(width - 24, 400);
    return maxW / WORLD_WIDTH;
  }, [width]);

  const fieldOffsetX = useMemo(() => {
    const fieldW = WORLD_WIDTH * scale;
    return (width - fieldW) / 2;
  }, [width, scale]);

  const onTouch = (e: GestureResponderEvent) => {
    if (status !== 'playing' && status !== 'ballLost') return;
    const pageX = e.nativeEvent.pageX;
    const logicalX = (pageX - fieldOffsetX) / scale;
    setPaddleCenter(logicalX);
  };

  const statusLabel =
    status === 'ballLost'
      ? 'Vida perdida'
      : status === 'paused'
        ? 'Pausa'
        : world && !world.ball.launched && status === 'playing'
          ? 'Toca para lanzar'
          : undefined;

  return (
    <SafeAreaView style={styles.safe}>
      <Hud
        lives={lives}
        score={score}
        level={levelIndex}
        statusLabel={statusLabel}
      />

      <View
        style={styles.boardWrap}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={onTouch}
        onResponderMove={onTouch}
        onResponderRelease={() => {
          if (status === 'playing') launch();
        }}
      >
        {world ? <Playfield world={world} scale={scale} /> : null}
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: retro.crt,
  },
  boardWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  controls: {
    paddingBottom: 16,
    alignItems: 'center',
  },
  secondary: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  secondaryText: {
    color: retro.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  dim: {
    opacity: 0.4,
  },
});
