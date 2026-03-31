/**
 * Unit tests for processed-value-filter.ts
 *
 * Tests processedValueFilter with all operators.
 */

import {
  processedValueFilter,
  extractPropertyValues,
} from "../processed-value-filter";
import type {
  ProcessedItem,
  ProcessedRow,
} from "../../utils/data-processor";

// Silence logger
jest.mock("../../services/logging-service", () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    setLevel: jest.fn(),
    getLevel: jest.fn(),
  },
}));

/* =========================================================
   Helpers
========================================================= */
function makeRow(
  columnId: string,
  value: unknown,
  type: string = "string",
  extras: Partial<ProcessedItem> = {}
): { row: { original: ProcessedRow }; columnId: string } {
  const processedItem: ProcessedItem = {
    id: columnId,
    path: [columnId],
    value,
    type,
    label: columnId,
    ...extras,
  };
  return {
    row: {
      original: { [columnId]: processedItem } as ProcessedRow,
    },
    columnId,
  };
}

function callFilter(
  columnId: string,
  value: unknown,
  type: string,
  filterValue: unknown,
  extras?: Partial<ProcessedItem>
): boolean {
  const { row } = makeRow(columnId, value, type, extras);
  return processedValueFilter(
    row as unknown as Parameters<typeof processedValueFilter>[0],
    columnId,
    filterValue,
    jest.fn()
  );
}

/* =========================================================
   No filter / invalid filter
========================================================= */
describe("processedValueFilter - no filter", () => {
  it("returns true when filterValue is null", () => {
    expect(callFilter("col", "val", "string", null)).toBe(true);
  });

  it("returns true when filterValue has no operator", () => {
    expect(callFilter("col", "val", "string", { value: "x" })).toBe(true);
  });

  it("returns false when column is missing from row", () => {
    const row = { original: {} as ProcessedRow };
    const result = processedValueFilter(
      row as unknown as Parameters<typeof processedValueFilter>[0],
      "missingCol",
      { operator: "equals", value: "x", field: "missingCol" },
      jest.fn()
    );
    expect(result).toBe(false);
  });
});

/* =========================================================
   arrIncludesSome
========================================================= */
describe("processedValueFilter - arrIncludesSome", () => {
  it("matches text value against array of filter values", () => {
    const result = callFilter("status", "active", "string", {
      operator: "arrIncludesSome",
      value: ["active", "pending"],
      field: "status",
    });
    expect(result).toBe(true);
  });

  it("does not match when value is not in filter array", () => {
    const result = callFilter("status", "deleted", "string", {
      operator: "arrIncludesSome",
      value: ["active", "pending"],
      field: "status",
    });
    expect(result).toBe(false);
  });

  it("handles numeric columns with exact comparison", () => {
    const result = callFilter("score", 42, "number", {
      operator: "arrIncludesSome",
      value: [42, 100],
      field: "score",
    });
    expect(result).toBe(true);
  });

  it("returns false for numeric column when value does not match", () => {
    const result = callFilter("score", 50, "number", {
      operator: "arrIncludesSome",
      value: [42, 100],
      field: "score",
    });
    expect(result).toBe(false);
  });

  it("handles objectArray with items", () => {
    const result = callFilter(
      "tags",
      ["a", "b"],
      "objectArray",
      {
        operator: "arrIncludesSome",
        value: ["a"],
        field: "tags",
      },
      {
        items: [
          { value: "a", type: "string", path: [], label: "tag", id: "tag0" },
          { value: "b", type: "string", path: [], label: "tag", id: "tag1" },
        ] as unknown as ProcessedItem[],
      }
    );
    expect(result).toBe(true);
  });
});

/* =========================================================
   in
========================================================= */
describe("processedValueFilter - in", () => {
  it("matches when value is in the filter list", () => {
    const result = callFilter("name", "Alice", "string", {
      operator: "in",
      value: ["Alice", "Bob"],
      field: "name",
    });
    expect(result).toBe(true);
  });

  it("does not match when value is not in the filter list", () => {
    const result = callFilter("name", "Charlie", "string", {
      operator: "in",
      value: ["Alice", "Bob"],
      field: "name",
    });
    expect(result).toBe(false);
  });
});

/* =========================================================
   notIn
========================================================= */
describe("processedValueFilter - notIn", () => {
  it("returns true when value is not in the exclusion list", () => {
    const result = callFilter("name", "Charlie", "string", {
      operator: "notIn",
      value: ["Alice", "Bob"],
      field: "name",
    });
    expect(result).toBe(true);
  });

  it("returns false when value is in the exclusion list", () => {
    const result = callFilter("name", "Alice", "string", {
      operator: "notIn",
      value: ["Alice", "Bob"],
      field: "name",
    });
    expect(result).toBe(false);
  });
});

