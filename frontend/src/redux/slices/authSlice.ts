import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { STORAGE_KEYS } from "@/constants";

interface AuthState {
  jwt: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  jwt: localStorage.getItem(STORAGE_KEYS.JWT),
  isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.JWT),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<string>) => {
      state.jwt = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem(STORAGE_KEYS.JWT, action.payload);
    },
    logout: (state) => {
      state.jwt = null;
      state.isAuthenticated = false;
      localStorage.removeItem(STORAGE_KEYS.JWT);
    },
    unauthorized: (_state) => {
      // This action is dispatched by axios interceptor on 401 errors
      // The actual logout and redirect logic is handled by middleware
      // No state changes needed here, just a marker action
    },
  },
});

export const { login, logout, unauthorized } = authSlice.actions;
export default authSlice.reducer;
