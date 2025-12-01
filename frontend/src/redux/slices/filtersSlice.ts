import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface FiltersState {
  showSigmet: boolean;
  showAirsigmet: boolean;
  minAltitude: number;
  maxAltitude: number;
  timeOffsetHours: number;
}

const initialState: FiltersState = {
  showSigmet: true,
  showAirsigmet: true,
  minAltitude: 0,
  maxAltitude: 48000,
  timeOffsetHours: 0,
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setShowSigmet: (state, action: PayloadAction<boolean>) => {
      state.showSigmet = action.payload;
    },
    setShowAirsigmet: (state, action: PayloadAction<boolean>) => {
      state.showAirsigmet = action.payload;
    },
    setMinAltitude: (state, action: PayloadAction<number>) => {
      state.minAltitude = action.payload;
    },
    setMaxAltitude: (state, action: PayloadAction<number>) => {
      state.maxAltitude = action.payload;
    },
    setTimeOffsetHours: (state, action: PayloadAction<number>) => {
      state.timeOffsetHours = action.payload;
    },
  },
});

export const {
  setShowSigmet,
  setShowAirsigmet,
  setMinAltitude,
  setMaxAltitude,
  setTimeOffsetHours,
} = filtersSlice.actions;
export default filtersSlice.reducer;
