import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { PauseOverlay } from '../src/components/PauseOverlay';
import { PixelText } from '../src/components/pixel/PixelText';
import { Playfield } from '../src/components/Playfield';
import { ResultOverlay } from '../src/components/ResultOverlay';
import { WORLD_HEIGHT, WORLD_WIDTH } from '../src/constants/game';
import { bit, chrome } from '../src/design-system/tokens';
import { powerLabel } from '../src/engine/capsules';
import { useAvatar } from '../src/hooks/AvatarProvider';
import { useGame } from '../src/hooks/GameProvider';
import { usePaddleLerp } from '../src/hooks/usePaddleLerp';
import { HudChip, PaddleSlider, VaporwaveBackdrop } from '../src/modules/arkanoid-ui-kit';

export default function GameScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { avatarId } = useAvatar();
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
    const maxH = Math.max(220, height - 260);
    return Math.min(maxW / WORLD_WIDTH, maxH / WORLD_HEIGHT);
  }, [width, height]);

  const worldRef = useRef(world);
  worldRef.current = world;

  const getCenter = React.useCallback(() => {
    const current = worldRef.current;
    if (!current) return null;
    return current.paddle.x + current.paddle.w / 2;
  }, []);

  const playing = status === 'playing';
  const setTarget = usePaddleLerp(movePaddle, getCenter, playing);
  const [thumbX, setThumbX] = useState(WORLD_WIDTH / 2);

  useEffect(() => {
    if (!world) return;
    const center = world.paddle.x + world.paddle.w / 2;
    setThumbX(center);
    setTarget(center);
  }, [world?.levelIndex, Boolean(world), setTarget]);

  const onSlider = (x: number) => {
    setThumbX(x);
    setTarget(x);
  };

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

  const fieldW = world ? world.width * scale : 0;

  return (
    <VaporwaveBackdrop>
      <View style={styles.safe}>
        <HudChip
          avatarId={avatarId}
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
            <View style={{ width: fieldW }}>
              <Pressable
                accessibilityRole="button"
                disabled={!playing}
                onPress={launch}
              >
                <Playfield world={world} scale={scale} />
              </Pressable>
              <PaddleSlider
                enabled={playing}
                worldWidth={world.width}
                trackWidth={fieldW}
                value={thumbX}
                onChange={onSlider}
              />
            </View>
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
              disabled={!playing}
              style={[styles.pauseBtn, !playing && styles.dim]}
            >
              <PixelText size="xs" color={bit.cyan}>
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
      </View>
    </VaporwaveBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 28,
  },
  boardWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    paddingBottom: 12,
    alignItems: 'center',
    minHeight: chrome.hit,
  },
  pauseBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: chrome.hit,
    justifyContent: 'center',
    borderWidth: chrome.outline,
    borderColor: bit.cyan,
    backgroundColor: bit.panel,
  },
  dim: {
    opacity: 0.4,
  },
});
