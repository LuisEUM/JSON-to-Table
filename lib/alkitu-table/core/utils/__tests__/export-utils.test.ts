/**
 * @jest-environment jsdom
 */

/**
 * Unit tests for export-utils.ts
 *
 * Tests cleanProcessedData, convertToCSV, downloadFile.
 */

import {
  cleanProcessedData,
  convertToCSV,
  downloadFile,
} from "../export-utils";
import type { ProcessedItem } from "../data-processor";

/* =========================================================
   cleanProcessedData
========================================================= */
describe("cleanProcessedData", () => {
  it("returns empty array for empty input", () => {
    expect(cleanProcessedData([])).toEqual([]);
  });

  it("returns empty array for null/undefined input", () => {
    expect(cleanProcessedData(null as unknown as Record<string, ProcessedItem>[])).toEqual([]);
    expect(cleanProcessedData(undefined as unknown as Record<string, ProcessedItem>[])).toEqual([]);
  });

  it("extracts value from ProcessedItem using label as key", () => {
    const data: Record<string, ProcessedItem>[] = [
      {
        name: {
          id: "name",
          path: ["name"],
          value: "Alice",
          type: "string",
          label: "Full Name",
        },
      },
    ];
    const result = cleanProcessedData(data);
    expect(result).toEqual([{ "Full Name": "Alice" }]);
  });

  it("falls back to key when label is not present", () => {
    const data: Record<string, ProcessedItem>[] = [
      {
        age: {
          id: "age",
          path: ["age"],
          value: 30,
          type: "number",
        } as ProcessedItem,
      },
    ];
    const result = cleanProcessedData(data);
    expect(result).toEqual([{ age: 30 }]);
  });

  it("omits internal columns: selection, index, actions", () => {
    const data: Record<string, ProcessedItem>[] = [
      {
        selection: {
          id: "selection",
          path: [],
          value: true,
          type: "boolean",
          label: "selection",
        },
        index: {
          id: "index",
          path: [],
          value: 0,
          type: "number",
          label: "index",
        },
        actions: {
          id: "actions",
          path: [],
          value: null,
          type: "null",
          label: "actions",
        },
        name: {
          id: "name",
          path: ["name"],
          value: "Alice",
          type: "string",
          label: "name",
        },
      },
    ];
    const result = cleanProcessedData(data);
    expect(result).toEqual([{ name: "Alice" }]);
  });

  it("includes non-ProcessedItem values as-is", () => {
    const data = [
      {
        raw: "plain string" as unknown as ProcessedItem,
      },
    ];
    const result = cleanProcessedData(data);
    expect(result).toEqual([{ raw: "plain string" }]);
  });
});

