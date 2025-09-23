/**
 * Embedded Filter Components - Specialized components that reuse existing filters
 * These components are designed to be embedded within the AtomicPrimitiveArrayFilter
 */

"use client";

import React, { useMemo, useCallback } from "react";
import { ArrayFilter } from "./array-filter";
import { StringFilter } from "./string-filter";
import { NumberFilter } from "./number-filter";
import { DateFilter } from "./date-filter";
import type { FilterComponentProps, FilterCondition } from "./filter-types";
import type { ProcessedItem } from "../../core";

interface EmbeddedFilterProps
  extends Omit<FilterComponentProps, "onApply" | "onClose" | "onClear"> {
  onFilterChange: (condition: FilterCondition | null) => void;
  isEmbedded?: boolean;
}

/**
 * Embedded Array Filter - Wraps ArrayFilter for use within AtomicPrimitiveArrayFilter
 */
export function EmbeddedArrayFilter({
  onFilterChange,
  isEmbedded = true,
  ...props
}: EmbeddedFilterProps) {
  const handleApply = useCallback(
    (condition: FilterCondition) => {
      console.log("🔧 EmbeddedArrayFilter applying:", condition);
      onFilterChange(condition);
    },
    [onFilterChange]
  );

  const handleClear = useCallback(() => {
    console.log("🔧 EmbeddedArrayFilter clearing");
    onFilterChange(null);
  }, [onFilterChange]);

  // Process uniqueValues for array filter (ensure they're ProcessedItems)
  const processedUniqueValues = useMemo(() => {
    return props.uniqueValues.filter((option) => {
      const processedItem = option.original as ProcessedItem;
      return Array.isArray(processedItem?.value);
    });
  }, [props.uniqueValues]);

  console.log("🔧 EmbeddedArrayFilter:", {
    totalValues: props.uniqueValues.length,
    arrayValues: processedUniqueValues.length,
    isEmbedded,
  });

  if (processedUniqueValues.length === 0) {
    return (
      <div className='p-4 text-center text-muted-foreground text-sm'>
        No hay arrays disponibles para filtrar
      </div>
    );
  }

  return (
    <div className={isEmbedded ? "border rounded-lg" : ""}>
      <ArrayFilter
        {...props}
        uniqueValues={processedUniqueValues}
        onApply={handleApply}
        onClear={handleClear}
        onClose={() => {}} // Embedded, no close action
        arrayType='array[primitivo]'
        hideFooter={false} // Show footer in embedded mode
      />
    </div>
  );
}

/**
 * Embedded String Filter - Wraps StringFilter for use within AtomicPrimitiveArrayFilter
 */
export function EmbeddedStringFilter({
  onFilterChange,
  isEmbedded = true,
  autoDetectedSeparator,
  ...props
}: EmbeddedFilterProps & { autoDetectedSeparator?: string }) {
  const handleApply = useCallback(
    (condition: FilterCondition) => {
      console.log("🔧 EmbeddedStringFilter applying:", condition);
      onFilterChange(condition);
    },
    [onFilterChange]
  );

  const handleClear = useCallback(() => {
    console.log("🔧 EmbeddedStringFilter clearing");
    onFilterChange(null);
  }, [onFilterChange]);

  // Process uniqueValues for string filter (convert ProcessedItems to strings)
  const processedUniqueValues = useMemo(() => {
    return props.uniqueValues
      .filter((option) => {
        const processedItem = option.original as ProcessedItem;
        return typeof processedItem?.value === "string";
      })
      .map((option) => {
        const processedItem = option.original as ProcessedItem;
        return {
          value: processedItem.value as string,
          count: option.count,
          original: processedItem.value,
        };
      });
  }, [props.uniqueValues]);

  // Set initial value with auto-detected separator if available
  const initialValueWithSeparator = useMemo(() => {
    if (
      autoDetectedSeparator &&
      autoDetectedSeparator !== "none" &&
      !props.initialValue?.additionalValue
    ) {
      const separatorMapping: Record<string, string> = {
        ",": "comma",
        ";": "semicolon",
        "|": "pipe",
        " - ": "dash",
        " / ": "slash",
        "\t": "tab",
        "\n": "newline",
      };

      return {
        ...props.initialValue,
        additionalValue: separatorMapping[autoDetectedSeparator] || "none",
      };
    }
    return props.initialValue;
  }, [props.initialValue, autoDetectedSeparator]);

  console.log("🔧 EmbeddedStringFilter:", {
    totalValues: props.uniqueValues.length,
    stringValues: processedUniqueValues.length,
    autoDetectedSeparator,
    initialValue: initialValueWithSeparator,
    isEmbedded,
  });

  if (processedUniqueValues.length === 0) {
    return (
      <div className='p-4 text-center text-muted-foreground text-sm'>
        No hay strings disponibles para filtrar
      </div>
    );
  }

  return (
    <div className={isEmbedded ? "border rounded-lg" : ""}>
      <StringFilter
        {...props}
        uniqueValues={processedUniqueValues}
        initialValue={initialValueWithSeparator}
        onApply={handleApply}
        onClear={handleClear}
        onClose={() => {}} // Embedded, no close action
        hideFooter={false} // Show footer in embedded mode
      />
    </div>
  );
}

