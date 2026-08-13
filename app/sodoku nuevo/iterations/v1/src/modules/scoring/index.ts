/** scoring — puntaje local determinista */
export function scoreForValidMove(): number {
  return 10;
}

export function scorePenaltyForError(): number {
  return -5;
}

export function scoreBonusForWin(levelId: number): number {
  return 100 + levelId * 10;
}

export function applyScore(current: number, delta: number): number {
  return Math.max(0, current + delta);
}
