import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { ChipSelect } from '../src/components/ChipSelect';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { Screen } from '../src/components/Screen';
import { colors, fonts, radius, spacing } from '../src/constants/theme';
import { DEMO_FOUND_COORDS, SPECIES, type Species } from '../src/engine';
import { usePets } from '../src/hooks/PetProvider';

const SPECIES_OPTIONS = SPECIES.map((s) => ({ value: s, label: s }));

export default function RegisterScreen() {
  const { createPet, error, clearError, unseen } = usePets();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<Species>('perro');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [locLabel, setLocLabel] = useState('Sin coordenadas de casa todavía');
  const [busy, setBusy] = useState(false);

  const captureGps = async () => {
    clearError();
    setBusy(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        setLocLabel('Permiso denegado. Usa ubicación de prueba o escribe lat/lng.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLat(String(pos.coords.latitude));
      setLng(String(pos.coords.longitude));
      setLocLabel(
        `Casa capturada: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`,
      );
    } catch {
      setLocLabel('No se pudo leer el GPS. Usa ubicación de prueba.');
    } finally {
      setBusy(false);
    }
  };

  const useDemo = () => {
    setLat(String(DEMO_FOUND_COORDS.lat));
    setLng(String(DEMO_FOUND_COORDS.lng));
    setLocLabel(
      `Ubicación de prueba: ${DEMO_FOUND_COORDS.lat}, ${DEMO_FOUND_COORDS.lng}`,
    );
  };

  const onSave = async () => {
    clearError();
    const homeLat = Number(lat.replace(',', '.'));
    const homeLng = Number(lng.replace(',', '.'));
    const pet = await createPet({
      name,
      species,
      address,
      homeLat,
      homeLng,
    });
    if (pet) router.replace(`/pet/${pet.id}`);
  };

  return (
    <Screen
      title="Registrar mascota"
      subtitle="Nombre, especie, dirección y GPS de casa"
      unseen={unseen}
    >
      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ej. Luna"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Especie</Text>
      <ChipSelect options={SPECIES_OPTIONS} value={species} onChange={setSpecies} />

      <Text style={styles.label}>Dirección (casa)</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="Calle, número, comuna"
        placeholderTextColor={colors.textMuted}
      />

      <View style={styles.card}>
        <Text style={styles.muted}>{locLabel}</Text>
        <PrimaryButton label={busy ? 'Capturando…' : 'Usar GPS actual como casa'} onPress={captureGps} disabled={busy} />
        <PrimaryButton label="Usar ubicación de prueba" variant="secondary" onPress={useDemo} />
        <Text style={styles.label}>Latitud</Text>
        <TextInput
          style={styles.input}
          value={lat}
          onChangeText={setLat}
          keyboardType="decimal-pad"
          placeholder="-33.4372"
          placeholderTextColor={colors.textMuted}
        />
        <Text style={styles.label}>Longitud</Text>
        <TextInput
          style={styles.input}
          value={lng}
          onChangeText={setLng}
          keyboardType="decimal-pad"
          placeholder="-70.6506"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton label="Guardar y generar QR" onPress={onSave} />
      <PrimaryButton label="Cancelar" variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.text,
    fontWeight: fonts.weightBold,
    fontFamily: fonts.base,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    color: colors.text,
    fontFamily: fonts.base,
    fontSize: fonts.sizeMd,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  muted: {
    color: colors.textMuted,
    fontFamily: fonts.base,
  },
  error: { color: colors.error, fontFamily: fonts.base },
});
