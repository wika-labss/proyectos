import React from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors, spacing, typography } from '../src/constants/theme';

export default function HowToScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <PrimaryButton label="← Home" variant="secondary" onPress={() => router.back()} />
        <Text style={styles.title}>Cómo jugar</Text>
        <Text style={styles.p}>
          Chess Wars es ajedrez clásico offline. Siempre juegas con Blancas. Toca una pieza y luego
          una casilla resaltada para mover.
        </Text>
        <Text style={styles.p}>
          Objetivo: dar jaque mate al rey negro. Si no tienes movimientos y no estás en jaque, es
          ahogado (tablas).
        </Text>
        <Text style={styles.p}>
          Reglas V1: enroque, peón doble paso, captura al paso y promoción a dama. Campaña Wars:
          10 batallas; 1–4 IA Fácil, 5–10 IA Media.
        </Text>
        <Text style={styles.p}>
          Partida rápida: elige dificultad y juega una partida suelta sin afectar el desbloqueo de
          campaña.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  title: { ...typography.title, color: colors.text, marginTop: spacing.md },
  p: { ...typography.body, color: colors.textMuted, lineHeight: 24 },
});
