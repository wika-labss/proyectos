import { Square, algebraic, sq } from '../types';

/** Fixed energy nodes V1.1: c3, f3, c6, f6 */
export const ENERGY_NODES: Square[] = [sq(2, 2), sq(5, 2), sq(2, 5), sq(5, 5)];

export function isEnergyNode(square: Square): boolean {
  return ENERGY_NODES.includes(square);
}

export function nodeLabels(): string[] {
  return ENERGY_NODES.map(algebraic);
}
