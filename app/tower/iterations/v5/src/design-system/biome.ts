import { biomeAccents, type BiomeId } from './tokens';

/** Motif → biome family. 25 frentes share 5 thumbs, not unique paintings. */
const MOTIF_BIOME: Record<string, BiomeId> = {
  pradera: 'forest',
  bosque: 'forest',
  pantano: 'forest',
  jardines: 'forest',
  isla: 'forest',
  arrecife: 'forest',
  puente: 'keep',
  aldea: 'keep',
  ciudadela: 'keep',
  fortaleza: 'keep',
  ruinas: 'keep',
  acueducto: 'keep',
  ultima: 'keep',
  canon: 'desert',
  costa: 'desert',
  desierto: 'desert',
  volcan: 'desert',
  mina: 'desert',
  montana: 'frost',
  glaciar: 'frost',
  puerto: 'frost',
  tormenta: 'frost',
  necro: 'void',
  orbital: 'void',
  cristal: 'void',
};

export function biomeForMotif(motif: string): BiomeId {
  return MOTIF_BIOME[motif] ?? 'keep';
}

export function biomeAccent(motif: string): string {
  return biomeAccents[biomeForMotif(motif)];
}
