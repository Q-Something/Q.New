
/**
 * Utility to display spark and points in a consistent format.
 * Example: "3 sparks (60 pts)"
 */
export function formatSparksWithPoints(sparks: number): string {
  const points = sparks * 20;
  return `${sparks} spark${sparks === 1 ? "" : "s"} (${points} pts)`;
}
