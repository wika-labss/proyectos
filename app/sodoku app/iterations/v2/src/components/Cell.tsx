import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { typography } from '../constants/theme';
import { ThemeColors } from '../types';

interface CellProps {
  value: number;
  notes: Set<number>;
  isGiven: boolean;
  isSelected: boolean;
  isConflict: boolean;
  isRelated: boolean;
  isSameNumber: boolean;
  row: number;
  col: number;
  size: number;
  colors: ThemeColors;
  onPress: (row: number, col: number) => void;
}

export function Cell({
  value,
  notes,
  isGiven,
  isSelected,
  isConflict,
  isRelated,
  isSameNumber,
  row,
  col,
  size,
  colors,
  onPress,
}: CellProps) {
  const backgroundColor = isSelected
    ? colors.primary
    : isSameNumber
      ? colors.highlightSame
      : isRelated
        ? colors.highlight
        : colors.surface;

  const textColor = isSelected
    ? colors.buttonText
    : isConflict
      ? colors.error
      : isGiven
        ? colors.text
        : colors.textSecondary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Fila ${row + 1}, columna ${col + 1}${value ? `, valor ${value}` : ', vacía'}`}
      onPress={() => onPress(row, col)}
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          backgroundColor,
          borderColor: colors.gridLine,
          borderTopWidth: row % 3 === 0 ? 2 : StyleSheet.hairlineWidth,
          borderLeftWidth: col % 3 === 0 ? 2 : StyleSheet.hairlineWidth,
          borderRightWidth: col === 8 ? 2 : StyleSheet.hairlineWidth,
          borderBottomWidth: row === 8 ? 2 : StyleSheet.hairlineWidth,
          borderTopColor: row % 3 === 0 ? colors.gridLineBold : colors.gridLine,
          borderLeftColor: col % 3 === 0 ? colors.gridLineBold : colors.gridLine,
          borderRightColor: col === 8 ? colors.gridLineBold : colors.gridLine,
          borderBottomColor: row === 8 ? colors.gridLineBold : colors.gridLine,
        },
      ]}
    >
      {value !== 0 ? (
        <Text
          style={[
            styles.value,
            {
              color: textColor,
              fontWeight: isGiven ? '700' : '400',
              fontSize: Math.max(size * 0.45, 16),
            },
          ]}
        >
          {value}
        </Text>
      ) : notes.size > 0 ? (
        <View style={styles.notesGrid}>
          {Array.from({ length: 9 }, (_, index) => {
            const noteValue = index + 1;
            return (
              <Text
                key={noteValue}
                style={[
                  styles.note,
                  {
                    color: isSelected ? colors.buttonText : colors.textSecondary,
                    fontSize: Math.max(size * 0.16, 8),
                  },
                ]}
              >
                {notes.has(noteValue) ? noteValue : ' '}
              </Text>
            );
          })}
        </View>
      ) : null}
      {isConflict && value !== 0 ? <Text style={styles.conflictMark}>✕</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  value: {
    textAlign: 'center',
  },
  notesGrid: {
    width: '88%',
    height: '88%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  note: {
    width: '33.33%',
    textAlign: 'center',
  },
  conflictMark: {
    position: 'absolute',
    top: 2,
    right: 4,
    fontSize: 10,
    color: '#EF4444',
  },
});
