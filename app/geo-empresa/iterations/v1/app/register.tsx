import * as Device from 'expo-device';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Screen } from '../src/components/Screen';
import { colors, fonts, spacing, touchMin } from '../src/constants/theme';
import { registrarDispositivo } from '../src/engine';
import {
  getOrCreateFingerprint,
  saveRegistration,
} from '../src/modules/registration/store';

export default function RegisterScreen() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [radio, setRadio] = useState('120');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setError(null);
    const baseLat = Number(lat);
    const baseLng = Number(lng);
    const radioMetros = Number(radio) || 120;
    if (!nombre.trim()) {
      setError('Nombre requerido');
      return;
    }
    if (!Number.isFinite(baseLat) || !Number.isFinite(baseLng)) {
      setError('Coordenadas inválidas');
      return;
    }
    setBusy(true);
    try {
      const fingerprint = await getOrCreateFingerprint();
      const snap = await registrarDispositivo({
        nombre: nombre.trim(),
        fingerprint,
        baseLat,
        baseLng,
        modelo: Device.modelName ?? undefined,
        radioMetros,
      });
      await saveRegistration({
        fingerprint,
        dispositivoId: snap.id,
        nombreRegistrado: snap.nombre_registrado,
        estadoEnrollment: snap.estado_enrollment,
      });
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Registrar teléfono</Text>
      <Text style={styles.sub}>Equipo corporativo. Queda pendiente de TI.</Text>
      <Field label="Nombre" value={nombre} onChangeText={setNombre} />
      <Field label="Lat base" value={lat} onChangeText={setLat} keyboardType="decimal-pad" />
      <Field label="Lng base" value={lng} onChangeText={setLng} keyboardType="decimal-pad" />
      <Field label="Radio m" value={radio} onChangeText={setRadio} keyboardType="number-pad" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        style={[styles.cta, busy && styles.ctaDisabled]}
        onPress={() => {
          void onSubmit();
        }}
        disabled={busy}
      >
        <Text style={styles.ctaText}>{busy ? 'Registrando…' : 'Registrar'}</Text>
      </Pressable>
    </Screen>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'decimal-pad' | 'number-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: fonts.title,
    fontWeight: '700',
  },
  sub: {
    color: colors.textMuted,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    color: colors.text,
    minHeight: touchMin,
    paddingHorizontal: spacing.md,
  },
  cta: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    minHeight: touchMin,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: fonts.body,
  },
  error: {
    color: colors.error,
    marginBottom: spacing.sm,
  },
});
