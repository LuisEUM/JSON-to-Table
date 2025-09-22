import { describe, test, expect } from "@jest/globals";

// Simulación de la lógica CORREGIDA de presets de filtros numéricos
const numberPresetLogic = {
  applyPreset: (preset: string, values: number[]) => {
    switch (preset) {
      case "positive":
        return values.filter((v) => v > 0); // Estrictamente mayor que 0
      case "negative":
        return values.filter((v) => v < 0); // Estrictamente menor que 0
      case "aboveAverage":
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        return values.filter((v) => v >= avg);
      case "belowAverage":
        const avgBelow = values.reduce((a, b) => a + b, 0) / values.length;
        return values.filter((v) => v <= avgBelow);
      default:
        return values;
    }
  },
};

describe("Number Filter Preset Logic Tests", () => {
  describe("Positive Values Preset", () => {
    test("✅ Should EXCLUDE zero from positive values", () => {
      const values = [-1, 0, 1];
      const result = numberPresetLogic.applyPreset("positive", values);

      expect(result).toEqual([1]);
      expect(result).not.toContain(0);
      expect(result).not.toContain(-1);
    });

    test("✅ Should only include values > 0", () => {
      const values = [-5, -1, 0, 1, 5, 10];
      const result = numberPresetLogic.applyPreset("positive", values);

      expect(result).toEqual([1, 5, 10]);
      expect(result.every((v) => v > 0)).toBe(true);
    });

    test("✅ Should return empty array when no positive values", () => {
      const values = [-10, -5, 0];
      const result = numberPresetLogic.applyPreset("positive", values);

      expect(result).toEqual([]);
    });
  });

  describe("Negative Values Preset", () => {
    test("✅ Should EXCLUDE zero from negative values", () => {
      const values = [-1, 0, 1];
      const result = numberPresetLogic.applyPreset("negative", values);

      expect(result).toEqual([-1]);
      expect(result).not.toContain(0);
      expect(result).not.toContain(1);
    });

    test("✅ Should only include values < 0", () => {
      const values = [-10, -5, -1, 0, 1, 5];
      const result = numberPresetLogic.applyPreset("negative", values);

      expect(result).toEqual([-10, -5, -1]);
      expect(result.every((v) => v < 0)).toBe(true);
    });

    test("✅ Should return empty array when no negative values", () => {
      const values = [0, 5, 10];
      const result = numberPresetLogic.applyPreset("negative", values);

      expect(result).toEqual([]);
    });
  });

  describe("Real Data Scenarios", () => {
    test("✅ Status column with -1, 0, 1 values", () => {
      const statusValues = [-1, 0, 1];

      const positiveResult = numberPresetLogic.applyPreset(
        "positive",
        statusValues
      );
      const negativeResult = numberPresetLogic.applyPreset(
        "negative",
        statusValues
      );

      expect(positiveResult).toEqual([1]);
      expect(negativeResult).toEqual([-1]);

      // Zero should not appear in either
      expect(positiveResult).not.toContain(0);
      expect(negativeResult).not.toContain(0);
    });

    test("✅ Pokemon orders (all positive)", () => {
      const pokemonOrders = [76, 77, 78, 81, 82, 83];

      const positiveResult = numberPresetLogic.applyPreset(
        "positive",
        pokemonOrders
      );
      const negativeResult = numberPresetLogic.applyPreset(
        "negative",
        pokemonOrders
      );

      expect(positiveResult).toEqual(pokemonOrders); // All are positive
      expect(negativeResult).toEqual([]); // None are negative
    });

    test("✅ Temperature data with zero", () => {
      const temperatures = [-10, -5, 0, 5, 10, 15];

      const positiveResult = numberPresetLogic.applyPreset(
        "positive",
        temperatures
      );
      const negativeResult = numberPresetLogic.applyPreset(
        "negative",
        temperatures
      );

      expect(positiveResult).toEqual([5, 10, 15]); // Only > 0
      expect(negativeResult).toEqual([-10, -5]); // Only < 0

      // Zero should not appear in either
      expect(positiveResult).not.toContain(0);
      expect(negativeResult).not.toContain(0);
    });

    test("✅ Financial data with losses and gains", () => {
      const profits = [-1000, -500, 0, 250, 750];

      const positiveResult = numberPresetLogic.applyPreset("positive", profits);
      const negativeResult = numberPresetLogic.applyPreset("negative", profits);

      expect(positiveResult).toEqual([250, 750]); // Only gains > 0
      expect(negativeResult).toEqual([-1000, -500]); // Only losses < 0

      // Zero (break-even) should not appear in either
      expect(positiveResult).not.toContain(0);
      expect(negativeResult).not.toContain(0);
    });
  });

  describe("Edge Cases", () => {
    test("✅ Should handle decimal values correctly", () => {
      const decimals = [-0.5, -0.1, 0, 0.1, 0.5];

      const positiveResult = numberPresetLogic.applyPreset(
        "positive",
        decimals
      );
      const negativeResult = numberPresetLogic.applyPreset(
        "negative",
        decimals
      );

      expect(positiveResult).toEqual([0.1, 0.5]);
      expect(negativeResult).toEqual([-0.5, -0.1]);
      expect(positiveResult).not.toContain(0);
      expect(negativeResult).not.toContain(0);
    });

    test("✅ Should handle very small numbers", () => {
      const smallNumbers = [-0.0001, 0, 0.0001];

      const positiveResult = numberPresetLogic.applyPreset(
        "positive",
        smallNumbers
      );
      const negativeResult = numberPresetLogic.applyPreset(
        "negative",
        smallNumbers
      );

      expect(positiveResult).toEqual([0.0001]);
      expect(negativeResult).toEqual([-0.0001]);
      expect(positiveResult).not.toContain(0);
      expect(negativeResult).not.toContain(0);
    });

    test("✅ Should handle large numbers", () => {
      const largeNumbers = [-1000000, 0, 1000000];

      const positiveResult = numberPresetLogic.applyPreset(
        "positive",
        largeNumbers
      );
      const negativeResult = numberPresetLogic.applyPreset(
        "negative",
        largeNumbers
      );

      expect(positiveResult).toEqual([1000000]);
      expect(negativeResult).toEqual([-1000000]);
      expect(positiveResult).not.toContain(0);
      expect(negativeResult).not.toContain(0);
    });

    test("✅ Should handle array with only zeros", () => {
      const onlyZeros = [0, 0, 0];

      const positiveResult = numberPresetLogic.applyPreset(
        "positive",
        onlyZeros
      );
      const negativeResult = numberPresetLogic.applyPreset(
        "negative",
        onlyZeros
      );

      expect(positiveResult).toEqual([]);
      expect(negativeResult).toEqual([]);
    });
  });

  describe("Behavior Validation", () => {
    test("✅ Zero should NEVER appear in positive or negative presets", () => {
      const testCases = [
        [-5, -1, 0, 1, 5],
        [0],
        [-10, 0, 10],
        [0, 0, 0, 1],
        [-1, 0, 0, 0],
      ];

      testCases.forEach((values) => {
        const positiveResult = numberPresetLogic.applyPreset(
          "positive",
          values
        );
        const negativeResult = numberPresetLogic.applyPreset(
          "negative",
          values
        );

        expect(positiveResult).not.toContain(0);
        expect(negativeResult).not.toContain(0);
      });
    });

    test("✅ Positive and negative results should never overlap", () => {
      const values = [-100, -50, -1, 0, 1, 50, 100];

      const positiveResult = numberPresetLogic.applyPreset("positive", values);
      const negativeResult = numberPresetLogic.applyPreset("negative", values);

      // No overlap between positive and negative results
      const overlap = positiveResult.filter((v) => negativeResult.includes(v));
      expect(overlap).toEqual([]);

      // All positive results should be > 0
      expect(positiveResult.every((v) => v > 0)).toBe(true);

      // All negative results should be < 0
      expect(negativeResult.every((v) => v < 0)).toBe(true);
    });
  });
});

