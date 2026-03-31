/**
 * Unit tests for data-processor.ts
 *
 * Tests processValue, processData, processBatchData, flattenObject, isIdField.
 */

import {
  processValue,
  processData,
  processBatchData,
  flattenObject,
  isIdField,
  setLogger,
  type ProcessedItem,
} from "../data-processor";
import { clearTypeCache } from "../type-cache";

// Silence logger during tests
const silentLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

beforeAll(() => {
  setLogger(silentLogger);
});

beforeEach(() => {
  clearTypeCache();
  jest.clearAllMocks();
});

/* =========================================================
   isIdField
========================================================= */
describe("isIdField", () => {
  it('returns true for "id"', () => {
    expect(isIdField("id")).toBe(true);
  });

  it('returns true for "Id" (case-insensitive match)', () => {
    expect(isIdField("Id")).toBe(true);
  });

  it('returns true for "_id"', () => {
    expect(isIdField("_id")).toBe(true);
  });

  it('returns true for "userId" (ends with Id)', () => {
    expect(isIdField("userId")).toBe(true);
  });

  it('returns true for "userID" (ends with ID)', () => {
    expect(isIdField("userID")).toBe(true);
  });

  it('returns true for "idNumber" (starts with id followed by uppercase)', () => {
    expect(isIdField("idNumber")).toBe(true);
  });

  it('returns false for "name"', () => {
    expect(isIdField("name")).toBe(false);
  });

  it('returns false for "email"', () => {
    expect(isIdField("email")).toBe(false);
  });

  it('returns false for "identity" (does not match patterns)', () => {
    // "identity" does not end with Id/ID nor match ^id[A-Z] (lowercase 'e')
    expect(isIdField("identity")).toBe(false);
  });

  it('returns false for "video"', () => {
    expect(isIdField("video")).toBe(false);
  });
});

/* =========================================================
   flattenObject
========================================================= */
describe("flattenObject", () => {
  it("flattens a simple nested object", () => {
    const obj = { a: { b: 1, c: 2 } };
    const result = flattenObject(obj, "");
    expect(result).toEqual({ "a.b": 1, "a.c": 2 });
  });

  it("flattens deeply nested objects", () => {
    const obj = { a: { b: { c: { d: 42 } } } };
    const result = flattenObject(obj, "");
    expect(result).toEqual({ "a.b.c.d": 42 });
  });

  it("keeps top-level primitives untouched", () => {
    const obj = { name: "Alice", age: 30 };
    const result = flattenObject(obj, "");
    expect(result).toEqual({ name: "Alice", age: 30 });
  });

  it("preserves arrays without flattening", () => {
    const obj = { tags: [1, 2, 3] };
    const result = flattenObject(obj, "");
    expect(result).toEqual({ tags: [1, 2, 3] });
  });

  it("handles empty objects", () => {
    const result = flattenObject({}, "");
    expect(result).toEqual({});
  });

  it("uses provided prefix", () => {
    const obj = { x: 10 };
    const result = flattenObject(obj, "root");
    expect(result).toEqual({ "root.x": 10 });
  });

  it("handles null values inside nested objects", () => {
    const obj = { a: { b: null } };
    const result = flattenObject(obj, "");
    expect(result).toEqual({ "a.b": null });
  });

  it("preserves Date instances as leaf values", () => {
    const d = new Date("2024-01-15");
    const obj = { createdAt: d };
    const result = flattenObject(obj, "");
    expect(result).toEqual({ createdAt: d });
  });
});

