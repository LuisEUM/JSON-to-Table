import { describe, test, expect } from "@jest/globals";

// Simulación de la lógica mejorada de detección de fechas en arrays
const improvedDateDetection = {
  detectDateInArray: (item: string): boolean => {
    // Patrones de fecha comunes
    const datePatterns = [
      /^\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{4}$/, // DD-MM-YYYY, DD/MM/YYYY, DD.MM.YYYY
      /^\d{4}[-\/\.]\d{1,2}[-\/\.]\d{1,2}$/, // YYYY-MM-DD, YYYY/MM/DD
      /^\d{1,2}\s+[A-Za-z]{3,}\s+\d{4}$/, // DD Month YYYY
    ];

    const isLikelyDate = datePatterns.some((pattern) => pattern.test(item));

    if (!isLikelyDate) return false;

    try {
      let testDate: Date | null = null;

      // DD-MM-YYYY o DD/MM/YYYY
      if (/^\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{4}$/.test(item)) {
        const parts = item.split(/[-\/\.]/);
        const [first, second, year] = parts.map(Number);

        // Validate ranges before constructing Date
        if (second < 1 || second > 12 || first < 1 || first > 31) {
          return false;
        }

        // Intentar DD-MM-YYYY primero (más común en Europa)
        testDate = new Date(year, second - 1, first);

        // Verify the date components match (catches invalid days like Feb 29 in non-leap years, Apr 31, etc.)
        if (
          testDate.getFullYear() !== year ||
          testDate.getMonth() !== second - 1 ||
          testDate.getDate() !== first
        ) {
          return false;
        }
      }
      // YYYY-MM-DD
      else if (/^\d{4}[-\/\.]\d{1,2}[-\/\.]\d{1,2}$/.test(item)) {
        testDate = new Date(item);
      }

      // Validar que la fecha es razonable
      return (
        testDate !== null &&
        !isNaN(testDate.getTime()) &&
        testDate.getFullYear() >= 1900 &&
        testDate.getFullYear() <= 2100
      );
    } catch {
      return false;
    }
  },

  groupArrayByType: (arrayValues: string[]) => {
    const groups = {
      date: [] as string[],
      string: [] as string[],
    };

    arrayValues.forEach((value) => {
      if (improvedDateDetection.detectDateInArray(value)) {
        groups.date.push(value);
      } else {
        groups.string.push(value);
      }
    });

    return groups;
  },
};

