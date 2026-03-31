/**
 * Type inference engine for column type detection.
 *
 * Analyzes sample values from a column and determines the most appropriate
 * ValueType (date, number, boolean, array, object, string) based on
 * heuristics including value analysis and field name patterns.
 */

import type { ValueType } from "./data-processor";
import {
  isDate as isDateUtil,
  normalizeDate as normalizeDateUtil,
  isDateColumnName,
  isStrongDateColumn,
  cleanStringValue,
} from "./date-utils";
import { REGEX } from "../constants/regex-patterns";
import {
  TEXT_ARRAY_FIELD_PATTERNS,
  POSTAL_FIELD_PATTERNS,
  OBJECT_FIELD_PATTERNS,
  KNOWN_OBJECT_FIELDS,
  ARRAY_COLUMN_NAME_PATTERNS,
  DATE_FIELD_PATTERNS,
  STANDARD_DATE_FIELDS,
  matchesFieldPattern,
  isKnownField,
} from "../constants/field-patterns";
import { getCached, setCache, generateCacheKey } from "./type-cache";

// ─── Types ──────────────────────────────────────────────────────────────────

/** Result of a sub-detector: type + confidence, or null if not detected */
export interface DetectionResult {
  type: ValueType;
  confidence: number;
}

/** Column type information with a normalizer function */
export interface ColumnTypeInfo {
  type: ValueType;
  normalizer: (value: unknown) => unknown;
}

// ─── Logger interface (injected from data-processor) ────────────────────────

interface ILogger {
  log(message: string, ...optionalParams: unknown[]): void;
  warn(message: string, ...optionalParams: unknown[]): void;
  debug(message: string, ...optionalParams: unknown[]): void;
}

let logger: ILogger = console;

/** Allow the parent module to inject its logger */
export function setTypeInferenceLogger(newLogger: ILogger): void {
  logger = newLogger;
}

// ─── Normalizer factories ───────────────────────────────────────────────────

const stringNormalizer = (v: unknown) =>
  v == null ? "" : cleanStringValue(v);

const dateNormalizer = normalizeDateUtil;

const numberNormalizer = (v: unknown) => {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const cleaned = v.replace(REGEX.QUOTE_STRIP, "").replace(REGEX.NUMERIC_NOISE, "");
    return Number(cleaned);
  }
  return 0;
};

const booleanNormalizer = (v: unknown) => {
  if (v == null) return false;
  if (v === 0 || v === "0" || v === false) return false;
  if (v === 1 || v === "1" || v === true) return true;
  return !!v;
};

const arrayNormalizer = (v: unknown) => (v == null ? [] : v);

const objectNormalizer = (v: unknown) => {
  if (v === 0 || v === null || v === undefined) return {};
  return v;
};

// ─── Sub-detectors ──────────────────────────────────────────────────────────

/**
 * Detect whether values represent a date column.
 * Checks Date objects, numeric timestamps, and string date formats.
 */
