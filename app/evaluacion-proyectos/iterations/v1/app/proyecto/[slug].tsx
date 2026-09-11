import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ScoreRow } from '../../src/components/ScoreRow';
import { Screen } from '../../src/components/Screen';
import { colors, fonts, spacing } from '../../src/constants/theme';
import {
  EvalApiError,
  canSubmitEvaluation,
  fetchProjectBySlug,
  saveEvaluation,
  type Project,
  type Score,
} from '../../src/engine';
import { loadEvaluatorName } from '../../src/modules/session';

export default function ProjectScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [evaluator, setEvaluator] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [functionality, setFunctionality] = useState<Score | null>(null);
  const [design, setDesign] = useState<Score | null>(null);
  const [businessProposal, setBusinessProposal] = useState<Score | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const name = await loadEvaluatorName();
      if (!name) {
        router.replace('/login');
        return;
      }
      if (!slug) {
        setError('Proyecto no válido.');
        setStatus('error');
        return;
      }
      try {
        const found = await fetchProjectBySlug(slug);
        if (cancelled) return;
        setEvaluator(name);
        setProject(found);
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof EvalApiError ? err.message : 'No se pudo cargar el proyecto.';
        setError(message);
        setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, slug]);

  const input = {
    evaluatorName: evaluator ?? '',
    projectId: project?.id ?? '',
    functionality,
    design,
    businessProposal,
  };
  const canSave = canSubmitEvaluation(input) && !saving;

  async function onSave() {
    setError(null);
    setSaved(false);
    if (!canSubmitEvaluation(input)) {
      setError('Completa las tres calificaciones (1 a 5).');
      return;
    }
    setSaving(true);
    try {
      await saveEvaluation(input);
      setSaved(true);
      Alert.alert('Guardado', 'La evaluación se envió correctamente.', [
        { text: 'OK', onPress: () => router.replace('/home') },
      ]);
    } catch (err) {
      const message = err instanceof EvalApiError ? err.message : 'No se pudo guardar.';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen title={project?.name} subtitle={evaluator ? `Evaluador: ${evaluator}` : undefined}>
      {status === 'loading' ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.text} />
        </View>
      ) : null}
      {status === 'error' ? <Text style={styles.error}>{error}</Text> : null}
      {status === 'ready' && project ? (
        <ScrollView contentContainerStyle={styles.content}>
          <ScoreRow label="Funcionalidad" value={functionality} onChange={setFunctionality} />
          <ScoreRow label="Diseño" value={design} onChange={setDesign} />
          <ScoreRow label="Propuesta de negocio" value={businessProposal} onChange={setBusinessProposal} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {saved ? <Text style={styles.meta}>Evaluación guardada.</Text> : null}
          <PrimaryButton label={saving ? 'Guardando' : 'Guardar'} onPress={() => void onSave()} disabled={!canSave} />
        </ScrollView>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    paddingVertical: spacing.xl,
  },
  content: {
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  error: {
    color: colors.error,
    fontSize: fonts.caption,
    marginBottom: spacing.md,
  },
  meta: {
    color: colors.textMuted,
    fontSize: fonts.caption,
    marginBottom: spacing.md,
  },
});
