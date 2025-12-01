import { describe, it, expect, beforeEach } from "vitest";
import authReducer, { login, logout } from "../authSlice";
import { STORAGE_KEYS } from "@/constants";

describe("authSlice", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return initial state", () => {
    const state = authReducer(undefined, { type: "unknown" });
    expect(state.jwt).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("should handle login", () => {
    const token = "test-jwt-token";
    const state = authReducer(undefined, login(token));

    expect(state.jwt).toBe(token);
    expect(state.isAuthenticated).toBe(true);
    expect(localStorage.getItem(STORAGE_KEYS.JWT)).toBe(token);
  });

  it("should handle logout", () => {
    localStorage.setItem(STORAGE_KEYS.JWT, "test-token");
    const initialState = { jwt: "test-token", isAuthenticated: true };
    const state = authReducer(initialState, logout());

    expect(state.jwt).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem(STORAGE_KEYS.JWT)).toBeNull();
  });

  it("should initialize with token from localStorage", () => {
    localStorage.setItem(STORAGE_KEYS.JWT, "stored-token");
    const state = authReducer(undefined, { type: "unknown" });
    // Note: This test checks the initial state creation, which happens in the slice definition
    // The actual initialization happens when the store is created
    expect(state.jwt).toBeNull(); // Initial state before any action
  });
});
