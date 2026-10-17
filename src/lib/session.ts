/**
 * Coming back to the app after this long is treated as a new payment, not a
 * return to the one in progress, so the screen starts over.
 */
export const START_OVER_AFTER_MS = 10 * 60 * 1000;

export function shouldStartOver(leftAt: number, now: number): boolean {
  return now - leftAt >= START_OVER_AFTER_MS;
}
