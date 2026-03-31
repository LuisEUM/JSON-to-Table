/**
 * Unit tests for type-cache.ts
 *
 * Tests getCached, setCache, clearTypeCache, generateCacheKey.
 */

import {
  getCached,
  setCache,
  clearTypeCache,
  generateCacheKey,
} from "../type-cache";

beforeEach(() => {
  clearTypeCache();
});

/* =========================================================
   Basic get/set
========================================================= */
describe("getCached / setCache", () => {
  it("returns undefined for cache miss", () => {
    expect(getCached("nonexistent")).toBeUndefined();
  });

  it("stores and retrieves a value", () => {
    setCache("key1", { type: "string" });
    expect(getCached("key1")).toEqual({ type: "string" });
  });

  it("stores and retrieves different types", () => {
    setCache("num", 42);
    setCache("str", "hello");
    setCache("obj", { a: 1, b: 2 });

    expect(getCached("num")).toBe(42);
    expect(getCached("str")).toBe("hello");
    expect(getCached("obj")).toEqual({ a: 1, b: 2 });
  });

  it("overwrites existing keys", () => {
    setCache("key", "old");
    setCache("key", "new");
    expect(getCached("key")).toBe("new");
  });
});

/* =========================================================
   TTL expiration
========================================================= */
describe("TTL expiration", () => {
  it("returns undefined for expired entries", () => {
    const realDateNow = Date.now;

    // Set at time 0
    Date.now = jest.fn().mockReturnValue(0);
    setCache("expiring", "value");

    // Retrieve within TTL (at 30 seconds)
    Date.now = jest.fn().mockReturnValue(30_000);
    expect(getCached("expiring")).toBe("value");

    // Retrieve after TTL (at 61 seconds, TTL is 60 seconds)
    Date.now = jest.fn().mockReturnValue(61_000);
    expect(getCached("expiring")).toBeUndefined();

    Date.now = realDateNow;
  });

  it("returns value just before TTL expires", () => {
    const realDateNow = Date.now;

    // Set at time 1000
    Date.now = jest.fn().mockReturnValue(1000);
    setCache("boundary", "value");

    // Exactly at TTL boundary (60_001ms from set time, i.e. diff > 60_000)
    Date.now = jest.fn().mockReturnValue(61_001);
    expect(getCached("boundary")).toBeUndefined();

    // Just before TTL (60_000ms from set time, i.e. diff === 60_000 is NOT > 60_000)
    clearTypeCache();
    Date.now = jest.fn().mockReturnValue(1000);
    setCache("boundary2", "value2");
    Date.now = jest.fn().mockReturnValue(61_000);
    expect(getCached("boundary2")).toBe("value2");

    Date.now = realDateNow;
  });
});

/* =========================================================
   Max cache size eviction
========================================================= */
describe("Max cache size eviction", () => {
  it("evicts oldest entry when max size is reached", () => {
    // Fill cache to max (500 entries)
    for (let i = 0; i < 500; i++) {
      setCache(`key-${i}`, i);
    }

    // Verify first entry exists
    expect(getCached("key-0")).toBe(0);

    // Add one more - should evict the oldest (key-0)
    setCache("key-500", 500);
    expect(getCached("key-0")).toBeUndefined();
    expect(getCached("key-500")).toBe(500);

    // Other entries should still exist
    expect(getCached("key-1")).toBe(1);
    expect(getCached("key-499")).toBe(499);
  });
});

/* =========================================================
   clearTypeCache
========================================================= */
describe("clearTypeCache", () => {
  it("clears all entries", () => {
    setCache("a", 1);
    setCache("b", 2);
    setCache("c", 3);

    expect(getCached("a")).toBe(1);

    clearTypeCache();

    expect(getCached("a")).toBeUndefined();
    expect(getCached("b")).toBeUndefined();
    expect(getCached("c")).toBeUndefined();
  });

  it("allows new entries after clearing", () => {
    setCache("x", 10);
    clearTypeCache();
    setCache("x", 20);
    expect(getCached("x")).toBe(20);
  });
});

/* =========================================================
   generateCacheKey
========================================================= */
describe("generateCacheKey", () => {
  it("produces consistent keys for the same inputs", () => {
    const key1 = generateCacheKey("col", [1, 2, 3]);
    const key2 = generateCacheKey("col", [1, 2, 3]);
    expect(key1).toBe(key2);
  });

  it("produces different keys for different column names", () => {
    const key1 = generateCacheKey("colA", [1, 2]);
    const key2 = generateCacheKey("colB", [1, 2]);
    expect(key1).not.toBe(key2);
  });

  it("produces different keys for different sample values", () => {
    const key1 = generateCacheKey("col", [1, 2]);
    const key2 = generateCacheKey("col", [3, 4]);
    expect(key1).not.toBe(key2);
  });

  it("only uses first 5 sample values", () => {
    const key1 = generateCacheKey("col", [1, 2, 3, 4, 5, 6, 7]);
    const key2 = generateCacheKey("col", [1, 2, 3, 4, 5, 99, 100]);
    // Same first 5 values, so same key
    expect(key1).toBe(key2);
  });

  it("includes type information in the key", () => {
    const key1 = generateCacheKey("col", [1]);
    const key2 = generateCacheKey("col", ["1"]);
    // Different types should produce different keys
    expect(key1).not.toBe(key2);
  });

  it("truncates long values to 20 chars", () => {
    const longString = "a".repeat(100);
    const key = generateCacheKey("col", [longString]);
    // The key should contain only the first 20 chars of the value
    expect(key).toContain("a".repeat(20));
    expect(key).not.toContain("a".repeat(21));
  });

  it("handles empty sample values", () => {
    const key = generateCacheKey("col", []);
    expect(key).toBe("col::");
  });
});
