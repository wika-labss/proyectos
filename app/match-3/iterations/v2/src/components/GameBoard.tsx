import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { COLS, ROWS } from '../constants/game';
import { colors, gemColors, radius } from '../constants/theme';
import type { Board, Cell, HintMove } from '../engine/match3Engine';

type Props = {
  board: Board;
  selected: Cell | null;
  hint: HintMove | null;
  cellSize: number;
  onSelect: (cell: Cell) => void;
};

function isHintCell(hint: HintMove | null, r: number, c: number): boolean {
  if (!hint) return false;
  return (
    (hint.a.r === r && hint.a.c === c) || (hint.b.r === r && hint.b.c === c)
  );
}

export function GameBoard({
  board,
  selected,
  hint,
  cellSize,
  onSelect,
}: Props) {
  return (
    <View style={[styles.board, { width: COLS * cellSize, height: ROWS * cellSize }]}>
      {board.map((row, r) =>
        row.map((gem, c) => {
          const sel = selected?.r === r && selected?.c === c;
          const hinted = isHintCell(hint, r, c);
          return (
            <Pressable
              key={`${r}-${c}`}
              onPress={() => onSelect({ r, c })}
              style={[
                styles.cell,
                {
                  width: cellSize - 2,
                  height: cellSize - 2,
                  left: c * cellSize + 1,
                  top: r * cellSize + 1,
                  backgroundColor: gemColors[gem] ?? colors.locked,
                  borderColor: hinted
                    ? colors.hint
                    : sel
                      ? colors.textOnDark
                      : 'transparent',
                  borderWidth: hinted || sel ? 3 : 0,
                },
              ]}
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
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  cell: {
    position: 'absolute',
    borderRadius: 8,
  },
});
