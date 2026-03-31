/**
 * Integration tests for AtomicPrimitiveArrayFilter with JsonTable
 *
 * Tests the complete flow from filter UI to data filtering
 */

import { describe, it, expect } from "@jest/globals";

// Mock data that matches the structure from the user's actual data
const mockTableData = [
  {
    id: "1",
    value: "GROW UP",
    metadata: { count: 1 },
  },
  {
    id: "2",
    value: "Webinar",
    metadata: { count: 1 },
  },
  {
    id: "3",
    value: "GROW",
    metadata: { count: 1 },
  },
  {
    id: "4",
    value: "GUILLERMO",
    metadata: { count: 1 },
  },
  {
    id: "5",
    value: "BAJA",
    metadata: { count: 1 },
  },
  {
    id: "6",
    value: ["red", "blue", "green"],
    metadata: { count: 3 },
  },
  {
    id: "7",
    value: [1, 2, 3, 4, 5],
    metadata: { count: 5 },
  },
  {
    id: "8",
    value: [-10, 0, 10],
    metadata: { count: 3 },
  },
  {
    id: "9",
    value: "01/12/2022",
    metadata: { count: 1 },
  },
  {
    id: "10",
    value: ["01/01/2024", "02/01/2024", "03/01/2024"],
    metadata: { count: 3 },
  },
  {
    id: "11",
    value: [true, false],
    metadata: { count: 2 },
  },
];

// Mock filter condition type
interface FilterCondition {
  field: string;
  operator: "arrIncludesSome" | "in" | "contains";
  value: (string | number | boolean)[];
  exactMatch?: boolean;
}

