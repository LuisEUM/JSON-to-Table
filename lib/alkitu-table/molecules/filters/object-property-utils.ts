import type { FilterOption } from "./filter-types";

export interface PropertyOption {
  path: string;
  value: string;
  count: number;
  displayValue: string;
}

/**
 * Get nested property value with enhanced path handling.
 * Supports dot notation paths (e.g., "items.value", "customFields.label").
 */
export function getNestedPropertyValue(
  obj: unknown,
  propertyPath: string
): unknown[] {
  const values: unknown[] = [];
  const pathParts = propertyPath.split(".");

  const extractValue = (current: unknown, parts: string[]): void => {
    if (parts.length === 0) return;

    const [currentPart, ...remainingParts] = parts;

    if (typeof current === "object" && current !== null) {
      if (Array.isArray(current)) {
        current.forEach((item) => {
          if (typeof item === "object" && item !== null) {
            const itemValue = (item as Record<string, unknown>)[currentPart];
            if (remainingParts.length === 0) {
              if (itemValue !== null && itemValue !== undefined) {
                values.push(itemValue);
              }
            } else {
              extractValue(itemValue, remainingParts);
            }
          }
        });
      } else {
        const directValue = (current as Record<string, unknown>)[currentPart];
        if (remainingParts.length === 0) {
          if (directValue !== null && directValue !== undefined) {
            values.push(directValue);
          }
        } else {
          extractValue(directValue, remainingParts);
        }
      }
    }
  };

  extractValue(obj, pathParts);
  return values;
}

/**
 * Format a value for display in the filter UI.
 * Handles objects, arrays, and primitive values.
 */
export function formatValueForDisplay(value: unknown): string {
  if (typeof value === "object" && value !== null) {
    try {
      const obj = value as Record<string, unknown>;
      const entries = Object.entries(obj);

      if (entries.length > 0) {
        const formattedProps = entries.map(([key, propValue]) => {
          const formattedValue = formatPropValue(propValue);
          return `  ${key}: ${formattedValue}`;
        });

        return `{\n${formattedProps.join(",\n")}\n}`;
      } else {
        return "{}";
      }
    } catch {
      return "[Objeto inválido]";
    }
  }
  return String(value);
}

/**
 * Format a property value for display (handles strings, nulls, arrays, objects).
 */
function formatPropValue(propValue: unknown): string {
  if (typeof propValue === "string") {
    return `"${propValue}"`;
  } else if (propValue === null) {
    return "null";
  } else if (Array.isArray(propValue)) {
    return formatArrayValue(propValue);
  } else if (typeof propValue === "object") {
    return "{...}";
  } else {
    return String(propValue);
  }
}

/**
 * Format an array value for display.
 */
function formatArrayValue(arr: unknown[]): string {
  if (arr.length === 0) {
    return "[]";
  } else if (arr.length <= 3) {
    const elements = arr.map((item) => {
      if (typeof item === "string") return `"${item}"`;
      if (typeof item === "object" && item !== null) return "{...}";
      return String(item);
    });
    return `[${elements.join(", ")}]`;
  } else {
    const firstElements = arr.slice(0, 3).map((item) => {
      if (typeof item === "string") return `"${item}"`;
      if (typeof item === "object" && item !== null) return "{...}";
      return String(item);
    });
    return `[${firstElements.join(", ")}, ... +${arr.length - 3} más]`;
  }
}

/**
 * Extract property options from unique values for a given property path.
 */
export function extractPropertyOptions(
  uniqueValues: FilterOption[],
  selectedProperty: string
): PropertyOption[] {
  const valueCounts = new Map<string, number>();

  uniqueValues.forEach((option) => {
    const propertyValues = getNestedPropertyValue(
      option.original,
      selectedProperty
    );

    propertyValues.forEach((value) => {
      if (Array.isArray(value)) {
        // For arrays, extract each individual element as a separate filter option
        value.forEach((arrayItem) => {
          const displayValue = formatValueForDisplay(arrayItem);
          valueCounts.set(
            displayValue,
            (valueCounts.get(displayValue) || 0) + option.count
          );
        });
      } else if (typeof value === "object" && value !== null) {
        const displayValue = formatValueForDisplay(value);
        valueCounts.set(
          displayValue,
          (valueCounts.get(displayValue) || 0) + option.count
        );
      } else {
        const displayValue = String(value);
        valueCounts.set(
          displayValue,
          (valueCounts.get(displayValue) || 0) + option.count
        );
      }
    });
  });

  return Array.from(valueCounts.entries())
    .map(([displayValue, count]) => ({
      path: selectedProperty,
      value: displayValue.toLowerCase(),
      count,
      displayValue,
    }))
    .sort((a, b) => a.displayValue.localeCompare(b.displayValue));
}
