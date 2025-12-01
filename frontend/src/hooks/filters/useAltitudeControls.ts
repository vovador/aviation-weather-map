import { useState, useEffect } from "react";

export const useAltitudeControls = (
  reduxMinAltitude: number,
  reduxMaxAltitude: number
) => {
  const [localMinAltitude, setLocalMinAltitude] = useState(reduxMinAltitude);
  const [localMaxAltitude, setLocalMaxAltitude] = useState(reduxMaxAltitude);

  // Sync local state with Redux state when it changes externally
  useEffect(() => {
    setLocalMinAltitude(reduxMinAltitude);
  }, [reduxMinAltitude]);

  useEffect(() => {
    setLocalMaxAltitude(reduxMaxAltitude);
  }, [reduxMaxAltitude]);

  return {
    localMinAltitude,
    localMaxAltitude,
    setLocalMinAltitude,
    setLocalMaxAltitude,
  };
};
