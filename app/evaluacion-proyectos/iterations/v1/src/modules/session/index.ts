import AsyncStorage from '@react-native-async-storage/async-storage';
import { isValidEvaluatorName, normalizeEvaluatorName } from '../../engine/validation';

const STORAGE_KEY = 'evaluacion.evaluatorName';

export async function loadEvaluatorName(): Promise<string | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const name = normalizeEvaluatorName(raw);
  return isValidEvaluatorName(name) ? name : null;
}

export async function saveEvaluatorName(raw: string): Promise<string> {
  const name = normalizeEvaluatorName(raw);
  if (!isValidEvaluatorName(name)) {
    throw new Error('El nombre debe tener entre 2 y 80 caracteres.');
  }
  await AsyncStorage.setItem(STORAGE_KEY, name);
  return name;
}
