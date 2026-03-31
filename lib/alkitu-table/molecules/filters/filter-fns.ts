import type {
  ProcessedRow,
  ProcessedItem,
} from "../../core/utils/data-processor";
import type { FilterFn } from "@tanstack/react-table";
import { formatDate } from "../../core/utils/error-handling";
import { logger } from "../../core/services/logging-service";
import type { FilterCondition, FilterValue } from "./filter-types";
import { isValidDate } from "./filter-types";

// Custom filter functions con tipos más específicos
export const filterFns = {
  includesString: (
    row: ProcessedRow,
    columnId: string,
    filterValue: string
  ) => {
    logger.debug("Ejecutando filtro de texto:", {
      columnId,
      filterValue,
      rowValue: row[columnId],
    });

    const processedValue = row[columnId] as ProcessedItem;
    if (!processedValue?.value) {
      logger.debug("Valor no encontrado para la columna:", { columnId });
      return false;
    }

    const value = String(processedValue.value).toLowerCase();
    const searchTerm = String(filterValue).toLowerCase();

    const result = value.includes(searchTerm);
    logger.debug("Comparacion texto:", { value, searchTerm, result });
    return result;
  },

  includesStringSensitive: (
    row: ProcessedRow,
    columnId: string,
    filterValue: string
  ) => {
    const processedValue = row[columnId] as ProcessedItem;
    const value = String(processedValue?.value ?? "");
    return value.includes(String(filterValue));
  },

  equalsString: (row: ProcessedRow, columnId: string, filterValue: string) => {
    const processedValue = row[columnId] as ProcessedItem;
    const value = String(processedValue?.value ?? "");
    return value.toLowerCase() === String(filterValue).toLowerCase();
  },

  equalsStringSensitive: (
    row: ProcessedRow,
    columnId: string,
    filterValue: string
  ) => {
    const processedValue = row[columnId] as ProcessedItem;
    const value = String(processedValue?.value ?? "");
    return value === String(filterValue);
  },

  arrIncludes: (row: ProcessedRow, columnId: string, filterValue: unknown) => {
    const processedValue = row[columnId] as ProcessedItem;
    const value = processedValue?.value;
    return Array.isArray(value) && value.includes(filterValue);
  },

  arrIncludesAll: (
    row: ProcessedRow,
    columnId: string,
    filterValue: unknown[]
  ) => {
    const processedValue = row[columnId] as ProcessedItem;
    const value = processedValue?.value;
    return (
      Array.isArray(value) &&
      Array.isArray(filterValue) &&
      filterValue.every((val) => value.includes(val))
    );
  },

  arrIncludesSome: (
    row: ProcessedRow,
    columnId: string,
    filterValue: unknown[]
  ) => {
    const processedValue = row[columnId] as ProcessedItem;
    if (!processedValue?.value) return false;

    const value = String(processedValue.value).toLowerCase();
    return (
      Array.isArray(filterValue) &&
      filterValue.some((val) => value === String(val).toLowerCase())
    );
  },

  equals: (row: ProcessedRow, columnId: string, filterValue: unknown) => {
    const processedValue = row[columnId] as ProcessedItem;
    return Object.is(processedValue?.value, filterValue);
  },

  weakEquals: (row: ProcessedRow, columnId: string, filterValue: unknown) => {
    const processedValue = row[columnId] as ProcessedItem;
    return processedValue?.value == filterValue;
  },

  inNumberRange: (
    row: ProcessedRow,
    columnId: string,
    filterValue: [number, number]
  ) => {
    logger.debug("Ejecutando filtro de numero:", {
      columnId,
      filterValue,
      rowValue: row[columnId],
    });

    const processedValue = row[columnId] as ProcessedItem;
    if (!processedValue?.value) {
      logger.debug("Valor no encontrado para la columna:", { columnId });
      return false;
    }

    const value = Number(processedValue.value);
    if (isNaN(value)) {
      logger.debug("Valor no es un numero valido:", { value });
      return false;
    }

    const [min, max] = filterValue;
    const result = value >= min && value <= max;
    logger.debug("Comparacion numero:", { value, min, max, result });
    return result;
  },

  processedValueFilter: (
    row: ProcessedRow,
    columnId: string,
    filterValue: FilterCondition
  ) => {
    const processedValue = row[columnId] as ProcessedItem;
    if (!processedValue?.value) return false;

    const rawValue = processedValue.value;

    switch (filterValue.operator) {
      case "includesString":
        return String(rawValue)
          .toLowerCase()
          .includes(String(filterValue.value).toLowerCase());

      case "arrIncludesSome":
        if (!Array.isArray(filterValue.value)) {
          return (
            String(rawValue).toLowerCase() ===
            String(filterValue.value).toLowerCase()
          );
        }
        return filterValue.value.some(
          (val) => String(rawValue).toLowerCase() === String(val).toLowerCase()
        );

      case "in":
        return (
          Array.isArray(filterValue.value) &&
          filterValue.value.includes(String(rawValue))
        );

      case "notIn":
        return (
          Array.isArray(filterValue.value) &&
          !filterValue.value.includes(String(rawValue))
        );

      case "equals":
        return (
          String(rawValue).toLowerCase() ===
          String(filterValue.value).toLowerCase()
        );

      case "notEquals":
        return (
          String(rawValue).toLowerCase() !==
          String(filterValue.value).toLowerCase()
        );

      case "contains":
        return String(rawValue)
          .toLowerCase()
          .includes(String(filterValue.value).toLowerCase());

      case "notContains":
        return !String(rawValue)
          .toLowerCase()
          .includes(String(filterValue.value).toLowerCase());

      case "startsWith":
        return String(rawValue)
          .toLowerCase()
          .startsWith(String(filterValue.value).toLowerCase());

      case "endsWith":
        return String(rawValue)
          .toLowerCase()
          .endsWith(String(filterValue.value).toLowerCase());

      case "greaterThan":
        if (processedValue.type === "date") {
          const date =
            rawValue instanceof Date
              ? rawValue
              : new Date(rawValue as string | number);
          const compareDate = new Date(filterValue.value as string | number);
          return date > compareDate;
        }
        return Number(rawValue) > Number(filterValue.value);

      case "lessThan":
        if (processedValue.type === "date") {
          const date =
            rawValue instanceof Date
              ? rawValue
              : new Date(rawValue as string | number);
          const compareDate = new Date(filterValue.value as string | number);
          return date < compareDate;
        }
        return Number(rawValue) < Number(filterValue.value);

      case "between":
        if (
          filterValue.value === undefined ||
          filterValue.additionalValue === undefined
        ) {
          return false;
        }
        if (processedValue.type === "date") {
          const date =
            rawValue instanceof Date
              ? rawValue
              : new Date(rawValue as string | number);
          const minDate = new Date(filterValue.value as string | number);
          const maxDate = new Date(
            filterValue.additionalValue as string | number
          );
          return date >= minDate && date <= maxDate;
        }
        const value = Number(rawValue);
        const min = Number(filterValue.value);
        const max = Number(filterValue.additionalValue);
        return value >= min && value <= max;

      case "notBetween":
        if (
          filterValue.value === undefined ||
          filterValue.additionalValue === undefined
        ) {
          return false;
        }
        if (processedValue.type === "date") {
          const date =
            rawValue instanceof Date
              ? rawValue
              : new Date(rawValue as string | number);
          const minDate = new Date(filterValue.value as string | number);
          const maxDate = new Date(
            filterValue.additionalValue as string | number
          );
          return date < minDate || date > maxDate;
        }
        const val = Number(rawValue);
        const minVal = Number(filterValue.value);
        const maxVal = Number(filterValue.additionalValue);
        return val < minVal || val > maxVal;

      case "isNull":
        return rawValue === null || rawValue === undefined || rawValue === "";

      case "isNotNull":
        return rawValue !== null && rawValue !== undefined && rawValue !== "";

      case "exactWordMatch": {
        if (!filterValue.value) return false;
        const searchTerms = String(filterValue.value).split("|");
        const patterns = searchTerms.map(
          (term) => new RegExp(`\\b${term}\\b`, "i")
        );
        return patterns.some((pattern) => pattern.test(String(rawValue)));
      }

      case "notExactWordMatch": {
        if (!filterValue.value) return true;
        const searchTerms = String(filterValue.value).split("|");
        const patterns = searchTerms.map(
          (term) => new RegExp(`\\b${term}\\b`, "i")
        );
        return !patterns.some((pattern) => pattern.test(String(rawValue)));
      }

      case "objectPropertyFilter": {
        if (!Array.isArray(filterValue.value)) return false;

        // Use the same logic as the objectPropertyFilter function
        const extractPropertyValues = (obj: unknown): string[] => {
          const values: string[] = [];

          if (typeof obj === "object" && obj !== null) {
            if (Array.isArray(obj)) {
              obj.forEach((item) => {
                if (typeof item === "object" && item !== null) {
                  Object.values(item).forEach((value) => {
                    if (value !== null && value !== undefined) {
                      values.push(String(value).toLowerCase());
                    }
                  });
                } else {
                  values.push(String(item).toLowerCase());
                }
              });
            } else {
              Object.values(obj).forEach((value) => {
                if (value !== null && value !== undefined) {
                  if (typeof value === "object") {
                    values.push(...extractPropertyValues(value));
                  } else {
                    values.push(String(value).toLowerCase());
                  }
                }
              });
            }
          } else {
            values.push(String(obj).toLowerCase());
          }

          return values;
        };

        const objectValues = extractPropertyValues(rawValue);
        const searchTerms = (filterValue.value as string[]).map((term) =>
          String(term).toLowerCase()
        );

        return searchTerms.some((searchTerm) =>
          objectValues.some((objValue) => objValue.includes(searchTerm))
        );
      }

      default:
        return true;
    }
  },

  dateBetweenFilterFn: (
    row: ProcessedRow,
    columnId: string,
    filterValue: string[]
  ) => {
    logger.debug("Ejecutando filtro de fecha:", {
      columnId,
      filterValue,
      rowValue: row[columnId],
    });

    const processedValue = row[columnId] as ProcessedItem;
    if (!processedValue?.value) {
      logger.debug("Valor no encontrado para la columna:", { columnId });
      return false;
    }

    // Convertir el valor de la celda a fecha y formato YYYY-MM-DD
    const date =
      processedValue.value instanceof Date
        ? processedValue.value
        : new Date(processedValue.value as string | number);

    if (!isValidDate(date)) {
      logger.debug("Fecha invalida:", { value: processedValue.value });
      return false;
    }

    const dateStr = formatDate(date, "yyyy-MM-dd");
    const result = filterValue.includes(dateStr);

    logger.debug("Comparacion fecha:", {
      date: dateStr,
      filterDates: filterValue,
      result,
    });

    return result;
  },

  exactWordMatch: (
    row: ProcessedRow,
    columnId: string,
    filterValue: string
  ) => {
    logger.debug("Ejecutando filtro de texto exacto:", {
      columnId,
      filterValue,
      rowValue: row[columnId],
    });

    const processedValue = row[columnId] as ProcessedItem;
    if (!processedValue?.value) {
      logger.debug("Valor no encontrado para la columna:", { columnId });
      return false;
    }

    const value = String(processedValue.value).toLowerCase();
    const searchTerms = String(filterValue).toLowerCase().split("|");

    // Create regex patterns for whole word matching
    const patterns = searchTerms.map(
      (term) => new RegExp(`\\b${term}\\b`, "i")
    );

    // Check if any pattern matches
    const result = patterns.some((pattern) => pattern.test(value));
    logger.debug("Comparacion texto exacto:", { value, searchTerms, result });
    return result;
  },

  notExactWordMatch: (
    row: ProcessedRow,
    columnId: string,
    filterValue: string
  ) => {
    logger.debug("Ejecutando filtro de texto exacto (negado):", {
      columnId,
      filterValue,
      rowValue: row[columnId],
    });

    const processedValue = row[columnId] as ProcessedItem;
    if (!processedValue?.value) {
      logger.debug("Valor no encontrado para la columna:", { columnId });
      return true; // Si no hay valor, no coincide con nada
    }

    const value = String(processedValue.value).toLowerCase();
    const searchTerms = String(filterValue).toLowerCase().split("|");

    // Create regex patterns for whole word matching
    const patterns = searchTerms.map(
      (term) => new RegExp(`\\b${term}\\b`, "i")
    );

    // Check if none of the patterns match
    const result = !patterns.some((pattern) => pattern.test(value));
    logger.debug("Comparacion texto exacto (negado):", {
      value,
      searchTerms,
      result,
    });
    return result;
  },

  objectPropertyFilter: (
    row: ProcessedRow,
    columnId: string,
    filterValue: string[]
  ) => {
    logger.debug("Ejecutando filtro de propiedades de objeto:", {
      columnId,
      filterValue,
      rowValue: row[columnId],
    });

    const processedValue = row[columnId] as ProcessedItem;
    if (!processedValue?.value) {
      logger.debug("Valor no encontrado para la columna:", { columnId });
      return false;
    }

    const rawValue = processedValue.value;

    // Helper function to extract property values from objects
    const extractPropertyValues = (obj: unknown): string[] => {
      const values: string[] = [];

      if (typeof obj === "object" && obj !== null) {
        if (Array.isArray(obj)) {
          // For arrays, extract from each item
          obj.forEach((item) => {
            if (typeof item === "object" && item !== null) {
              Object.values(item).forEach((value) => {
                if (value !== null && value !== undefined) {
                  values.push(String(value).toLowerCase());
                }
              });
            } else {
              values.push(String(item).toLowerCase());
            }
          });
        } else {
          // For objects, extract all property values
          Object.values(obj).forEach((value) => {
            if (value !== null && value !== undefined) {
              if (typeof value === "object") {
                values.push(...extractPropertyValues(value));
              } else {
                values.push(String(value).toLowerCase());
              }
            }
          });
        }
      } else {
        values.push(String(obj).toLowerCase());
      }

      return values;
    };

    const objectValues = extractPropertyValues(rawValue);
    const searchTerms = filterValue.map((term) => String(term).toLowerCase());

    // Check if any of the search terms match any of the object property values
    const result = searchTerms.some((searchTerm) =>
      objectValues.some((objValue) => objValue.includes(searchTerm))
    );

    logger.debug("Comparacion propiedades objeto:", {
      objectValues: objectValues.slice(0, 5), // Show first 5 for debugging
      searchTerms,
      result,
    });

    return result;
  },
};

