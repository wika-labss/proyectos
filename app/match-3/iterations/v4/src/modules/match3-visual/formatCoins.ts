export function formatCoins(n: number): string {
  return Math.max(0, Math.floor(n))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
