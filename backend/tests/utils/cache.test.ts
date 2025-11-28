import { TTLCache } from "../../src/utils/cache";

describe("TTLCache", () => {
  let cache: TTLCache<string, string>;

  beforeEach(() => {
    cache = new TTLCache<string, string>(1); // 1 second TTL for tests
  });

  afterEach(() => {
    cache.clear();
  });

  it("should store and retrieve values", () => {
    cache.set("key1", "value1");
    expect(cache.get("key1")).toBe("value1");
  });

  it("should return undefined for non-existent keys", () => {
    expect(cache.get("nonexistent")).toBeUndefined();
  });

  it("should return undefined for expired entries", (done) => {
    cache.set("key1", "value1");
    expect(cache.get("key1")).toBe("value1");

    setTimeout(() => {
      expect(cache.get("key1")).toBeUndefined();
      done();
    }, 1100); // Wait slightly more than 1 second
  });

  it("should correctly check if key exists", () => {
    cache.set("key1", "value1");
    expect(cache.has("key1")).toBe(true);
    expect(cache.has("nonexistent")).toBe(false);
  });

  it("should return false for expired entries in has()", (done) => {
    cache.set("key1", "value1");
    expect(cache.has("key1")).toBe(true);

    setTimeout(() => {
      expect(cache.has("key1")).toBe(false);
      done();
    }, 1100);
  });

  it("should delete entries", () => {
    cache.set("key1", "value1");
    cache.delete("key1");
    expect(cache.get("key1")).toBeUndefined();
    expect(cache.has("key1")).toBe(false);
  });

  it("should clear all entries", () => {
    cache.set("key1", "value1");
    cache.set("key2", "value2");
    cache.clear();
    expect(cache.get("key1")).toBeUndefined();
    expect(cache.get("key2")).toBeUndefined();
  });

  it("should handle different value types", () => {
    const objectCache = new TTLCache<string, { data: string }>(10);
    const testObject = { data: "test" };
    objectCache.set("key1", testObject);
    expect(objectCache.get("key1")).toEqual(testObject);
  });
});
