import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing, touchMin } from '../constants/theme';
import { TIPOS, type QueryFilter, type TipoLicitacion } from '../engine/filters';
import type { EstadoRef, RubroRef } from '../engine/types';
import { EstadoChip } from './EstadoChip';

type FilterBarProps = {
  filter: QueryFilter;
  rubros: RubroRef[];
  estados: EstadoRef[];
  onChange: (patch: Partial<QueryFilter>) => void;
};

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
      accessibilityRole="button"
    >
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

export function FilterBar({ filter, rubros, estados, onChange }: FilterBarProps) {
  const setTipo = (tipo: TipoLicitacion | null) => onChange({ tipo });
  const toggleEstado = (codigo: number) => {
    const current = filter.estados ?? [];
    const next = current.includes(codigo)
      ? current.filter((c) => c !== codigo)
      : [...current, codigo];
    onChange({ estados: next.length ? next : null });
  };

  return (
    <View>
      <Text style={styles.section}>Rango</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Chip label="7 días" selected={false} onPress={() => onChange({ ...range(7) })} />
        <Chip label="30 días" selected={false} onPress={() => onChange({ ...range(30) })} />
        <Chip label="90 días" selected={false} onPress={() => onChange({ ...range(90) })} />
        <Chip
          label="Todo"
          selected={filter.desde === null && filter.hasta === null}
          onPress={() => onChange({ desde: null, hasta: null })}
        />
      </ScrollView>
      <Text style={styles.section}>Tipo</Text>
      <View style={styles.row}>
        <Chip label="Todos" selected={filter.tipo === null} onPress={() => setTipo(null)} />
        {TIPOS.map((tipo) => (
          <Chip key={tipo} label={tipo} selected={filter.tipo === tipo} onPress={() => setTipo(tipo)} />
        ))}
      </View>
      <Text style={styles.section}>Estado</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Chip label="Todos" selected={filter.estados === null} onPress={() => onChange({ estados: null })} />
        {estados.map((estado) => (
          <EstadoChip
            key={estado.codigo}
            codigo={estado.codigo}
            nombre={estado.nombre}
            selected={Boolean(filter.estados?.includes(estado.codigo))}
            onPress={() => toggleEstado(estado.codigo)}
          />
        ))}
      </ScrollView>
      <Text style={styles.section}>Rubro</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Chip label="Todos" selected={filter.rubro === null} onPress={() => onChange({ rubro: null })} />
        {rubros.slice(0, 24).map((rubro) => (
          <Chip
            key={rubro.codigo}
            label={`${rubro.codigo}`}
            selected={filter.rubro === rubro.codigo}
            onPress={() => onChange({ rubro: rubro.codigo })}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function range(days: number): Pick<QueryFilter, 'desde' | 'hasta'> {
  const hasta = new Date().toISOString().slice(0, 10);
  const d = new Date(`${hasta}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return { desde: d.toISOString().slice(0, 10), hasta };
}

const styles = StyleSheet.create({
  section: {
    color: colors.textMuted,
    fontSize: fonts.caption,
    fontWeight: '700',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    minHeight: touchMin,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipLabel: {
    color: colors.text,
    fontSize: fonts.caption,
    fontWeight: '700',
  },
  chipLabelSelected: {
    color: colors.background,
  },
});
