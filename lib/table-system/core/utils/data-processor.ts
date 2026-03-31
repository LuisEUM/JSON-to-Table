import type { FilterFn } from "@tanstack/react-table";
import { logger as appLogger } from "../services/logging-service";
import {
  isDate as isDateUtil,
  normalizeDate as normalizeDateUtil,
  cleanStringValue,
} from "./date-utils";
import { withErrorHandling, logError } from "./error-handling";
import { REGEX } from "../constants/regex-patterns";
import {
  KNOWN_OBJECT_FIELDS,
  FLATTEN_OBJECT_PATTERNS,
  BROAD_DATE_FIELD_PATTERNS,
  STANDARD_DATE_FIELDS,
  matchesFieldPattern,
  isKnownField,
  POSTAL_FIELD_PATTERNS,
} from "../constants/field-patterns";
import {
  inferTypeFromSample as inferTypeFromSampleImpl,
  setTypeInferenceLogger,
  type ColumnTypeInfo,
} from "./type-inference";

// Re-export ColumnTypeInfo so consumers that relied on the internal type still work
export type { ColumnTypeInfo };

// Re-export sub-detectors for advanced usage
export {
  detectDateType,
  detectNumberType,
  detectBooleanType,
  detectArrayType,
  detectObjectType,
} from "./type-inference";

// Extensión de FilterFns para tanstack table
declare module "@tanstack/table-core" {
  interface FilterFns {
    processedValueFilter: FilterFn<ProcessedRow>;
  }
}

/* =======================================================
    CONSTANTES Y LOGGER
======================================================= */

interface ILogger {
  log(message: string, ...optionalParams: unknown[]): void;
  warn(message: string, ...optionalParams: unknown[]): void;
  debug(message: string, ...optionalParams: unknown[]): void;
}

let logger: ILogger = appLogger;

export function setLogger(newLogger: ILogger): void {
  logger = newLogger;
  // Propagate to type-inference module
  setTypeInferenceLogger(newLogger);
}

// Sync logger on module load
setTypeInferenceLogger(appLogger);

/* =======================================================
    TIPOS Y UTILIDADES GENERALES
======================================================= */

export interface ProcessedValue {
  value: unknown;
  type: string;
  items?: ProcessedValue[];
  parentId?: string;
  __parentId?: string;
  rawValue?: unknown;
  label?: string;
  title?: string;
  isReference?: boolean;
  path?: string[];
  dateValue?: Date;
}

export interface ProcessedItem extends ProcessedValue {
  id: string;
  path: string[];
  groups?: string[];
  isId?: boolean;
}

export type ProcessedRow = Record<string, ProcessedItem>;

export type ValueType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "array"
  | "primitiveArray"
  | "objectArray"
  | "object"
  | "reference"
  | "null"
  | "undefined";

/**
 * @deprecated Use cleanStringValue from date-utils instead
 */
const cleanString = (v: unknown): string =>
  typeof v === "string"
    ? v.replace(REGEX.QUOTE_STRIP, "")
    : String(v).replace(REGEX.QUOTE_STRIP, "");

/* =======================================================
    MANEJO DE FECHAS (deprecated re-exports)
======================================================= */

/** @deprecated Use isDate from date-utils instead */
export const isDate = isDateUtil;

/** @deprecated Use normalizeDate from date-utils instead */
export const normalizeDate = normalizeDateUtil;

/* =======================================================
    APLANAMIENTO DE OBJETOS
======================================================= */

export const flattenObject = withErrorHandling(
  (obj: Record<string, unknown>, prefix = ""): Record<string, unknown> => {
    return Object.keys(obj).reduce((acc: Record<string, unknown>, key) => {
      const pre = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        !isDate(value)
      ) {
        Object.assign(
          acc,
          flattenObject(value as Record<string, unknown>, pre)
        );
      } else {
        acc[pre] = value;
      }
      return acc;
    }, {});
  },
  (error, obj, prefix) => {
    logError(error, { context: "flattenObject", obj, prefix });
    return { [`${prefix || "error"}`]: `[Error: ${error}]` };
  }
);

