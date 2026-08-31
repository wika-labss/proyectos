import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';

export default function HowToScreen() {
  const router = useRouter();
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>Cómo jugar</Text>
        <Text style={styles.p}>
          Los enemigos siguen el camino hacia tu base. Coloca torres en las zonas
          marcadas para detener las oleadas.
        </Text>
        <Text style={styles.p}>
          Hay 4 torres: Arquera, Cañón, Hielo y Francotirador. Junta 2 del mismo
          tipo y mismo nivel para evolucionar (hasta Lv.4: Ballesta Élite,
          Mortero Infernal, Ventisca Absolute, Águila de Ébano).
        </Text>
        <Text style={styles.p}>
          Puedes vender una torre seleccionada y recuperar ~70 % del oro
          invertido (si gastaste 50, vueles 35; en evoluciones suma lo
          invertido en las fusionadas).
        </Text>
        <Text style={styles.p}>
          Campaña: 25 mapas con dificultad un poco más alta que V3. Modo
          Infinito: oleadas sin fin que escalan. Tienda: preview visual de
          Infinito y Pack de Contenido (sin cobros reales aún).
        </Text>
        <Pressable style={styles.cta} onPress={() => router.back()}>
          <Text style={styles.ctaText}>Entendido</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.night },
  safe: { flex: 1, padding: 24, gap: 16, justifyContent: 'center' },
  title: { color: colors.mist, fontSize: 32, fontWeight: '900' },
  p: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  cta: {
    marginTop: 12,
    backgroundColor: colors.ember,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: { color: colors.mist, fontWeight: '800', fontSize: 16 },
});
