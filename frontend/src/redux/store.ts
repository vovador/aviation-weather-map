import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import filtersReducer from "./slices/filtersSlice";
import { awcApi } from "./awc";
import { authErrorMiddleware } from "./middleware/authErrorMiddleware";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    filters: filtersReducer,
    [awcApi.reducerPath]: awcApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      // RTK Query middleware: handles API request caching, deduplication, automatic refetching,
      // and tag-based cache invalidation for the AWC API endpoints (SIGMET, AirSIGMET, auth)
      .concat(awcApi.middleware)
      // Auth error middleware: intercepts unauthorized actions (e.g., from 401 responses),
      // automatically logs out the user by clearing auth state and redirects to login page
      .concat(authErrorMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
