export type Economy = { gold: number };

export function startEconomy(gold: number): Economy {
  return { gold: Math.max(0, Math.floor(gold)) };
}

export function trySpend(eco: Economy, cost: number): { ok: boolean; eco: Economy } {
  if (eco.gold < cost) return { ok: false, eco };
  return { ok: true, eco: { gold: eco.gold - cost } };
}

export function reward(eco: Economy, amount: number): Economy {
  return { gold: eco.gold + Math.max(0, Math.floor(amount)) };
}
