import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CrimeBoard } from '../../src/components/CrimeBoard';
import { PieceTray } from '../../src/components/PieceTray';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { colors, fonts, skins, spacing } from '../../src/constants/theme';
import {
  clearCell,
  createBoardState,
  getRoom,
  isUnlocked,
  placePiece,
  type RoomId,
} from '../../src/engine';
import { useProgress } from '../../src/hooks/ProgressProvider';

export default function PlayScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { progress, markRoomComplete } = useProgress();
  const id = roomId as RoomId;

  const room = useMemo(() => {
    try {
      return getRoom(id);
    } catch {
      return null;
    }
  }, [id]);

  const [board, setBoard] = useState(() =>
    room ? createBoardState(room.size, room.puzzle) : null,
  );
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  if (!room || !board) {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>Caso no encontrado</Text>
        <PrimaryButton label="Mapa" onPress={() => router.replace('/map')} />
      </View>
    );
  }

  if (!isUnlocked(progress.campaign, id)) {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>Habitación bloqueada</Text>
        <PrimaryButton label="Mapa" onPress={() => router.replace('/map')} />
      </View>
    );
  }

  const conflictKeys = new Set(
    board.conflicts.map((c) => `${c.row},${c.col}`),
  );
  const skin = skins[room.skinKey];

  const onCellPress = (row: number, col: number) => {
    setSelectedCell({ row, col });
    if (board.givens[row]![col]) return;
    if (selectedPiece === null) return;
    setBoard(placePiece(board, row, col, selectedPiece));
  };

  const onClear = () => {
    if (!selectedCell) return;
    setBoard(clearCell(board, selectedCell.row, selectedCell.col));
  };

  const onResolve = async () => {
    if (!board.solved) return;
    await markRoomComplete(id);
    router.replace(`/victory/${id}`);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: skin.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{room.title}</Text>
        <Text style={styles.blurb} numberOfLines={2}>
          {room.blurb}
        </Text>

        <CrimeBoard
          size={room.size}
          cells={board.cells}
          givens={board.givens}
          conflictKeys={conflictKeys}
          selectedCell={selectedCell}
          onCellPress={onCellPress}
        />

        <Text style={styles.hint}>
          Elige una pieza y tócala en una celda vacía. Sin repeticiones en fila,
          columna ni región.
        </Text>

        <PieceTray
          size={room.size}
          selectedPiece={selectedPiece}
          onSelect={setSelectedPiece}
        />

        <View style={styles.actions}>
          <PrimaryButton label="Borrar celda" variant="ghost" onPress={onClear} />
          <PrimaryButton
            label={board.solved ? 'Resolver caso' : 'Aún hay conflictos…'}
            disabled={!board.solved}
            onPress={() => void onResolve()}
          />
          <PrimaryButton
            label="Salir"
            variant="ghost"
            onPress={() => router.replace('/map')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontFamily: fonts.brand,
    fontWeight: '700',
  },
  blurb: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  hint: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 13,
    textAlign: 'center',
  },
  actions: { gap: spacing.sm },
  err: { color: colors.error, fontFamily: fonts.body },
});
