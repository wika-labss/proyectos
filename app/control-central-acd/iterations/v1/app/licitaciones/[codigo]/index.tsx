import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { Screen } from '../../../src/components/Screen';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { colors, fonts, spacing, touchMin } from '../../../src/constants/theme';
import { AcdApiError, fetchGanador, formatMonto, type GanadorPayload } from '../../../src/engine';

export default function DetalleScreen() {
  const { codigo } = useLocalSearchParams<{ codigo: string }>();
  const router = useRouter();
  const [data, setData] = useState<GanadorPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!codigo) return;
    void fetchGanador(codigo)
      .then(setData)
      .catch((err) => {
        setError(err instanceof AcdApiError ? err.message : 'No se pudo cargar el detalle.');
      });
  }, [codigo]);

  return (
    <Screen title={codigo ?? 'Detalle'} subtitle={data?.nombre ?? 'Licitación'}>
      <ScrollView>
        <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button">
          <Text style={styles.backLabel}>← Volver</Text>
        </Pressable>
        {error ? <Text style={styles.warn}>{error}</Text> : null}
        {data ? (
          <>
            <Text style={styles.meta}>
              {data.estado.nombre} · {data.organismo}
            </Text>
            <Text style={styles.monto}>{formatMonto(data.monto_adjudicado ?? data.monto_estimado, data.moneda ?? 'CLP')}</Text>
            {data.tiene_ganador ? (
              <PrimaryButton label="Ver perfil del ganador" onPress={() => router.push(`/licitaciones/${codigo}/ganador`)} />
            ) : data.estado.codigo === 8 ? (
              <Text style={styles.meta}>Ganador aún no cargado en nuestra base.</Text>
            ) : (
              <Text style={styles.meta}>Esta licitación todavía no tiene ganador.</Text>
            )}
            <Pressable
              style={styles.link}
              onPress={() => data.url_ficha && void Linking.openURL(data.url_ficha)}
              accessibilityRole="button"
            >
              <Text style={styles.linkLabel}>Abrir ficha MP</Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { minHeight: touchMin, justifyContent: 'center', marginBottom: spacing.sm },
  backLabel: { color: colors.accent, fontWeight: '800' },
  warn: { color: colors.error, marginBottom: spacing.sm },
  meta: { color: colors.textMuted, fontSize: fonts.caption, marginBottom: spacing.sm },
  monto: { color: colors.text, fontSize: fonts.heading, fontWeight: '800', marginBottom: spacing.md },
  link: { minHeight: touchMin, justifyContent: 'center', marginTop: spacing.md },
  linkLabel: { color: colors.accent, fontWeight: '800' },
});
