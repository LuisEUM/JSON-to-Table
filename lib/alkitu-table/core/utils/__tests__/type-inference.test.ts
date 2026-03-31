/**
 * Unit tests for type-inference.ts
 *
 * Tests inferTypeFromSample and sub-detectors.
 */

import {
  inferTypeFromSample,
  detectDateType,
  detectNumberType,
  detectBooleanType,
  detectArrayType,
  detectObjectType,
  setTypeInferenceLogger,
} from "../type-inference";
import { clearTypeCache } from "../type-cache";

// Silence logger during tests
const silentLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

beforeAll(() => {
  setTypeInferenceLogger(silentLogger);
});

beforeEach(() => {
  clearTypeCache();
});

/* =========================================================
   detectDateType
========================================================= */
describe("detectDateType", () => {
  it("detects strong date column names immediately (createdAt)", () => {
    const result = detectDateType(["anything"], "createdAt");
    expect(result).not.toBeNull();
    expect(result!.type).toBe("date");
    expect(result!.confidence).toBe(1.0);
  });

  it("detects strong date column names (updatedAt)", () => {
    const result = detectDateType([], "updatedAt");
    expect(result).not.toBeNull();
    expect(result!.type).toBe("date");
  });

  it("detects ISO date strings", () => {
    const values = ["2024-01-15", "2024-02-20", "2024-03-10"];
    const result = detectDateType(values, "someDate");
    expect(result).not.toBeNull();
    expect(result!.type).toBe("date");
  });

  it("detects numeric timestamps in seconds", () => {
    const values = [1700000000, 1710000000, 1720000000];
    const result = detectDateType(values, "timestamp");
    expect(result).not.toBeNull();
    expect(result!.type).toBe("date");
  });

  it("detects numeric timestamps in milliseconds", () => {
    const values = [1700000000000, 1710000000000, 1720000000000];
    const result = detectDateType(values, "createdDate");
    expect(result).not.toBeNull();
    expect(result!.type).toBe("date");
  });

  it("returns null for non-date values", () => {
    const values = ["hello", "world", "foo"];
    const result = detectDateType(values, "name");
    expect(result).toBeNull();
  });

  it("returns null for small numbers", () => {
    const values = [1, 2, 3, 4, 5];
    const result = detectDateType(values, "count");
    expect(result).toBeNull();
  });
});

/* =========================================================
   detectNumberType
========================================================= */
describe("detectNumberType", () => {
  it("detects pure number values", () => {
    const values = [1, 2, 3];
    const result = detectNumberType(values, "count");
    expect(result).not.toBeNull();
    expect(result!.type).toBe("number");
  });

  it("detects all-zero values as number", () => {
    const values = [0, 0, 0];
    const result = detectNumberType(values, "score");
    expect(result).not.toBeNull();
    expect(result!.type).toBe("number");
  });

  it("detects nested stats properties as number", () => {
    const values = [10, 20, 30];
    const result = detectNumberType(values, "stats.hp");
    expect(result).not.toBeNull();
    expect(result!.type).toBe("number");
  });

  it("returns null for string values that look like phone numbers", () => {
    const values = ["12345", "67890"];
    const result = detectNumberType(values, "phone");
    expect(result).toBeNull();
  });

  it("returns null for mixed types", () => {
    const values = [1, "hello", 3];
    const result = detectNumberType(values, "mixed");
    expect(result).toBeNull();
  });
});

/* =========================================================
   detectBooleanType
========================================================= */
describe("detectBooleanType", () => {
  it("detects true/false values", () => {
    const values = [true, false, true, false];
    const result = detectBooleanType(values);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("boolean");
  });

  it("detects 0/1 values as boolean", () => {
    const values = [0, 1, 1, 0, 1];
    const result = detectBooleanType(values);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("boolean");
  });

  it('detects "0"/"1" string values as boolean', () => {
    const values = ["0", "1", "1", "0"];
    const result = detectBooleanType(values);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("boolean");
  });

  it("returns null when less than 95% are boolean-like", () => {
    const values = [true, false, "maybe", "sometimes", 42];
    const result = detectBooleanType(values);
    expect(result).toBeNull();
  });
});

/* =========================================================
   detectArrayType
========================================================= */
describe("detectArrayType", () => {
  it("detects arrays of objects as objectArray", () => {
    const values = [[{ name: "a" }], [{ name: "b" }]];
    const result = detectArrayType(values, "items");
    expect(result).not.toBeNull();
    expect(result!.type).toBe("objectArray");
  });

  it("detects arrays of primitives as primitiveArray", () => {
    const values = [[1, 2, 3], [4, 5]];
    const result = detectArrayType(values, "tags");
    expect(result).not.toBeNull();
    expect(result!.type).toBe("primitiveArray");
  });

  it("uses column name pattern for empty arrays", () => {
    const values = [[], []];
    // "itemsList" contains "items" so it matches the pattern
    expect(detectArrayType(values, "itemsList")).not.toBeNull();
    // Test with a matching name
    const result2 = detectArrayType(values, "orderItems");
    expect(result2).not.toBeNull();
    expect(result2!.type).toBe("objectArray");
  });

  it("returns null when no arrays are present", () => {
    const values = ["hello", "world"];
    const result = detectArrayType(values, "name");
    expect(result).toBeNull();
  });

  it("detects [object Object] strings as objectArray", () => {
    const values = ["[object Object],[object Object]"];
    const result = detectArrayType(values, "data");
    expect(result).not.toBeNull();
    expect(result!.type).toBe("objectArray");
  });
});

