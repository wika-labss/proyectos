import { useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Hud } from '../src/components/Hud';
import { PaddleControls } from '../src/components/PaddleControls';
import { PauseOverlay } from '../src/components/PauseOverlay';
import { EightBitBackdrop } from '../src/components/pixel/EightBitBackdrop';
import { PixelText } from '../src/components/pixel/PixelText';
import { Playfield } from '../src/components/Playfield';
import { ResultOverlay } from '../src/components/ResultOverlay';
import { WORLD_HEIGHT, WORLD_WIDTH } from '../src/constants/game';
import { bit } from '../src/constants/theme';
import { powerLabel } from '../src/engine/capsules';
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
    highScore,
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
      ? 'VIDA PERDIDA'
      : world && !world.ball.launched && status === 'playing'
        ? 'TOCA PARA LANZAR'
        : undefined;

  return (
    <EightBitBackdrop>
      <SafeAreaView style={styles.safe}>
        <Hud
          lives={lives}
          score={score}
          level={levelIndex + 1}
          statusLabel={statusLabel}
          powerLabel={
            world && status === 'playing'
              ? powerLabel(world.power, world.doorOpen, world.slow)
              : undefined
          }
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
            <PixelText size="xs" color={bit.muted}>
              PAUSA
            </PixelText>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={pause}
              disabled={status !== 'playing'}
              style={[styles.pauseBtn, status !== 'playing' && styles.dim]}
            >
              <PixelText size="xs" color={bit.gold}>
                PAUSA
              </PixelText>
            </Pressable>
          )}
        </View>

        {status === 'paused' ? <PauseOverlay onResume={resume} onMenu={onMenu} /> : null}

        {status === 'levelClear' ? (
          <ResultOverlay
            title={`NIVEL ${levelIndex + 1} CLEAR`}
            score={score}
            primaryLabel="CONTINUAR"
            onPrimary={continueLevel}
          />
        ) : null}

        {status === 'gameOver' ? (
          <ResultOverlay
            title="GAME OVER"
            score={score}
            highScore={highScore}
            primaryLabel="REINTENTAR"
            onPrimary={startGame}
            secondaryLabel="MENU"
            onSecondary={onMenu}
          />
        ) : null}

        {status === 'victory' ? (
          <ResultOverlay
            title="VICTORIA"
            subtitle="EL MURO CAYO"
            score={score}
            highScore={highScore}
            primaryLabel="REINTENTAR"
            onPrimary={startGame}
            secondaryLabel="MENU"
            onSecondary={onMenu}
          />
        ) : null}
      </SafeAreaView>
    </EightBitBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
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
    borderWidth: 3,
    borderColor: bit.gold,
    backgroundColor: bit.panel,
  },
  dim: {
    opacity: 0.4,
  },
});