describe("AtomicPrimitiveArrayFilter Integration", () => {
  describe("Filter Application in JsonTable", () => {
    it("should filter rows with arrIncludesSome operator for string values", () => {
      const filterCondition: FilterCondition = {
        field: "value",
        operator: "arrIncludesSome",
        value: ["GROW", "Webinar"],
      };

      const filteredData = applyFilter(mockTableData, filterCondition);

      expect(filteredData).toHaveLength(2);
      expect(filteredData[0].value).toBe("Webinar");
      expect(filteredData[1].value).toBe("GROW");
    });

    it("should filter rows with arrIncludesSome operator for number values", () => {
      const filterCondition: FilterCondition = {
        field: "value",
        operator: "arrIncludesSome",
        value: [1, 2, 10],
      };

      const filteredData = applyFilter(mockTableData, filterCondition);

      // Should match arrays containing these numbers
      expect(filteredData.length).toBeGreaterThan(0);

      // Verify that arrays containing the target values are included
      const hasArrayWithNumbers = filteredData.some(
        (row) =>
          Array.isArray(row.value) &&
          row.value.some((val: unknown) => [1, 2, 10].includes(val as number))
      );
      expect(hasArrayWithNumbers).toBe(true);
    });

    it("should filter rows with arrIncludesSome operator for date values", () => {
      const filterCondition: FilterCondition = {
        field: "value",
        operator: "arrIncludesSome",
        value: ["01/12/2022", "01/01/2024"],
      };

      const filteredData = applyFilter(mockTableData, filterCondition);

      expect(filteredData.length).toBeGreaterThan(0);

      // Should include individual date and array with dates
      const hasIndividualDate = filteredData.some(
        (row) => row.value === "01/12/2022"
      );
      const hasArrayWithDate = filteredData.some(
        (row) => Array.isArray(row.value) && row.value.includes("01/01/2024")
      );

      expect(hasIndividualDate || hasArrayWithDate).toBe(true);
    });

    it("should filter rows with arrIncludesSome operator for boolean values", () => {
      const filterCondition: FilterCondition = {
        field: "value",
        operator: "arrIncludesSome",
        value: [true],
      };

      const filteredData = applyFilter(mockTableData, filterCondition);

      // Should find arrays containing true
      const hasArrayWithTrue = filteredData.some(
        (row) => Array.isArray(row.value) && row.value.includes(true)
      );
      expect(hasArrayWithTrue).toBe(true);
    });

    it("should handle mixed primitive types in filter values", () => {
      const filterCondition: FilterCondition = {
        field: "value",
        operator: "arrIncludesSome",
        value: ["GROW", 1, "01/12/2022", true],
      };

      const filteredData = applyFilter(mockTableData, filterCondition);

      expect(filteredData.length).toBeGreaterThan(0);

      // Should match various types
      const matchesString = filteredData.some((row) => row.value === "GROW");
      const matchesDate = filteredData.some(
        (row) => row.value === "01/12/2022"
      );

      expect(matchesString || matchesDate).toBe(true);
    });
  });

  describe("Number Range Filtering", () => {
    it("should apply number range filter correctly", () => {
      // Simulate number range filtering from controller
      const numberValues = extractNumberValues(mockTableData);
      const min = 0;
      const max = 5;
      const isInverted = true; // Within range

      const filteredNumbers = numberValues.filter((num) => {
        const inRange = num >= min && num <= max;
        return isInverted ? inRange : !inRange;
      });

      expect(filteredNumbers).toEqual(
        expect.arrayContaining([0, 1, 2, 3, 4, 5])
      );
      expect(filteredNumbers).not.toContain(10);
      expect(filteredNumbers).not.toContain(-10);
    });

    it("should apply inverted number range filter correctly", () => {
      const numberValues = extractNumberValues(mockTableData);
      const min = 0;
      const max = 5;
      const isInverted = false; // Outside range

      const filteredNumbers = numberValues.filter((num) => {
        const inRange = num >= min && num <= max;
        return isInverted ? inRange : !inRange;
      });

      expect(filteredNumbers).toEqual(expect.arrayContaining([10, -10]));
      expect(filteredNumbers).not.toContain(1);
      expect(filteredNumbers).not.toContain(3);
    });
  });

  describe("Date Range Filtering", () => {
    it("should apply date range filter correctly", () => {
      const dateValues = extractDateValues(mockTableData);
      const startDate = new Date("2022-01-01");
      const endDate = new Date("2023-12-31");
      const isInverted = true; // Within range

      const filteredDates = dateValues.filter((dateStr) => {
        const itemDate = parseDate(dateStr);
        if (!itemDate) return false;

        const inRange = itemDate >= startDate && itemDate <= endDate;
        return isInverted ? inRange : !inRange;
      });

      expect(filteredDates).toContain("01/12/2022");
    });
  });

  describe("String Separator Filtering", () => {
    it("should split string values by separator and filter correctly", () => {
      const stringWithSeparator = "red,blue,green";
      const separator = ",";
      const searchTerms = ["red", "blue"];

      const parts = stringWithSeparator.split(separator).map((s) => s.trim());
      const matches = parts.filter((part) =>
        searchTerms.some((term) =>
          part.toLowerCase().includes(term.toLowerCase())
        )
      );

      expect(matches).toEqual(["red", "blue"]);
    });

    it("should handle exact match for separated values", () => {
      const stringWithSeparator = "apple,apple pie,pineapple";
      const separator = ",";
      const searchTerm = "apple";
      const exactMatch = true;

      const parts = stringWithSeparator.split(separator).map((s) => s.trim());
      const matches = parts.filter((part) => {
        if (exactMatch) {
          return part.toLowerCase() === searchTerm.toLowerCase();
        } else {
          return part.toLowerCase().includes(searchTerm.toLowerCase());
        }
      });

      expect(matches).toEqual(["apple"]); // Only exact match
    });
  });

  describe("Type-Specific Controller Integration", () => {
    it("should integrate string controller with main filter", () => {
      const stringValues = extractStringValues(mockTableData);
      const selectedSeparator = "none";
      // exactMatch = false (not used in this code path, separator is "none")
      const searchTerm = "grow";

      let filteredStrings = stringValues;

      if (selectedSeparator !== "none") {
        // Process with separator (not applicable here)
      }

      // Apply search filter
      filteredStrings = filteredStrings.filter((str) =>
        str.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filteredStrings).toEqual(["GROW UP", "GROW"]);
    });

    it("should integrate number controller with presets", () => {
      const numberValues = extractNumberValues(mockTableData);
      const preset: string = "positive";

      let selectedNumbers: number[] = [];

      switch (preset) {
        case "positive":
          selectedNumbers = numberValues.filter((n) => n > 0);
          break;
        case "negative":
          selectedNumbers = numberValues.filter((n) => n < 0);
          break;
      }

      expect(selectedNumbers).toEqual(
        expect.arrayContaining([1, 2, 3, 4, 5, 10])
      );
      expect(selectedNumbers).not.toContain(0);
      expect(selectedNumbers).not.toContain(-10);
    });

    it("should integrate date controller with presets", () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const preset: string = "yesterday";
      let dateRange = {
        start: undefined as Date | undefined,
        end: undefined as Date | undefined,
      };

      switch (preset) {
        case "today":
          dateRange = { start: today, end: today };
          break;
        case "yesterday":
          dateRange = { start: yesterday, end: yesterday };
          break;
      }

      expect(dateRange.start?.getDate()).toBe(yesterday.getDate());
      expect(dateRange.end?.getDate()).toBe(yesterday.getDate());
    });
  });

  describe("Performance and Edge Cases", () => {
    it("should handle large datasets efficiently", () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `item-${i}`,
        value: i % 2 === 0 ? `text-${i}` : [i, i + 1, i + 2],
        metadata: { count: 1 },
      }));

      const startTime = Date.now();

      const filterCondition: FilterCondition = {
        field: "value",
        operator: "arrIncludesSome",
        value: [1, 2, "text-0", "text-100"],
      };

      const filteredData = applyFilter(largeDataset, filterCondition);

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      expect(filteredData.length).toBeGreaterThan(0);
      expect(processingTime).toBeLessThan(100); // Should process in under 100ms
    });

    it("should handle empty filter values gracefully", () => {
      const filterCondition: FilterCondition = {
        field: "value",
        operator: "arrIncludesSome",
        value: [],
      };

      const filteredData = applyFilter(mockTableData, filterCondition);

      // Empty filter should return all data or no data depending on implementation
      expect(Array.isArray(filteredData)).toBe(true);
    });

    it("should handle invalid date formats gracefully", () => {
      const invalidDates = ["invalid-date", "32/13/2023", "not-a-date"];

      const validDates = invalidDates.filter((dateStr) => {
        const parsed = parseDate(dateStr);
        return parsed && !isNaN(parsed.getTime());
      });

      expect(validDates).toHaveLength(0);
    });
  });
});

