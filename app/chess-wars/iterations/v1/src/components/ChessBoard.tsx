import React from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { colors } from '../constants/theme';
import { Board, Piece, Square, fileOf, rankOf } from '../engine/types';

const SYMBOLS: Record<string, string> = {
  wk: '♔',
  wq: '♕',
  wr: '♖',
  wb: '♗',
  wn: '♘',
  wp: '♙',
  bk: '♚',
  bq: '♛',
  br: '♜',
  bb: '♝',
  bn: '♞',
  bp: '♟',
};

function glyph(piece: Piece | null): string {
  if (!piece) return '';
  return SYMBOLS[`${piece.color}${piece.type}`] ?? '';
}

type Props = {
  board: Board;
  selected: Square | null;
  legalTargets: Square[];
  onPressSquare: (square: Square) => void;
  disabled?: boolean;
};

export function ChessBoard({
  board,
  selected,
  legalTargets,
  onPressSquare,
  disabled,
}: Props) {
  const { width } = useWindowDimensions();
  const size = Math.min(width - 24, 420);
  const cell = size / 8;

  const squares: Square[] = [];
  for (let rank = 7; rank >= 0; rank--) {
    for (let file = 0; file < 8; file++) {
      squares.push(rank * 8 + file);
    }
  }

  return (
    <View style={[styles.board, { width: size, height: size }]}>
      {squares.map((s) => {
        const light = (fileOf(s) + rankOf(s)) % 2 === 1;
        const isSelected = selected === s;
        const isLegal = legalTargets.includes(s);
        return (
          <Pressable
            key={s}
            disabled={disabled}
            onPress={() => onPressSquare(s)}
            style={[
              styles.cell,
              {
                width: cell,
                height: cell,
                backgroundColor: light ? colors.boardLight : colors.boardDark,
              },
              isSelected && { backgroundColor: colors.selected },
            ]}
          >
            {isLegal && !board[s] ? <View style={styles.dot} /> : null}
            {isLegal && board[s] ? <View style={styles.captureRing} /> : null}
            <Text style={[styles.piece, { fontSize: cell * 0.62 }]}>{glyph(board[s])}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  piece: {
    color: colors.background,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.legal,
  },
  captureRing: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: colors.accent,
  },
});
