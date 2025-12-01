import { useState, useEffect } from "react";

export const useToggleControls = (
  reduxShowSigmet: boolean,
  reduxShowAirsigmet: boolean
) => {
  const [localShowSigmet, setLocalShowSigmet] = useState(reduxShowSigmet);
  const [localShowAirsigmet, setLocalShowAirsigmet] =
    useState(reduxShowAirsigmet);

  // Sync local state with Redux state when it changes externally
  useEffect(() => {
    setLocalShowSigmet(reduxShowSigmet);
  }, [reduxShowSigmet]);

  useEffect(() => {
    setLocalShowAirsigmet(reduxShowAirsigmet);
  }, [reduxShowAirsigmet]);

  const handleSigmetToggle = (pressed: boolean) => {
    setLocalShowSigmet(pressed);
  };

  const handleAirsigmetToggle = (pressed: boolean) => {
    setLocalShowAirsigmet(pressed);
  };

  return {
    localShowSigmet,
    localShowAirsigmet,
    setLocalShowSigmet,
    setLocalShowAirsigmet,
    handleSigmetToggle,
    handleAirsigmetToggle,
  };
};
