import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { colors, fontFamily, fontSize, fontWeight, layout, radius, spacing } from '../src/constants/theme';
import { prepareSend } from '../src/engine';
import type { Aggregator } from '../src/engine';
import { AggregatorPicker } from '../src/modules/aggregator/AggregatorPicker';
import { CameraCapture } from '../src/modules/camera/CameraCapture';
import { enviar, readEvidenceConfig } from '../src/modules/evidence-api';
import { OrderNumberField } from '../src/modules/order-name/OrderNumberField';

type Phase = 'idle' | 'loading' | 'success' | 'error';

export default function CapturaScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [order, setOrder] = useState('');
  const [aggregator, setAggregator] = useState<Aggregator | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [message, setMessage] = useState('');

  const ready = prepareSend({ imageUri, order, aggregator });

  async function onSend() {
    const prepared = prepareSend({ imageUri, order, aggregator });
    if (!prepared.ok) {
      setPhase('error');
      setMessage(prepared.error);
      return;
    }
    setPhase('loading');
    setMessage('');
    const result = await enviar(readEvidenceConfig(), prepared.payload);
    if (!result.ok) {
      setPhase('error');
      setMessage(result.error);
      return;
    }
    setPhase('success');
    setMessage('La imagen quedó guardada');
    setImageUri(null);
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>app-delivery</Text>
        <Link href="/consulta" style={styles.link}>
          Consulta
        </Link>
      </View>
      <CameraCapture uri={imageUri} onCapture={setImageUri} />
      <OrderNumberField value={order} onChange={setOrder} />
      <AggregatorPicker value={aggregator} onChange={setAggregator} />
      <Pressable
        disabled={!ready.ok || phase === 'loading'}
        onPress={() => void onSend()}
        style={[styles.send, ready.ok && phase !== 'loading' ? styles.sendOn : styles.sendOff]}
      >
        <Text style={styles.sendText}>{phase === 'loading' ? 'Enviando…' : 'Enviar evidencia'}</Text>
      </Pressable>
      {phase === 'success' ? <Text style={styles.ok}>{message}</Text> : null}
      {phase === 'error' ? <Text style={styles.err}>{message}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontFamily: fontFamily.base,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  link: {
    color: colors.accent,
    fontFamily: fontFamily.base,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  send: {
    minHeight: layout.touchMin,
    maxWidth: layout.ctaMaxWidth,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  sendOn: { backgroundColor: colors.accent },
  sendOff: { backgroundColor: colors.border },
  sendText: {
    color: colors.surface,
    fontFamily: fontFamily.base,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  ok: { color: colors.text, fontFamily: fontFamily.base, fontSize: fontSize.sm },
  err: { color: colors.error, fontFamily: fontFamily.base, fontSize: fontSize.sm },
});
