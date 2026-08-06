import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { colors, layout } from '../src/constants/theme';
import { RemoteButton } from '../src/components/RemoteButton';
import { useDiagnosticsLog } from '../src/hooks/useDiagnosticsLog';
import type { LogEntry, LogLevel } from '../src/diagnostics/types';

const LEVEL_COLOR: Record<LogLevel, string> = {
  info: colors.textOnSoft,
  ok: colors.feedbackSuccess,
  fail: colors.feedbackError,
  warn: colors.feedbackWarning,
};

export default function LogsScreen() {
  const { entries, count, clear, exportText, exportJson } = useDiagnosticsLog();
  const [filter, setFilter] = useState<'all' | LogLevel>('all');
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    if (filter === 'all') {
      return entries;
    }
    return entries.filter((entry) => entry.level === filter);
  }, [entries, filter]);

  const onExportText = async () => {
    setBusy(true);
    try {
      await exportText();
    } finally {
      setBusy(false);
    }
  };

  const onExportJson = async () => {
    setBusy(true);
    try {
      await exportJson();
    } finally {
      setBusy(false);
    }
  };

  const renderItem = ({ item }: { item: LogEntry }) => (
    <View style={styles.row}>
      <Text style={[styles.level, { color: LEVEL_COLOR[item.level] }]}>
        {item.level.toUpperCase()}
      </Text>
      <Text style={styles.line} selectable>
        {item.execution} → {item.result}
      </Text>
      <Text style={styles.ts}>{item.ts}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Logs</Text>
        <Text style={styles.subtitle}>
          ejecución → resultado · {count} entradas · v3.1
        </Text>
        <RemoteButton
          compact
          label="← Volver"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/pairing');
            }
          }}
          style={styles.backButton}
        />
      </View>

      <View style={styles.actions}>
        <RemoteButton
          compact
          disabled={busy || count === 0}
          label="Exportar texto"
          onPress={() => void onExportText()}
          style={styles.actionBtn}
        />
        <RemoteButton
          compact
          disabled={busy || count === 0}
          label="Exportar JSON"
          onPress={() => void onExportJson()}
          style={styles.actionBtn}
        />
        <RemoteButton
          compact
          disabled={count === 0}
          label="Limpiar"
          onPress={clear}
          style={styles.actionBtn}
        />
      </View>

      <View style={styles.filters}>
        {(['all', 'fail', 'warn', 'ok', 'info'] as const).map((option) => (
          <Pressable
            key={option}
            accessibilityRole="button"
            onPress={() => setFilter(option)}
            style={[styles.chip, filter === option && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === option && styles.chipTextActive]}>
              {option === 'all' ? 'Todos' : option}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Sin logs. Busca TVs o conecta por IP para generar entradas.
          </Text>
        }
        ListHeaderComponent={
          count > 0 ? (
            <Text style={styles.hint}>
              Más reciente arriba. Exporta texto o JSON para enviar al diagnóstico.
            </Text>
          ) : null
        }
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSoft,
    flex: 1,
  },
  header: {
    backgroundColor: colors.backgroundStrong,
    gap: 8,
    paddingBottom: 16,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 48,
  },
  title: {
    color: colors.textOnStrong,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textOnStrong,
    fontSize: 13,
    opacity: 0.9,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 12,
  },
  actionBtn: {
    flexGrow: 1,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: 10,
  },
  chip: {
    borderColor: colors.buttonBackground,
    borderRadius: layout.buttonRadius,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: colors.buttonBackground,
  },
  chipText: {
    color: colors.textOnSoft,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  chipTextActive: {
    color: colors.buttonText,
  },
  list: {
    gap: 10,
    paddingBottom: 40,
    paddingHorizontal: layout.screenPadding,
  },
  row: {
    borderBottomColor: 'rgba(0,0,0,0.12)',
    borderBottomWidth: 1,
    gap: 2,
    paddingBottom: 10,
  },
  level: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  line: {
    color: colors.textOnSoft,
    fontSize: 13,
    fontWeight: '600',
  },
  ts: {
    color: colors.textOnSoft,
    fontSize: 11,
    opacity: 0.7,
  },
  empty: {
    color: colors.textOnSoft,
    fontSize: 14,
    marginTop: 24,
    textAlign: 'center',
  },
  hint: {
    color: colors.textOnSoft,
    fontSize: 11,
    marginBottom: 8,
    opacity: 0.7,
  },
});
