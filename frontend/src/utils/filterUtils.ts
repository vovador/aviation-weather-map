/**
 * Count coordinates in a geometry
 */
export const countCoordinates = (
  coordinates: number[] | number[][] | number[][][]
): number => {
  if (Array.isArray(coordinates[0])) {
    if (Array.isArray(coordinates[0][0])) {
      // 3D array (Polygon)
      return (coordinates as number[][][]).reduce(
        (sum, ring) => sum + ring.length,
        0
      );
    }
    // 2D array (LineString)
    return (coordinates as number[][]).length;
  }
  // 1D array (Point)
  return 1;
};