/**
 * Embedded Number Filter - Wraps NumberFilter for use within AtomicPrimitiveArrayFilter
 */
export function EmbeddedNumberFilter({
  onFilterChange,
  isEmbedded = true,
  ...props
}: EmbeddedFilterProps) {
  const handleApply = useCallback(
    (condition: FilterCondition) => {
      console.log("🔧 EmbeddedNumberFilter applying:", condition);
      onFilterChange(condition);
    },
    [onFilterChange]
  );

  const handleClear = useCallback(() => {
    console.log("🔧 EmbeddedNumberFilter clearing");
    onFilterChange(null);
  }, [onFilterChange]);

  // Process uniqueValues for number filter
  const processedUniqueValues = useMemo(() => {
    const numberValues = props.uniqueValues
      .filter((option) => {
        const processedItem = option.original as ProcessedItem;
        const value = processedItem?.value;

        if (typeof value === "number") return true;
        if (typeof value === "string") {
          // Normalizar decimales: convertir comas a puntos
          const normalized = value.replace(",", ".");
          return !isNaN(Number(normalized));
        }
        return false;
      })
      .map((option) => {
        const processedItem = option.original as ProcessedItem;
        const value = processedItem.value;

        let numValue: number;
        if (typeof value === "number") {
          numValue = value;
        } else {
          // Normalizar decimales: convertir comas a puntos
          const normalized = String(value).replace(",", ".");
          numValue = Number(normalized);
        }

        return {
          value: numValue,
          count: option.count,
          original: numValue,
        };
      });

    return numberValues;
  }, [props.uniqueValues]);

  // Calculate min/max values - Fixed to handle empty arrays
  const [minValue, maxValue] = useMemo(() => {
    if (processedUniqueValues.length === 0) return [undefined, undefined];

    const numbers = processedUniqueValues
      .map((v) => Number(v.value))
      .filter((n) => !isNaN(n));

    // Handle empty numbers array to prevent NaN
    if (numbers.length === 0) return [undefined, undefined];

    const min = Math.min(...numbers);
    const max = Math.max(...numbers);

    // Additional safety check for NaN values
    return [isNaN(min) ? undefined : min, isNaN(max) ? undefined : max];
  }, [processedUniqueValues]);

  console.log("🔧 EmbeddedNumberFilter:", {
    totalValues: props.uniqueValues.length,
    numberValues: processedUniqueValues.length,
    minValue,
    maxValue,
    isEmbedded,
  });

  if (processedUniqueValues.length === 0) {
    return (
      <div className='p-4 text-center text-muted-foreground text-sm'>
        No hay números disponibles para filtrar
      </div>
    );
  }

  return (
    <div className={isEmbedded ? "border rounded-lg" : ""}>
      <NumberFilter
        {...props}
        uniqueValues={processedUniqueValues}
        minValue={minValue}
        maxValue={maxValue}
        onApply={handleApply}
        onClear={handleClear}
        onClose={() => {}} // Embedded, no close action
        hideFooter={false} // Show footer in embedded mode
      />
    </div>
  );
}

/**
 * Embedded Date Filter - Wraps DateFilter for use within AtomicPrimitiveArrayFilter
 */
