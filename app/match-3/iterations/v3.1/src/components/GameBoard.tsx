import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { COLS, ROWS } from '../constants/game';
import { colors, gemColors, radius } from '../constants/theme';
import type { Board, Cell, HintMove } from '../engine/match3Engine';
import { VisualAssets } from '../modules/match3-visual/assets';
import { SheetSprite } from '../modules/match3-visual/SheetSprite';

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
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (popping) {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.2,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.15,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scale.setValue(1);
      opacity.setValue(1);
      translateY.setValue(-cellSize * 0.35);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 7,
        tension: 80,
      }).start();
    }
  }, [popping, gem, cellSize, opacity, scale, translateY]);

  const sprite = gem >= 0 && gem < 5;

  return (
    <Animated.View
      style={[
        styles.cell,
        {
          width: cellSize - 2,
          height: cellSize - 2,
          left: c * cellSize + 1,
          top: r * cellSize + 1,
          backgroundColor: sprite ? 'transparent' : (gemColors[gem] ?? colors.locked),
          borderColor: hinted
            ? colors.hint
            : selected
              ? colors.star
              : 'transparent',
          borderWidth: hinted || selected ? 2 : 0,
          opacity,
          transform: [{ scale }, { translateY }],
        },
      ]}
    >
      {sprite ? (
        <SheetSprite
          source={VisualAssets.gems}
          cols={5}
          rows={1}
          col={gem}
          row={0}
          size={cellSize - 6}
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
  return (
    <View style={[styles.board, { width: COLS * cellSize, height: ROWS * cellSize }]}>
      {board.map((row, r) =>
        row.map((gem, c) => {
          if ((gem as number) < 0) return null;
          const sel = selected?.r === r && selected?.c === c;
          const hinted = isHintCell(hint, r, c);
          const popping = isClearing(clearing, r, c);
          return (
            <GemCell
              key={`${r}-${c}-${gem}`}
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
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: colors.cyan,
  },
  cell: {
    position: 'absolute',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
