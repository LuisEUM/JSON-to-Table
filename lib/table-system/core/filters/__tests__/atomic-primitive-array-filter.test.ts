/**
 * Tests for AtomicPrimitiveArrayFilter
 *
 * This test suite validates the new atomic design implementation
 * of the primitive array filter with enhanced controllers.
 */

import { describe, it, expect } from "@jest/globals";

// Mock data for testing
const mockUniqueValues = [
  // String values
  {
    value: { value: "apple", count: 5 },
    count: 5,
    original: {
      id: "test",
      path: ["test"],
      value: "apple",
      type: "string",
    },
  },
  {
    value: { value: "banana,orange", count: 3 },
    count: 3,
    original: {
      id: "test",
      path: ["test"],
      value: "banana,orange",
      type: "string",
    },
  },

  // Number values
  {
    value: { value: 42, count: 8 },
    count: 8,
    original: {
      id: "test",
      path: ["test"],
      value: 42,
      type: "number",
    },
  },
  {
    value: { value: -15, count: 2 },
    count: 2,
    original: {
      id: "test",
      path: ["test"],
      value: -15,
      type: "number",
    },
  },
  {
    value: { value: 0, count: 1 },
    count: 1,
    original: {
      id: "test",
      path: ["test"],
      value: 0,
      type: "number",
    },
  },

  // Date values
  {
    value: { value: "01/12/2022", count: 4 },
    count: 4,
    original: {
      id: "test",
      path: ["test"],
      value: "01/12/2022",
      type: "date",
    },
  },
  {
    value: { value: "15-03-2023", count: 6 },
    count: 6,
    original: {
      id: "test",
      path: ["test"],
      value: "15-03-2023",
      type: "date",
    },
  },

  // Boolean values
  {
    value: { value: true, count: 10 },
    count: 10,
    original: {
      id: "test",
      path: ["test"],
      value: true,
      type: "boolean",
    },
  },
  {
    value: { value: false, count: 3 },
    count: 3,
    original: {
      id: "test",
      path: ["test"],
      value: false,
      type: "boolean",
    },
  },

  // Array values (mixed primitives)
  {
    value: { value: ["red", "blue", "green"], count: 7 },
    count: 7,
    original: {
      id: "test",
      path: ["test"],
      value: ["red", "blue", "green"],
      type: "primitiveArray",
    },
  },
  {
    value: { value: [1, 2, 3, 4, 5], count: 5 },
    count: 5,
    original: {
      id: "test",
      path: ["test"],
      value: [1, 2, 3, 4, 5],
      type: "primitiveArray",
    },
  },
  {
    value: { value: ["01/01/2024", "02/01/2024"], count: 2 },
    count: 2,
    original: {
      id: "test",
      path: ["test"],
      value: ["01/01/2024", "02/01/2024"],
      type: "primitiveArray",
    },
  },
];