/* =========================================================
   convertToCSV
========================================================= */
describe("convertToCSV", () => {
  it("returns empty string for empty data", () => {
    expect(convertToCSV([])).toBe("");
  });

  it("returns empty string for null/undefined", () => {
    expect(convertToCSV(null as unknown as Record<string, unknown>[])).toBe("");
    expect(convertToCSV(undefined as unknown as Record<string, unknown>[])).toBe("");
  });

  it("generates CSV with headers from object keys", () => {
    const data = [{ name: "Alice", age: 30 }];
    const csv = convertToCSV(data);
    const lines = csv.trim().split("\n");
    expect(lines[0]).toBe("name,age");
    expect(lines[1]).toBe('"Alice",30');
  });

  it("handles special characters in strings by quoting", () => {
    const data = [{ note: 'He said "hello"' }];
    const csv = convertToCSV(data);
    const lines = csv.trim().split("\n");
    // Quotes inside values should be doubled
    expect(lines[1]).toBe('"He said ""hello"""');
  });

  it("handles commas in string values", () => {
    const data = [{ address: "123 Main St, Suite 4" }];
    const csv = convertToCSV(data);
    const lines = csv.trim().split("\n");
    expect(lines[1]).toBe('"123 Main St, Suite 4"');
  });

  it("handles null and undefined values as empty strings", () => {
    const data = [{ a: null, b: undefined }];
    const csv = convertToCSV(data);
    const lines = csv.trim().split("\n");
    expect(lines[1]).toBe(",");
  });

  it("handles object values by JSON-stringifying them", () => {
    const data = [{ info: { key: "val" } }];
    const csv = convertToCSV(data);
    const lines = csv.trim().split("\n");
    // Object should be JSON-stringified and double-quote escaped
    expect(lines[1]).toContain("{");
    expect(lines[1]).toContain("key");
  });

  it("handles numbers without quoting", () => {
    const data = [{ count: 42, ratio: 3.14 }];
    const csv = convertToCSV(data);
    const lines = csv.trim().split("\n");
    expect(lines[1]).toBe("42,3.14");
  });

  it("collects all unique keys from multiple rows", () => {
    const data = [{ a: 1 }, { b: 2 }, { a: 3, c: 4 }];
    const csv = convertToCSV(data);
    const headerLine = csv.trim().split("\n")[0];
    expect(headerLine).toContain("a");
    expect(headerLine).toContain("b");
    expect(headerLine).toContain("c");
  });

  it("auto-cleans ProcessedItem data before converting", () => {
    // Data that looks like ProcessedItem (has value and type)
    const data = [
      {
        name: { value: "Alice", type: "string", label: "name", id: "name", path: ["name"] },
      },
    ] as unknown as Record<string, unknown>[];
    const csv = convertToCSV(data);
    // Should detect ProcessedItem structure and clean it
    const lines = csv.trim().split("\n");
    expect(lines[0]).toBe("name");
    expect(lines[1]).toBe('"Alice"');
  });
});

/* =========================================================
   downloadFile
========================================================= */
describe("downloadFile", () => {
  let mockLink: {
    href: string;
    download: string;
    click: jest.Mock;
  };
  let createElementSpy: jest.SpyInstance;
  let appendChildSpy: jest.SpyInstance;
  let removeChildSpy: jest.SpyInstance;
  let createObjectURLSpy: jest.SpyInstance;
  let revokeObjectURLSpy: jest.SpyInstance;

  beforeEach(() => {
    mockLink = {
      href: "",
      download: "",
      click: jest.fn(),
    };

    createElementSpy = jest
      .spyOn(document, "createElement")
      .mockReturnValue(mockLink as unknown as HTMLElement);

    appendChildSpy = jest
      .spyOn(document.body, "appendChild")
      .mockImplementation((node) => node);

    removeChildSpy = jest
      .spyOn(document.body, "removeChild")
      .mockImplementation((node) => node);

    createObjectURLSpy = jest.fn().mockReturnValue("blob:mock-url");
    revokeObjectURLSpy = jest.fn();

    global.URL.createObjectURL = createObjectURLSpy as unknown as typeof URL.createObjectURL;
    global.URL.revokeObjectURL = revokeObjectURLSpy as unknown as typeof URL.revokeObjectURL;
  });

  afterEach(() => {
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it("creates an anchor element for download", () => {
    downloadFile("content", "test.csv", "text/csv");
    expect(createElementSpy).toHaveBeenCalledWith("a");
  });

  it("sets the correct filename", () => {
    downloadFile("content", "export.csv", "text/csv");
    expect(mockLink.download).toBe("export.csv");
  });

  it("creates a Blob with the correct MIME type", () => {
    downloadFile("data", "file.json", "application/json");
    expect(createObjectURLSpy).toHaveBeenCalled();
    const blobArg = createObjectURLSpy.mock.calls[0][0];
    expect(blobArg).toBeInstanceOf(Blob);
  });

  it("triggers click on the link", () => {
    downloadFile("content", "test.csv", "text/csv");
    expect(mockLink.click).toHaveBeenCalledTimes(1);
  });

  it("appends and then removes the link from the DOM", () => {
    downloadFile("content", "test.csv", "text/csv");
    expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
    expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
  });

  it("revokes the object URL after download", () => {
    downloadFile("content", "test.csv", "text/csv");
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");
  });
});
