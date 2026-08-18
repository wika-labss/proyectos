import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../modules/app-theme';
import { Board } from '../types';

interface BoardProps {
  board: Board;
  givens: boolean[][];
  selected: { row: number; col: number } | null;
  conflicts: { row: number; col: number }[];
  onSelect: (row: number, col: number) => void;
}

function isConflict(
  conflicts: { row: number; col: number }[],
  row: number,
  col: number
): boolean {
  return conflicts.some((c) => c.row === row && c.col === col);
}

export function SudokuBoard({ board, givens, selected, conflicts, onSelect }: BoardProps) {
  return (
    <View style={styles.board}>
      {board.map((rowValues, row) => (
        <View key={`r-${row}`} style={styles.row}>
          {rowValues.map((value, col) => {
            const selectedCell = selected?.row === row && selected?.col === col;
            const error = isConflict(conflicts, row, col);
            const thickRight = col === 2 || col === 5;
            const thickBottom = row === 2 || row === 5;
            return (
              <Pressable
                key={`c-${row}-${col}`}
                onPress={() => onSelect(row, col)}
                style={[
                  styles.cell,
                  thickRight && styles.thickRight,
                  thickBottom && styles.thickBottom,
                  selectedCell && styles.selected,
                ]}
              >
                <Text
                  style={[
                    styles.number,
                    givens[row][col] && styles.given,
                    error && styles.error,
                  ]}
                >
                  {value === 0 ? '' : String(value)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    borderWidth: 3,
    borderColor: colors.borderBold,
    backgroundColor: colors.surface,
    aspectRatio: 1,
    width: '100%',
  },
  row: { flex: 1, flexDirection: 'row' },
  cell: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thickRight: { borderRightWidth: 3 },
  thickBottom: { borderBottomWidth: 3 },
  selected: { backgroundColor: colors.selected },
  number: { color: colors.number, fontSize: typography.cell, fontWeight: '400' },
  given: { fontWeight: '700', color: colors.given },
  error: { color: colors.error, fontWeight: '700' },
});
