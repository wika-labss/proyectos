import { useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controls } from '../src/components/Controls';
import { Hud } from '../src/components/Hud';
import { PauseOverlay } from '../src/components/PauseOverlay';
import { Playfield } from '../src/components/Playfield';
import { Preview } from '../src/components/Preview';
import { colors } from '../src/constants/theme';
import { useGame } from '../src/hooks/GameProvider';

export default function GameScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const {
    status,
    board,
    active,
    preview,
    score,
    level,
    gravityMs,
    move,
    rotate,
    setSoftDrop,
    hardDrop,
    pause,
    resume,
    startGame,
  } = useGame();

  useEffect(() => {
    if (!board && status === 'idle') {
      startGame();
    }
  }, [board, status, startGame]);

  useEffect(() => {
    if (status === 'gameOver') {
      router.replace('/game-over');
    }
  }, [status, router]);

  const cellSize = useMemo(() => {
    if (!board) return 14;
    const maxW = Math.min(width - 96, 280);
    const maxH = Math.max(180, height - 320);
    return Math.max(10, Math.min(Math.floor(maxW / board.cols), Math.floor(maxH / board.rows)));
  }, [board, width, height]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Hud
          score={score}
          level={level}
          gravityMs={gravityMs}
          statusLabel={status === 'paused' ? 'Pausa' : undefined}
        />
        <Pressable
          onPress={status === 'paused' ? resume : pause}
          disabled={status !== 'playing' && status !== 'paused'}
          style={styles.pauseBtn}
        >
          <Text style={styles.pauseText}>{status === 'paused' ? '▶' : 'Ⅱ'}</Text>
        </Pressable>
      </View>

      <View style={styles.play}>
        <View style={styles.side}>
          <Text style={styles.sideLabel}>Next</Text>
          <Preview type={preview} />
        </View>
        <View style={styles.boardWrap}>
          {board ? <Playfield board={board} active={active} cellSize={cellSize} /> : null}
        </View>
      </View>

      <Controls
        disabled={status !== 'playing'}
        onMove={move}
        onRotate={rotate}
        onSoftDrop={setSoftDrop}
        onHardDrop={hardDrop}
      />

      <PauseOverlay
        visible={status === 'paused'}
        onResume={resume}
        onMenu={() => router.replace('/')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.void,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pauseBtn: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  pauseText: {
    color: colors.muted,
    fontSize: 18,
    fontWeight: '700',
  },
  play: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  side: {
    width: 72,
    alignItems: 'center',
    gap: 6,
  },
  sideLabel: {
    color: colors.muted,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  boardWrap: {
    flex: 1,
    justifyContent: 'center',
  },
});
