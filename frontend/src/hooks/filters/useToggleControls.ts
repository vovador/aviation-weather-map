import { setShowSigmet, setShowAirsigmet } from "@/redux/slices/filtersSlice";
import type { AppDispatch } from "@/redux/store";

export const useToggleControls = (
  showSigmet: boolean,
  showAirsigmet: boolean,
  dispatch: AppDispatch
) => {
  const handleSigmetToggle = (pressed: boolean) => {
    dispatch(setShowSigmet(pressed));
  };

  const handleAirsigmetToggle = (pressed: boolean) => {
    dispatch(setShowAirsigmet(pressed));
  };

  return {
    showSigmet,
    showAirsigmet,
    handleSigmetToggle,
    handleAirsigmetToggle,
  };
};