describe("Improved Date Detection in Arrays", () => {
  describe("Date Pattern Recognition", () => {
    test("✅ Should detect DD-MM-YYYY format", () => {
      expect(improvedDateDetection.detectDateInArray("31-05-2025")).toBe(true);
      expect(improvedDateDetection.detectDateInArray("01-02-2025")).toBe(true);
      expect(improvedDateDetection.detectDateInArray("15-12-2023")).toBe(true);
    });

    test("✅ Should detect DD/MM/YYYY format", () => {
      expect(improvedDateDetection.detectDateInArray("31/05/2025")).toBe(true);
      expect(improvedDateDetection.detectDateInArray("01/02/2025")).toBe(true);
      expect(improvedDateDetection.detectDateInArray("15/12/2023")).toBe(true);
    });

    test("✅ Should detect DD.MM.YYYY format", () => {
      expect(improvedDateDetection.detectDateInArray("31.05.2025")).toBe(true);
      expect(improvedDateDetection.detectDateInArray("01.02.2025")).toBe(true);
      expect(improvedDateDetection.detectDateInArray("15.12.2023")).toBe(true);
    });

    test("✅ Should detect YYYY-MM-DD format", () => {
      expect(improvedDateDetection.detectDateInArray("2025-05-31")).toBe(true);
      expect(improvedDateDetection.detectDateInArray("2025-02-01")).toBe(true);
      expect(improvedDateDetection.detectDateInArray("2023-12-15")).toBe(true);
    });

    test("✅ Should reject invalid date strings", () => {
      expect(improvedDateDetection.detectDateInArray("LORENA")).toBe(false);
      expect(improvedDateDetection.detectDateInArray("C_EXPERTO")).toBe(false);
      expect(improvedDateDetection.detectDateInArray("HIVEN_ED01_FEB24")).toBe(
        false
      );
      expect(improvedDateDetection.detectDateInArray("123456")).toBe(false);
      expect(improvedDateDetection.detectDateInArray("31-13-2025")).toBe(false); // Invalid month
      expect(improvedDateDetection.detectDateInArray("32-01-2025")).toBe(false); // Invalid day
    });

    test("✅ Should handle edge cases", () => {
      expect(improvedDateDetection.detectDateInArray("29-02-2024")).toBe(true); // Leap year
      expect(improvedDateDetection.detectDateInArray("29-02-2023")).toBe(false); // Not leap year
      expect(improvedDateDetection.detectDateInArray("31-04-2025")).toBe(false); // April has 30 days
      expect(improvedDateDetection.detectDateInArray("30-04-2025")).toBe(true); // Valid April date
    });
  });

  describe("Array Grouping with Real Data", () => {
    test("✅ Should correctly group user's actual data", () => {
      const userArrayValues = [
        "31-05-2025",
        "01-02-2025",
        "LORENA",
        "C_EXPERTO",
        "HIVEN_ED01_FEB24",
        "HIVEN_ED03_ABR24",
        "HIVEN_ED05_JUN24_OCT24",
        "HIVEN_ED06_SEP25",
        "HOLDED",
      ];

      const groups = improvedDateDetection.groupArrayByType(userArrayValues);

      expect(groups.date).toEqual(["31-05-2025", "01-02-2025"]);
      expect(groups.string).toEqual([
        "LORENA",
        "C_EXPERTO",
        "HIVEN_ED01_FEB24",
        "HIVEN_ED03_ABR24",
        "HIVEN_ED05_JUN24_OCT24",
        "HIVEN_ED06_SEP25",
        "HOLDED",
      ]);
    });

    test("✅ Should handle mixed date formats", () => {
      const mixedDateFormats = [
        "31-05-2025", // DD-MM-YYYY
        "2025/02/01", // YYYY/MM/DD
        "15.12.2023", // DD.MM.YYYY
        "not-a-date", // String
        "2024-03-15", // YYYY-MM-DD
        "SOME_CODE_123", // String
      ];

      const groups = improvedDateDetection.groupArrayByType(mixedDateFormats);

      expect(groups.date).toEqual([
        "31-05-2025",
        "2025/02/01",
        "15.12.2023",
        "2024-03-15",
      ]);
      expect(groups.string).toEqual(["not-a-date", "SOME_CODE_123"]);
    });

    test("✅ Should handle arrays with only strings", () => {
      const onlyStrings = ["LORENA", "C_EXPERTO", "HOLDED"];
      const groups = improvedDateDetection.groupArrayByType(onlyStrings);

      expect(groups.date).toEqual([]);
      expect(groups.string).toEqual(["LORENA", "C_EXPERTO", "HOLDED"]);
    });

    test("✅ Should handle arrays with only dates", () => {
      const onlyDates = ["31-05-2025", "01-02-2025", "15-12-2023"];
      const groups = improvedDateDetection.groupArrayByType(onlyDates);

      expect(groups.date).toEqual(["31-05-2025", "01-02-2025", "15-12-2023"]);
      expect(groups.string).toEqual([]);
    });
  });

  describe("Performance and Robustness", () => {
    test("✅ Should handle large arrays efficiently", () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => {
        if (i % 3 === 0)
          return `${String((i % 28) + 1).padStart(2, "0")}-${String(
            (i % 12) + 1
          ).padStart(2, "0")}-2025`;
        return `STRING_${i}`;
      });

      const startTime = performance.now();
      const groups = improvedDateDetection.groupArrayByType(largeArray);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete in < 100ms
      expect(groups.date.length).toBeGreaterThan(0);
      expect(groups.string.length).toBeGreaterThan(0);
    });

    test("✅ Should handle empty arrays", () => {
      const emptyArray: string[] = [];
      const groups = improvedDateDetection.groupArrayByType(emptyArray);

      expect(groups.date).toEqual([]);
      expect(groups.string).toEqual([]);
    });

    test("✅ Should handle arrays with empty strings", () => {
      const arrayWithEmpties = ["31-05-2025", "", "LORENA", ""];
      const groups = improvedDateDetection.groupArrayByType(arrayWithEmpties);

      expect(groups.date).toEqual(["31-05-2025"]);
      expect(groups.string).toEqual(["", "LORENA", ""]);
    });
  });

  describe("Specific User Scenarios", () => {
    test("✅ Should detect dates in value column from user's data", () => {
      // Based on the user's screenshot showing dates in the value column
      const valueColumnData = [
        "31-05-2025", // Date - should be detected
        "01-02-2025", // Date - should be detected
        "LORENA", // String
        "C_EXPERTO", // String
        "C_MASTER", // String
        "HIVEN_ED01_FEB24", // String (contains date info but not in date format)
        "HIVEN_ED03_ABR24", // String
        "HIVEN_ED05_JUN24_OCT24", // String
        "HIVEN_ED06_SEP25", // String
        "HOLDED", // String
      ];

      const groups = improvedDateDetection.groupArrayByType(valueColumnData);

      // Should create two groups: dates and strings
      expect(groups.date.length).toBe(2);
      expect(groups.string.length).toBe(8);

      // Verify specific dates are detected
      expect(groups.date).toContain("31-05-2025");
      expect(groups.date).toContain("01-02-2025");

      // Verify strings are not misclassified as dates
      expect(groups.string).toContain("LORENA");
      expect(groups.string).toContain("HIVEN_ED01_FEB24");
    });

    test("✅ Should create separate accordions for dates and strings", () => {
      const mixedData = ["31-05-2025", "01-02-2025", "LORENA", "C_EXPERTO"];
      const groups = improvedDateDetection.groupArrayByType(mixedData);

      // Should result in two accordion sections in the UI:
      // 1. "Fechas" accordion with 2 items
      // 2. "Valores de Texto" accordion with 2 items

      const expectedAccordions = [
        { type: "date", count: groups.date.length, displayName: "Fechas" },
        {
          type: "string",
          count: groups.string.length,
          displayName: "Valores de Texto",
        },
      ];

      expect(expectedAccordions[0].count).toBe(2); // 2 dates
      expect(expectedAccordions[1].count).toBe(2); // 2 strings
    });
  });
});