export function detectDateType(
  values: unknown[],
  columnName: string
): DetectionResult | null {
  // Strong date column names get immediate detection
  if (isStrongDateColumn(columnName)) {
    return { type: "date", confidence: 1.0 };
  }

  const nonNullValues = values.filter(
    (v) => v !== null && v !== undefined && v !== 0
  );

  // Check for timestamp strings when the column name suggests dates
  if (isDateColumnName(columnName)) {
    const stringValues = nonNullValues.filter((v) => typeof v === "string");
    if (stringValues.length > 0) {
      const potentialTimestamps = stringValues.filter((v) => {
        const clean = cleanStringValue(v);
        return REGEX.TIMESTAMP_STRING.test(clean) && !isNaN(Number(clean));
      });
      const percentageTimestamps =
        potentialTimestamps.length / stringValues.length;
      if (percentageTimestamps > 0.7) {
        return { type: "date", confidence: percentageTimestamps };
      }
    }
  }

  // Count date-compatible values
  const dateCompatibleValues = nonNullValues.filter((v) => {
    if (v instanceof Date) return true;

    if (typeof v === "number") {
      // Timestamp in seconds (10 digits) from year 2000 to 2050
      if (v >= 946684800 && v <= 2524608000) return true;
      // Timestamp in milliseconds (13 digits) from year 2000 to 2050
      if (v >= 946684800000 && v <= 2524608000000) return true;
    }

    if (typeof v === "string") {
      const clean = cleanStringValue(v);

      // Numeric string that looks like a timestamp
      if (REGEX.TIMESTAMP_STRING.test(clean) && !isNaN(Number(clean))) {
        const num = Number(clean);
        if (
          num >= 946684800 &&
          (num <= 2524608000 ||
            (num >= 946684800000 && num <= 2524608000000))
        ) {
          return true;
        }
      }

      if (REGEX.ISO_DATE.test(clean)) return true;
      if (REGEX.COMMON_DATE.test(clean)) return true;
      if (REGEX.REVERSE_DATE.test(clean)) return true;
    }

    return false;
  });

  if (dateCompatibleValues.length > 0 && nonNullValues.length > 0) {
    const dateCompatiblePercentage =
      dateCompatibleValues.length / nonNullValues.length;
    const dateThreshold = isDateColumnName(columnName) ? 0.3 : 0.7;

    logger.debug(`Análisis de fechas para ${columnName}:`, {
      total: nonNullValues.length,
      compatibles: dateCompatibleValues.length,
      porcentaje: (dateCompatiblePercentage * 100).toFixed(2) + "%",
      umbral: (dateThreshold * 100).toFixed(2) + "%",
    });

    if (dateCompatiblePercentage >= dateThreshold) {
      return { type: "date", confidence: dateCompatiblePercentage };
    }
  }

  // Strongly-named date fields
  if (
    matchesFieldPattern(columnName, DATE_FIELD_PATTERNS) &&
    dateCompatibleValues.length > 0
  ) {
    return { type: "date", confidence: 0.9 };
  }

  // Standard date fields (createdAt, updatedAt) with non-null values
  if (
    isKnownField(columnName, STANDARD_DATE_FIELDS) &&
    nonNullValues.length > 0
  ) {
    return { type: "date", confidence: 0.85 };
  }

  // Numeric values that are timestamps
  const numericValues = nonNullValues.filter((v) => typeof v === "number");
  if (
    numericValues.length > 0 &&
    numericValues.length === nonNullValues.length
  ) {
    const countTimestamps = numericValues.filter(isDateUtil).length;
    const percentageTimestamps = countTimestamps / numericValues.length;
    if (
      percentageTimestamps > 0.8 ||
      (isDateColumnName(columnName) && percentageTimestamps > 0.5)
    ) {
      return { type: "date", confidence: percentageTimestamps };
    }
  }

  return null;
}

/**
 * Detect whether values represent a number column.
 * Handles pure numbers, cleaned numeric strings, and nested stat properties.
 */
export function detectNumberType(
  values: unknown[],
  columnName: string
): DetectionResult | null {
  const nonNullValues = values.filter(
    (v) => v !== null && v !== undefined && v !== 0
  );

  // All values are 0 or null → number
  if (nonNullValues.length === 0 && values.some((v) => v === 0)) {
    return { type: "number", confidence: 1.0 };
  }

  // Nested stat properties (e.g. stats.hp)
  const isNestedProperty = columnName.includes(".");
  if (isNestedProperty) {
    if (REGEX.STATS_PROPERTY.test(columnName)) {
      const numericValues = values.filter((value) => {
        if (typeof value === "number") return true;
        if (typeof value === "string") {
          const cleaned = value
            .replace(REGEX.QUOTE_STRIP, "")
            .replace(REGEX.NUMERIC_NOISE, "");
          return !isNaN(Number(cleaned)) && REGEX.NUMERIC_ONLY.test(cleaned);
        }
        return false;
      });
      if (numericValues.length > 0) {
        return { type: "number", confidence: numericValues.length / values.length };
      }
    }

    // General numeric detection for nested properties
    const numericValues = values.filter((value) => {
      if (typeof value === "number") return true;
      if (typeof value === "string") {
        const cleaned = value
          .replace(REGEX.QUOTE_STRIP, "")
          .replace(REGEX.NUMERIC_NOISE, "");
        return (
          !isNaN(Number(cleaned)) &&
          REGEX.NUMERIC_ONLY.test(cleaned) &&
          cleaned.length <= 4
        );
      }
      return false;
    });

    if (numericValues.length / values.length > 0.7) {
      return { type: "number", confidence: numericValues.length / values.length };
    }
  }

  // String-like numbers that should stay as strings (long numbers, phone-like)
  const stringNumberValues = nonNullValues.filter(
    (v) =>
      (typeof v === "string" &&
        REGEX.STRING_NUMBER_PATTERN.test(cleanStringValue(v))) ||
      (typeof v === "number" &&
        v.toString().length >= 5 &&
        v.toString().length <= 10)
  );
  if (stringNumberValues.length > 0) {
    // These should be strings, not numbers – signal no numeric detection
    return null;
  }

  // All values are plain numbers
  const numericCandidates = values.map((v) => {
    if (typeof v === "number") {
      if (v.toString().length >= 5) return false;
      return true;
    }
    if (typeof v !== "string") return false;
    const cleaned = cleanStringValue(v).replace(REGEX.NUMERIC_NOISE, "");
    if (cleaned.length >= 5 && REGEX.NUMERIC_ONLY.test(cleaned)) return false;
    return !isNaN(Number(cleaned));
  });
  if (numericCandidates.every((v) => v === true)) {
    return { type: "number", confidence: 1.0 };
  }

  return null;
}