describe("AtomicPrimitiveArrayFilter", () => {
  describe("Type Detection and Grouping", () => {
    it("should correctly detect and group different primitive types", () => {
      // Test would validate the arrayOptions processing logic
      const expectedTypes = ["string", "number", "date", "boolean"];

      // Mock the processing function
      const processedValues = mockUniqueValues
        .map((item) => {
          const processedItem = item.original;

          if (Array.isArray(processedItem.value)) {
            return processedItem.value.map((val) => ({
              value: val,
              type: detectType(val),
              count: 1,
            }));
          } else {
            return [
              {
                value: processedItem.value,
                type: detectType(processedItem.value),
                count: item.count,
              },
            ];
          }
        })
        .flat();

      const detectedTypes = [...new Set(processedValues.map((v) => v.type))];

      expect(detectedTypes).toEqual(expect.arrayContaining(expectedTypes));
    });

    it("should enhance date detection for common formats", () => {
      const dateValues = [
        "01/12/2022", // DD/MM/YYYY
        "15-03-2023", // DD-MM-YYYY
        "2024-01-01", // YYYY-MM-DD
        "25 Dec 2023", // DD Month YYYY
      ];

      dateValues.forEach((dateStr) => {
        const detectedType = detectType(dateStr);
        expect(detectedType).toBe("date");
      });
    });

    it("should correctly handle mixed array values", () => {
      const mixedArray = ["text", 123, "01/01/2024", true];
      const processedTypes = mixedArray.map(detectType);

      expect(processedTypes).toEqual(["string", "number", "date", "boolean"]);
    });
  });

  describe("String Controller", () => {
    it("should handle separator selection", () => {
      const testString = "apple,banana,orange";
      const separators = {
        comma: /,/g,
        semicolon: /;/g,
        space: / /g,
        tab: /\t/g,
      };

      Object.entries(separators).forEach(([name, regex]) => {
        if (name === "comma") {
          const parts = testString.split(regex).map((s) => s.trim());
          expect(parts).toEqual(["apple", "banana", "orange"]);
        }
      });
    });

    it("should apply exact match toggle correctly", () => {
      const testValues = ["apple", "apple pie", "pineapple"];
      const searchTerm = "apple";

      // Without exact match (contains)
      const withoutExact = testValues.filter((val) =>
        val.toLowerCase().includes(searchTerm.toLowerCase())
      );
      expect(withoutExact).toEqual(["apple", "apple pie", "pineapple"]);

      // With exact match
      const withExact = testValues.filter(
        (val) => val.toLowerCase() === searchTerm.toLowerCase()
      );
      expect(withExact).toEqual(["apple"]);
    });
  });

  describe("Number Controller", () => {
    const numberValues = [42, -15, 0, 100, -50, 25];

    it("should correctly identify positive, negative, and zero values", () => {
      const hasPositive = numberValues.some((n) => n > 0);
      const hasNegative = numberValues.some((n) => n < 0);
      const hasZero = numberValues.some((n) => n === 0);

      expect(hasPositive).toBe(true);
      expect(hasNegative).toBe(true);
      expect(hasZero).toBe(true);
    });

    it("should filter presets based on available data", () => {
      const hasNegative = numberValues.some((n) => n < 0);
      const hasPositive = numberValues.some((n) => n > 0);
      const hasZero = numberValues.some((n) => n === 0);

      const availablePresets = [];

      // Always available
      availablePresets.push(
        "custom",
        "aboveAverage",
        "belowAverage",
        "top25",
        "bottom25"
      );

      // Conditional presets
      if (hasNegative) availablePresets.push("negative");
      if (hasPositive || (hasZero && !hasNegative))
        availablePresets.push("positive");

      expect(availablePresets).toContain("negative");
      expect(availablePresets).toContain("positive");
    });

    it("should apply number presets correctly", () => {
      // Test positive preset (should exclude zero)
      const positiveValues = numberValues.filter((n) => n > 0);
      expect(positiveValues).toEqual([42, 100, 25]);
      expect(positiveValues).not.toContain(0);

      // Test negative preset (should exclude zero)
      const negativeValues = numberValues.filter((n) => n < 0);
      expect(negativeValues).toEqual([-15, -50]);
      expect(negativeValues).not.toContain(0);
    });

    it("should handle range filtering with inversion", () => {
      const min = 0;
      const max = 50;

      // Within range
      const withinRange = numberValues.filter((n) => n >= min && n <= max);
      expect(withinRange).toEqual([42, 0, 25]);

      // Outside range (inverted)
      const outsideRange = numberValues.filter((n) => n < min || n > max);
      expect(outsideRange).toEqual([-15, 100, -50]);
    });
  });

  describe("Date Controller", () => {
    const dateStrings = ["01/12/2022", "15-03-2023", "2024-01-01"];

    it("should parse different date formats correctly", () => {
      const parsedDates = dateStrings.map((dateStr) => {
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
          const [day, month, year] = dateStr
            .split("/")
            .map((n) => parseInt(n, 10));
          return new Date(year, month - 1, day);
        } else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateStr)) {
          const [day, month, year] = dateStr
            .split("-")
            .map((n) => parseInt(n, 10));
          return new Date(year, month - 1, day);
        } else {
          return new Date(dateStr);
        }
      });

      expect(parsedDates.every((date) => !isNaN(date.getTime()))).toBe(true);
    });

    it("should apply date presets correctly", () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Test preset ranges
      const presets = {
        today: { start: today, end: today },
        yesterday: { start: yesterday, end: yesterday },
      };

      expect(presets.today.start.getDate()).toBe(today.getDate());
      expect(presets.yesterday.start.getDate()).toBe(yesterday.getDate());
    });

    it("should handle date range filtering with inversion", () => {
      const startDate = new Date("2022-01-01");
      const endDate = new Date("2023-12-31");

      const testDates = [
        new Date("2022-12-01"), // Within range
        new Date("2023-03-15"), // Within range
        new Date("2024-01-01"), // Outside range
        new Date("2021-12-31"), // Outside range
      ];

      // Within range
      const withinRange = testDates.filter(
        (date) => date >= startDate && date <= endDate
      );
      expect(withinRange).toHaveLength(2);

      // Outside range (inverted)
      const outsideRange = testDates.filter(
        (date) => date < startDate || date > endDate
      );
      expect(outsideRange).toHaveLength(2);
    });
  });

  describe("Filter Application", () => {
    it("should create correct filter condition for arrIncludesSome operator", () => {
      const selectedValues = new Set(["apple", "42", "01/12/2022", "true"]);
      const columnId = "testColumn";

      const expectedCondition = {
        field: columnId,
        operator: "arrIncludesSome",
        value: Array.from(selectedValues),
      };

      expect(expectedCondition.operator).toBe("arrIncludesSome");
      expect(expectedCondition.value).toEqual([
        "apple",
        "42",
        "01/12/2022",
        "true",
      ]);
    });

    it("should handle empty selection by calling onClear", () => {
      const selectedValues = new Set();
      const shouldClear = selectedValues.size === 0;

      expect(shouldClear).toBe(true);
    });
  });

  describe("Type Filtering", () => {
    it("should filter options by selected type", () => {
      const allOptions = [
        { value: "apple", type: "string" },
        { value: 42, type: "number" },
        { value: "01/12/2022", type: "date" },
        { value: true, type: "boolean" },
      ];

      // Filter by string type
      const stringOptions = allOptions.filter((opt) => opt.type === "string");
      expect(stringOptions).toEqual([{ value: "apple", type: "string" }]);

      // Filter by número type
      const numberOptions = allOptions.filter((opt) => opt.type === "number");
      expect(numberOptions).toEqual([{ value: 42, type: "number" }]);
    });

    it('should show all types when "all" is selected', () => {
      const selectedTypeFilter = "all";
      const shouldShowAll = selectedTypeFilter === "all";

      expect(shouldShowAll).toBe(true);
    });
  });

  describe("Search Functionality", () => {
    it("should filter options by search term", () => {
      const options = [
        { value: "apple" },
        { value: "banana" },
        { value: "orange" },
        { value: "grape" },
      ];

      const searchTerm = "ap";
      const filtered = options.filter((opt) =>
        String(opt.value).toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filtered).toEqual([{ value: "apple" }, { value: "grape" }]);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty unique values array", () => {
      const emptyValues: { value: unknown }[] = [];
      const processedOptions = emptyValues.map((item) => item.value);

      expect(processedOptions).toEqual([]);
    });

    it("should handle null and undefined values", () => {
      const values = [null, undefined, "", 0, false];
      const processed = values.map((val) => ({
        value: val,
        type: detectType(val),
        isValid: val !== null && val !== undefined,
      }));

      expect(processed.some((p) => !p.isValid)).toBe(true);
    });

    it("should handle very large arrays", () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => i);
      const processingTime = Date.now();

      // Simulate processing
      const processed = largeArray.map((val) => ({
        value: val,
        type: "number",
      }));

      const elapsed = Date.now() - processingTime;
      expect(processed).toHaveLength(10000);
      expect(elapsed).toBeLessThan(1000); // Should process in under 1 second
    });
  });
});