export const isIdField = (fieldName: string): boolean => {
  const idPatterns = [/^id$/i, /^_id$/i, /Id$/, /ID$/, /^id[A-Z]/, /^ID[A-Z]/];
  return idPatterns.some((pattern) => pattern.test(fieldName));
};

/* =======================================================
    PROCESAMIENTO DE VALORES Y DATOS
======================================================= */

export const processValue = withErrorHandling(
  (
    value: unknown,
    fieldName: string = "",
    parentId?: string
  ): ProcessedValue => {
    const pathParts = fieldName ? fieldName.split(".") : [];

    // Reference fields
    const isReference =
      fieldName === "__parentId" || fieldName === "__parentTable";
    if (isReference) {
      logger.debug("Procesando campo de referencia:", fieldName, value);
      return {
        value: cleanString(value),
        type: "string",
        path: pathParts,
        label: fieldName,
        isReference: true,
      };
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const refObj = value as Record<string, unknown>;
      if ("__parentId" in refObj || "__parentTable" in refObj) {
        return {
          value: cleanString(refObj.__parentId || refObj.__parentTable),
          type: "string",
          path: pathParts,
          label: fieldName,
          isReference: true,
        };
      }
    }

    if (value === null)
      return { value: "null", type: "null", path: pathParts, label: fieldName };
    if (value === undefined)
      return {
        value: "undefined",
        type: "undefined",
        path: pathParts,
        label: fieldName,
      };

    const base = { value, path: pathParts, label: fieldName };

    if (isDate(value)) {
      const dateObj = normalizeDate(value);
      return {
        ...base,
        value:
          dateObj instanceof Date
            ? `${String(dateObj.getDate()).padStart(2, "0")}-${String(
                dateObj.getMonth() + 1
              ).padStart(2, "0")}-${dateObj.getFullYear()}`
            : dateObj,
        type: "date",
        rawValue: value,
        dateValue: dateObj instanceof Date ? dateObj : undefined,
      };
    }

    if (typeof value === "string")
      return { ...base, value: cleanString(value), type: "string" };

    if (typeof value === "number")
      return { ...base, value, type: "number" };

    if (typeof value === "boolean")
      return { ...base, value: String(value), type: "boolean" };

    if (Array.isArray(value)) {
      const isObjectArray =
        value.length > 0 &&
        typeof value[0] === "object" &&
        value[0] !== null &&
        !Array.isArray(value[0]) &&
        !(value[0] instanceof Date);
      const items = value.map((item) =>
        processValue(item, fieldName, parentId)
      );
      return {
        ...base,
        value,
        type: isObjectArray ? "objectArray" : "primitiveArray",
        items,
      };
    }

    if (typeof value === "object" && value !== null)
      return { ...base, value, type: "object", __parentId: parentId };

    return { ...base, value: cleanString(value), type: "string" };
  },
  (error, value, fieldName, parentId) => {
    logError(error, {
      context: "processValue",
      fieldName,
      valueType: typeof value,
      parentId,
    });
    return {
      value: `[Error: ${error}]`,
      type: "string",
      path: fieldName ? fieldName.split(".") : [],
      label: fieldName,
    };
  }
);

export const processData = withErrorHandling(
  (data: Record<string, unknown>): ProcessedItem[] => {
    const processed: ProcessedItem[] = [];
    const flattenedData = flattenObject(data, "");
    let keyFound = false;
    let currentId: string | undefined;

    for (const [key, value] of Object.entries(flattenedData)) {
      if (isIdField(key) && !keyFound) {
        keyFound = true;
        currentId = String(value);
        break;
      }
    }

    for (const [key, value] of Object.entries(flattenedData)) {
      const path = key.split(".");
      const processedValue = processValue(value, key, currentId);
      const inferredType = inferColumnType(key, processedValue);
      const isKey = isIdField(key) && !keyFound;
      processed.push({
        id: key,
        path,
        ...processedValue,
        type: inferredType,
        isId: isKey,
        __parentId: currentId,
      });
    }

    return processed;
  },
  (error, data) => {
    logError(error, {
      context: "processData",
      dataKeys: Object.keys(data || {}),
    });
    return [
      {
        id: "error",
        path: ["error"],
        value: `Error processing data: ${error}`,
        type: "string",
        label: "Error",
      },
    ];
  }
);

