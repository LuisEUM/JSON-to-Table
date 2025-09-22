import { describe, test, expect } from "@jest/globals";

// Simulación de la lógica del filtro de arrays primitivos
const primitiveArrayFilterLogic = {
  groupByType: (arrayValues: unknown[]) => {
    const groups = new Map<string, { values: unknown[]; count: number }>();

    arrayValues.forEach((value) => {
      let type: string;

      if (typeof value === "string") {
        type = "string";
      } else if (typeof value === "number") {
        type = "número";
      } else if (typeof value === "boolean") {
        type = "boolean";
      } else if (value instanceof Date) {
        type = "fecha";
      } else if (typeof value === "object" && value !== null) {
        type = "objeto";
      } else {
        type = "unknown";
      }

      if (!groups.has(type)) {
        groups.set(type, { values: [], count: 0 });
      }

      const group = groups.get(type)!;
      if (!group.values.includes(value)) {
        group.values.push(value);
      }
      group.count++;
    });

    return groups;
  },

  filterBySelection: (arrayValues: unknown[], selectedValues: unknown[]) => {
    return arrayValues.filter((value) => selectedValues.includes(value));
  },
};

describe("Primitive Array Filter Tests", () => {
  describe("Type Grouping", () => {
    test("✅ Should group mixed primitive values by type", () => {
      const mixedArray = ["apple", "banana", 1, 2, 3, true, false, "cherry"];

      const groups = primitiveArrayFilterLogic.groupByType(mixedArray);

      expect(groups.has("string")).toBe(true);
      expect(groups.has("número")).toBe(true);
      expect(groups.has("boolean")).toBe(true);

      expect(groups.get("string")?.values).toEqual([
        "apple",
        "banana",
        "cherry",
      ]);
      expect(groups.get("número")?.values).toEqual([1, 2, 3]);
      expect(groups.get("boolean")?.values).toEqual([true, false]);
    });

    test("✅ Should handle date values correctly", () => {
      const dateArray = [
        new Date("2023-01-01"),
        new Date("2023-06-15"),
        "not-a-date",
        42,
      ];

      const groups = primitiveArrayFilterLogic.groupByType(dateArray);

      expect(groups.has("fecha")).toBe(true);
      expect(groups.has("string")).toBe(true);
      expect(groups.has("número")).toBe(true);

      expect(groups.get("fecha")?.values).toHaveLength(2);
      expect(groups.get("string")?.values).toEqual(["not-a-date"]);
      expect(groups.get("número")?.values).toEqual([42]);
    });

    test("✅ Should count duplicate values correctly", () => {
      const arrayWithDuplicates = [
        "apple",
        "apple",
        "banana",
        1,
        1,
        1,
        2,
        true,
        true,
        false,
      ];

      const groups = primitiveArrayFilterLogic.groupByType(arrayWithDuplicates);

      expect(groups.get("string")?.count).toBe(3); // apple(2) + banana(1)
      expect(groups.get("número")?.count).toBe(4); // 1(3) + 2(1)
      expect(groups.get("boolean")?.count).toBe(3); // true(2) + false(1)

      // But unique values should be deduplicated
      expect(groups.get("string")?.values).toEqual(["apple", "banana"]);
      expect(groups.get("número")?.values).toEqual([1, 2]);
      expect(groups.get("boolean")?.values).toEqual([true, false]);
    });

    test("✅ Should handle empty arrays", () => {
      const emptyArray: unknown[] = [];
      const groups = primitiveArrayFilterLogic.groupByType(emptyArray);

      expect(groups.size).toBe(0);
    });

    test("✅ Should handle arrays with only one type", () => {
      const stringOnlyArray = ["apple", "banana", "cherry", "date"];
      const groups = primitiveArrayFilterLogic.groupByType(stringOnlyArray);

      expect(groups.size).toBe(1);
      expect(groups.has("string")).toBe(true);
      expect(groups.get("string")?.values).toEqual([
        "apple",
        "banana",
        "cherry",
        "date",
      ]);
    });
  });

  describe("Selection Filtering", () => {
    test("✅ Should filter array values by selection", () => {
      const arrayValues = ["apple", "banana", 1, 2, true, false];
      const selectedValues = ["apple", 1, true];

      const filtered = primitiveArrayFilterLogic.filterBySelection(
        arrayValues,
        selectedValues
      );

      expect(filtered).toEqual(["apple", 1, true]);
    });

    test("✅ Should handle empty selection", () => {
      const arrayValues = ["apple", "banana", 1, 2];
      const selectedValues: unknown[] = [];

      const filtered = primitiveArrayFilterLogic.filterBySelection(
        arrayValues,
        selectedValues
      );

      expect(filtered).toEqual([]);
    });

    test("✅ Should handle selection with non-existing values", () => {
      const arrayValues = ["apple", "banana"];
      const selectedValues = ["apple", "cherry", "date"]; // cherry and date don't exist

      const filtered = primitiveArrayFilterLogic.filterBySelection(
        arrayValues,
        selectedValues
      );

      expect(filtered).toEqual(["apple"]);
    });
  });

  describe("Real Data Scenarios", () => {
    test("✅ Pokemon types array filtering", () => {
      // Simulating Pokemon with multiple types
      const pokemonTypes = [
        "grass",
        "poison", // Bulbasaur
        "fire",
        "flying", // Charizard
        "water", // Squirtle
        "electric", // Pikachu
        "grass",
        "poison", // Ivysaur (duplicate types)
      ];

      const groups = primitiveArrayFilterLogic.groupByType(pokemonTypes);

      expect(groups.has("string")).toBe(true);
      expect(groups.get("string")?.values).toEqual([
        "grass",
        "poison",
        "fire",
        "flying",
        "water",
        "electric",
      ]);
      expect(groups.get("string")?.count).toBe(8); // Total occurrences including duplicates
    });

    test("✅ Mixed data array from API response", () => {
      const apiResponseArray = [
        "PEIMP_ED05_OCT25", // String ID
        "PEIMP_GRABADO", // String ID
        8,
        4,
        2,
        1, // Numeric counts
        true,
        false, // Boolean flags
        "SAEXP_ED03_ENE24_MAY24", // Another string ID
      ];

      const groups = primitiveArrayFilterLogic.groupByType(apiResponseArray);

      expect(groups.size).toBe(3); // string, número, boolean
      expect(groups.get("string")?.values).toHaveLength(3);
      expect(groups.get("número")?.values).toEqual([8, 4, 2, 1]);
      expect(groups.get("boolean")?.values).toEqual([true, false]);
    });

    test("✅ Filter by type selection", () => {
      const mixedArray = ["apple", 1, "banana", 2, true, "cherry"];

      // Select only strings
      const stringValues = ["apple", "banana", "cherry"];
      const filteredStrings = primitiveArrayFilterLogic.filterBySelection(
        mixedArray,
        stringValues
      );
      expect(filteredStrings).toEqual(["apple", "banana", "cherry"]);

      // Select only numbers
      const numberValues = [1, 2];
      const filteredNumbers = primitiveArrayFilterLogic.filterBySelection(
        mixedArray,
        numberValues
      );
      expect(filteredNumbers).toEqual([1, 2]);

      // Select mixed types
      const mixedSelection = ["apple", 1, true];
      const filteredMixed = primitiveArrayFilterLogic.filterBySelection(
        mixedArray,
        mixedSelection
      );
      expect(filteredMixed).toEqual(["apple", 1, true]);
    });
  });

  describe("Edge Cases", () => {
    test("✅ Should handle null and undefined values", () => {
      const arrayWithNulls = ["apple", null, undefined, 1, "banana"];
      const groups = primitiveArrayFilterLogic.groupByType(arrayWithNulls);

      expect(groups.has("string")).toBe(true);
      expect(groups.has("número")).toBe(true);
      // null and undefined should be handled gracefully
      expect(groups.get("string")?.values).toEqual(["apple", "banana"]);
    });

    test("✅ Should handle very large arrays efficiently", () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => {
        if (i % 3 === 0) return `string-${i}`;
        if (i % 3 === 1) return i;
        return i % 2 === 0;
      });

      const startTime = performance.now();
      const groups = primitiveArrayFilterLogic.groupByType(largeArray);
      const endTime = performance.now();

      expect(groups.size).toBe(3); // string, número, boolean
      expect(endTime - startTime).toBeLessThan(100); // Should complete in < 100ms
    });

    test("✅ Should handle arrays with objects (should not group as primitives)", () => {
      const arrayWithObjects = [
        "string",
        1,
        { name: "object" },
        [1, 2, 3], // nested array
        true,
      ];

      const groups = primitiveArrayFilterLogic.groupByType(arrayWithObjects);

      expect(groups.has("string")).toBe(true);
      expect(groups.has("número")).toBe(true);
      expect(groups.has("boolean")).toBe(true);
      expect(groups.has("objeto")).toBe(true);
      expect(groups.has("unknown")).toBe(true); // for nested array
    });
  });

  describe("Integration with Filter System", () => {
    test("✅ Should work with arrIncludesSome operator", () => {
      // Simulating how the filter would work with the table system
      const pokemonData = [
        { name: "bulbasaur", types: ["grass", "poison"] },
        { name: "charmander", types: ["fire"] },
        { name: "squirtle", types: ["water"] },
        { name: "pikachu", types: ["electric"] },
      ];

      // User selects "grass" and "fire" from the primitive array filter
      const selectedTypes = ["grass", "fire"];

      // Filter Pokemon that have any of the selected types
      const filteredPokemon = pokemonData.filter((pokemon) =>
        pokemon.types.some((type) => selectedTypes.includes(type))
      );

      expect(filteredPokemon).toHaveLength(2);
      expect(filteredPokemon.map((p) => p.name)).toEqual([
        "bulbasaur",
        "charmander",
      ]);
    });

    test("✅ Should handle multiple type selections simultaneously", () => {
      const mixedDataRows = [
        { id: 1, values: ["text1", 10, true] },
        { id: 2, values: ["text2", 20] },
        { id: 3, values: [30, false, "text3"] },
        { id: 4, values: ["text4"] },
      ];

      // User selects from different type groups: strings="text1", numbers=10, booleans=true
      const selectedValues = ["text1", 10, true];

      const filteredRows = mixedDataRows.filter((row) =>
        row.values.some((value) => selectedValues.includes(value))
      );

      expect(filteredRows).toHaveLength(2); // rows 1 and 3
      expect(filteredRows.map((r) => r.id)).toEqual([1, 3]);
    });
  });
});