// Definir el tipo como un registro indexado
export interface FilterFunctions {
  [key: string]: (
    row: ProcessedRow,
    columnId: string,
    filterValue:
      | FilterValue
      | FilterCondition
      | [number, number]
      | [Date, Date]
      | string[]
  ) => boolean;
}

// Exportar dateBetweenFilterFn por separado
export const dateBetweenFilterFn: FilterFn<ProcessedRow> = (
  row,
  columnId,
  filterValue
) => {
  logger.debug("Ejecutando filtro de fecha:", {
    columnId,
    filterValue,
    rowValue: row.getValue(columnId),
  });

  const processedValue = row.getValue(columnId) as ProcessedItem;
  if (!processedValue?.value) {
    logger.debug("Valor no encontrado para la columna:", { columnId });
    return false;
  }

  const date =
    processedValue.value instanceof Date
      ? processedValue.value
      : new Date(processedValue.value as string | number);

  if (!isValidDate(date)) {
    logger.debug("Fecha invalida:", { value: processedValue.value });
    return false;
  }

  const [start, end] = filterValue as [Date | undefined, Date | undefined];

  if (start && !end) {
    const result = date.getTime() >= start.getTime();
    logger.debug("Comparacion fecha inicio:", {
      date: date.toISOString(),
      start: start.toISOString(),
      result,
    });
    return result;
  } else if (!start && end) {
    const result = date.getTime() <= end.getTime();
    logger.debug("Comparacion fecha fin:", {
      date: date.toISOString(),
      end: end.toISOString(),
      result,
    });
    return result;
  } else if (start && end) {
    const result =
      date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
    logger.debug("Comparacion rango fecha:", {
      date: date.toISOString(),
      start: start.toISOString(),
      end: end.toISOString(),
      result,
    });
    return result;
  }

  return true;
};
