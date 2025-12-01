export interface AltitudeRange {
  min?: number;
  max?: number;
  unit?: string;
}

export const formatAltitudeRange = ({
  min = 0,
  max = 0,
  unit = "FL",
}: AltitudeRange) => `${min} - ${max} ${unit}`;
