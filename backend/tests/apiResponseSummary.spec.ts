import { createApiResponseSummary } from "../src/utils/apiResponseSummary";

describe("createApiResponseSummary", () => {
  describe("arrays", () => {
    it("should return array type and length for non-empty arrays", () => {
      const data = [1, 2, 3, 4, 5];
      const summary = createApiResponseSummary(data);

      expect(summary).toEqual({
        type: "array",
        length: 5,
      });
    });

    it("should return array type and length 0 for empty arrays", () => {
      const data: unknown[] = [];
      const summary = createApiResponseSummary(data);

      expect(summary).toEqual({
        type: "array",
        length: 0,
      });
    });

    it("should handle arrays with complex objects", () => {
      const data = [
        { id: 1, name: "test" },
        { id: 2, name: "test2" },
      ];
      const summary = createApiResponseSummary(data);

      expect(summary).toEqual({
        type: "array",
        length: 2,
      });
    });
  });

  describe("generic objects", () => {
    it("should return object type with keys and keyCount", () => {
      const data = {
        key1: "value1",
        key2: "value2",
        key3: "value3",
      };
      const summary = createApiResponseSummary(data);

      expect(summary).toEqual({
        type: "object",
        keys: ["key1", "key2", "key3"],
        keyCount: 3,
      });
    });

    it("should handle empty objects", () => {
      const data = {};
      const summary = createApiResponseSummary(data);

      expect(summary).toEqual({
        type: "object",
        keys: [],
        keyCount: 0,
      });
    });

    it("should handle objects with nested structures", () => {
      const data = {
        nested: {
          deep: {
            value: "test",
          },
        },
        other: "value",
      };
      const summary = createApiResponseSummary(data);

      expect(summary).toEqual({
        type: "object",
        keys: ["nested", "other"],
        keyCount: 2,
      });
    });
  });

  describe("domain-specific keys", () => {
    it("should include sigmetsCount when sigmets array is present", () => {
      const data = {
        sigmets: [
          { id: 1, text: "SIGMET 1" },
          { id: 2, text: "SIGMET 2" },
          { id: 3, text: "SIGMET 3" },
        ],
        other: "value",
      };
      const summary = createApiResponseSummary(data);

      expect(summary).toEqual({
        type: "object",
        keys: ["sigmets", "other"],
        keyCount: 2,
        sigmetsCount: 3,
      });
    });

    it("should include airsigmetsCount when airsigmets array is present", () => {
      const data = {
        airsigmets: [
          { id: 1, text: "AIRSIGMET 1" },
          { id: 2, text: "AIRSIGMET 2" },
        ],
      };
      const summary = createApiResponseSummary(data);

      expect(summary).toEqual({
        type: "object",
        keys: ["airsigmets"],
        keyCount: 1,
        airsigmetsCount: 2,
      });
    });

    it("should include featuresCount when features array is present", () => {
      const data = {
        features: [
          { type: "Feature", geometry: {} },
          { type: "Feature", geometry: {} },
          { type: "Feature", geometry: {} },
          { type: "Feature", geometry: {} },
        ],
        metadata: {},
      };
      const summary = createApiResponseSummary(data);

      expect(summary).toEqual({
        type: "object",
        keys: ["features", "metadata"],
        keyCount: 2,
        featuresCount: 4,
      });
    });

    it("should include itemsCount when items array is present", () => {
      const data = {
        items: [1, 2, 3, 4, 5, 6],
        total: 6,
      };
      const summary = createApiResponseSummary(data);

      expect(summary).toEqual({
        type: "object",
        keys: ["items", "total"],
        keyCount: 2,
        itemsCount: 6,
      });
    });

    it("should include multiple collection counts when multiple keys are present", () => {
      const data = {
        sigmets: [{ id: 1 }],
        airsigmets: [{ id: 1 }, { id: 2 }],
        features: [{ id: 1 }, { id: 2 }, { id: 3 }],
        items: [1, 2, 3, 4],
        other: "value",
      };
      const summary = createApiResponseSummary(data);

      expect(summary).toEqual({
        type: "object",
        keys: ["sigmets", "airsigmets", "features", "items", "other"],
        keyCount: 5,
        sigmetsCount: 1,
        airsigmetsCount: 2,
        featuresCount: 3,
        itemsCount: 4,
      });
    });

    it("should not include count if key exists but is not an array", () => {
      const data = {
        sigmets: "not an array",
        features: 123,
        items: null,
      };
      const summary = createApiResponseSummary(data);

      expect(summary).toEqual({
        type: "object",
        keys: ["sigmets", "features", "items"],
        keyCount: 3,
      });
    });
  });

  describe("invalid inputs", () => {
    it("should handle null", () => {
      const summary = createApiResponseSummary(null);

      expect(summary).toEqual({
        type: "object",
      });
    });

    it("should handle undefined", () => {
      const summary = createApiResponseSummary(undefined);

      expect(summary).toEqual({
        type: "undefined",
      });
    });

    it("should handle string", () => {
      const summary = createApiResponseSummary("string value");

      expect(summary).toEqual({
        type: "string",
      });
    });

    it("should handle number", () => {
      const summary = createApiResponseSummary(123);

      expect(summary).toEqual({
        type: "number",
      });
    });

    it("should handle boolean", () => {
      const summary = createApiResponseSummary(true);

      expect(summary).toEqual({
        type: "boolean",
      });
    });

    it("should handle function", () => {
      const fn = () => {};
      const summary = createApiResponseSummary(fn);

      expect(summary).toEqual({
        type: "function",
      });
    });
  });

  describe("edge cases", () => {
    it("should handle objects with only collection keys", () => {
      const data = {
        sigmets: [],
      };
      const summary = createApiResponseSummary(data);

      expect(summary).toEqual({
        type: "object",
        keys: ["sigmets"],
        keyCount: 1,
        sigmetsCount: 0,
      });
    });

    it("should handle objects with mixed array and non-array values", () => {
      const data = {
        sigmets: [{ id: 1 }],
        metadata: { version: "1.0" },
        count: 5,
        active: true,
      };
      const summary = createApiResponseSummary(data);

      expect(summary).toEqual({
        type: "object",
        keys: ["sigmets", "metadata", "count", "active"],
        keyCount: 4,
        sigmetsCount: 1,
      });
    });

    it("should handle Date objects", () => {
      const data = new Date();
      const summary = createApiResponseSummary(data);

      expect(summary).toEqual({
        type: "object",
        keys: expect.any(Array),
        keyCount: expect.any(Number),
      });
    });
  });
});
