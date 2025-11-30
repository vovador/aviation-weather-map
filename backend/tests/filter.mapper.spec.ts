import { FilterMapper } from "../src/mappers/filter.mapper";

describe("FilterMapper", () => {
  describe("fromQuery", () => {
    it("should parse valid min/max altitude", () => {
      const params = {
        minAlt: "15000",
        maxAlt: "25000",
      };

      const result = FilterMapper.fromQuery(params);

      expect(result.minAlt).toBe(15000);
      expect(result.maxAlt).toBe(25000);
    });

    it("should ignore invalid numeric values", () => {
      const params = {
        minAlt: "invalid",
        maxAlt: "not-a-number",
        from: "2024-01-01T00:00:00Z",
      };

      const result = FilterMapper.fromQuery(params);

      expect(result.minAlt).toBeUndefined();
      expect(result.maxAlt).toBeUndefined();
      expect(result.fromTs).toBeDefined(); // valid timestamp should still work
    });

    it("should convert valid ISO timestamps to unix seconds", () => {
      const params = {
        from: "2024-01-01T00:00:00Z",
        to: "2024-01-01T23:59:59Z",
      };

      const result = FilterMapper.fromQuery(params);

      expect(result.fromTs).toBe(1704067200); // 2024-01-01T00:00:00Z in unix seconds
      expect(result.toTs).toBe(1704153599); // 2024-01-01T23:59:59Z in unix seconds
    });

    it("should return undefined for invalid ISO timestamps", () => {
      const params = {
        from: "invalid-date",
        to: "not-a-timestamp",
      };

      const result = FilterMapper.fromQuery(params);

      expect(result.fromTs).toBeUndefined();
      expect(result.toTs).toBeUndefined();
    });

    it("should return empty object when no params provided", () => {
      const params = {};

      const result = FilterMapper.fromQuery(params);

      expect(result).toEqual({});
      expect(result.minAlt).toBeUndefined();
      expect(result.maxAlt).toBeUndefined();
      expect(result.fromTs).toBeUndefined();
      expect(result.toTs).toBeUndefined();
      expect(result.geometryType).toBeUndefined();
    });

    it("should pass through geometryType as string", () => {
      const params = {
        geometryType: "Polygon",
      };

      const result = FilterMapper.fromQuery(params);

      expect(result.geometryType).toBe("Polygon");
    });

    it("should handle all filter types together", () => {
      const params = {
        minAlt: "10000",
        maxAlt: "20000",
        from: "2024-01-01T00:00:00Z",
        to: "2024-01-01T12:00:00Z",
        geometryType: "Point",
      };

      const result = FilterMapper.fromQuery(params);

      expect(result.minAlt).toBe(10000);
      expect(result.maxAlt).toBe(20000);
      expect(result.fromTs).toBe(1704067200);
      expect(result.toTs).toBe(1704110400); // 2024-01-01T12:00:00Z
      expect(result.geometryType).toBe("Point");
    });

    it("should handle null and undefined values gracefully", () => {
      const params = {
        minAlt: null,
        maxAlt: undefined,
        from: null,
        to: undefined,
        geometryType: null,
      };

      const result = FilterMapper.fromQuery(params);

      expect(result.minAlt).toBeUndefined();
      expect(result.maxAlt).toBeUndefined();
      expect(result.fromTs).toBeUndefined();
      expect(result.toTs).toBeUndefined();
      expect(result.geometryType).toBeUndefined();
    });

    it("should handle numeric altitude values", () => {
      const params = {
        minAlt: 15000,
        maxAlt: 25000,
      };

      const result = FilterMapper.fromQuery(params);

      expect(result.minAlt).toBe(15000);
      expect(result.maxAlt).toBe(25000);
    });

    it("should handle decimal altitude values", () => {
      const params = {
        minAlt: "15000.5",
        maxAlt: "25000.75",
      };

      const result = FilterMapper.fromQuery(params);

      expect(result.minAlt).toBe(15000.5);
      expect(result.maxAlt).toBe(25000.75);
    });
  });

  describe("toUnix", () => {
    it("should convert valid ISO timestamp to unix seconds", () => {
      const iso = "2024-01-01T00:00:00Z";
      const result = FilterMapper.toUnix(iso);

      expect(result).toBe(1704067200);
    });

    it("should return undefined for invalid ISO timestamp", () => {
      const iso = "invalid-date";
      const result = FilterMapper.toUnix(iso);

      expect(result).toBeUndefined();
    });

    it("should return undefined for empty string", () => {
      const iso = "";
      const result = FilterMapper.toUnix(iso);

      expect(result).toBeUndefined();
    });

    it("should handle ISO timestamp with milliseconds", () => {
      const iso = "2024-01-01T00:00:00.000Z";
      const result = FilterMapper.toUnix(iso);

      expect(result).toBe(1704067200);
    });

    it("should floor the timestamp correctly", () => {
      const iso = "2024-01-01T00:00:00.999Z";
      const result = FilterMapper.toUnix(iso);

      expect(result).toBe(1704067200); // Should be floored, not rounded
    });
  });
});
