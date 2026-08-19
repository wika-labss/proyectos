import { useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Hud } from '../src/components/Hud';
import { PaddleControls } from '../src/components/PaddleControls';
import { PauseOverlay } from '../src/components/PauseOverlay';
import { Playfield } from '../src/components/Playfield';
import { ResultOverlay } from '../src/components/ResultOverlay';
import { WORLD_HEIGHT, WORLD_WIDTH } from '../src/constants/game';
import { play } from '../src/constants/theme';
import { useGame } from '../src/hooks/GameProvider';

export default function GameScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const {
    status,
    world,
    lives,
    score,
    levelIndex,
    startGame,
    movePaddle,
    launch,
    pause,
    resume,
    continueLevel,
    goMenu,
  } = useGame();

  useEffect(() => {
    if (!world && status === 'menu') {
      startGame();
    }
  }, [world, status, startGame]);

  useEffect(() => {
    if (status === 'gameOver') {
      router.replace('/lose');
    } else if (status === 'victory') {
      router.replace('/win');
    }
  }, [status, router]);

  const scale = useMemo(() => {
    const maxW = Math.min(width - 24, WORLD_WIDTH);
    const maxH = Math.max(220, height - 220);
    return Math.min(maxW / WORLD_WIDTH, maxH / WORLD_HEIGHT);
  }, [width, height]);

  const onMenu = () => {
    goMenu();
    router.replace('/');
  };

  const statusLabel =
    status === 'ballLost'
      ? 'Vida perdida'
      : !world?.ball.launched && status === 'playing'
        ? 'Toca para lanzar'
        : world?.boss && world.boss.hitsLeft > 0
          ? 'Derrota al jefe'
          : undefined;

  return (
    <SafeAreaView style={styles.safe}>
      <Hud
        lives={lives}
        score={score}
        level={levelIndex + 1}
        boss={world?.boss}
        statusLabel={statusLabel}
      />

      <View style={styles.boardWrap}>
        {world ? (
          <PaddleControls
            enabled={status === 'playing'}
            worldWidth={world.width}
            scale={scale}
            width={world.width * scale}
            height={world.height * scale}
            onMove={movePaddle}
            onLaunch={launch}
          >
            <Playfield world={world} scale={scale} />
          </PaddleControls>
        ) : null}
      </View>

      <View style={styles.controls}>
        {status === 'paused' ? (
          <Text style={styles.hint}>Juego en pausa</Text>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={pause}
            disabled={status !== 'playing'}
            style={[styles.pauseBtn, status !== 'playing' && styles.dim]}
          >
            <Text style={styles.pauseText}>Pausa</Text>
          </Pressable>
        )}
      </View>

      {status === 'paused' ? (
        <PauseOverlay onResume={resume} onMenu={onMenu} />
      ) : null}

      {status === 'levelClear' ? (
        <ResultOverlay
          tone="retro"
          title={levelIndex === 2 ? 'El jefe despierta' : `Nivel ${levelIndex + 1} completado`}
          score={score}
          primaryLabel={levelIndex === 2 ? 'Enfrentar jefe' : 'Continuar'}
          onPrimary={continueLevel}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: play.crt,
  },
  boardWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    paddingBottom: 12,
    alignItems: 'center',
    minHeight: 44,
  },
  pauseBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  pauseText: {
    color: play.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  hint: {
    color: play.muted,
    fontSize: 13,
  },
  dim: {
    opacity: 0.4,
  },
});
