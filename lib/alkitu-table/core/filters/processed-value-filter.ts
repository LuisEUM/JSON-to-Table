import type { FilterFn } from "@tanstack/react-table";
import type { ProcessedItem, ProcessedRow } from "../utils/data-processor";
import type { FilterCondition } from "../../molecules/filters/filter-types";
import {
  matchesFilterWithSeparator,
  matchesTextSearch,
  normalizeFilterValues,
  type SeparatorType,
} from "./filter-utils";
import { logger } from "../services/logging-service";

/**
 * Recursively extract property values from objects and arrays
 * as lowercase strings for comparison purposes.
 */
export const extractPropertyValues = (obj: unknown): string[] => {
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

export const processedValueFilter: FilterFn<ProcessedRow> = (
  row,
  columnId,
  filterValue
) => {
  if (
    !filterValue ||
    typeof filterValue !== "object" ||
    !("operator" in filterValue)
  ) {
    return true;
  }

  const processedValue = row.original[columnId] as ProcessedItem;
  if (!processedValue) return false;

  // Debug: Ver la estructura del processedValue para arrays
  if (
    columnId.includes("shippingAddresses") ||
    columnId.includes("memberships")
  ) {
    logger.debug("ProcessedValue debug:", {
      columnId,
      processedValue: {
        type: processedValue.type,
        value: processedValue.value,
        items: processedValue.items,
        hasItems: !!processedValue.items,
        itemsLength: processedValue.items?.length,
        firstItem: processedValue.items?.[0],
      },
    });
  }

  const rawValue = processedValue.value;
  const columnType = processedValue.type;
  const typedFilterValue = filterValue as FilterCondition;

  switch (typedFilterValue.operator) {
    case "arrIncludesSome":
      if (columnType === "date") {
        try {
          // rawValue is already formatted as DD-MM-YYYY by data-processor
          // Convert separator to match filter format (DD/MM/YYYY)
          const formattedCellDate = String(rawValue).replace(/-/g, "/");

          // Asegurarse de que filterValue.value sea un array
          const filterValues = Array.isArray(typedFilterValue.value)
            ? typedFilterValue.value
            : [typedFilterValue.value];

          // Ya no necesitamos convertir entre formatos, las comparaciones serán directas
          logger.debug(
            `Comparando fecha: ${formattedCellDate} con filtros:`,
            filterValues
          );

          // Verificar si alguno de los valores de filtro coincide con la fecha formateada
          const result = filterValues.some((val: unknown) => {
            const stringVal = String(val).trim();
            const match = formattedCellDate === stringVal;
            logger.debug(
              `- Comparando con ${stringVal}: ${
                match ? "COINCIDE" : "no coincide"
              }`
            );
            return match;
          });

          logger.debug(
            `Resultado final para ${formattedCellDate}: ${
              result ? "INCLUIDO" : "NO INCLUIDO"
            }`
          );
          return result;
        } catch (error) {
          logger.error("Error al comparar fechas:", error);
          return false;
        }
      } else if (
        columnType === "objectArray" ||
        columnType === "array"
      ) {
        // Debug: Log para arrays
        logger.debug("Filtering array column:", {
          columnId,
          columnType,
          rawValue,
          filterValue: typedFilterValue,
          rawValueType: typeof rawValue,
          isRawValueArray: Array.isArray(rawValue),
        });

        // Manejar arrays de objetos específicamente
        const filterValues = Array.isArray(typedFilterValue.value)
          ? typedFilterValue.value
          : [typedFilterValue.value];

        // Para arrays procesados, los elementos están en processedValue.items
        let arrayToCheck = rawValue;
        if (processedValue.items && Array.isArray(processedValue.items)) {
          // Extraer los valores reales de los ProcessedValue items
          arrayToCheck = processedValue.items.map((item) => item.value);
          logger.debug("Using items array:", {
            originalRawValue: rawValue,
            itemsArray: arrayToCheck,
            itemsLength: (arrayToCheck as unknown[]).length,
          });
        }

        // Si tenemos un array para verificar, verificar si algún elemento coincide
        if (Array.isArray(arrayToCheck)) {
          const result = arrayToCheck.some((arrayItem: unknown) => {
            return filterValues.some((filterVal: unknown) => {
              logger.debug("Comparing array items:", {
                arrayItem:
                  typeof arrayItem === "object"
                    ? JSON.stringify(arrayItem).slice(0, 100)
                    : arrayItem,
                filterVal:
                  typeof filterVal === "object"
                    ? JSON.stringify(filterVal).slice(0, 100)
                    : filterVal,
                arrayItemType: typeof arrayItem,
                filterValType: typeof filterVal,
              });

              // Para objetos, comparar por contenido
              if (
                typeof arrayItem === "object" &&
                typeof filterVal === "object" &&
                arrayItem !== null &&
                filterVal !== null
              ) {
                try {
                  const match =
                    JSON.stringify(arrayItem) ===
                    JSON.stringify(filterVal);
                  logger.debug("Object comparison result:", match);
                  return match;
                } catch {
                  logger.debug("Object comparison failed");
                  return false;
                }
              }
              // Para primitivos, comparación directa
              const match = arrayItem === filterVal;
              logger.debug("Primitive comparison result:", match);
              return match;
            });
          });

          logger.debug("Array filter result:", result);
          return result;
        }

        logger.debug(
          "Array filter - arrayToCheck is not array, returning false"
        );
        return false;
      } else {
        // Para valores no-fecha y no-array, verificar el tipo de columna
        const filterValues = Array.isArray(typedFilterValue.value)
          ? typedFilterValue.value
          : [typedFilterValue.value];

        // Si es una columna numérica, hacer comparación exacta de números
        if (columnType === "number") {
          const numericRawValue = Number(rawValue);
          if (isNaN(numericRawValue)) return false;

          return filterValues.some((val: unknown) => {
            const numericFilterValue = Number(val);
            return (
              !isNaN(numericFilterValue) &&
              numericRawValue === numericFilterValue
            );
          });
        }

        // Para otros tipos (texto), usar la lógica original de includes
        return filterValues.some((val: unknown) => {
          const stringVal = String(val).toLowerCase();
          const stringRawVal = String(rawValue).toLowerCase();
          return stringRawVal.includes(stringVal);
        });
      }
    case "in": {
      // Manejo mejorado para filtros con separadores
      const filterValues = normalizeFilterValues(typedFilterValue.value);
      const fieldValue = String(rawValue);
      const separator = typedFilterValue.additionalValue as SeparatorType;
      const exactMatch = typedFilterValue.exactMatch === true;

      // Si hay separador, usar la lógica de separación
      if (separator && separator !== "none") {
        return matchesFilterWithSeparator(
          fieldValue,
          filterValues,
          separator,
          exactMatch
        );
      }

      // Sin separador: comparación directa
      return filterValues.includes(fieldValue);
    }
    case "notIn":
      return (
        Array.isArray(typedFilterValue.value) &&
        !typedFilterValue.value.includes(String(rawValue))
      );
    case "equals":
      return rawValue === typedFilterValue.value;
    case "notEquals":
      return rawValue !== typedFilterValue.value;
    case "contains": {
      const searchTerms = normalizeFilterValues(typedFilterValue.value);
      const textValue = String(rawValue);
      const exactWordMatch = typedFilterValue.exactMatch === true;

      return matchesTextSearch(textValue, searchTerms, exactWordMatch);
    }
    case "notContains":
      return !String(rawValue)
        .toLowerCase()
        .includes(String(typedFilterValue.value).toLowerCase());
    case "exactWordMatch":
      if (typeof typedFilterValue.value === "string") {
        const searchTerms: string[] = typedFilterValue.value.split("|");
        const patterns: RegExp[] = searchTerms.map(
          (term: string) => new RegExp(`\\b${term}\\b`, "i")
        );
        return patterns.some((pattern: RegExp) =>
          pattern.test(String(rawValue))
        );
      }
      return false;
    case "notExactWordMatch":
      if (typeof typedFilterValue.value === "string") {
        const searchTerms: string[] = typedFilterValue.value.split("|");
        const patterns: RegExp[] = searchTerms.map(
          (term: string) => new RegExp(`\\b${term}\\b`, "i")
        );
        return !patterns.some((pattern: RegExp) =>
          pattern.test(String(rawValue))
        );
      }
      return true;
    case "startsWith":
      return String(rawValue)
        .toLowerCase()
        .startsWith(String(typedFilterValue.value).toLowerCase());
    case "endsWith":
      return String(rawValue)
        .toLowerCase()
        .endsWith(String(typedFilterValue.value).toLowerCase());
    case "greaterThan":
      return Number(rawValue) > Number(typedFilterValue.value);
    case "lessThan":
      return Number(rawValue) < Number(typedFilterValue.value);
    case "between":
      if (
        typedFilterValue.value !== undefined &&
        typedFilterValue.additionalValue !== undefined
      ) {
        const min = Number(typedFilterValue.value);
        const max = Number(typedFilterValue.additionalValue);
        const value = Number(rawValue);
        return value >= min && value <= max;
      }
      return false;
    case "notBetween":
      if (
        typedFilterValue.value !== undefined &&
        typedFilterValue.additionalValue !== undefined
      ) {
        const min = Number(typedFilterValue.value);
        const max = Number(typedFilterValue.additionalValue);
        const value = Number(rawValue);
        return value < min || value > max;
      }
      return false;
    case "isNull":
      return rawValue === null || rawValue === undefined;
    case "isNotNull":
      return rawValue !== null && rawValue !== undefined;
    case "includesString":
      if (typeof typedFilterValue.value === "string") {
        const pattern = typedFilterValue.value.split("|");
        return pattern.some((value: string) =>
          String(rawValue).toLowerCase().includes(value.toLowerCase())
        );
      }
      return false;
    case "objectPropertyFilter": {
      // Usar la función objectPropertyFilter importada
      if (!Array.isArray(typedFilterValue.value)) return false;

      const objectValues = extractPropertyValues(rawValue);
      const searchTerms = (typedFilterValue.value as string[]).map((term) =>
        String(term).toLowerCase()
      );

      // Check if any of the search terms match any of the object property values
      const hasMatch = searchTerms.some((searchTerm) =>
        objectValues.some((objValue) => objValue.includes(searchTerm))
      );

      // Handle inclusion/exclusion logic
      const isInclude = typedFilterValue.additionalValue === "include";
      const matchResult = isInclude ? hasMatch : !hasMatch;

      logger.debug("ObjectPropertyFilter resultado:", {
        columnId,
        searchTerms,
        objectValues: objectValues.slice(0, 5), // Show first 5 for debugging
        hasMatch,
        isInclude,
        finalResult: matchResult,
      });

      return matchResult;
    }
    default:
      return true;
  }
};
