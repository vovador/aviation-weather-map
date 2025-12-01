import { describe, it, expect } from "vitest";
import filtersReducer, {
  setShowSigmet,
  setShowAirsigmet,
  setMinAltitude,
  setMaxAltitude,
  setTimeOffsetHours,
} from "../filtersSlice";

describe("filtersSlice", () => {
  it("should return initial state", () => {
    const state = filtersReducer(undefined, { type: "unknown" });
    expect(state.showSigmet).toBe(true);
    expect(state.showAirsigmet).toBe(true);
    expect(state.minAltitude).toBe(0);
    expect(state.maxAltitude).toBe(48000);
    expect(state.timeOffsetHours).toBe(0);
  });

  it("should handle setShowSigmet", () => {
    const state = filtersReducer(undefined, setShowSigmet(false));
    expect(state.showSigmet).toBe(false);
  });

  it("should handle setShowAirsigmet", () => {
    const state = filtersReducer(undefined, setShowAirsigmet(false));
    expect(state.showAirsigmet).toBe(false);
  });

  it("should handle setMinAltitude", () => {
    const state = filtersReducer(undefined, setMinAltitude(10000));
    expect(state.minAltitude).toBe(10000);
  });

  it("should handle setMaxAltitude", () => {
    const state = filtersReducer(undefined, setMaxAltitude(30000));
    expect(state.maxAltitude).toBe(30000);
  });

  it("should handle setTimeOffsetHours", () => {
    const state = filtersReducer(undefined, setTimeOffsetHours(-12));
    expect(state.timeOffsetHours).toBe(-12);
  });
});
