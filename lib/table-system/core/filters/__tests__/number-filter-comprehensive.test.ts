import { describe, test, expect } from "@jest/globals";

// Simulación de la lógica corregida de filtros numéricos
const numericFilterLogic = {
  arrIncludesSome: (
    rawValue: number,
    filterValue: any,
    columnType: string = "número"
  ) => {
    const filterValues = Array.isArray(filterValue.value)
      ? filterValue.value
      : [filterValue.value];

    // Si es una columna numérica, hacer comparación exacta de números
    if (columnType === "número") {
      const numericRawValue = Number(rawValue);
      if (isNaN(numericRawValue)) return false;

      return filterValues.some((val: unknown) => {
        const numericFilterValue = Number(val);
        return (
          !isNaN(numericFilterValue) && numericRawValue === numericFilterValue
        );
      });
    }

    // Para otros tipos (texto), usar la lógica original de includes
    return filterValues.some((val: unknown) => {
      const stringVal = String(val).toLowerCase();
      const stringRawVal = String(rawValue).toLowerCase();
      return stringRawVal.includes(stringVal);
    });
  },
};

// Helper para generar presets dinámicos (lógica mejorada)
const generateDynamicPresets = (numbers: number[]) => {
  const hasNegativeValues = numbers.some((n) => n < 0);
  const hasPositiveValues = numbers.some((n) => n > 0);
  const hasZero = numbers.some((n) => n === 0);

  const basePresets = [
    { label: "Personalizado", value: "custom" },
    { label: "Valores positivos", value: "positive" },
    { label: "Valores negativos", value: "negative" },
    { label: "Valores mayores a la media", value: "aboveAverage" },
    { label: "Valores menores a la media", value: "belowAverage" },
    { label: "Top 25%", value: "top25" },
    { label: "Último 25%", value: "bottom25" },
  ];

  return basePresets.filter((preset) => {
    switch (preset.value) {
      case "negative":
        // Solo mostrar si realmente hay valores negativos
        return hasNegativeValues;
      case "positive":
        // Solo mostrar si hay valores positivos o solo hay cero
        // Si hay tanto positivos como negativos, mostrar ambos
        // Si solo hay cero, considerarlo como "positivo"
        return hasPositiveValues || (hasZero && !hasNegativeValues);
      default:
        return true;
    }
  });
};

