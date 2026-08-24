/** Crime piece catalog — MOD-02 */
export type PieceKind = 'victim' | 'suspect' | 'killer';

export type CrimePiece = {
  id: number;
  kind: PieceKind;
  label: string;
  short: string;
};

const LABELS_BY_N: Record<4 | 6 | 9, CrimePiece[]> = {
  4: [
    { id: 0, kind: 'victim', label: 'Víctima', short: 'V' },
    { id: 1, kind: 'suspect', label: 'Carlos', short: 'C' },
    { id: 2, kind: 'suspect', label: 'Elena', short: 'E' },
    { id: 3, kind: 'killer', label: 'Asesino', short: 'A' },
  ],
  6: [
    { id: 0, kind: 'victim', label: 'Víctima', short: 'V' },
    { id: 1, kind: 'suspect', label: 'Carlos', short: 'C' },
    { id: 2, kind: 'suspect', label: 'Elena', short: 'E' },
    { id: 3, kind: 'suspect', label: 'Bruno', short: 'B' },
    { id: 4, kind: 'suspect', label: 'Diana', short: 'D' },
    { id: 5, kind: 'killer', label: 'Asesino', short: 'A' },
  ],
  9: [
    { id: 0, kind: 'victim', label: 'Víctima', short: 'V' },
    { id: 1, kind: 'suspect', label: 'Carlos', short: 'C' },
    { id: 2, kind: 'suspect', label: 'Elena', short: 'E' },
    { id: 3, kind: 'suspect', label: 'Bruno', short: 'B' },
    { id: 4, kind: 'suspect', label: 'Diana', short: 'D' },
    { id: 5, kind: 'suspect', label: 'Félix', short: 'F' },
    { id: 6, kind: 'suspect', label: 'Greta', short: 'G' },
    { id: 7, kind: 'suspect', label: 'Hugo', short: 'H' },
    { id: 8, kind: 'killer', label: 'Asesino', short: 'A' },
  ],
};

export function getPieceSet(n: 4 | 6 | 9): CrimePiece[] {
  const set = LABELS_BY_N[n];
  if (set.length !== n) {
    throw new Error(`piece set size ${set.length} !== board ${n}`);
  }
  const victims = set.filter((p) => p.kind === 'victim');
  const killers = set.filter((p) => p.kind === 'killer');
  if (victims.length !== 1 || killers.length !== 1) {
    throw new Error('piece set must have exactly 1 victim and 1 killer');
  }
  return set;
}

export function pieceById(n: 4 | 6 | 9, id: number): CrimePiece {
  const p = getPieceSet(n).find((x) => x.id === id);
  if (!p) throw new Error(`unknown piece ${id} for n=${n}`);
  return p;
}
