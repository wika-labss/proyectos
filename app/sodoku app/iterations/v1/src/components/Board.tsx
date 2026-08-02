import React, { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { spacing } from '../constants/theme';
import { CellPosition, Notes, ThemeColors } from '../types';
import { Cell } from './Cell';

interface BoardProps {
  board: number[][];
  givens: boolean[][];
  notes: Notes;
  selectedCell: CellPosition | null;
  conflictCells: CellPosition[];
  colors: ThemeColors;
  onCellPress: (row: number, col: number) => void;
}

function isSamePosition(a: CellPosition, row: number, col: number): boolean {
  return a.row === row && a.col === col;
}

export function Board({
  board,
  givens,
  notes,
  selectedCell,
  conflictCells,
  colors,
  onCellPress,
}: BoardProps) {
  const { width } = useWindowDimensions();
  const boardSize = Math.min(width - spacing.md * 2, 360);
  const cellSize = boardSize / 9;

  const selectedValue = selectedCell ? board[selectedCell.row][selectedCell.col] : 0;

  const conflictSet = useMemo(
    () => new Set(conflictCells.map((cell) => `${cell.row}-${cell.col}`)),
    [conflictCells],
  );

  return (
    <View style={[styles.container, { width: boardSize, height: boardSize, backgroundColor: colors.surface }]}>
      {board.map((row, rowIndex) =>
        row.map((value, colIndex) => {
          const isSelected = selectedCell
            ? isSamePosition(selectedCell, rowIndex, colIndex)
            : false;
          const isRelated = selectedCell
            ? selectedCell.row === rowIndex ||
              selectedCell.col === colIndex ||
              (Math.floor(selectedCell.row / 3) === Math.floor(rowIndex / 3) &&
                Math.floor(selectedCell.col / 3) === Math.floor(colIndex / 3))
            : false;
          const isSameNumber = selectedValue !== 0 && value === selectedValue && !isSelected;
          const isConflict = conflictSet.has(`${rowIndex}-${colIndex}`);

          return (
            <View
              key={`${rowIndex}-${colIndex}`}
              style={{ position: 'absolute', top: rowIndex * cellSize, left: colIndex * cellSize }}
            >
              <Cell
                value={value}
                notes={notes[rowIndex][colIndex]}
                isGiven={givens[rowIndex][colIndex]}
                isSelected={isSelected}
                isConflict={isConflict}
                isRelated={isRelated}
                isSameNumber={isSameNumber}
                row={rowIndex}
                col={colIndex}
                size={cellSize}
                colors={colors}
                onPress={onCellPress}
              />
            </View>
          );
        }),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
});
