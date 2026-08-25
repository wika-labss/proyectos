import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { Screen } from '../../../src/components/Screen';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { colors, fonts, radius, spacing, touchMin } from '../../../src/constants/theme';
import {
  AcdApiError,
  canOpenActa,
  fetchGanador,
  formatMonto,
  itemsTotal,
  pctEstimado,
  primaryProveedor,
  type GanadorPayload,
} from '../../../src/engine';

export default function GanadorScreen() {
  const { codigo } = useLocalSearchParams<{ codigo: string }>();
  const router = useRouter();
  const [data, setData] = useState<GanadorPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!codigo) return;
    void fetchGanador(codigo)
      .then(setData)
      .catch((err) => {
        setError(err instanceof AcdApiError ? err.message : 'No se pudo cargar el ganador.');
      });
  }, [codigo]);

  const proveedor = data ? primaryProveedor(data) : null;
  const total = data ? itemsTotal(data) : null;
  const pct = data ? pctEstimado(data) : null;
  const actaOk = data ? canOpenActa(data) : false;

  return (
    <Screen title="Propuesta ganadora" subtitle={codigo}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button">
          <Text style={styles.backLabel}>← Volver</Text>
        </Pressable>
        {error ? <Text style={styles.warn}>{error}</Text> : null}
        {data && !data.tiene_ganador ? (
          <Text style={styles.meta}>Ganador aún no cargado. El estado puede ser adjudicado en el listado diario, pero la ficha no está en nuestra BD.</Text>
        ) : null}
        {data && data.tiene_ganador ? (
          <>
            <Text style={styles.nombre}>{proveedor?.nombre ?? 'Proveedor'}</Text>
            <Text style={styles.meta}>{proveedor?.rut}</Text>
            <Text style={styles.meta}>
              {data.numero_oferentes != null ? `${data.numero_oferentes} oferentes` : 'Oferentes no informados'}
              {data.fecha_adjudicacion ? ` · ${data.fecha_adjudicacion.slice(0, 10)}` : ''}
            </Text>
            {data.items.map((item) => (
              <View key={`${item.correlativo}-${item.rut_proveedor}`} style={styles.item}>
                <Text style={styles.itemName}>{item.nombre_producto ?? 'Ítem'}</Text>
                <Text style={styles.meta}>
                  {item.cantidad} × {formatMonto(item.monto_unitario, data.moneda ?? 'CLP')}
                </Text>
                <Text style={styles.itemTotal}>{formatMonto(item.subtotal, data.moneda ?? 'CLP')}</Text>
              </View>
            ))}
            <Text style={styles.total}>Total {formatMonto(total, data.moneda ?? 'CLP')}</Text>
            {pct != null ? (
              <Text style={styles.meta}>{pct}% del estimado ({formatMonto(data.monto_estimado, data.moneda ?? 'CLP')})</Text>
            ) : (
              <Text style={styles.meta}>Estimado no visible en la ficha.</Text>
            )}
            <PrimaryButton
              label={actaOk ? 'Descargar acta' : 'Aún no hay acta en Mercado Público'}
              onPress={() => actaOk && data.url_acta && void Linking.openURL(data.url_acta)}
              disabled={!actaOk}
            />
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
  content: { paddingBottom: spacing.xl },
  back: { minHeight: touchMin, justifyContent: 'center', marginBottom: spacing.sm },
  backLabel: { color: colors.accent, fontWeight: '800' },
  warn: { color: colors.error, marginBottom: spacing.sm },
  nombre: { color: colors.text, fontSize: fonts.title, fontWeight: '800' },
  meta: { color: colors.textMuted, fontSize: fonts.caption, marginTop: spacing.xs, marginBottom: spacing.sm },
  item: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemName: { color: colors.text, fontWeight: '700' },
  itemTotal: { color: colors.accent, fontWeight: '800', marginTop: spacing.xs },
  total: { color: colors.text, fontSize: fonts.heading, fontWeight: '800', marginVertical: spacing.md },
  link: { minHeight: touchMin, justifyContent: 'center', marginTop: spacing.md },
  linkLabel: { color: colors.accent, fontWeight: '800' },
});
