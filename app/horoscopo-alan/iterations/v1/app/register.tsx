import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { Screen } from '../src/components/Screen';
import {
  formatBirthDate,
  resolveZodiacSign,
  validateRegistrationInput,
} from '../src/engine';
import { appTitle, colors, fonts, radius, spacing } from '../src/constants/theme';
import { useProfile } from '../src/hooks/ProfileProvider';

const defaultBirthDate = new Date(2000, 0, 1);

export default function RegisterScreen() {
  const router = useRouter();
  const { setProfile } = useProfile();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState(defaultBirthDate);
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onDateChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selected) {
      setBirthDate(selected);
    }
  };

  const handleSave = async () => {
    const validationError = validateRegistrationInput(name, birthDate);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const sign = resolveZodiacSign(birthDate);
      await setProfile({
        name: name.trim(),
        birthDate: formatBirthDate(birthDate),
        signSlug: sign.slug,
        signName: sign.nombre,
        registeredAt: new Date().toISOString(),
      });
      router.replace('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el registro.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen title={appTitle} subtitle="Registro único — nombre y fecha de nacimiento">
      <View style={styles.card}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Tu nombre"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Fecha de nacimiento</Text>
        {Platform.OS === 'android' ? (
          <Pressable style={styles.dateButton} onPress={() => setShowPicker(true)}>
            <Text style={styles.dateText}>{formatBirthDate(birthDate)}</Text>
          </Pressable>
        ) : null}

        {showPicker ? (
          <DateTimePicker
            value={birthDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={onDateChange}
          />
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          label={saving ? 'Guardando...' : 'Guardar y continuar'}
          onPress={() => {
            void handleSave();
          }}
          disabled={saving}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  label: {
    color: colors.textMuted,
    fontSize: fonts.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: fonts.body,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  dateButton: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  dateText: {
    color: colors.text,
    fontSize: fonts.body,
  },
  error: {
    color: colors.error,
    fontSize: fonts.caption,
    marginBottom: spacing.sm,
  },
});
