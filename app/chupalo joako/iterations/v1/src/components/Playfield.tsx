import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, pieceColors } from '../constants/theme';
import { Board, cellsOf, Piece, PieceType } from '../engine/tetrisEngine';

type Props = {
  board: Board;
  active: Piece | null;
  cellSize: number;
};

export function Playfield({ board, active, cellSize }: Props) {
  const overlay = useMemo(() => {
    const map = new Map<string, PieceType>();
    if (active) {
      for (const c of cellsOf(active)) {
        if (c.y >= 0) map.set(`${c.x},${c.y}`, active.type);
      }
    }
    return map;
  }, [active]);

  const rows = [];
  for (let y = 0; y < board.rows; y += 1) {
    const cols = [];
    for (let x = 0; x < board.cols; x += 1) {
      const stacked = board.cells[y * board.cols + x];
      const falling = overlay.get(`${x},${y}`);
      const type = falling ?? (stacked === 0 ? null : stacked);
      cols.push(
        <View
          key={`${x},${y}`}
          style={[
            styles.cell,
            {
              width: cellSize,
              height: cellSize,
              backgroundColor: type ? pieceColors[type] : colors.cellEmpty,
              borderColor: colors.cellBorder,
            },
          ]}
        />
      );
    }
    rows.push(
      <View key={`r${y}`} style={styles.row}>
        {cols}
      </View>
    );
  }

  return <View style={styles.well}>{rows}</View>;
}

const styles = StyleSheet.create({
  well: {
    alignSelf: 'center',
    backgroundColor: colors.well,
    borderWidth: 2,
    borderColor: colors.accent,
    padding: 2,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 1,
  },
});