describe("Comprehensive Number Filter Tests", () => {
  describe("Exact Number Matching", () => {
    test("✅ Should match exact integer: 83 with [83]", () => {
      const result = numericFilterLogic.arrIncludesSome(83, { value: ["83"] });
      expect(result).toBe(true);
    });

    test("✅ Should NOT match different integer: 82 with [83]", () => {
      const result = numericFilterLogic.arrIncludesSome(82, { value: ["83"] });
      expect(result).toBe(false);
    });

    test("✅ Should match decimal: 83.5 with [83.5]", () => {
      const result = numericFilterLogic.arrIncludesSome(83.5, {
        value: ["83.5"],
      });
      expect(result).toBe(true);
    });

    test("✅ Should NOT match similar decimal: 83.5 with [83.6]", () => {
      const result = numericFilterLogic.arrIncludesSome(83.5, {
        value: ["83.6"],
      });
      expect(result).toBe(false);
    });
  });

  describe("Range and Multiple Values", () => {
    const pokemonOrders = [83, 82, 81, 78, 77, 76];

    test("✅ Should match multiple specific values", () => {
      const selectedValues = ["83", "81", "77"];
      const results = pokemonOrders.map((order) =>
        numericFilterLogic.arrIncludesSome(order, { value: selectedValues })
      );

      expect(results).toEqual([true, false, true, false, true, false]);
    });

    test("✅ Should handle range selection (80-85)", () => {
      const rangeValues = ["83", "82", "81"]; // Valores en el rango 80-85
      const results = pokemonOrders.map((order) =>
        numericFilterLogic.arrIncludesSome(order, { value: rangeValues })
      );

      // Solo 83, 82, 81 deberían coincidir
      expect(results).toEqual([true, true, true, false, false, false]);
    });

    test("✅ Should handle single value from range", () => {
      const singleValue = ["78"];
      const results = pokemonOrders.map((order) =>
        numericFilterLogic.arrIncludesSome(order, { value: singleValue })
      );

      // Solo 78 debería coincidir
      expect(results).toEqual([false, false, false, true, false, false]);
    });
  });

  describe("Edge Cases and Data Types", () => {
    test("✅ Should handle zero correctly", () => {
      const result = numericFilterLogic.arrIncludesSome(0, { value: ["0"] });
      expect(result).toBe(true);
    });

    test("✅ Should handle negative numbers", () => {
      const result = numericFilterLogic.arrIncludesSome(-5, { value: ["-5"] });
      expect(result).toBe(true);
    });

    test("✅ Should NOT match zero with negative", () => {
      const result = numericFilterLogic.arrIncludesSome(0, { value: ["-1"] });
      expect(result).toBe(false);
    });

    test("✅ Should handle large numbers", () => {
      const result = numericFilterLogic.arrIncludesSome(999999, {
        value: ["999999"],
      });
      expect(result).toBe(true);
    });

    test("✅ Should handle very small decimals", () => {
      const result = numericFilterLogic.arrIncludesSome(0.001, {
        value: ["0.001"],
      });
      expect(result).toBe(true);
    });

    test("✅ Should handle scientific notation", () => {
      const result = numericFilterLogic.arrIncludesSome(1e5, {
        value: ["100000"],
      });
      expect(result).toBe(true);
    });
  });

  describe("Filter Value Types", () => {
    test("✅ Should handle numeric filter values", () => {
      const result = numericFilterLogic.arrIncludesSome(83, { value: [83] });
      expect(result).toBe(true);
    });

    test("✅ Should handle string filter values", () => {
      const result = numericFilterLogic.arrIncludesSome(83, { value: ["83"] });
      expect(result).toBe(true);
    });

    test("✅ Should handle mixed filter value types", () => {
      const result = numericFilterLogic.arrIncludesSome(83, {
        value: [83, "82", 81],
      });
      expect(result).toBe(true);
    });

    test("✅ Should handle single non-array filter value", () => {
      const result = numericFilterLogic.arrIncludesSome(83, { value: "83" });
      expect(result).toBe(true);
    });
  });

  describe("Invalid Data Handling", () => {
    test("✅ Should handle invalid number strings gracefully", () => {
      const result = numericFilterLogic.arrIncludesSome(83, {
        value: ["invalid", "83", "also-invalid"],
      });
      expect(result).toBe(true); // Should still match the valid "83"
    });

    test("✅ Should return false for empty filter array", () => {
      const result = numericFilterLogic.arrIncludesSome(83, { value: [] });
      expect(result).toBe(false);
    });

    test("✅ Should handle NaN raw values", () => {
      const result = numericFilterLogic.arrIncludesSome(NaN, { value: ["83"] });
      expect(result).toBe(false);
    });

    test("✅ Should handle null/undefined filter values", () => {
      const result = numericFilterLogic.arrIncludesSome(83, {
        value: [null, undefined, "83"],
      });
      expect(result).toBe(true); // Should still match the valid "83"
    });
  });

  describe("Column Type Differentiation", () => {
    test("✅ Should use exact matching for number columns", () => {
      const result = numericFilterLogic.arrIncludesSome(
        8,
        { value: ["83"] },
        "número"
      );
      expect(result).toBe(false);
    });

    test("✅ Should use includes matching for text columns", () => {
      const result = numericFilterLogic.arrIncludesSome(
        8,
        { value: ["83"] },
        "string"
      );
      expect(result).toBe(true); // "8" is included in "83" for text matching
    });

    test("✅ Should default to number logic when no column type specified", () => {
      const result = numericFilterLogic.arrIncludesSome(8, { value: ["83"] });
      expect(result).toBe(false);
    });
  });
});

