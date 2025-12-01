import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { formatDateForAPI, getDateRange, formatTimeOffset } from "../dateUtils";

describe("dateUtils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("formatDateForAPI", () => {
    it("should format date as ISO string", () => {
      const date = new Date("2024-01-01T12:00:00Z");
      const formatted = formatDateForAPI(date);
      expect(formatted).toBe("2024-01-01T12:00:00.000Z");
    });
  });

  describe("getDateRange", () => {
    it("should return date range with 0 offset", () => {
      const range = getDateRange(0);
      expect(range.from).toBe("2024-01-01T12:00:00.000Z");
      expect(range.to).toBe("2024-01-01T18:00:00.000Z");
    });

    it("should return date range with positive offset", () => {
      const range = getDateRange(6);
      expect(range.from).toBe("2024-01-01T18:00:00.000Z");
      expect(range.to).toBe("2024-01-02T00:00:00.000Z");
    });

    it("should return date range with negative offset", () => {
      const range = getDateRange(-12);
      expect(range.from).toBe("2024-01-01T00:00:00.000Z");
      expect(range.to).toBe("2024-01-01T06:00:00.000Z");
    });
  });

  describe("formatTimeOffset", () => {
    it('should format 0 hours as "Now"', () => {
      expect(formatTimeOffset(0)).toBe("Now");
    });

    it("should format positive hours with + prefix", () => {
      expect(formatTimeOffset(6)).toBe("+6h");
    });

    it("should format negative hours without prefix", () => {
      expect(formatTimeOffset(-12)).toBe("-12h");
    });
  });
});
