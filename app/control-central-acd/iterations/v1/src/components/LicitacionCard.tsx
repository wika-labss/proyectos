import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing, touchMin } from '../constants/theme';
import type { LicitacionCard } from '../engine/types';
import { canOpenPerfil, formatMonto } from '../engine/licitaciones';
import { EstadoChip } from './EstadoChip';

type LicitacionCardViewProps = {
  item: LicitacionCard;
  onOpen: () => void;
  onPerfil?: () => void;
  onFicha?: () => void;
};

export function LicitacionCardView({ item, onOpen, onPerfil, onFicha }: LicitacionCardViewProps) {
  const perfil = canOpenPerfil(item);
  return (
    <Pressable onPress={onOpen} style={styles.card} accessibilityRole="button">
      <View style={styles.header}>
        <Text style={styles.codigo}>{item.codigo}</Text>
        <EstadoChip codigo={item.estado.codigo} nombre={`${item.tipo} · ${item.estado.nombre}`} />
      </View>
      <Text style={styles.nombre}>{item.nombre}</Text>
      <Text style={styles.meta}>
        {[item.organismo, item.region].filter(Boolean).join(' · ')}
      </Text>
      <Text style={styles.monto}>{formatMonto(item.monto, item.moneda ?? 'CLP')}</Text>
      <View style={styles.actions}>
        {perfil ? (
          <Pressable onPress={onPerfil} style={styles.action} accessibilityRole="button">
            <Text style={styles.actionLabel}>Ver perfil</Text>
          </Pressable>
        ) : item.estado.codigo === 8 ? (
          <Text style={styles.partial}>Sin perfil</Text>
        ) : null}
        <Pressable onPress={onFicha} style={styles.action} accessibilityRole="button">
          <Text style={styles.actionLabel}>Ficha</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  codigo: {
    color: colors.accent,
    fontSize: fonts.caption,
    fontWeight: '800',
    flex: 1,
  },
  nombre: {
    color: colors.text,
    fontSize: fonts.body,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  meta: {
    color: colors.textMuted,
    fontSize: fonts.caption,
    marginTop: spacing.xs,
  },
  monto: {
    color: colors.text,
    fontSize: fonts.heading,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  action: {
    minHeight: touchMin,
    justifyContent: 'center',
  },
  actionLabel: {
    color: colors.accent,
    fontWeight: '800',
    fontSize: fonts.caption,
  },
  partial: {
    color: colors.textMuted,
    fontSize: fonts.caption,
  },
});
