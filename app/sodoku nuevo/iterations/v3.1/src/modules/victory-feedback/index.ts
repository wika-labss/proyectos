/** victory-feedback — mensaje por nivel */
export function buildVictoryMessage(levelId: number): string {
  const safeLevel = Math.max(1, Math.min(20, Math.floor(levelId)));
  return `muy bien culiaitoo${'!'.repeat(safeLevel)}`;
}