export const inferColumnType = (
  columnName: string,
  value: ProcessedValue
): string => {
  return value.type;
};

/* =======================================================
    AGRUPACIÓN DE COLUMNAS
======================================================= */

export interface GroupedColumns {
  id: string;
  header: string;
  level: number;
  items?: ProcessedItem[];
  children?: GroupedColumns[];
}

export const groupColumns = withErrorHandling(
  (
    data: ProcessedItem[]
  ): { rootItems: ProcessedItem[]; groups: GroupedColumns[] } => {
    if (!data?.length) return { rootItems: [], groups: [] };

    const rootItems: ProcessedItem[] = [];
    const groupTree: { [key: string]: GroupedColumns } = {};

    data.forEach((item) => {
      if (!item.groups || item.groups.length === 0) {
        rootItems.push(item);
      } else {
        item.groups.forEach((group, index) => {
          const level = index + 1;
          if (!groupTree[group]) {
            groupTree[group] = {
              id: group,
              header: group,
              level,
              items: [],
              children: [],
            };
          }
        });
      }
    });

    return {
      rootItems,
      groups: Object.values(groupTree).filter((group) => group.level === 1),
    };
  },
  (error, data) => {
    logError(error, { context: "groupColumns", itemCount: data?.length || 0 });
    return { rootItems: data || [], groups: [] };
  }
);

/* =======================================================
    ANÁLISIS DE TIPOS POR COLUMNA
======================================================= */

export const analyzeColumnTypes = withErrorHandling(
  (
    data: Record<string, unknown>[],
    sampleSize: number = 100
  ): Record<string, ColumnTypeInfo> => {
    if (!data.length) return {};

    const allColumns = new Set<string>();
    data.forEach((row) => {
      Object.keys(row).forEach((key) => allColumns.add(key));
    });

    const columnAnalysis: Record<string, ColumnTypeInfo> = {};

    logger.debug("Iniciando análisis de tipos por columna...");

    for (const columnName of allColumns) {
      const columnValues = data
        .map((row) => row[columnName])
        .filter((value) => value !== null && value !== undefined);
      const actualSampleSize = Math.max(
        10,
        Math.min(columnValues.length, sampleSize)
      );
      const sampleValues = columnValues.slice(0, actualSampleSize);

      logger.debug(`Analizando columna: ${columnName}`, {
        totalValores: columnValues.length,
        sampleSize: sampleValues.length,
      });

      columnAnalysis[columnName] = inferTypeFromSampleImpl(
        sampleValues,
        columnName
      );
      logger.debug(
        `Tipo inferido para ${columnName}:`,
        columnAnalysis[columnName]
      );
    }

    return columnAnalysis;
  },
  (error, data, sampleSize) => {
    logError(error, {
      context: "analyzeColumnTypes",
      rowCount: data?.length || 0,
      sampleSize,
    });
    return {};
  }
);

/**
 * Delegates to the extracted type-inference module.
 * Kept as a named export for backward compatibility.
 */
export const inferTypeFromSample = inferTypeFromSampleImpl;

/* =======================================================
    PROCESAMIENTO POR LOTES
======================================================= */

interface BatchProcessOptions {
  sampleSize: number;
}

