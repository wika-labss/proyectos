export function isInsideFence(distanceM: number, radiusM: number): boolean {
  return distanceM <= radiusM;
}

export function formatDistance(distanceM: number): string {
  if (distanceM < 1000) {
    return `${Math.round(distanceM)} m`;
  }
  return `${(distanceM / 1000).toFixed(2)} km`;
}
