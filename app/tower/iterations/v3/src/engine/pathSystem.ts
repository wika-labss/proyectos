import type { Vec2 } from './types';

export function pathLength(path: Vec2[]): number {
  let len = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!;
    const b = path[i]!;
    len += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return len;
}

/** Convert progress 0..1 along polyline to world position. */
export function positionAt(path: Vec2[], t: number): Vec2 {
  if (path.length === 0) return { x: 0, y: 0 };
  if (path.length === 1) return { ...path[0]! };
  const clamped = Math.max(0, Math.min(1, t));
  const total = pathLength(path);
  if (total <= 0) return { ...path[0]! };
  let remain = clamped * total;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!;
    const b = path[i]!;
    const seg = Math.hypot(b.x - a.x, b.y - a.y);
    if (remain <= seg || i === path.length - 1) {
      const u = seg === 0 ? 0 : remain / seg;
      return {
        x: a.x + (b.x - a.x) * u,
        y: a.y + (b.y - a.y) * u,
      };
    }
    remain -= seg;
  }
  return { ...path[path.length - 1]! };
}

/** Advance traveler by distance (logical units). Returns new t and reachedBase. */
export function advancePath(
  path: Vec2[],
  t: number,
  distance: number,
): { t: number; reachedBase: boolean } {
  const total = pathLength(path);
  if (total <= 0) return { t: 1, reachedBase: true };
  const next = t + distance / total;
  if (next >= 1) return { t: 1, reachedBase: true };
  return { t: next, reachedBase: false };
}
