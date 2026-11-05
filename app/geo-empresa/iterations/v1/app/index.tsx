import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../src/components/Screen';
import { colors, fonts, spacing } from '../src/constants/theme';
import { useAgent } from '../src/hooks/useAgent';

function bannerStyle(kind: 'ok' | 'warn' | 'err') {
  if (kind === 'ok') return { backgroundColor: colors.accent };
  if (kind === 'warn') return { backgroundColor: colors.warning };
  return { backgroundColor: colors.error };
}

export default function StatusScreen() {
  const { registration, snapshot, owner, loaded, error } = useAgent();

  if (!loaded) {
    return (
      <Screen>
        <ActivityIndicator color={colors.accent} />
      </Screen>
    );
  }

  if (!registration) {
    return <Redirect href="/register" />;
  }

  const enrollment = snapshot?.estado_enrollment ?? registration.estadoEnrollment;
  let banner = 'Pendiente de TI';
  let kind: 'ok' | 'warn' | 'err' = 'warn';
  if (!owner) {
    banner = 'No enrolado — sideload no es flota segura';
    kind = 'warn';
  } else if (enrollment === 'aprobado') {
    banner = 'Owner OK · aprobado';
    kind = 'ok';
  } else if (enrollment === 'rechazado') {
    banner = 'Rechazado por TI';
    kind = 'err';
  }

  const dentro = snapshot?.dentro_perimetro;
  return (
    <Screen>
      <Text style={styles.title}>Geo Empresa</Text>
      <View style={[styles.banner, bannerStyle(kind)]}>
        <Text style={styles.bannerText}>{banner}</Text>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.card}>
        <Text style={styles.label}>Equipo</Text>
        <Text style={styles.value}>{registration.nombreRegistrado}</Text>
        <Text style={styles.label}>Perímetro</Text>
        <Text style={styles.value}>
          {dentro === undefined ? '—' : dentro ? 'dentro' : 'fuera'}
          {snapshot?.distancia_base_m != null
            ? ` · ${Math.round(snapshot.distancia_base_m)} m`
            : ''}
        </Text>
        <Text style={styles.label}>Último ping</Text>
        <Text style={styles.value}>{snapshot?.ultimo_ping_at ?? '—'}</Text>
        <Text style={styles.label}>Auto-lock</Text>
        <Text style={styles.value}>{snapshot?.politica_autolock ? 'on' : 'off'}</Text>
      </View>
      <Text style={styles.hint}>El agente corre en background. No desinstale este equipo.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: fonts.title,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  banner: {
    borderRadius: 12,
    padding: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  bannerText: {
    color: colors.background,
    fontSize: fonts.body,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
  },
  label: {
    color: colors.textMuted,
    fontSize: fonts.caption,
  },
  value: {
    color: colors.text,
    fontSize: fonts.body,
    marginBottom: spacing.sm,
  },
  hint: {
    color: colors.textMuted,
    fontSize: fonts.caption,
    marginTop: spacing.lg,
  },
  error: {
    color: colors.error,
    marginBottom: spacing.md,
  },
});
