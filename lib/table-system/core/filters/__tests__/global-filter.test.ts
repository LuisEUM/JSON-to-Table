/**
 * Unit tests for global-filter.ts
 *
 * Tests globalFilterFn for searching across different value types.
 */

import { globalFilterFn } from "../global-filter";
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
  columns: Record<string, { value: unknown; type: string; items?: unknown[] }>
): Parameters<typeof globalFilterFn>[0] {
  const original: ProcessedRow = {};
  for (const [key, col] of Object.entries(columns)) {
    original[key] = {
      id: key,
      path: [key],
      value: col.value,
      type: col.type,
      label: key,
      items: col.items,
    } as ProcessedItem;
  }
  return {
    original,
    id: "row-1",
  } as unknown as Parameters<typeof globalFilterFn>[0];
}

function callGlobalFilter(
  row: Parameters<typeof globalFilterFn>[0],
  searchTerm: string
): boolean {
  return globalFilterFn(row, "all", searchTerm, jest.fn());
}

/* =========================================================
   Empty search term
========================================================= */
describe("globalFilterFn - empty search", () => {
  it("returns true for empty string", () => {
    const row = makeRow({ name: { value: "Alice", type: "string" } });
    expect(callGlobalFilter(row, "")).toBe(true);
  });
});

/* =========================================================
   String values
========================================================= */
describe("globalFilterFn - string values", () => {
  it("finds matching string value", () => {
    const row = makeRow({ name: { value: "Alice Smith", type: "string" } });
    expect(callGlobalFilter(row, "alice")).toBe(true);
  });

  it("is case-insensitive", () => {
    const row = makeRow({ name: { value: "Alice", type: "string" } });
    expect(callGlobalFilter(row, "ALICE")).toBe(true);
  });

  it("returns false when no match", () => {
    const row = makeRow({ name: { value: "Alice", type: "string" } });
    expect(callGlobalFilter(row, "bob")).toBe(false);
  });

  it("matches partial strings", () => {
    const row = makeRow({ email: { value: "alice@example.com", type: "string" } });
    expect(callGlobalFilter(row, "example")).toBe(true);
  });
});

/* =========================================================
   Number values
========================================================= */
describe("globalFilterFn - number values", () => {
  it("finds matching number value", () => {
    const row = makeRow({ age: { value: 42, type: "number" } });
    expect(callGlobalFilter(row, "42")).toBe(true);
  });

  it("finds partial number match", () => {
    const row = makeRow({ price: { value: 1234, type: "number" } });
    expect(callGlobalFilter(row, "123")).toBe(true);
  });

  it("returns false for non-matching number", () => {
    const row = makeRow({ age: { value: 42, type: "number" } });
    expect(callGlobalFilter(row, "99")).toBe(false);
  });
});

/* =========================================================
   Date values
========================================================= */
describe("globalFilterFn - date values", () => {
  it("finds matching date string", () => {
    const row = makeRow({
      created: { value: "15-01-2024", type: "date" },
    });
    expect(callGlobalFilter(row, "2024")).toBe(true);
  });

  it("finds day in date string", () => {
    const row = makeRow({
      created: { value: "15-01-2024", type: "date" },
    });
    expect(callGlobalFilter(row, "15")).toBe(true);
  });
});

/* =========================================================
   Boolean values
========================================================= */
describe("globalFilterFn - boolean values", () => {
  it("matches verdadero for true values", () => {
    const row = makeRow({ active: { value: true, type: "boolean" } });
    expect(callGlobalFilter(row, "verdadero")).toBe(true);
  });

  it("matches falso for false values", () => {
    const row = makeRow({ active: { value: false, type: "boolean" } });
    expect(callGlobalFilter(row, "falso")).toBe(true);
  });

  it("does not match verdadero for false values", () => {
    const row = makeRow({ active: { value: false, type: "boolean" } });
    expect(callGlobalFilter(row, "verdadero")).toBe(false);
  });
});

/* =========================================================
   Array values
========================================================= */
describe("globalFilterFn - array values", () => {
  it("searches within array items", () => {
    const row = makeRow({
      tags: {
        value: ["red", "blue", "green"],
        type: "primitiveArray",
        items: [
          { value: "red", type: "string", path: [], label: "tag" },
          { value: "blue", type: "string", path: [], label: "tag" },
          { value: "green", type: "string", path: [], label: "tag" },
        ],
      },
    });
    expect(callGlobalFilter(row, "blue")).toBe(true);
  });

  it("returns false when array does not contain match", () => {
    const row = makeRow({
      tags: {
        value: ["red", "blue"],
        type: "primitiveArray",
        items: [
          { value: "red", type: "string", path: [], label: "tag" },
          { value: "blue", type: "string", path: [], label: "tag" },
        ],
      },
    });
    expect(callGlobalFilter(row, "yellow")).toBe(false);
  });
});

/* =========================================================
   Nested object search (recursive)
========================================================= */
describe("globalFilterFn - nested objects", () => {
  it("searches recursively in nested objects", () => {
    const row = makeRow({
      user: {
        value: { name: "Alice", email: "alice@test.com" },
        type: "object",
      },
    });
    // globalFilterFn searches recursively through objects
    expect(callGlobalFilter(row, "alice@test")).toBe(true);
  });

  it("finds nested values deep in objects", () => {
    const row = makeRow({
      config: {
        value: { settings: { theme: "dark" } },
        type: "object",
      },
    });
    expect(callGlobalFilter(row, "dark")).toBe(true);
  });
});

/* =========================================================
   Multi-column search
========================================================= */
describe("globalFilterFn - multi-column search", () => {
  it("searches across all columns", () => {
    const row = makeRow({
      name: { value: "Alice", type: "string" },
      email: { value: "bob@example.com", type: "string" },
      age: { value: 30, type: "number" },
    });
    // Search should match in the email column
    expect(callGlobalFilter(row, "bob")).toBe(true);
  });

  it("returns false when no column matches", () => {
    const row = makeRow({
      name: { value: "Alice", type: "string" },
      age: { value: 30, type: "number" },
    });
    expect(callGlobalFilter(row, "xyz")).toBe(false);
  });
});