/**
 * Detect whether values represent a boolean column.
 */
export function detectBooleanType(
  values: unknown[]
): DetectionResult | null {
  const booleanValues = values.filter(
    (v) =>
      v === 0 || v === 1 || v === "0" || v === "1" || v === true || v === false
  );
  if (booleanValues.length / values.length > 0.95) {
    return { type: "boolean", confidence: booleanValues.length / values.length };
  }
  return null;
}

/**
 * Detect whether values represent an array column (with sub-type detection).
 */
export function detectArrayType(
  values: unknown[],
  columnName: string
): DetectionResult | null {
  const allArrays = values.filter((v) => Array.isArray(v)) as unknown[][];

  if (allArrays.length > 0) {
    // Count arrays that contain at least one object
    const arraysWithObjects = allArrays.filter((arr) => {
      if (arr.length === 0) return false;
      return arr.some(
        (item: unknown) =>
          (typeof item === "object" &&
            item !== null &&
            !Array.isArray(item) &&
            !(item instanceof Date)) ||
          (typeof item === "string" &&
            (item.includes("[object Object]") ||
              item.trim() === "[object Object]" ||
              REGEX.OBJECT_IN_STRING.test(item.trim())))
      );
    });

    // If arrays contain objects
    if (
      arraysWithObjects.length > 0 &&
      (arraysWithObjects.length /
        values.filter((v) => v !== null).length >
        0.01 ||
        allArrays.length < 10)
    ) {
      return {
        type: "objectArray",
        confidence: arraysWithObjects.length / allArrays.length,
      };
    }

    // All arrays are empty – infer by column name
    const emptyArrays = allArrays.filter((arr) => arr.length === 0);
    if (emptyArrays.length === allArrays.length) {
      if (matchesFieldPattern(columnName, ARRAY_COLUMN_NAME_PATTERNS)) {
        return { type: "objectArray", confidence: 0.6 };
      }
    }

    // Primitive arrays
    return {
      type: "primitiveArray",
      confidence: allArrays.length / values.length,
    };
  }

  // Strings that represent [object Object] arrays
  const arrayObjectValues = values.filter(
    (v: unknown) =>
      !Array.isArray(v) &&
      typeof v === "string" &&
      v.includes("[object Object]")
  );
  if (
    arrayObjectValues.length > 0 &&
    arrayObjectValues.length / values.filter((v) => v !== null).length > 0.1
  ) {
    return { type: "objectArray", confidence: arrayObjectValues.length / values.length };
  }

  return null;
}

/**
 * Detect whether values represent an object column.
 */
export function detectObjectType(
  values: unknown[],
  columnName: string
): DetectionResult | null {
  const objectValues = values.filter(
    (v) =>
      typeof v === "object" &&
      v !== null &&
      !Array.isArray(v) &&
      !(v instanceof Date)
  );

  const hasObjectValues = objectValues.length > 0;
  const hasZeroOrNullValues =
    values.filter((v) => v === 0 || v === null || v === undefined).length > 0;

  const isLikelyObjectField = matchesFieldPattern(
    columnName,
    OBJECT_FIELD_PATTERNS
  );

  // Object + zero/null values + name suggests object
  if (hasObjectValues && hasZeroOrNullValues && isLikelyObjectField) {
    logger.debug(
      `Columna ${columnName}: Detectado como objeto con valores mixtos (${objectValues.length} objetos y valores 0/null/undefined)`
    );
    return { type: "object", confidence: 0.9 };
  }

  // Object values + name strongly suggests object
  if (hasObjectValues && isLikelyObjectField) {
    return { type: "object", confidence: 0.85 };
  }

  // Known specific object fields
  if (isKnownField(columnName, KNOWN_OBJECT_FIELDS) && hasObjectValues) {
    return { type: "object", confidence: 0.95 };
  }

  // General object detection: more than 10% of non-null values are objects
  if (
    objectValues.length > 0 &&
    objectValues.length / values.filter((v) => v !== null).length > 0.1
  ) {
    return { type: "object", confidence: objectValues.length / values.length };
  }

  return null;
}

// ─── Main orchestrator ──────────────────────────────────────────────────────

