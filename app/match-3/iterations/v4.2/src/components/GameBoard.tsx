import React, { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, View } from 'react-native';
import { COLS, ROWS } from '../constants/game';
import { colors, gemColors } from '../constants/theme';
import type { Board, Cell, HintMove } from '../engine/match3Engine';
import { VisualAssets } from '../modules/match3-visual/assets';
import { nativeDriver } from '../modules/match3-visual/nativeDriver';

type Props = {
  board: Board;
  selected: Cell | null;
  hint: HintMove | null;
  clearing: Cell[];
  cellSize: number;
  onSelect: (cell: Cell) => void;
};

function isHintCell(hint: HintMove | null, r: number, c: number): boolean {
  if (!hint) return false;
  return (
    (hint.a.r === r && hint.a.c === c) || (hint.b.r === r && hint.b.c === c)
  );
}

function isClearing(clearing: Cell[], r: number, c: number): boolean {
  return clearing.some((x) => x.r === r && x.c === c);
}

function GemCell({
  gem,
  r,
  c,
  cellSize,
  selected,
  hinted,
  popping,
  onSelect,
}: {
  gem: number;
  r: number;
  c: number;
  cellSize: number;
  selected: boolean;
  hinted: boolean;
  popping: boolean;
  onSelect: (cell: Cell) => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const inset = Math.max(1, Math.floor(cellSize * 0.06));
  const spriteSize = Math.max(8, cellSize - inset * 2);

  useEffect(() => {
    if (popping) {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.2,
          duration: 110,
          useNativeDriver: nativeDriver,
        }),
        Animated.timing(opacity, {
          toValue: 0.15,
          duration: 110,
          useNativeDriver: nativeDriver,
        }),
      ]).start();
      return;
    }
    scale.setValue(1);
    opacity.setValue(1);
  }, [popping, gem, opacity, scale]);

  const sprite = gem >= 0 && gem < 5;
  const frame = sprite ? VisualAssets.gemFrames[gem] : undefined;

  return (
    <Animated.View
      style={[
        styles.cell,
        {
          width: cellSize,
          height: cellSize,
          left: c * cellSize,
          top: r * cellSize,
          backgroundColor: sprite ? 'transparent' : (gemColors[gem] ?? colors.locked),
          borderColor: hinted
            ? colors.hint
            : selected
              ? colors.star
              : 'transparent',
          borderWidth: hinted || selected ? 2 : 0,
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      {frame ? (
        <Image
          source={frame}
          resizeMode="contain"
          resizeMethod="resize"
          style={{ width: spriteSize, height: spriteSize }}
        />
      ) : null}
      <Pressable
        onPress={() => onSelect({ r, c })}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

export function GameBoard({
  board,
  selected,
  hint,
  clearing,
  cellSize,
  onSelect,
}: Props) {
  const width = COLS * cellSize;
  const height = ROWS * cellSize;
  return (
    <View style={[styles.board, { width, height }]}>
      {board.map((row, r) =>
        row.map((gem, c) => {
          if ((gem as number) < 0) return null;
          const sel = selected?.r === r && selected?.c === c;
          const hinted = isHintCell(hint, r, c);
          const popping = isClearing(clearing, r, c);
          return (
            <GemCell
              key={`${r}-${c}`}
              gem={gem}
              r={r}
              c={c}
              cellSize={cellSize}
              selected={sel}
              hinted={hinted}
              popping={popping}
              onSelect={onSelect}
            />
          );
        }),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    position: 'relative',
    backgroundColor: colors.nightDeep,
    overflow: 'hidden',
  },
  cell: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
