import { describe, test, expect } from "@jest/globals";

interface TestFilterValue {
  value: unknown;
}

// Lógica CORRECTA para filtros numéricos (comparación exacta)
const proposedNumericFilterLogic = {
  arrIncludesSome: (rawValue: number, filterValue: TestFilterValue) => {
    const filterValues = Array.isArray(filterValue.value)
      ? filterValue.value
      : [filterValue.value];

    // CORRECCIÓN: Comparación exacta de números
    return filterValues.some((val: unknown) => {
      const numVal = Number(val);
      return !isNaN(numVal) && rawValue === numVal;
    });
  },
};

describe("Number Filter Logic Tests", () => {
  describe("Corrected Logic (Exact Number Matching)", () => {
    test("✅ Should match exact numbers: 83 with [83]", () => {
      const result = proposedNumericFilterLogic.arrIncludesSome(83, {
        value: ["83"],
      });
      expect(result).toBe(true);
    });

    test("✅ Should NOT match different numbers: 8 with [83]", () => {
      const result = proposedNumericFilterLogic.arrIncludesSome(8, {
        value: ["83"],
      });
      expect(result).toBe(false);
    });

    test("✅ Should NOT match different numbers: 3 with [83]", () => {
      const result = proposedNumericFilterLogic.arrIncludesSome(3, {
        value: ["83"],
      });
      expect(result).toBe(false);
    });

    test("✅ Should match when number is in array: 10 with [10, 20, 30]", () => {
      const result = proposedNumericFilterLogic.arrIncludesSome(10, {
        value: ["10", "20", "30"],
      });
      expect(result).toBe(true);
    });

    test("✅ Should NOT match when number is not in array: 15 with [10, 20, 30]", () => {
      const result = proposedNumericFilterLogic.arrIncludesSome(15, {
        value: ["10", "20", "30"],
      });
      expect(result).toBe(false);
    });

    test("✅ Should handle decimal numbers: 1.5 with [1.5, 2.5]", () => {
      const result = proposedNumericFilterLogic.arrIncludesSome(1.5, {
        value: ["1.5", "2.5"],
      });
      expect(result).toBe(true);
    });

    test("✅ Should handle negative numbers: -10 with [-10, -20]", () => {
      const result = proposedNumericFilterLogic.arrIncludesSome(-10, {
        value: ["-10", "-20"],
      });
      expect(result).toBe(true);
    });

    test("✅ Should handle zero: 0 with [0, 10]", () => {
      const result = proposedNumericFilterLogic.arrIncludesSome(0, {
        value: ["0", "10"],
      });
      expect(result).toBe(true);
    });

    test("✅ Should handle large numbers: 1000 with [1000, 2000]", () => {
      const result = proposedNumericFilterLogic.arrIncludesSome(1000, {
        value: ["1000", "2000"],
      });
      expect(result).toBe(true);
    });

    test("✅ Should NOT match partial digits: 1 with [10, 100]", () => {
      const result = proposedNumericFilterLogic.arrIncludesSome(1, {
        value: ["10", "100"],
      });
      expect(result).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    test("Should handle empty filter array", () => {
      const result = proposedNumericFilterLogic.arrIncludesSome(83, {
        value: [],
      });
      expect(result).toBe(false);
    });

    test("Should handle non-array filter value", () => {
      const result = proposedNumericFilterLogic.arrIncludesSome(83, {
        value: "83",
      });
      expect(result).toBe(true);
    });

    test("Should handle invalid number strings", () => {
      const result = proposedNumericFilterLogic.arrIncludesSome(83, {
        value: ["invalid", "83"],
      });
      expect(result).toBe(true); // Should still match the valid "83"
    });

    test("Should handle mixed number types", () => {
      const result = proposedNumericFilterLogic.arrIncludesSome(83, {
        value: [83, "83", 84],
      });
      expect(result).toBe(true);
    });
  });
});

// Casos específicos de prueba manual para la columna "order"
describe("Order Column Test Cases", () => {
  const orderValues = [83, 82, 81, 78, 77, 76]; // Valores típicos de la columna order

  describe("Range Filter Tests", () => {
    test("Should include values in range [75-85] (within range)", () => {
      const valuesInRange = orderValues.filter((val) =>
        proposedNumericFilterLogic.arrIncludesSome(val, {
          value: ["83", "82", "81", "78", "77", "76"], // Todos los valores en el rango
        })
      );
      expect(valuesInRange).toEqual([83, 82, 81, 78, 77, 76]);
    });

    test("Should exclude values outside range [80-85] (within range)", () => {
      const valuesInRange = orderValues.filter((val) =>
        proposedNumericFilterLogic.arrIncludesSome(val, {
          value: ["83", "82", "81"], // Solo valores 80-85
        })
      );
      expect(valuesInRange).toEqual([83, 82, 81]);
    });

    test("Should handle single value selection: only 83", () => {
      const result = proposedNumericFilterLogic.arrIncludesSome(83, {
        value: ["83"],
      });
      expect(result).toBe(true);

      const resultOther = proposedNumericFilterLogic.arrIncludesSome(82, {
        value: ["83"],
      });
      expect(resultOther).toBe(false);
    });
  });

  describe("Common Range Scenarios", () => {
    test("Top values (80+): should include 83, 82, 81", () => {
      const topValues = ["83", "82", "81"];
      orderValues.forEach((val) => {
        const result = proposedNumericFilterLogic.arrIncludesSome(val, {
          value: topValues,
        });
        const shouldMatch = val >= 80;
        expect(result).toBe(shouldMatch);
      });
    });

    test("Bottom values (77-78): should include 78, 77", () => {
      const bottomValues = ["78", "77"];
      orderValues.forEach((val) => {
        const result = proposedNumericFilterLogic.arrIncludesSome(val, {
          value: bottomValues,
        });
        const shouldMatch = val >= 77 && val <= 78;
        expect(result).toBe(shouldMatch);
      });
    });
  });
});
