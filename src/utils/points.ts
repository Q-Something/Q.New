
// Utility for points <-> sparks conversion
export const SPARK_POINT_VALUE = 20;
export function pointsToSparks(points: number) {
  return Math.floor(points / SPARK_POINT_VALUE);
}
export function sparksToPoints(sparks: number) {
  return sparks * SPARK_POINT_VALUE;
}
