import { describe, test, expect, beforeEach } from "@jest/globals";

// Helper para dividir por separador
const splitBySeparator = (value: string, separator: string): string[] => {
  const separatorMap: Record<string, RegExp> = {
    tab: /\t/g,
    semicolon: /;/g,
    comma: /,/g,
    space: / /g,
    multispace: /\s+/g,
    newline: /\n/g,
  };

  const regex = separatorMap[separator];
  if (!regex) return [value];

  return value
    .split(regex)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
};

// Simulación de la lógica actual del filtro (INCORRECTA)
const currentFilterLogic = {
  in: (rawValue: string, filterValue: any) => {
    return (
      Array.isArray(filterValue.value) &&
      filterValue.value.includes(String(rawValue))
    );
  },
  contains: (rawValue: string, filterValue: any) => {
    return String(rawValue)
      .toLowerCase()
      .includes(String(filterValue.value).toLowerCase());
  },
};

// Lógica propuesta del filtro (CORRECTA)
const proposedFilterLogic = {
  in: (rawValue: string, filterValue: any) => {
    // Si hay separador, dividir el valor del campo y verificar intersección
    if (filterValue.additionalValue && filterValue.additionalValue !== "none") {
      const fieldValues = splitBySeparator(
        String(rawValue),
        filterValue.additionalValue
      );
      const filterValues = Array.isArray(filterValue.value)
        ? filterValue.value
        : [filterValue.value];

      // Modo exacto: TODOS los valores del campo deben coincidir exactamente con los filtros
      if (filterValue.exactMatch) {
        // Para coincidencia exacta, el conjunto de valores debe ser idéntico
        return (
          fieldValues.length === filterValues.length &&
          fieldValues.every((val) => filterValues.includes(val))
        );
      }
      // Modo normal: AL MENOS UN valor del campo debe estar en los filtros
      return fieldValues.some((val) => filterValues.includes(val));
    }
    // Sin separador: comparación directa
    return (
      Array.isArray(filterValue.value) &&
      filterValue.value.includes(String(rawValue))
    );
  },

  contains: (rawValue: string, filterValue: any) => {
    const searchTerms = Array.isArray(filterValue.value)
      ? filterValue.value
      : [filterValue.value];
    const textValue = String(rawValue).toLowerCase();

    if (filterValue.exactMatch) {
      // Coincidencia exacta de palabra
      return searchTerms.some((term) => {
        const regex = new RegExp(`\\b${String(term).toLowerCase()}\\b`);
        return regex.test(textValue);
      });
    }
    // Contiene el texto
    return searchTerms.some((term) =>
      textValue.includes(String(term).toLowerCase())
    );
  },
};