/* =========================================================
   equals
========================================================= */
describe("processedValueFilter - equals", () => {
  it("returns true for exact match", () => {
    const result = callFilter("status", "active", "string", {
      operator: "equals",
      value: "active",
      field: "status",
    });
    expect(result).toBe(true);
  });

  it("returns false for non-match", () => {
    const result = callFilter("status", "inactive", "string", {
      operator: "equals",
      value: "active",
      field: "status",
    });
    expect(result).toBe(false);
  });
});

/* =========================================================
   notEquals
========================================================= */
describe("processedValueFilter - notEquals", () => {
  it("returns true when values differ", () => {
    const result = callFilter("status", "inactive", "string", {
      operator: "notEquals",
      value: "active",
      field: "status",
    });
    expect(result).toBe(true);
  });

  it("returns false when values match", () => {
    const result = callFilter("status", "active", "string", {
      operator: "notEquals",
      value: "active",
      field: "status",
    });
    expect(result).toBe(false);
  });
});

/* =========================================================
   contains
========================================================= */
describe("processedValueFilter - contains", () => {
  it("returns true when value contains substring", () => {
    const result = callFilter("desc", "hello world", "string", {
      operator: "contains",
      value: "world",
      field: "desc",
    });
    expect(result).toBe(true);
  });

  it("is case-insensitive", () => {
    const result = callFilter("desc", "Hello World", "string", {
      operator: "contains",
      value: "hello",
      field: "desc",
    });
    expect(result).toBe(true);
  });

  it("returns false when substring is not found", () => {
    const result = callFilter("desc", "hello world", "string", {
      operator: "contains",
      value: "xyz",
      field: "desc",
    });
    expect(result).toBe(false);
  });
});

/* =========================================================
   notContains
========================================================= */
describe("processedValueFilter - notContains", () => {
  it("returns true when value does not contain substring", () => {
    const result = callFilter("desc", "hello", "string", {
      operator: "notContains",
      value: "world",
      field: "desc",
    });
    expect(result).toBe(true);
  });

  it("returns false when value contains substring", () => {
    const result = callFilter("desc", "hello world", "string", {
      operator: "notContains",
      value: "world",
      field: "desc",
    });
    expect(result).toBe(false);
  });
});

/* =========================================================
   startsWith
========================================================= */
describe("processedValueFilter - startsWith", () => {
  it("returns true when value starts with prefix", () => {
    const result = callFilter("name", "Alice Smith", "string", {
      operator: "startsWith",
      value: "alice",
      field: "name",
    });
    expect(result).toBe(true);
  });

  it("returns false when value does not start with prefix", () => {
    const result = callFilter("name", "Bob Smith", "string", {
      operator: "startsWith",
      value: "alice",
      field: "name",
    });
    expect(result).toBe(false);
  });
});

/* =========================================================
   endsWith
========================================================= */
describe("processedValueFilter - endsWith", () => {
  it("returns true when value ends with suffix", () => {
    const result = callFilter("email", "user@example.com", "string", {
      operator: "endsWith",
      value: ".com",
      field: "email",
    });
    expect(result).toBe(true);
  });

  it("returns false when value does not end with suffix", () => {
    const result = callFilter("email", "user@example.org", "string", {
      operator: "endsWith",
      value: ".com",
      field: "email",
    });
    expect(result).toBe(false);
  });
});

/* =========================================================
   greaterThan
========================================================= */
describe("processedValueFilter - greaterThan", () => {
  it("returns true when value is greater", () => {
    const result = callFilter("age", 30, "number", {
      operator: "greaterThan",
      value: 25,
      field: "age",
    });
    expect(result).toBe(true);
  });

  it("returns false when value is equal", () => {
    const result = callFilter("age", 25, "number", {
      operator: "greaterThan",
      value: 25,
      field: "age",
    });
    expect(result).toBe(false);
  });

  it("returns false when value is less", () => {
    const result = callFilter("age", 20, "number", {
      operator: "greaterThan",
      value: 25,
      field: "age",
    });
    expect(result).toBe(false);
  });
});

/* =========================================================
   lessThan
========================================================= */
describe("processedValueFilter - lessThan", () => {
  it("returns true when value is less", () => {
    const result = callFilter("age", 20, "number", {
      operator: "lessThan",
      value: 25,
      field: "age",
    });
    expect(result).toBe(true);
  });

  it("returns false when value is equal", () => {
    const result = callFilter("age", 25, "number", {
      operator: "lessThan",
      value: 25,
      field: "age",
    });
    expect(result).toBe(false);
  });

  it("returns false when value is greater", () => {
    const result = callFilter("age", 30, "number", {
      operator: "lessThan",
      value: 25,
      field: "age",
    });
    expect(result).toBe(false);
  });
});