export function EmbeddedDateFilter({
  onFilterChange,
  isEmbedded = true,
  ...props
}: EmbeddedFilterProps) {
  const handleApply = useCallback(
    (condition: FilterCondition) => {
      console.log("🔧 EmbeddedDateFilter applying:", condition);
      onFilterChange(condition);
    },
    [onFilterChange]
  );

  const handleClear = useCallback(() => {
    console.log("🔧 EmbeddedDateFilter clearing");
    onFilterChange(null);
  }, [onFilterChange]);

  // Process uniqueValues for date filter
  const processedUniqueValues = useMemo(() => {
    return props.uniqueValues
      .filter((option) => {
        const processedItem = option.original as ProcessedItem;
        const value = processedItem?.value;

        if (!value || typeof value !== "string") return false;

        // Check if it looks like a date
        const datePatterns = [
          /^\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{4}$/,
          /^\d{4}[-\/\.]\d{1,2}[-\/\.]\d{1,2}$/,
          /^\d{1,2}\s+[A-Za-z]{3,}\s+\d{4}$/,
        ];

        if (!datePatterns.some((pattern) => pattern.test(value))) return false;

        try {
          const testDate = new Date(value);
          return (
            !isNaN(testDate.getTime()) &&
            testDate.getFullYear() >= 1900 &&
            testDate.getFullYear() <= 2100
          );
        } catch {
          return false;
        }
      })
      .map((option) => {
        const processedItem = option.original as ProcessedItem;
        return {
          value: processedItem.value as string,
          count: option.count,
          original: processedItem.value,
        };
      });
  }, [props.uniqueValues]);

  console.log("🔧 EmbeddedDateFilter:", {
    totalValues: props.uniqueValues.length,
    dateValues: processedUniqueValues.length,
    isEmbedded,
  });

  if (processedUniqueValues.length === 0) {
    return (
      <div className='p-4 text-center text-muted-foreground text-sm'>
        No hay fechas disponibles para filtrar
      </div>
    );
  }

  return (
    <div className={isEmbedded ? "border rounded-lg" : ""}>
      <DateFilter
        {...props}
        uniqueValues={processedUniqueValues}
        onApply={handleApply}
        onClear={handleClear}
        onClose={() => {}} // Embedded, no close action
        hideFooter={false} // Show footer in embedded mode
      />
    </div>
  );
}

/**
 * Filter Type Selector - Allows switching between different embedded filters
 */
export interface FilterTypeOption {
  type: string;
  label: string;
  count: number;
  available: boolean;
}

export function getAvailableFilterTypes(
  uniqueValues: FilterComponentProps["uniqueValues"]
): FilterTypeOption[] {
  const typeCounters = {
    array: 0,
    string: 0,
    number: 0,
    date: 0,
    boolean: 0,
  };

  uniqueValues.forEach((option) => {
    const processedItem = option.original as ProcessedItem;
    const value = processedItem?.value;

    if (Array.isArray(value)) {
      typeCounters.array += option.count;
    } else if (typeof value === "string") {
      // Check if it's a date
      const datePatterns = [
        /^\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{4}$/,
        /^\d{4}[-\/\.]\d{1,2}[-\/\.]\d{1,2}$/,
      ];

      if (datePatterns.some((pattern) => pattern.test(value))) {
        try {
          const testDate = new Date(value);
          if (!isNaN(testDate.getTime())) {
            typeCounters.date += option.count;
            return;
          }
        } catch {}
      }

      typeCounters.string += option.count;
    } else if (typeof value === "number") {
      typeCounters.number += option.count;
    } else if (typeof value === "boolean") {
      typeCounters.boolean += option.count;
    }
  });

  return [
    {
      type: "all",
      label: "Todos los tipos",
      count: uniqueValues.length,
      available: true,
    },
    {
      type: "array",
      label: "Arrays",
      count: typeCounters.array,
      available: typeCounters.array > 0,
    },
    {
      type: "string",
      label: "Texto",
      count: typeCounters.string,
      available: typeCounters.string > 0,
    },
    {
      type: "number",
      label: "Números",
      count: typeCounters.number,
      available: typeCounters.number > 0,
    },
    {
      type: "date",
      label: "Fechas",
      count: typeCounters.date,
      available: typeCounters.date > 0,
    },
    {
      type: "boolean",
      label: "Booleanos",
      count: typeCounters.boolean,
      available: typeCounters.boolean > 0,
    },
  ].filter((option) => option.available);
}