describe("Filter Logic Tests", () => {
  describe("Text Filters with Separator", () => {
    describe("Current Logic (INCORRECT)", () => {
      test('❌ Should fail: "grass, bug" with ["grass"] checkbox', () => {
        const result = currentFilterLogic.in("grass, bug", {
          value: ["grass"],
          additionalValue: "comma",
        });
        expect(result).toBe(false); // Actual: false, Expected: true
      });

      test('❌ Should fail: "grass" with ["grass"] checkbox', () => {
        const result = currentFilterLogic.in("grass", {
          value: ["grass"],
          additionalValue: "comma",
        });
        expect(result).toBe(true); // This one works by accident
      });
    });

    describe("Proposed Logic (CORRECT)", () => {
      test('✅ Should include "grass, bug" when ["grass"] is selected (no exact match)', () => {
        const result = proposedFilterLogic.in("grass, bug", {
          value: ["grass"],
          additionalValue: "comma",
          exactMatch: false,
        });
        expect(result).toBe(true);
      });

      test('✅ Should NOT include "grass, bug" when ["grass"] is selected (exact match)', () => {
        const result = proposedFilterLogic.in("grass, bug", {
          value: ["grass"],
          additionalValue: "comma",
          exactMatch: true,
        });
        expect(result).toBe(false);
      });

      test('✅ Should include "grass" when ["grass"] is selected (exact match)', () => {
        const result = proposedFilterLogic.in("grass", {
          value: ["grass"],
          additionalValue: "comma",
          exactMatch: true,
        });
        expect(result).toBe(true);
      });

      test('✅ Should include "grass, bug, fire" when ["grass", "bug"] selected (no exact)', () => {
        const result = proposedFilterLogic.in("grass, bug, fire", {
          value: ["grass", "bug"],
          additionalValue: "comma",
          exactMatch: false,
        });
        expect(result).toBe(true);
      });

      test('✅ Should NOT include "grass, bug, fire" when ["grass", "bug"] selected (exact)', () => {
        const result = proposedFilterLogic.in("grass, bug, fire", {
          value: ["grass", "bug"],
          additionalValue: "comma",
          exactMatch: true,
        });
        expect(result).toBe(false);
      });

      test('✅ Should NOT include "fire" when ["grass", "bug"] selected', () => {
        const result = proposedFilterLogic.in("fire", {
          value: ["grass", "bug"],
          additionalValue: "comma",
          exactMatch: false,
        });
        expect(result).toBe(false);
      });

      test("✅ Should handle spaces in values correctly", () => {
        const result = proposedFilterLogic.in("electric, water", {
          value: ["electric"],
          additionalValue: "comma",
          exactMatch: false,
        });
        expect(result).toBe(true);
      });

      test("✅ Should handle multiple separators", () => {
        const result = proposedFilterLogic.in("fire;water;grass", {
          value: ["water"],
          additionalValue: "semicolon",
          exactMatch: false,
        });
        expect(result).toBe(true);
      });

      test("✅ Should work without separator", () => {
        const result = proposedFilterLogic.in("fire", {
          value: ["fire"],
          additionalValue: "none",
          exactMatch: false,
        });
        expect(result).toBe(true);
      });
    });
  });

  describe("Contains Filter with Exact Match Toggle", () => {
    describe("Without Exact Match", () => {
      test("✅ Should find partial matches", () => {
        const result = proposedFilterLogic.contains("The grass is green", {
          value: ["grass"],
          exactMatch: false,
        });
        expect(result).toBe(true);
      });

      test("✅ Should find substring in compound words", () => {
        const result = proposedFilterLogic.contains("grassland", {
          value: ["grass"],
          exactMatch: false,
        });
        expect(result).toBe(true);
      });
    });

    describe("With Exact Match", () => {
      test("✅ Should find whole word matches", () => {
        const result = proposedFilterLogic.contains("The grass is green", {
          value: ["grass"],
          exactMatch: true,
        });
        expect(result).toBe(true);
      });

      test("✅ Should NOT find partial matches in compound words", () => {
        const result = proposedFilterLogic.contains("grassland", {
          value: ["grass"],
          exactMatch: true,
        });
        expect(result).toBe(false);
      });

      test("✅ Should handle multiple search terms", () => {
        const result = proposedFilterLogic.contains(
          "The grass and bug pokemon",
          {
            value: ["grass", "water"],
            exactMatch: true,
          }
        );
        expect(result).toBe(true); // Found 'grass' as whole word
      });

      test("✅ Should be case insensitive", () => {
        const result = proposedFilterLogic.contains("The GRASS is green", {
          value: ["grass"],
          exactMatch: true,
        });
        expect(result).toBe(true);
      });
    });
  });

  describe("Edge Cases", () => {
    test("Should handle empty values", () => {
      const result = proposedFilterLogic.in("", {
        value: ["grass"],
        additionalValue: "comma",
        exactMatch: false,
      });
      expect(result).toBe(false);
    });

    test("Should handle null/undefined gracefully", () => {
      const result = proposedFilterLogic.in("grass", {
        value: null,
        additionalValue: "comma",
        exactMatch: false,
      });
      expect(result).toBe(false);
    });

    test("Should handle empty filter array", () => {
      const result = proposedFilterLogic.in("grass", {
        value: [],
        additionalValue: "comma",
        exactMatch: false,
      });
      expect(result).toBe(false);
    });

    test("Should handle values with only separators", () => {
      const result = proposedFilterLogic.in(",,,", {
        value: ["grass"],
        additionalValue: "comma",
        exactMatch: false,
      });
      expect(result).toBe(false);
    });
  });

  describe("Separator Function Tests", () => {
    test("Should split by comma correctly", () => {
      const result = splitBySeparator("grass, bug, fire", "comma");
      expect(result).toEqual(["grass", "bug", "fire"]);
    });

    test("Should split by semicolon correctly", () => {
      const result = splitBySeparator("grass;bug;fire", "semicolon");
      expect(result).toEqual(["grass", "bug", "fire"]);
    });

    test("Should handle extra spaces", () => {
      const result = splitBySeparator("grass ,  bug , fire", "comma");
      expect(result).toEqual(["grass", "bug", "fire"]);
    });

    test("Should handle empty segments", () => {
      const result = splitBySeparator("grass,,bug", "comma");
      expect(result).toEqual(["grass", "bug"]);
    });

    test("Should return original value when no separator", () => {
      const result = splitBySeparator("grass bug", "none");
      expect(result).toEqual(["grass bug"]);
    });
  });
});

// Test for number filters
describe("Number Filter Tests", () => {
  const numberFilter = {
    between: (value: number, min: number, max: number) => {
      return value >= min && value <= max;
    },
    greaterThan: (value: number, threshold: number) => {
      return value > threshold;
    },
    lessThan: (value: number, threshold: number) => {
      return value < threshold;
    },
  };

  test("Between filter should work correctly", () => {
    expect(numberFilter.between(50, 0, 100)).toBe(true);
    expect(numberFilter.between(150, 0, 100)).toBe(false);
    expect(numberFilter.between(0, 0, 100)).toBe(true);
    expect(numberFilter.between(100, 0, 100)).toBe(true);
  });

  test("Greater than filter should work correctly", () => {
    expect(numberFilter.greaterThan(10, 5)).toBe(true);
    expect(numberFilter.greaterThan(5, 5)).toBe(false);
    expect(numberFilter.greaterThan(3, 5)).toBe(false);
  });

  test("Less than filter should work correctly", () => {
    expect(numberFilter.lessThan(3, 5)).toBe(true);
    expect(numberFilter.lessThan(5, 5)).toBe(false);
    expect(numberFilter.lessThan(10, 5)).toBe(false);
  });
});

// Test for date filters
describe("Date Filter Tests", () => {
  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  test("Should format dates correctly", () => {
    const date = new Date("2024-03-15");
    expect(formatDate(date)).toBe("15/03/2024");
  });

  test("Should match formatted dates", () => {
    const date = new Date("2024-03-15");
    const formattedDate = formatDate(date);
    const filterValues = ["15/03/2024", "16/03/2024"];

    expect(filterValues.includes(formattedDate)).toBe(true);
  });

  test("Should not match different dates", () => {
    const date = new Date("2024-03-15");
    const formattedDate = formatDate(date);
    const filterValues = ["16/03/2024", "17/03/2024"];

    expect(filterValues.includes(formattedDate)).toBe(false);
  });
});