export const processBatchData = withErrorHandling(
  (
    dataRows: Record<string, unknown>[],
    options: BatchProcessOptions = { sampleSize: 100 }
  ): ProcessedItem[][] => {
    if (!dataRows.length) return [];

    logger.debug("Iniciando procesamiento por lotes:", {
      totalRows: dataRows.length,
      sampleSize: options.sampleSize,
    });

    // Pre-process: flatten nested objects
    const flattenedDataRows: Record<string, unknown>[] = dataRows.map(
      (row) => {
        const flattenedRow: Record<string, unknown> = {};
        const normalizedRow: Record<string, unknown> = { ...row };

        // Pre-normalize known object fields
        for (const [key, value] of Object.entries(normalizedRow)) {
          const isKnownObjectField =
            isKnownField(key, KNOWN_OBJECT_FIELDS) ||
            matchesFieldPattern(key, FLATTEN_OBJECT_PATTERNS);

          if (
            isKnownObjectField &&
            (value === 0 ||
              value === "" ||
              value === null ||
              value === undefined)
          ) {
            normalizedRow[key] = { num: null, name: null };
            logger.debug(
              `Pre-normalizando campo ${key}: valor ${value} convertido a objeto con propiedades vacías`
            );
          }
        }

        // Flatten
        for (const [key, value] of Object.entries(normalizedRow)) {
          if (
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value) &&
            !(value instanceof Date)
          ) {
            Object.assign(
              flattenedRow,
              flattenObject(value as Record<string, unknown>, key)
            );
          } else {
            flattenedRow[key] = value;
          }
        }
        return flattenedRow;
      }
    );

    const columnTypes: Record<string, ColumnTypeInfo> = analyzeColumnTypes(
      flattenedDataRows,
      options.sampleSize
    );

    // Secondary date detection by field name patterns
    Object.keys(columnTypes).forEach((key) => {
      if (columnTypes[key].type === "date") return;

      const isLikelyDateField = matchesFieldPattern(
        key,
        BROAD_DATE_FIELD_PATTERNS
      );

      if (isLikelyDateField) {
        const sampleValues = flattenedDataRows
          .slice(0, Math.min(flattenedDataRows.length, 50))
          .map((row) => row[key])
          .filter((v) => v !== null && v !== undefined);

        const potentialDateValues = sampleValues.filter((v) => {
          if (typeof v === "number" && v > 1000000000 && v < 9999999999999)
            return true;
          if (typeof v === "string") {
            const clean = cleanStringValue(v);
            if (REGEX.TIMESTAMP_STRING.test(clean) && !isNaN(Number(clean)))
              return true;
            if (REGEX.ISO_OR_COMMON_DATE.test(clean)) return true;
          }
          return false;
        });

        if (potentialDateValues.length > 0) {
          logger.debug(
            `Columna ${key}: Detectada como fecha por nombre y valores compatibles (${potentialDateValues.length}/${sampleValues.length} valores posibles)`
          );
          columnTypes[key] = {
            type: "date",
            normalizer: normalizeDate,
          };
        }
      }
    });

    // Store original values for normalizer application
    const originalValues: Map<number, Map<string, unknown>> = new Map();
    flattenedDataRows.forEach((row, rowIndex) => {
      const rowOriginals = new Map<string, unknown>();
      Object.entries(row).forEach(([key, value]) => {
        rowOriginals.set(key, value);
      });
      originalValues.set(rowIndex, rowOriginals);
    });

    return flattenedDataRows.map((data, index) => {
      if (index % 100 === 0) {
        logger.debug(`Procesando fila ${index}/${flattenedDataRows.length}`);
      }

      const processed: ProcessedItem[] = [];
      let keyFound = false;
      let currentId: string | undefined;

      for (const [key, value] of Object.entries(data)) {
        if (isIdField(key) && !keyFound) {
          keyFound = true;
          currentId = cleanString(value);
          break;
        }
      }

      for (const [key, value] of Object.entries(data)) {
        const path = key.split(".");
        const origValue = originalValues.get(index)?.get(key) ?? value;
        const isLongNumericString =
          (typeof value === "number" && value.toString().length >= 5) ||
          (typeof value === "string" &&
            REGEX.LONG_NUMERIC_STRING.test(cleanString(value)));
        const isPostalColumn = matchesFieldPattern(key, POSTAL_FIELD_PATTERNS);
        const columnTypeInfo = columnTypes[key];
        let processedValue: ProcessedValue;

        const isKnownObjField =
          isKnownField(key, KNOWN_OBJECT_FIELDS) ||
          matchesFieldPattern(key, FLATTEN_OBJECT_PATTERNS);

        if (
          isKnownObjField &&
          (value === 0 || value === "" || value === null || value === undefined)
        ) {
          logger.debug(
            `Campo ${key} con valor ${value} encontrado después de pre-normalización. Asignando objeto vacío.`
          );
          processedValue = {
            value: {},
            type: "object",
            path,
            label: key,
            __parentId: currentId,
          };
        } else if (
          isPostalColumn ||
          isLongNumericString ||
          (typeof value === "string" &&
            REGEX.STRING_NUMBER_PATTERN.test(cleanString(value)))
        ) {
          if (isKnownField(key, STANDARD_DATE_FIELDS)) {
            const dateObj = normalizeDate(value);
            processedValue = {
              value:
                dateObj instanceof Date
                  ? dateObj.toLocaleString("es-ES", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })
                  : dateObj,
              type: "date",
              path,
              label: key,
              rawValue: origValue,
              dateValue: dateObj instanceof Date ? dateObj : undefined,
            };
          } else {
            processedValue = {
              value:
                typeof origValue === "string"
                  ? cleanString(origValue)
                  : cleanString(origValue),
              type: "string",
              path,
              label: key,
            };
          }
        } else if (
          value !== null &&
          typeof value === "object" &&
          !Array.isArray(value) &&
          !(value instanceof Date)
        ) {
          logger.warn(
            `⚠️ Objeto encontrado después de aplanar: ${key}`,
            value
          );
          flattenObject(value as Record<string, unknown>, key);
          processedValue = {
            value: "[Objeto]",
            type: "object",
            path,
            label: key,
            __parentId: currentId,
          };
        } else if (columnTypeInfo) {
          if (columnTypeInfo.type === "date" && isDate(value)) {
            const dateObj = normalizeDate(value);
            processedValue = {
              value:
                dateObj instanceof Date
                  ? dateObj.toLocaleString("es-ES", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })
                  : dateObj,
              type: "date",
              path,
              label: key,
              rawValue: origValue,
              dateValue: dateObj instanceof Date ? dateObj : undefined,
            };
          } else {
            processedValue = processValue(origValue, key, currentId);
            processedValue.type = columnTypeInfo.type;
            if (
              columnTypeInfo.type === "number" &&
              typeof origValue !== "number"
            ) {
              processedValue.value = columnTypeInfo.normalizer(origValue);
            } else if (
              columnTypeInfo.type === "boolean" &&
              typeof origValue !== "boolean"
            ) {
              processedValue.value = columnTypeInfo.normalizer(origValue);
            } else {
              if (typeof origValue === "string") {
                processedValue.value = cleanString(origValue);
              } else if (typeof processedValue.value === "string") {
                processedValue.value = cleanString(processedValue.value);
              } else {
                processedValue.value = origValue;
              }
            }
          }
        } else {
          processedValue = processValue(origValue, key, currentId);
        }

        if (typeof processedValue.value === "string") {
          processedValue.value = cleanString(processedValue.value);
        }

        processed.push({
          id: key,
          path,
          ...processedValue,
          label: key,
          isId: isIdField(key) && !keyFound,
          __parentId: currentId,
        });
      }

      return processed;
    });
  },
  (error, dataRows, options) => {
    logError(error, {
      context: "processBatchData",
      rowCount: dataRows?.length || 0,
      options,
    });
    return [
      [
        {
          id: "error",
          path: ["error"],
          value: `Error processing batch data: ${error}`,
          type: "string",
          label: "Error",
        },
      ],
    ];
  }
);
