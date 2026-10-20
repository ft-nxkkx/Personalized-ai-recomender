// Elo update used by the mock backend. The real backend owns ratings once it is wired in.
export const ELO_K = 16;

export function expectedScore(rating: number, opponent: number): number {
  return 1 / (1 + Math.pow(10, (opponent - rating) / 400));
}

/** score: 1 win, 0.5 tie, 0 loss for side A. Returns rounded deltas for A and B. */
export function eloDeltas(ratingA: number, ratingB: number, score: number, k = ELO_K) {
  const ea = expectedScore(ratingA, ratingB);
  const dA = Math.round(k * (score - ea));
  return { deltaA: dA, deltaB: -dA };
}
