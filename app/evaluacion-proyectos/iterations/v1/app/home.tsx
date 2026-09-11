import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { ProjectCard } from '../src/components/ProjectCard';
import { Screen } from '../src/components/Screen';
import { colors, fonts, spacing } from '../src/constants/theme';
import { EvalApiError, fetchProjects, type Project } from '../src/engine';
import { loadEvaluatorName } from '../src/modules/session';

export default function HomeScreen() {
  const router = useRouter();
  const [evaluator, setEvaluator] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void (async () => {
        const name = await loadEvaluatorName();
        if (!name) {
          router.replace('/login');
          return;
        }
        if (cancelled) return;
        setEvaluator(name);
        setStatus('loading');
        setError(null);
        try {
          const list = await fetchProjects();
          if (cancelled) return;
          setProjects(list);
          setStatus('ready');
        } catch (err) {
          if (cancelled) return;
          const message =
            err instanceof EvalApiError ? err.message : 'No se pudieron cargar los proyectos.';
          setError(message);
          setStatus('error');
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [router]),
  );

  return (
    <Screen subtitle={evaluator ? `Evaluador: ${evaluator}` : undefined}>
      {status === 'loading' ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.text} />
        </View>
      ) : null}
      {status === 'error' ? <Text style={styles.error}>{error}</Text> : null}
      {status === 'ready' && projects.length === 0 ? (
        <Text style={styles.meta}>No hay proyectos disponibles.</Text>
      ) : null}
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          name={project.name}
          onPress={() => router.push(`/proyecto/${project.slug}`)}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    paddingVertical: spacing.xl,
  },
  error: {
    color: colors.error,
    fontSize: fonts.caption,
    marginBottom: spacing.md,
  },
  meta: {
    color: colors.textMuted,
    fontSize: fonts.caption,
  },
});