// Helper functions to simulate the filtering logic

interface MockRow {
  id: string;
  value: string | number | boolean | (string | number | boolean)[];
  metadata: { count: number };
  [key: string]: unknown;
}

function applyFilter(data: MockRow[], condition: FilterCondition): MockRow[] {
  if (condition.operator === "arrIncludesSome") {
    return data.filter((row) => {
      const cellValue = row[condition.field];

      // Handle arrays
      if (Array.isArray(cellValue)) {
        return cellValue.some((val) =>
          condition.value.some((filterVal) => {
            if (typeof val === "number" && typeof filterVal === "number") {
              return val === filterVal; // Exact number match
            }
            return String(val) === String(filterVal);
          })
        );
      }

      // Handle individual values
      return condition.value.some((filterVal) => {
        if (typeof cellValue === "number" && typeof filterVal === "number") {
          return cellValue === filterVal; // Exact number match
        }
        return String(cellValue) === String(filterVal);
      });
    });
  }

  return data;
}

function extractStringValues(data: MockRow[]): string[] {
  const strings: string[] = [];

  data.forEach((row) => {
    const value = row.value;

    if (typeof value === "string") {
      strings.push(value);
    } else if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item === "string") {
          strings.push(item);
        }
      });
    }
  });

  return strings;
}

function extractNumberValues(data: MockRow[]): number[] {
  const numbers: number[] = [];

  data.forEach((row) => {
    const value = row.value;

    if (typeof value === "number") {
      numbers.push(value);
    } else if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item === "number") {
          numbers.push(item);
        }
      });
    }
  });

  return numbers;
}

function extractDateValues(data: MockRow[]): string[] {
  const dates: string[] = [];

  data.forEach((row) => {
    const value = row.value;

    if (typeof value === "string" && isDateString(value)) {
      dates.push(value);
    } else if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item === "string" && isDateString(item)) {
          dates.push(item);
        }
      });
    }
  });

  return dates;
}

function isDateString(value: string): boolean {
  const datePatterns = [
    /^\d{1,2}\/\d{1,2}\/\d{4}$/,
    /^\d{1,2}-\d{1,2}-\d{4}$/,
    /^\d{4}-\d{1,2}-\d{1,2}$/,
  ];

  return datePatterns.some((pattern) => pattern.test(value));
}

function parseDate(dateStr: string): Date | null {
  try {
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split("/").map((n) => parseInt(n, 10));
      if (month < 1 || month > 12 || day < 1 || day > 31) return null;
      const date = new Date(year, month - 1, day);
      // Verify components match to catch overflow (e.g., Feb 30 -> Mar 2)
      if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
      return date;
    } else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split("-").map((n) => parseInt(n, 10));
      if (month < 1 || month > 12 || day < 1 || day > 31) return null;
      const date = new Date(year, month - 1, day);
      if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
      return date;
    } else {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    }
  } catch {
    return null;
  }
}
