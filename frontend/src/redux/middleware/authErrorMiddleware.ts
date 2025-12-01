import type { Middleware } from "@reduxjs/toolkit";
import { unauthorized } from "../slices/authSlice";
import { logout } from "../slices/authSlice";

/**
 * Middleware that handles 401 Unauthorized errors.
 * When the unauthorized action is dispatched (typically from axios interceptor),
 * this middleware:
 * 1. Dispatches the logout action to clear auth state
 * 2. Redirects to the login page
 */
export const authErrorMiddleware: Middleware =
  (store) => (next) => (action) => {
    // If the action is unauthorized, handle logout and redirect
    if (unauthorized.match(action)) {
      // Dispatch logout to clear auth state and localStorage
      store.dispatch(logout());
      // Redirect to login page
      window.location.href = "/login";
    }

    // Continue with the action
    return next(action);
  };
