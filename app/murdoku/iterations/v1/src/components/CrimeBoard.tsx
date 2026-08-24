import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../constants/theme';
import { pieceById, type BoardSize } from '../engine';

type Props = {
  size: BoardSize;
  cells: Array<Array<number | null>>;
  givens: boolean[][];
  conflictKeys: Set<string>;
  selectedCell: { row: number; col: number } | null;
  onCellPress: (row: number, col: number) => void;
};

export function CrimeBoard({
  size,
  cells,
  givens,
  conflictKeys,
  selectedCell,
  onCellPress,
}: Props) {
  const cellSize = size === 9 ? 34 : size === 6 ? 44 : 56;

  return (
    <View style={styles.wrap}>
      {cells.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((value, c) => {
            const key = `${r},${c}`;
            const conflict = conflictKeys.has(key);
            const selected =
              selectedCell?.row === r && selectedCell?.col === c;
            const given = givens[r]![c]!;
            const piece = value !== null ? pieceById(size, value) : null;
            const pieceColor =
              piece?.kind === 'victim'
                ? colors.victim
                : piece?.kind === 'killer'
                  ? colors.killer
                  : piece
                    ? colors.suspect
                    : colors.text;

            return (
              <Pressable
                key={key}
                onPress={() => onCellPress(r, c)}
                style={[
                  styles.cell,
                  {
                    width: cellSize,
                    height: cellSize,
                    borderColor: conflict
                      ? colors.error
                      : selected
                        ? colors.accent
                        : colors.border,
                    backgroundColor: conflict
                      ? colors.conflictFill
                      : selected
                        ? colors.selectedFill
                        : colors.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.glyph,
                    {
                      color: pieceColor,
                      fontWeight: given ? '800' : '600',
                      fontSize: size === 9 ? 12 : 16,
                      fontFamily: fonts.body,
                    },
                  ]}
                >
                  {piece?.short ?? ''}
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
  wrap: {
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row' },
  cell: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 34,
    minHeight: 34,
  },
  glyph: {
    textAlign: 'center',
  },
});