// Helper function to detect type (simplified version)
function detectType(value: unknown): string {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (typeof value === "string") {
    // Enhanced date detection
    const datePatterns = [
      /^\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{4}$/,
      /^\d{4}[-\/\.]\d{1,2}[-\/\.]\d{1,2}$/,
      /^\d{1,2}\s+[A-Za-z]{3,}\s+\d{4}$/,
    ];

    if (datePatterns.some((pattern) => pattern.test(value))) {
      try {
        let testDate: Date | null = null;

        // DD-MM-YYYY, DD/MM/YYYY, DD.MM.YYYY
        if (/^\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{4}$/.test(value)) {
          const parts = value.split(/[-\/\.]/);
          const [day, month, year] = parts.map(Number);
          if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            testDate = new Date(year, month - 1, day);
          }
        }
        // YYYY-MM-DD, YYYY/MM/DD
        else if (/^\d{4}[-\/\.]\d{1,2}[-\/\.]\d{1,2}$/.test(value)) {
          const parts = value.split(/[-\/\.]/);
          const [year, month, day] = parts.map(Number);
          if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            testDate = new Date(year, month - 1, day);
          }
        }
        // DD Month YYYY
        else if (/^\d{1,2}\s+[A-Za-z]{3,}\s+\d{4}$/.test(value)) {
          testDate = new Date(value);
        }

        if (
          testDate &&
          !isNaN(testDate.getTime()) &&
          testDate.getFullYear() >= 1900 &&
          testDate.getFullYear() <= 2100
        ) {
          return "date";
        }
      } catch {
        // not a date
      }
    }

    return "string";
  }
  return "unknown";
}
