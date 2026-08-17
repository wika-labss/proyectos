import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, pieceColors } from '../constants/theme';
import { cellsOf, Piece, PieceType } from '../engine/tetrisEngine';

type Props = {
  type: PieceType | null;
  cellSize?: number;
};

export function Preview({ type, cellSize = 12 }: Props) {
  if (!type) {
    return <View style={styles.box} />;
  }
  const piece: Piece = { type, rot: 0, x: 0, y: 0 };
  const cells = cellsOf(piece);
  const minX = Math.min(...cells.map((c) => c.x));
  const minY = Math.min(...cells.map((c) => c.y));
  const maxX = Math.max(...cells.map((c) => c.x));
  const maxY = Math.max(...cells.map((c) => c.y));
  const set = new Set(cells.map((c) => `${c.x},${c.y}`));
  const rows = [];
  for (let y = minY; y <= maxY; y += 1) {
    const cols = [];
    for (let x = minX; x <= maxX; x += 1) {
      const on = set.has(`${x},${y}`);
      cols.push(
        <View
          key={`${x},${y}`}
          style={{
            width: cellSize,
            height: cellSize,
            backgroundColor: on ? pieceColors[type] : 'transparent',
            borderWidth: on ? 1 : 0,
            borderColor: colors.cellBorder,
          }}
        />
      );
    }
    rows.push(
      <View key={`r${y}`} style={styles.row}>
        {cols}
      </View>
    );
  }
  return <View style={styles.box}>{rows}</View>;
}

const styles = StyleSheet.create({
  box: {
    minHeight: 52,
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
});
