export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function shortestAngleDelta(from: number, to: number) {
  return ((((to - from) % 360) + 540) % 360) - 180;
}