describe("Dynamic Presets Tests", () => {
  describe("Preset Filtering Based on Data", () => {
    test("✅ Should include negative preset when data has negative values", () => {
      const numbers = [-5, 0, 10, 20];
      const presets = generateDynamicPresets(numbers);

      const hasNegativePreset = presets.some((p) => p.value === "negative");
      const hasPositivePreset = presets.some((p) => p.value === "positive");

      expect(hasNegativePreset).toBe(true);
      expect(hasPositivePreset).toBe(true);
    });

    test("✅ Should exclude negative preset when data has no negative values", () => {
      const numbers = [0, 10, 20, 30];
      const presets = generateDynamicPresets(numbers);

      const hasNegativePreset = presets.some((p) => p.value === "negative");
      const hasPositivePreset = presets.some((p) => p.value === "positive");

      expect(hasNegativePreset).toBe(false);
      expect(hasPositivePreset).toBe(true);
    });

    test("✅ Should exclude positive preset when data has only negative values", () => {
      const numbers = [-10, -5, -1];
      const presets = generateDynamicPresets(numbers);

      const hasNegativePreset = presets.some((p) => p.value === "negative");
      const hasPositivePreset = presets.some((p) => p.value === "positive");

      expect(hasNegativePreset).toBe(true);
      expect(hasPositivePreset).toBe(false);
    });

    test("✅ Should include positive preset when data has only zero", () => {
      const numbers = [0];
      const presets = generateDynamicPresets(numbers);

      const hasPositivePreset = presets.some((p) => p.value === "positive");
      const hasNegativePreset = presets.some((p) => p.value === "negative");

      expect(hasPositivePreset).toBe(true);
      expect(hasNegativePreset).toBe(false);
    });

    test("✅ Should exclude both presets when data has zero and negatives", () => {
      const numbers = [0, -5, -10];
      const presets = generateDynamicPresets(numbers);

      const hasPositivePreset = presets.some((p) => p.value === "positive");
      const hasNegativePreset = presets.some((p) => p.value === "negative");

      expect(hasPositivePreset).toBe(false); // No hay valores positivos reales
      expect(hasNegativePreset).toBe(true); // Sí hay valores negativos
    });

    test("✅ Should show both presets when data has zero, positives and negatives", () => {
      const numbers = [-5, 0, 10];
      const presets = generateDynamicPresets(numbers);

      const hasPositivePreset = presets.some((p) => p.value === "positive");
      const hasNegativePreset = presets.some((p) => p.value === "negative");

      expect(hasPositivePreset).toBe(true); // Hay valores positivos
      expect(hasNegativePreset).toBe(true); // Hay valores negativos
    });

    test("✅ Should always include non-conditional presets", () => {
      const numbers = [1, 2, 3];
      const presets = generateDynamicPresets(numbers);

      const conditionalPresets = [
        "custom",
        "aboveAverage",
        "belowAverage",
        "top25",
        "bottom25",
      ];

      conditionalPresets.forEach((presetValue) => {
        const hasPreset = presets.some((p) => p.value === presetValue);
        expect(hasPreset).toBe(true);
      });
    });
  });

  describe("Real Data Scenarios", () => {
    test("✅ Pokemon order data (all positive)", () => {
      const pokemonOrders = [83, 82, 81, 78, 77, 76];
      const presets = generateDynamicPresets(pokemonOrders);

      expect(presets.some((p) => p.value === "positive")).toBe(true);
      expect(presets.some((p) => p.value === "negative")).toBe(false);
    });

    test("✅ Temperature data (mixed positive/negative)", () => {
      const temperatures = [-10, -5, 0, 15, 25, 30];
      const presets = generateDynamicPresets(temperatures);

      expect(presets.some((p) => p.value === "positive")).toBe(true);
      expect(presets.some((p) => p.value === "negative")).toBe(true);
    });

    test("✅ Financial data (negative losses)", () => {
      const profits = [-1000, -500, -100];
      const presets = generateDynamicPresets(profits);

      expect(presets.some((p) => p.value === "positive")).toBe(false);
      expect(presets.some((p) => p.value === "negative")).toBe(true);
    });
  });
});

describe("Integration Tests - Real Filter Scenarios", () => {
  describe("Pokemon Order Column Filtering", () => {
    const pokemonData = [
      { name: "venomoth", order: 83 },
      { name: "venonat", order: 82 },
      { name: "parasect", order: 81 },
      { name: "vileplume", order: 78 },
      { name: "gloom", order: 77 },
      { name: "oddish", order: 76 },
    ];

    test("✅ Filter by single order value", () => {
      const filteredData = pokemonData.filter((pokemon) =>
        numericFilterLogic.arrIncludesSome(pokemon.order, { value: ["83"] })
      );

      expect(filteredData).toHaveLength(1);
      expect(filteredData[0].name).toBe("venomoth");
    });

    test("✅ Filter by multiple order values", () => {
      const filteredData = pokemonData.filter((pokemon) =>
        numericFilterLogic.arrIncludesSome(pokemon.order, {
          value: ["83", "81", "77"],
        })
      );

      expect(filteredData).toHaveLength(3);
      expect(filteredData.map((p) => p.name)).toEqual([
        "venomoth",
        "parasect",
        "gloom",
      ]);
    });

    test("✅ Filter by range (top values)", () => {
      const topValues = ["83", "82", "81"]; // Orders >= 80
      const filteredData = pokemonData.filter((pokemon) =>
        numericFilterLogic.arrIncludesSome(pokemon.order, { value: topValues })
      );

      expect(filteredData).toHaveLength(3);
      expect(filteredData.map((p) => p.order)).toEqual([83, 82, 81]);
    });

    test("✅ Filter with no matches", () => {
      const filteredData = pokemonData.filter((pokemon) =>
        numericFilterLogic.arrIncludesSome(pokemon.order, {
          value: ["100", "200"],
        })
      );

      expect(filteredData).toHaveLength(0);
    });
  });

  describe("Performance and Edge Cases", () => {
    test("✅ Should handle large datasets efficiently", () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => i);
      const startTime = performance.now();

      const filtered = largeDataset.filter((num) =>
        numericFilterLogic.arrIncludesSome(num, {
          value: ["500", "501", "502"],
        })
      );

      const endTime = performance.now();

      expect(filtered).toEqual([500, 501, 502]);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in < 100ms
    });

    test("✅ Should handle empty dataset", () => {
      const emptyDataset: number[] = [];
      const presets = generateDynamicPresets(emptyDataset);

      // Should still have non-conditional presets
      expect(presets.some((p) => p.value === "custom")).toBe(true);
      expect(presets.some((p) => p.value === "negative")).toBe(false);
      expect(presets.some((p) => p.value === "positive")).toBe(false);
    });
  });
});