/**
 * Infer the type of a column based on a sample of values.
 *
 * Detection order:
 * 1. Text-array fields by name convention (notes, comments)
 * 2. Postal code fields → string
 * 3. Nested numeric properties
 * 4. Date detection
 * 5. String-like numbers → string (guard)
 * 6. Boolean detection
 * 7. Object detection
 * 8. Array detection
 * 9. Pure number detection
 * 10. Default → string
 */
export function inferTypeFromSample(
  sampleValues: unknown[],
  columnName: string,
  _sampleSize?: number // eslint-disable-line @typescript-eslint/no-unused-vars
): ColumnTypeInfo {
  if (!sampleValues.length) {
    return { type: "string", normalizer: stringNormalizer };
  }

  // Check cache first
  const cacheKey = generateCacheKey(columnName, sampleValues);
  const cached = getCached<ColumnTypeInfo>(cacheKey);
  if (cached) {
    return cached;
  }

  const result = inferTypeFromSampleUncached(sampleValues, columnName);
  setCache(cacheKey, result);
  return result;
}

/** Internal uncached implementation of type inference */
function inferTypeFromSampleUncached(
  sampleValues: unknown[],
  columnName: string
): ColumnTypeInfo {
  // 1. Text-array fields by name convention
  if (matchesFieldPattern(columnName, TEXT_ARRAY_FIELD_PATTERNS)) {
    logger.debug(
      `Columna ${columnName}: Tratando como array[objeto] por nombre específico`
    );
    return { type: "objectArray", normalizer: arrayNormalizer };
  }

  // 2. Postal code check for nested properties
  const isPostalCodeColumn = matchesFieldPattern(
    columnName,
    POSTAL_FIELD_PATTERNS
  );
  const isNestedProperty = columnName.includes(".");

  if (isNestedProperty) {
    // Nested numeric detection (stats, etc.)
    const nestedNumResult = detectNumberType(sampleValues, columnName);
    if (nestedNumResult) {
      logger.debug(
        `Columna ${columnName}: Detectado como número (propiedad anidada)`
      );
      return { type: "number", normalizer: numberNormalizer };
    }

    if (isPostalCodeColumn) {
      logger.debug(
        `Columna ${columnName}: Tratando como string (código postal)`
      );
      return { type: "string", normalizer: stringNormalizer };
    }
  }

  // 3. Date detection
  const dateResult = detectDateType(sampleValues, columnName);
  if (dateResult) {
    logger.debug(
      `Columna ${columnName}: Detectado tipo fecha (confidence: ${dateResult.confidence.toFixed(2)})`
    );
    return { type: "date", normalizer: dateNormalizer };
  }

  // 4. String-number guard (long numeric strings that should stay strings)
  const nonNullValues = sampleValues.filter(
    (v) => v !== null && v !== undefined && v !== 0
  );
  const stringNumberValues = nonNullValues.filter(
    (v) =>
      (typeof v === "string" &&
        REGEX.STRING_NUMBER_PATTERN.test(cleanStringValue(v))) ||
      (typeof v === "number" &&
        v.toString().length >= 5 &&
        v.toString().length <= 10)
  );
  if (stringNumberValues.length > 0) {
    logger.debug(
      `Columna ${columnName}: Tratando como string para valores numéricos específicos`
    );
    return { type: "string", normalizer: stringNormalizer };
  }

  // 5. Boolean detection
  const boolResult = detectBooleanType(sampleValues);
  if (boolResult) {
    return { type: "boolean", normalizer: booleanNormalizer };
  }

  // 6. Object detection
  const objResult = detectObjectType(sampleValues, columnName);
  if (objResult) {
    return { type: "object", normalizer: objectNormalizer };
  }

  // 7. Array detection
  const arrResult = detectArrayType(sampleValues, columnName);
  if (arrResult) {
    logger.debug(
      `Columna ${columnName}: Detectado ${arrResult.type}`
    );
    return { type: arrResult.type, normalizer: arrayNormalizer };
  }

  // 8. Pure number detection (non-nested, non-guarded)
  const numericCandidates = sampleValues.map((v) => {
    if (typeof v === "number") {
      if (v.toString().length >= 5) return false;
      return true;
    }
    if (typeof v !== "string") return false;
    const cleaned = cleanStringValue(v).replace(REGEX.NUMERIC_NOISE, "");
    if (cleaned.length >= 5 && REGEX.NUMERIC_ONLY.test(cleaned)) return false;
    return !isNaN(Number(cleaned));
  });
  if (numericCandidates.every((v) => v === true)) {
    return { type: "number", normalizer: numberNormalizer };
  }

  // 9. Default: string
  logger.debug(`Columna ${columnName}: Tratando como string por defecto`);
  return { type: "string", normalizer: stringNormalizer };
}
