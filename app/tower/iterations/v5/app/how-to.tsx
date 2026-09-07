import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../src/design-system/tokens';
import {
  KeepBackdrop,
  StoneButton,
  towersRoster,
} from '../src/modules/tower-ui-kit';

export default function HowToScreen() {
  const router = useRouter();
  return (
    <KeepBackdrop variant="menu">
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>Cómo jugar</Text>
        <Image source={towersRoster} style={styles.roster} resizeMode="contain" />
        <Text style={styles.p}>
          Los enemigos siguen el camino hacia tu base. Coloca torres en las zonas
          marcadas para detener las oleadas.
        </Text>
        <Text style={styles.p}>
          Hay 4 torres: Arquera, Cañón, Hielo y Francotirador. Junta 2 del mismo
          tipo y mismo nivel para evolucionar (hasta Lv.4).
        </Text>
        <Text style={styles.p}>
          Vende una torre seleccionada y recupera ~70 % del oro invertido.
          Campaña: 25 frentes. Infinito: oleadas sin fin.
        </Text>
        <StoneButton label="Entendido" onPress={() => router.back()} />
      </SafeAreaView>
    </KeepBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
    justifyContent: 'center',
  },
  title: {
    color: colors.mist,
    fontSize: typography.title,
    fontWeight: '900',
  },
  roster: { width: '100%', height: 120 },
  p: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 24,
  },
});