describe("Integration Tests - UI Behavior", () => {
  describe("Status Column Filtering (Real Scenario)", () => {
    const statusData = [
      { id: 1, status: -1 }, // Inactive
      { id: 2, status: 0 }, // Pending
      { id: 3, status: 1 }, // Active
    ];

    test("✅ Selecting 'Valores negativos' should show only inactive items", () => {
      const statusValues = statusData.map((item) => item.status);
      const result = numberPresetLogic.applyPreset("negative", statusValues);

      expect(result).toEqual([-1]);
      expect(result).toHaveLength(1);

      // In UI: Only inactive items should be visible
      const filteredData = statusData.filter((item) =>
        result.includes(item.status)
      );
      expect(filteredData).toEqual([{ id: 1, status: -1 }]);
    });

    test("✅ Selecting 'Valores positivos' should show only active items", () => {
      const statusValues = statusData.map((item) => item.status);
      const result = numberPresetLogic.applyPreset("positive", statusValues);

      expect(result).toEqual([1]);
      expect(result).toHaveLength(1);

      // In UI: Only active items should be visible
      const filteredData = statusData.filter((item) =>
        result.includes(item.status)
      );
      expect(filteredData).toEqual([{ id: 3, status: 1 }]);
    });

    test("✅ Pending items (status: 0) should not appear in either preset", () => {
      const statusValues = statusData.map((item) => item.status);

      const positiveResult = numberPresetLogic.applyPreset(
        "positive",
        statusValues
      );
      const negativeResult = numberPresetLogic.applyPreset(
        "negative",
        statusValues
      );

      expect(positiveResult).not.toContain(0);
      expect(negativeResult).not.toContain(0);

      // In UI: Pending items should not be visible when using either preset
      const positiveFiltered = statusData.filter((item) =>
        positiveResult.includes(item.status)
      );
      const negativeFiltered = statusData.filter((item) =>
        negativeResult.includes(item.status)
      );

      expect(positiveFiltered.some((item) => item.status === 0)).toBe(false);
      expect(negativeFiltered.some((item) => item.status === 0)).toBe(false);
    });
  });
});