/* =========================================================
   detectObjectType
========================================================= */
describe("detectObjectType", () => {
  it("detects objects with pattern-matching column names", () => {
    const values = [{ street: "Main St" }, null];
    const result = detectObjectType(values, "billAddress");
    expect(result).not.toBeNull();
    expect(result!.type).toBe("object");
  });

  it("detects objects when more than 10% of values are objects", () => {
    const values = [
      { a: 1 },
      { b: 2 },
      "string",
      "string",
      "string",
      "string",
      "string",
      "string",
    ];
    const result = detectObjectType(values, "data");
    expect(result).not.toBeNull();
    expect(result!.type).toBe("object");
  });

  it("returns null for pure primitives", () => {
    const values = ["hello", "world", "foo"];
    const result = detectObjectType(values, "name");
    expect(result).toBeNull();
  });

  it("returns null for arrays", () => {
    const values = [[1, 2], [3, 4]];
    const result = detectObjectType(values, "items");
    expect(result).toBeNull();
  });
});

/* =========================================================
   inferTypeFromSample (main orchestrator)
========================================================= */
describe("inferTypeFromSample", () => {
  it("returns string for empty sample", () => {
    const result = inferTypeFromSample([], "col");
    expect(result.type).toBe("string");
  });

  it("infers string for text values", () => {
    const result = inferTypeFromSample(["hello", "world"], "name");
    expect(result.type).toBe("string");
  });

  it("infers number for small numeric values", () => {
    const result = inferTypeFromSample([1, 2, 3], "count");
    expect(result.type).toBe("number");
    expect(result.normalizer(42)).toBe(42);
  });

  it("infers boolean for boolean values", () => {
    const result = inferTypeFromSample([true, false, true, false], "active");
    expect(result.type).toBe("boolean");
    expect(result.normalizer(1)).toBe(true);
    expect(result.normalizer(0)).toBe(false);
  });

  it("infers date for ISO date strings", () => {
    const result = inferTypeFromSample(
      ["2024-01-15", "2024-02-20", "2024-03-10"],
      "startDate"
    );
    expect(result.type).toBe("date");
  });

  it("infers date for createdAt field name (strong date column)", () => {
    const result = inferTypeFromSample([1700000000], "createdAt");
    expect(result.type).toBe("date");
  });

  it("infers objectArray for notes field name pattern", () => {
    const result = inferTypeFromSample(["some text"], "notes");
    expect(result.type).toBe("objectArray");
  });

  it("infers objectArray for comments field name pattern", () => {
    const result = inferTypeFromSample(["text"], "comments");
    expect(result.type).toBe("objectArray");
  });

  it("infers primitiveArray for arrays of primitives", () => {
    const result = inferTypeFromSample(
      [[1, 2, 3], [4, 5]],
      "scores"
    );
    expect(result.type).toBe("primitiveArray");
  });

  it("infers objectArray for arrays of objects", () => {
    const result = inferTypeFromSample(
      [[{ name: "a" }], [{ name: "b" }]],
      "records"
    );
    expect(result.type).toBe("objectArray");
  });

  it("infers object for object values", () => {
    const values = [{ street: "Main" }, null, { street: "Oak" }];
    const result = inferTypeFromSample(values, "shippingAddress");
    expect(result.type).toBe("object");
  });

  it("infers string for mixed types that do not strongly match", () => {
    const result = inferTypeFromSample(
      ["hello", 42, true],
      "mixed"
    );
    expect(result.type).toBe("string");
  });

  it("uses cache for repeated calls with same inputs", () => {
    const values = ["2024-01-15", "2024-02-20"];
    const result1 = inferTypeFromSample(values, "dateCol");
    const result2 = inferTypeFromSample(values, "dateCol");
    // Same reference from cache
    expect(result1).toBe(result2);
  });

  it("normalizer for string returns cleaned value", () => {
    const result = inferTypeFromSample(["hello"], "text");
    expect(result.normalizer('"quoted"')).toBe("quoted");
    expect(result.normalizer(null)).toBe("");
  });

  it("normalizer for number handles strings", () => {
    const result = inferTypeFromSample([1, 2, 3], "qty");
    expect(result.normalizer("42")).toBe(42);
    expect(result.normalizer(null)).toBe(0);
  });

  it("infers string for postal code columns", () => {
    const result = inferTypeFromSample(["12345", "67890"], "address.postalCode");
    // Nested property with postal pattern
    expect(result.type).toBe("string");
  });
});