/* =========================================================
   between
========================================================= */
describe("processedValueFilter - between", () => {
  it("returns true when value is within range", () => {
    const result = callFilter("age", 25, "number", {
      operator: "between",
      value: 20,
      additionalValue: 30,
      field: "age",
    });
    expect(result).toBe(true);
  });

  it("returns true at lower boundary (inclusive)", () => {
    const result = callFilter("age", 20, "number", {
      operator: "between",
      value: 20,
      additionalValue: 30,
      field: "age",
    });
    expect(result).toBe(true);
  });

  it("returns true at upper boundary (inclusive)", () => {
    const result = callFilter("age", 30, "number", {
      operator: "between",
      value: 20,
      additionalValue: 30,
      field: "age",
    });
    expect(result).toBe(true);
  });

  it("returns false when value is outside range", () => {
    const result = callFilter("age", 35, "number", {
      operator: "between",
      value: 20,
      additionalValue: 30,
      field: "age",
    });
    expect(result).toBe(false);
  });

  it("returns false when value or additionalValue is undefined", () => {
    const result = callFilter("age", 25, "number", {
      operator: "between",
      value: undefined,
      additionalValue: undefined,
      field: "age",
    });
    expect(result).toBe(false);
  });
});

/* =========================================================
   isNull
========================================================= */
describe("processedValueFilter - isNull", () => {
  it("returns true for null value", () => {
    const result = callFilter("field", null, "null", {
      operator: "isNull",
      value: null,
      field: "field",
    });
    expect(result).toBe(true);
  });

  it("returns true for undefined value", () => {
    const result = callFilter("field", undefined, "undefined", {
      operator: "isNull",
      value: null,
      field: "field",
    });
    expect(result).toBe(true);
  });

  it("returns false for non-null value", () => {
    const result = callFilter("field", "hello", "string", {
      operator: "isNull",
      value: null,
      field: "field",
    });
    expect(result).toBe(false);
  });
});

/* =========================================================
   isNotNull
========================================================= */
describe("processedValueFilter - isNotNull", () => {
  it("returns true for non-null value", () => {
    const result = callFilter("field", "hello", "string", {
      operator: "isNotNull",
      value: null,
      field: "field",
    });
    expect(result).toBe(true);
  });

  it("returns false for null value", () => {
    const result = callFilter("field", null, "null", {
      operator: "isNotNull",
      value: null,
      field: "field",
    });
    expect(result).toBe(false);
  });
});

/* =========================================================
   objectPropertyFilter
========================================================= */
describe("processedValueFilter - objectPropertyFilter", () => {
  it("matches object property values (include mode)", () => {
    const result = callFilter(
      "info",
      { name: "Alice", role: "admin" },
      "object",
      {
        operator: "objectPropertyFilter",
        value: ["alice"],
        additionalValue: "include",
        field: "info",
      }
    );
    expect(result).toBe(true);
  });

  it("does not match non-existent property values (include mode)", () => {
    const result = callFilter(
      "info",
      { name: "Alice", role: "admin" },
      "object",
      {
        operator: "objectPropertyFilter",
        value: ["bob"],
        additionalValue: "include",
        field: "info",
      }
    );
    expect(result).toBe(false);
  });

  it("works in exclude mode", () => {
    const result = callFilter(
      "info",
      { name: "Alice", role: "admin" },
      "object",
      {
        operator: "objectPropertyFilter",
        value: ["alice"],
        additionalValue: "exclude",
        field: "info",
      }
    );
    // Exclude mode: match found means filter OUT, so return false
    expect(result).toBe(false);
  });

  it("returns false when filter value is not an array", () => {
    const result = callFilter("info", { name: "Alice" }, "object", {
      operator: "objectPropertyFilter",
      value: "alice",
      field: "info",
    });
    expect(result).toBe(false);
  });
});

/* =========================================================
   extractPropertyValues
========================================================= */
describe("extractPropertyValues", () => {
  it("extracts values from flat objects", () => {
    const result = extractPropertyValues({ name: "Alice", age: 30 });
    expect(result).toContain("alice");
    expect(result).toContain("30");
  });

  it("extracts values from arrays of objects", () => {
    const result = extractPropertyValues([
      { name: "Alice" },
      { name: "Bob" },
    ]);
    expect(result).toContain("alice");
    expect(result).toContain("bob");
  });

  it("extracts values from nested objects", () => {
    const result = extractPropertyValues({
      user: { name: "Alice" },
    });
    expect(result).toContain("alice");
  });

  it("handles primitive values", () => {
    const result = extractPropertyValues("Hello");
    expect(result).toContain("hello");
  });

  it("handles arrays of primitives", () => {
    const result = extractPropertyValues([1, 2, 3]);
    expect(result).toContain("1");
    expect(result).toContain("2");
    expect(result).toContain("3");
  });

  it("skips null and undefined values in objects", () => {
    const result = extractPropertyValues({ a: null, b: undefined, c: "val" });
    expect(result).toContain("val");
    expect(result).not.toContain("null");
    expect(result).not.toContain("undefined");
  });
});

/* =========================================================
   default operator
========================================================= */
describe("processedValueFilter - default/unknown operator", () => {
  it("returns true for unknown operators", () => {
    const result = callFilter("col", "val", "string", {
      operator: "unknownOp",
      value: "x",
      field: "col",
    });
    expect(result).toBe(true);
  });
});
