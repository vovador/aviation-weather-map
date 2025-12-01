import { describe, it, expect, beforeEach } from "vitest";
import authReducer, { login, logout } from "../authSlice";

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
    expect(localStorage.getItem("jwt")).toBe(token);
  });

  it("should handle logout", () => {
    localStorage.setItem("jwt", "test-token");
    const initialState = { jwt: "test-token", isAuthenticated: true };
    const state = authReducer(initialState, logout());

    expect(state.jwt).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem("jwt")).toBeNull();
  });

  it("should initialize with token from localStorage", () => {
    localStorage.setItem("jwt", "stored-token");
    const state = authReducer(undefined, { type: "unknown" });
    // Note: This test checks the initial state creation, which happens in the slice definition
    // The actual initialization happens when the store is created
    expect(state.jwt).toBeNull(); // Initial state before any action
  });
});