/* =========================================================
   processValue
========================================================= */
describe("processValue", () => {
  it("processes null values", () => {
    const result = processValue(null, "field", undefined);
    expect(result.type).toBe("null");
    expect(result.value).toBe("null");
  });

  it("processes undefined values", () => {
    const result = processValue(undefined, "field", undefined);
    expect(result.type).toBe("undefined");
    expect(result.value).toBe("undefined");
  });

  it("processes string values", () => {
    const result = processValue("hello", "field", undefined);
    expect(result.type).toBe("string");
    expect(result.value).toBe("hello");
  });

  it("strips surrounding quotes from strings", () => {
    const result = processValue('"quoted"', "field", undefined);
    expect(result.value).toBe("quoted");
  });

  it("processes number values", () => {
    const result = processValue(42, "field", undefined);
    expect(result.type).toBe("number");
    expect(result.value).toBe(42);
  });

  it("processes zero as number", () => {
    const result = processValue(0, "field", undefined);
    expect(result.type).toBe("number");
    expect(result.value).toBe(0);
  });

  it("processes boolean true", () => {
    const result = processValue(true, "field", undefined);
    expect(result.type).toBe("boolean");
    expect(result.value).toBe("true");
  });

  it("processes boolean false", () => {
    const result = processValue(false, "field", undefined);
    expect(result.type).toBe("boolean");
    expect(result.value).toBe("false");
  });

  it("processes arrays of primitives as primitiveArray", () => {
    const result = processValue([1, 2, 3], "field", undefined);
    expect(result.type).toBe("primitiveArray");
    expect(result.items).toHaveLength(3);
  });

  it("processes arrays of objects as objectArray", () => {
    const result = processValue(
      [{ name: "a" }, { name: "b" }],
      "field",
      undefined
    );
    expect(result.type).toBe("objectArray");
    expect(result.items).toHaveLength(2);
  });

  it("processes plain objects", () => {
    const obj = { key: "val" };
    const result = processValue(obj, "field", undefined);
    expect(result.type).toBe("object");
    expect(result.value).toEqual(obj);
  });

  it("processes Date values as date type", () => {
    const d = new Date("2024-06-15T00:00:00Z");
    const result = processValue(d, "field", undefined);
    expect(result.type).toBe("date");
    expect(result.rawValue).toBe(d);
    expect(result.dateValue).toBeInstanceOf(Date);
  });

  it("processes ISO date strings as date type", () => {
    const result = processValue("2024-01-15", "field", undefined);
    expect(result.type).toBe("date");
    expect(result.rawValue).toBe("2024-01-15");
  });

  it("processes reference fields (__parentId)", () => {
    const result = processValue("ref123", "__parentId", undefined);
    expect(result.type).toBe("string");
    expect(result.isReference).toBe(true);
  });

  it("processes objects with __parentId as references", () => {
    const result = processValue(
      { __parentId: "ref456", other: "data" },
      "someField",
      undefined
    );
    expect(result.isReference).toBe(true);
    expect(result.value).toBe("ref456");
  });

  it("sets path from fieldName", () => {
    const result = processValue("test", "a.b.c", undefined);
    expect(result.path).toEqual(["a", "b", "c"]);
  });

  it("sets empty path when fieldName is empty", () => {
    const result = processValue("test", "", undefined);
    expect(result.path).toEqual([]);
  });

  it("handles empty arrays as primitiveArray", () => {
    const result = processValue([], "field", undefined);
    // empty array has length 0, no objects → primitiveArray
    expect(result.type).toBe("primitiveArray");
    expect(result.items).toHaveLength(0);
  });
});

/* =========================================================
   processData
========================================================= */
describe("processData", () => {
  it("processes a flat object into ProcessedItems", () => {
    const data = { name: "Alice", age: 30 };
    const result = processData(data);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);

    const nameItem = result.find((item: ProcessedItem) => item.id === "name");
    expect(nameItem).toBeDefined();
    expect(nameItem!.value).toBe("Alice");
  });

  it("flattens nested objects before processing", () => {
    const data = { user: { name: "Bob", email: "bob@example.com" } };
    const result = processData(data);

    const nameItem = result.find(
      (item: ProcessedItem) => item.id === "user.name"
    );
    expect(nameItem).toBeDefined();
    expect(nameItem!.value).toBe("Bob");
  });

  it("processes empty objects", () => {
    const data = {};
    const result = processData(data);
    expect(result).toEqual([]);
  });

  it("detects id field and sets currentId", () => {
    const data = { id: "abc123", name: "Test" };
    const result = processData(data);
    const nameItem = result.find((item: ProcessedItem) => item.id === "name");
    expect(nameItem!.__parentId).toBe("abc123");
  });

  it("handles objects with null values", () => {
    const data = { name: "Test", address: null };
    const result = processData(data);
    const addressItem = result.find(
      (item: ProcessedItem) => item.id === "address"
    );
    expect(addressItem).toBeDefined();
  });
});

/* =========================================================
   processBatchData
========================================================= */
describe("processBatchData", () => {
  it("returns empty array for empty input", () => {
    const result = processBatchData([], { sampleSize: 100 });
    expect(result).toEqual([]);
  });

  it("processes a simple batch of flat objects", () => {
    const data = [
      { name: "Alice", age: 30 },
      { name: "Bob", age: 25 },
    ];
    const result = processBatchData(data, { sampleSize: 100 });
    expect(result).toHaveLength(2);
    expect(result[0].length).toBeGreaterThan(0);
    expect(result[1].length).toBeGreaterThan(0);
  });

  it("handles nested objects in batch", () => {
    const data = [
      { user: { name: "Alice" }, score: 100 },
      { user: { name: "Bob" }, score: 90 },
    ];
    const result = processBatchData(data, { sampleSize: 100 });
    expect(result).toHaveLength(2);

    // Nested objects should be flattened
    const firstRow = result[0];
    const userName = firstRow.find(
      (item: ProcessedItem) => item.id === "user.name"
    );
    expect(userName).toBeDefined();
  });

  it("detects id fields in batch data", () => {
    const data = [
      { id: "1", name: "Alice" },
      { id: "2", name: "Bob" },
    ];
    const result = processBatchData(data, { sampleSize: 100 });
    const firstRow = result[0];
    const nameItem = firstRow.find(
      (item: ProcessedItem) => item.id === "name"
    );
    expect(nameItem!.__parentId).toBe("1");
  });

  it("accepts custom sampleSize option", () => {
    const data = [{ a: 1 }, { a: 2 }];
    const result = processBatchData(data, { sampleSize: 1 });
    expect(result).toHaveLength(2);
  });
});
