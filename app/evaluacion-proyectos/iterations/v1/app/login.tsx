import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { Screen } from '../src/components/Screen';
import { Wordmark } from '../src/components/Wordmark';
import { colors, fonts, radius, spacing } from '../src/constants/theme';
import { isValidEvaluatorName } from '../src/engine';
import { saveEvaluatorName } from '../src/modules/session';

export default function LoginScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onContinue() {
    setError(null);
    if (!isValidEvaluatorName(name)) {
      setError('Escribe tu nombre (2 a 80 caracteres).');
      return;
    }
    setBusy(true);
    try {
      await saveEvaluatorName(name);
      router.replace('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el nombre.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.hero}>
          <Wordmark size="compact" />
        </View>
        <Text style={styles.heading}>Identificación</Text>
        <Text style={styles.hint}>Ingresa tu nombre para continuar.</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Nombre"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={80}
          style={styles.input}
          accessibilityLabel="Nombre"
          onSubmitEditing={() => {
            void onContinue();
          }}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.cta}>
          <PrimaryButton label="Continuar" onPress={() => void onContinue()} disabled={busy} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  hero: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  heading: {
    color: colors.text,
    fontSize: fonts.title,
    fontWeight: '400',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  hint: {
    color: colors.textMuted,
    fontSize: fonts.caption,
    marginBottom: spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: radius.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    fontSize: fonts.body,
    fontWeight: '400',
  },
  error: {
    color: colors.error,
    fontSize: fonts.caption,
    marginTop: spacing.sm,
  },
  cta: {
    marginTop: spacing.xl,
  },
});
