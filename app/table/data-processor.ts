import type { FilterFn } from "@tanstack/react-table";
import { logger as appLogger } from "../services/logging-service";
import {
  isDate as isDateUtil,
  normalizeDate as normalizeDateUtil,
  isDateColumnName,
  isStrongDateColumn,
} from "./utils/date-utils";
import { withErrorHandling, logError } from "./utils/error-handling";

// Extensión de FilterFns para tanstack table
declare module "@tanstack/table-core" {
  interface FilterFns {
    processedValueFilter: FilterFn<ProcessedRow>;
  }
}

/* =======================================================
    CONSTANTES Y LOGGER
======================================================= */

// Interfaz para logging configurable (inyección de dependencia)
interface ILogger {
  log(message: string, ...optionalParams: unknown[]): void;
  warn(message: string, ...optionalParams: unknown[]): void;
  debug(message: string, ...optionalParams: unknown[]): void;
}

// Usar el logger de la aplicación
let logger: ILogger = appLogger;

// Permite reemplazar el logger (útil para testing)
export function setLogger(newLogger: ILogger): void {
  logger = newLogger;
}

/* =======================================================
    TIPOS Y UTILIDADES GENERALES
======================================================= */

// Tipos para los valores procesados
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

// Tipos para análisis de columnas
export type ValueType =
  | "string"
  | "número"
  | "boolean"
  | "fecha"
  | "array"
  | "array[primitivo]"
  | "array[objeto]"
  | "objeto"
  | "referencia"
  | "null"
  | "undefined";

/**
 * Limpia el valor de string, removiendo comillas
 * @deprecated Use cleanStringValue from date-utils instead
 */
const cleanStringValue = (v: unknown): string =>
  typeof v === "string"
    ? v.replace(/^["']|["']$/g, "")
    : String(v).replace(/^["']|["']$/g, "");

/* =======================================================
    MANEJO DE FECHAS: DETECCIÓN Y NORMALIZACIÓN
======================================================= */

/**
 * Determina si un valor es una fecha válida.
 * Soporta objetos Date, timestamps (segundos/ms) y strings en formato ISO.
 *
 * @deprecated Use isDate from date-utils instead
 */
export const isDate = isDateUtil;

/**
 * Normaliza un valor de fecha a un formato estándar.
 *
 * @deprecated Use normalizeDate from date-utils instead
 */
export const normalizeDate = normalizeDateUtil;

/* =======================================================
    APLANAMIENTO DE OBJETOS
======================================================= */

/**
 * Aplana recursivamente un objeto, generando propiedades en notación de puntos.
 *
 * @param obj Objeto a aplanar
 * @param prefix Prefijo para las claves (usado en recursión)
 * @returns Objeto aplanado
 */
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

/**
 * Detecta si un nombre de campo representa un ID.
 *
 * @param fieldName Nombre del campo a analizar
 * @returns true si el campo parece ser un ID
 */
export const isIdField = (fieldName: string): boolean => {
  const idPatterns = [/^id$/i, /^_id$/i, /Id$/, /ID$/, /^id[A-Z]/, /^ID[A-Z]/];
  return idPatterns.some((pattern) => pattern.test(fieldName));
};

/* =======================================================
    PROCESAMIENTO DE VALORES Y DATOS
======================================================= */

/**
 * Procesa y normaliza un valor según su tipo y el nombre del campo.
 * Separa la lógica para referencias, fechas, números, arrays y objetos.
 *
 * @param value Valor a procesar
 * @param fieldName Nombre del campo
 * @param parentId ID del objeto padre (para referencias)
 * @returns Valor procesado con tipo y metadatos
 */
export const processValue = withErrorHandling(
  (
    value: unknown,
    fieldName: string = "",
    parentId?: string
  ): ProcessedValue => {
    const pathParts = fieldName ? fieldName.split(".") : [];

    // Manejo de campos de referencia
    const isReference =
      fieldName === "__parentId" || fieldName === "__parentTable";
    if (isReference) {
      logger.debug("Procesando campo de referencia:", fieldName, value);
      return {
        value: cleanStringValue(value),
        type: "string",
        path: pathParts,
        label: fieldName,
        isReference: true,
      };
    }
    // Si es objeto que contiene referencia, procesarlo como tal
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const refObj = value as Record<string, unknown>;
      if ("__parentId" in refObj || "__parentTable" in refObj) {
        const refValue = cleanStringValue(
          refObj.__parentId || refObj.__parentTable
        );
        return {
          value: refValue,
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

    const baseProcessedValue = { value, path: pathParts, label: fieldName };

    // Si es fecha, mantener el objeto Date
    if (isDate(value)) {
      const dateObj = normalizeDate(value);
      return {
        ...baseProcessedValue,
        value:
          dateObj instanceof Date
            ? `${String(dateObj.getDate()).padStart(2, "0")}-${String(
                dateObj.getMonth() + 1
              ).padStart(2, "0")}-${dateObj.getFullYear()}`
            : dateObj,
        type: "fecha",
        rawValue: value,
        dateValue: dateObj instanceof Date ? dateObj : undefined,
      };
    }

    if (typeof value === "string") {
      return {
        ...baseProcessedValue,
        value: cleanStringValue(value),
        type: "string",
      };
    }

    if (typeof value === "number") {
      return {
        ...baseProcessedValue,
        value,
        type: "número",
      };
    }

    if (typeof value === "boolean") {
      return {
        ...baseProcessedValue,
        value: String(value),
        type: "boolean",
      };
    }

    if (Array.isArray(value)) {
      logger.debug("Procesando array en campo:", fieldName);
      const isObjectArray =
        value.length > 0 &&
        typeof value[0] === "object" &&
        value[0] !== null &&
        !Array.isArray(value[0]) &&
        !(value[0] instanceof Date);
      const arrayType = isObjectArray ? "array[objeto]" : "array[primitivo]";
      const items = value.map((item) =>
        processValue(item, fieldName, parentId)
      );
      return {
        ...baseProcessedValue,
        value,
        type: arrayType,
        items,
      };
    }
    
    // Verificación adicional: Si no es array pero viene marcado como tal,
    // re-procesar con el tipo correcto (backwards compatibility)
    if (!Array.isArray(value) && typeof value === "string") {
      // Verificar si es una fecha disfrazada
      if (isDate(value)) {
        const dateObj = normalizeDate(value);
        return {
          ...baseProcessedValue,
          value:
            dateObj instanceof Date
              ? `${String(dateObj.getDate()).padStart(2, "0")}-${String(
                  dateObj.getMonth() + 1
                ).padStart(2, "0")}-${dateObj.getFullYear()}`
              : dateObj,
          type: "fecha",
          rawValue: value,
          dateValue: dateObj instanceof Date ? dateObj : undefined,
        };
      }
      
      // Si no es fecha, es string simple
      return {
        ...baseProcessedValue,
        value: cleanStringValue(value),
        type: "string",
      };
    }

    if (typeof value === "object" && value !== null) {
      return {
        ...baseProcessedValue,
        value,
        type: "objeto",
        __parentId: parentId,
      };
    }

    return {
      ...baseProcessedValue,
      value: cleanStringValue(value),
      type: "string",
    };
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

/**
 * Procesa un objeto de datos, aplanándolo y normalizando cada campo.
 *
 * @param data Objeto de datos a procesar
 * @returns Array de items procesados
 */
export const processData = withErrorHandling(
  (data: Record<string, unknown>): ProcessedItem[] => {
    const processed: ProcessedItem[] = [];
    const flattenedData = flattenObject(data, "");
    let keyFound = false;
    let currentId: string | undefined;

    // Buscar primer ID principal
    for (const [key, value] of Object.entries(flattenedData)) {
      if (isIdField(key) && !keyFound) {
        keyFound = true;
        currentId = String(value);
        logger.debug("ID principal encontrado:", key, currentId);
        break;
      }
    }

    // Procesar cada campo aplanado
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

/**
 * Determina el tipo de columna basándose en el valor procesado.
 *
 * @param columnName Nombre de la columna
 * @param value Valor procesado
 * @returns Tipo inferido
 */
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

/**
 * Agrupa columnas a partir de la propiedad "groups" de cada item.
 *
 * @param data Items procesados
 * @returns Estructura de grupos y items raíz
 */
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

interface ColumnTypeInfo {
  type: ValueType;
  normalizer: (value: unknown) => unknown;
}

/**
 * Analiza una muestra de datos para determinar el tipo predominante de cada columna.
 *
 * @param data Array de objetos de datos
 * @param sampleSize Tamaño de la muestra a analizar
 * @returns Mapping de columnas a su tipo y función normalizadora
 */
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

      columnAnalysis[columnName] = inferTypeFromSample(
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
 * Infierir el tipo de una columna basado en una muestra de valores, siguiendo reglas definidas.
 *
 * @param sampleValues Muestra de valores para inferir el tipo
 * @param columnName Nombre de la columna
 * @returns Tipo inferido y función normalizadora
 */
export const inferTypeFromSample = (
  sampleValues: unknown[],
  columnName: string
): ColumnTypeInfo => {
  if (!sampleValues.length) {
    return { type: "string", normalizer: (v) => (v == null ? "" : String(v)) };
  }

  // Reglas para columnas específicas de notas o comentarios que siempre deberían ser arrays de objetos
  if (
    columnName === "notes" ||
    columnName === "comments" ||
    /^(notas|comentarios)$/i.test(columnName)
  ) {
    logger.debug(
      `Columna ${columnName}: Tratando como array[objeto] por nombre específico`
    );
    return {
      type: "array[objeto]",
      normalizer: (v) => (v == null ? [] : v),
    };
  }

  // Reglas para columnas específicas
  const isPostalCodeColumn =
    /^(postal|zip|cp|codigo.*postal|post.*code|postcode)$/i.test(columnName);
  const isNestedProperty = columnName.includes(".");

  // Tratamiento especial para propiedades anidadas numéricas (como stats.hp)
  if (isNestedProperty) {
    // Detectar si es una propiedad de stats de Pokémon o similar
    if (/\.stats\.|^stats\./.test(columnName)) {
      const numericValues = sampleValues.filter((value) => {
        if (typeof value === "number") return true;
        if (typeof value === "string") {
          const cleaned = value
            .replace(/^["']|["']$/g, "")
            .replace(/[$,%\s]/g, "");
          return !isNaN(Number(cleaned)) && /^\d+$/.test(cleaned);
        }
        return false;
      });

      if (numericValues.length > 0) {
        logger.debug(
          `Columna ${columnName}: Detectado como número (propiedad de stats)`
        );
        return {
          type: "número",
          normalizer: (v) => {
            if (v === null || v === undefined) return 0;
            if (typeof v === "number") return v;
            if (typeof v === "string") {
              const cleaned = v
                .replace(/^["']|["']$/g, "")
                .replace(/[$,%\s]/g, "");
              return Number(cleaned);
            }
            return 0;
          },
        };
      }
    }

    // Detección general para valores numéricos en propiedades anidadas
    const numericValues = sampleValues.filter((value) => {
      if (typeof value === "number") return true;
      if (typeof value === "string") {
        const cleaned = value
          .replace(/^["']|["']$/g, "")
          .replace(/[$,%\s]/g, "");
        return (
          !isNaN(Number(cleaned)) &&
          /^\d+$/.test(cleaned) &&
          cleaned.length <= 4
        );
      }
      return false;
    });

    // Si todos o la mayoría de los valores son numéricos, tratar como número
    if (numericValues.length / sampleValues.length > 0.7) {
      logger.debug(
        `Columna ${columnName}: Detectado como número (valores numéricos en propiedad anidada)`
      );
      return {
        type: "número",
        normalizer: (v) => {
          if (v === null || v === undefined) return 0;
          if (typeof v === "number") return v;
          if (typeof v === "string") {
            const cleaned = v
              .replace(/^["']|["']$/g, "")
              .replace(/[$,%\s]/g, "");
            return Number(cleaned);
          }
          return 0;
        },
      };
    }

    // Solo forzar como string si es código postal
    if (isPostalCodeColumn) {
      logger.debug(
        `Columna ${columnName}: Tratando como string (código postal)`
      );
      return {
        type: "string",
        normalizer: (v) => (v == null ? "" : cleanStringValue(v)),
      };
    }
  }

  if (isStrongDateColumn(columnName)) {
    logger.debug(
      `Columna ${columnName}: Forzando detección como fecha (nombre indica timestamp)`
    );
    return {
      type: "fecha",
      normalizer: normalizeDate,
    };
  }

  const nonNullValues = sampleValues.filter(
    (v) => v !== null && v !== undefined && v !== 0
  );
  if (nonNullValues.length === 0 && sampleValues.some((v) => v === 0)) {
    logger.debug(
      `Columna ${columnName}: Detectado tipo número (todos son 0 o nulos)`
    );
    return {
      type: "número",
      normalizer: (v) => (v == null ? 0 : v),
    };
  }

  if (isDateColumnName(columnName)) {
    const stringValues = nonNullValues.filter((v) => typeof v === "string");
    if (stringValues.length > 0) {
      const potentialTimestamps = stringValues.filter((v) => {
        const clean = cleanStringValue(v);
        return /^\d{10,13}$/.test(clean) && !isNaN(Number(clean));
      });
      const percentageTimestamps =
        potentialTimestamps.length / stringValues.length;
      if (percentageTimestamps > 0.7) {
        logger.debug(
          `Columna ${columnName}: Detectado tipo fecha (string timestamps)`
        );
        return {
          type: "fecha",
          normalizer: normalizeDate,
        };
      }
    }
  }

  // Análisis mejorado para la detección de fechas
  // Contamos cuántos valores son compatibles con formatos de fecha
  const dateCompatibleValues = nonNullValues.filter((v) => {
    // Objetos Date
    if (v instanceof Date) return true;

    // Números que parecen timestamps
    if (typeof v === "number") {
      // Timestamp en segundos (10 dígitos) desde año 2000 hasta 2050
      if (v >= 946684800 && v <= 2524608000) return true;

      // Timestamp en milisegundos (13 dígitos) desde año 2000 hasta 2050
      if (v >= 946684800000 && v <= 2524608000000) return true;
    }

    // Strings que parecen fechas
    if (typeof v === "string") {
      const clean = cleanStringValue(v);

      // Si es un string numérico que parece timestamp
      if (/^\d{10,13}$/.test(clean) && !isNaN(Number(clean))) {
        const num = Number(clean);
        if (
          num >= 946684800 &&
          (num <= 2524608000 || (num >= 946684800000 && num <= 2524608000000))
        ) {
          return true;
        }
      }

      // Formatos ISO
      if (/^\d{4}-\d{2}-\d{2}(T|\s|$)/.test(clean)) return true;

      // Formatos comunes DD/MM/YYYY o MM/DD/YYYY
      if (/^\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4}/.test(clean)) return true;

      // Formato YYYY/MM/DD
      if (/^\d{4}[\/\.-]\d{1,2}[\/\.-]\d{1,2}/.test(clean)) return true;
    }

    return false;
  });

  if (dateCompatibleValues.length > 0) {
    const dateCompatiblePercentage =
      dateCompatibleValues.length / nonNullValues.length;

    // Si el nombre sugiere fecha o un porcentaje significativo de valores son compatibles con fechas
    const dateThreshold = isDateColumnName(columnName) ? 0.3 : 0.7;

    logger.debug(`Análisis de fechas para ${columnName}:`, {
      total: nonNullValues.length,
      compatibles: dateCompatibleValues.length,
      porcentaje: (dateCompatiblePercentage * 100).toFixed(2) + "%",
      umbral: (dateThreshold * 100).toFixed(2) + "%",
    });

    if (dateCompatiblePercentage >= dateThreshold) {
      logger.debug(
        `Columna ${columnName}: Detectado tipo fecha (${dateCompatibleValues.length}/${nonNullValues.length} valores compatibles)`
      );
      return {
        type: "fecha",
        normalizer: normalizeDate,
      };
    }
  }

  // Verificamos si el nombre de columna sugiere fecha (más específico que isDateColumnName)
  const isStronglyDateName =
    /^(created|updated|modified|date|timestamp|time)(at|on|_at|_on)?$/i.test(
      columnName
    );
  if (isStronglyDateName && dateCompatibleValues.length > 0) {
    logger.debug(
      `Columna ${columnName}: Forzando detección como fecha por nombre específico con ${dateCompatibleValues.length} valores compatibles`
    );
    return {
      type: "fecha",
      normalizer: normalizeDate,
    };
  }

  // Verificar campos conocidos que suelen ser fechas
  if (
    (columnName === "createdAt" || columnName === "updatedAt") &&
    nonNullValues.length > 0
  ) {
    // Para estos campos específicos, si tienen al menos un valor plausible, los tratamos como fecha
    logger.debug(
      `Columna ${columnName}: Considerando como fecha por ser un campo estándar con valores no nulos`
    );
    return {
      type: "fecha",
      normalizer: normalizeDate,
    };
  }

  // Continuar con la detección de valores numéricos
  const stringNumberPattern = /^[\d-]{3,10}$|^\d{2,6}[\s-]?\d{2,4}$/;
  const stringNumberValues = nonNullValues.filter(
    (v) =>
      (typeof v === "string" &&
        stringNumberPattern.test(cleanStringValue(v))) ||
      (typeof v === "number" &&
        v.toString().length >= 5 &&
        v.toString().length <= 10)
  );
  if (stringNumberValues.length > 0) {
    logger.debug(
      `Columna ${columnName}: Tratando como string para valores numéricos específicos`
    );
    return {
      type: "string",
      normalizer: (v) => (v == null ? "" : cleanStringValue(v)),
    };
  }

  const numericValues = nonNullValues.filter((v) => typeof v === "number");
  if (
    numericValues.length > 0 &&
    numericValues.length === nonNullValues.length
  ) {
    const countTimestamps = numericValues.filter(isDate).length;
    const percentageTimestamps = countTimestamps / numericValues.length;
    logger.debug(`Análisis numérico para ${columnName}:`, {
      total: numericValues.length,
      timestamps: countTimestamps,
    });
    if (
      percentageTimestamps > 0.8 ||
      (isDateColumnName(columnName) && percentageTimestamps > 0.5)
    ) {
      logger.debug(
        `Columna ${columnName}: Detectado tipo fecha (timestamps numéricos)`
      );
      return {
        type: "fecha",
        normalizer: normalizeDate,
      };
    }
  }

  const booleanValues = sampleValues.filter(
    (v) =>
      v === 0 || v === 1 || v === "0" || v === "1" || v === true || v === false
  );
  if (booleanValues.length / sampleValues.length > 0.95) {
    return {
      type: "boolean",
      normalizer: (v) => {
        if (v == null) return false;
        if (v === 0 || v === "0" || v === false) return false;
        if (v === 1 || v === "1" || v === true) return true;
        return !!v;
      },
    };
  }

  const objectValues = sampleValues.filter(
    (v) =>
      typeof v === "object" &&
      v !== null &&
      !Array.isArray(v) &&
      !(v instanceof Date)
  );

  // Detección mejorada para campos que pueden ser 0 u objetos
  // Verificar si existe al menos un objeto real y si los demás valores son principalmente 0 o null
  const hasObjectValues = objectValues.length > 0;
  const hasZeroOrNullValues =
    sampleValues.filter((v) => v === 0 || v === null || v === undefined)
      .length > 0;

  // Patrones comunes para nombres de campos que suelen ser objetos
  const objectFieldPatterns = [
    /^(supplier|client|customer|bill|address|shipping|contact|location|payment|invoice|person).*record$/i,
    /^.*[aA]ddress$/,
    /^.*[rR]ecord$/,
    /^(user|profile|account|config|settings|options|details|info|data|meta)$/i,
  ];

  // Verificar si el nombre sugiere que podría ser un objeto
  const isLikelyObjectField = objectFieldPatterns.some((pattern) =>
    pattern.test(columnName)
  );

  // Si hay al menos un objeto real y existen valores 0 o null, y el nombre sugiere un objeto
  if (hasObjectValues && hasZeroOrNullValues && isLikelyObjectField) {
    logger.debug(
      `Columna ${columnName}: Detectado como objeto con valores mixtos (${objectValues.length} objetos y valores 0/null/undefined)`
    );
    return {
      type: "objeto",
      normalizer: (v) => {
        if (v === 0 || v === null || v === undefined) return {};
        return v;
      },
    };
  }

  // Si tiene al menos un valor como objeto y el nombre sugiere fuertemente que es un objeto
  if (hasObjectValues && isLikelyObjectField) {
    logger.debug(
      `Columna ${columnName}: Forzando detección como objeto por nombre de campo y presencia de al menos un objeto`
    );
    return {
      type: "objeto",
      normalizer: (v) => {
        if (v === 0 || v === null || v === undefined) return {};
        return v;
      },
    };
  }

  // Caso especial para campos específicos que sabemos que son objetos
  if (
    (columnName === "supplierRecord" ||
      columnName === "billAddress" ||
      columnName === "clientRecord") &&
    hasObjectValues
  ) {
    logger.debug(
      `Columna ${columnName}: Campo específico conocido como objeto con ${objectValues.length} objetos`
    );
    return {
      type: "objeto",
      normalizer: (v) => {
        if (v === 0 || v === null || v === undefined) return {};
        return v;
      },
    };
  }

  // Continuar con la lógica existente para objetos
  if (
    objectValues.length > 0 &&
    objectValues.length / sampleValues.filter((v) => v !== null).length > 0.1
  ) {
    return {
      type: "objeto",
      normalizer: (v) => (v == null || v === 0 ? {} : v),
    };
  }

  // Análisis mejorado para detectar arrays
  // Primero identificamos todos los arrays en la muestra
  const allArrays = sampleValues.filter((v) => Array.isArray(v));

  // Si hay arrays en la muestra, realizamos un análisis más profundo
  if (allArrays.length > 0) {
    // Contamos cuántos arrays tienen al menos un objeto
    const arraysWithObjects = allArrays.filter((arr) => {
      // Si el array está vacío, no podemos determinar directamente
      if (arr.length === 0) return false;

      // Verificamos si algún elemento es un objeto
      return arr.some(
        (item) =>
          (typeof item === "object" &&
            item !== null &&
            !Array.isArray(item) &&
            !(item instanceof Date)) ||
          (typeof item === "string" &&
            (item.includes("[object Object]") ||
              item.trim() === "[object Object]" ||
              /^\{.*\}$/.test(item.trim())))
      );
    });

    // Si hay al menos un array con objetos y representa más del 1% de los arrays no nulos
    // O si tenemos menos de 10 arrays y al menos uno tiene objetos
    if (
      arraysWithObjects.length > 0 &&
      (arraysWithObjects.length /
        sampleValues.filter((v) => v !== null).length >
        0.01 ||
        allArrays.length < 10)
    ) {
      logger.debug(
        `Columna ${columnName}: Detectado array[objeto] (${arraysWithObjects.length}/${allArrays.length} arrays contienen objetos)`
      );
      return {
        type: "array[objeto]",
        normalizer: (v) => (v == null ? [] : v),
      };
    }

    // Si todos los arrays están vacíos, pero hay al menos uno, hacemos una inspección adicional
    const emptyArrays = allArrays.filter((arr) => arr.length === 0);
    if (emptyArrays.length === allArrays.length) {
      // Para arrays vacíos, intentamos inferir por el nombre de la columna
      if (
        /^(.*items|.*list|.*collection|.*set|.*array|.*records|.*data|.*entries|.*elements)$/i.test(
          columnName
        ) ||
        /(items|notes|comments|details|elementos|detalles|opciones|records)$/i.test(
          columnName
        )
      ) {
        logger.debug(
          `Columna ${columnName}: Inferido array[objeto] por nombre y arrays vacíos`
        );
        return {
          type: "array[objeto]",
          normalizer: (v) => (v == null ? [] : v),
        };
      }
    }

    // Para arrays primitivos (ninguno contiene objetos)
    logger.debug(
      `Columna ${columnName}: Detectado array[primitivo] (ningún array contiene objetos)`
    );
    return {
      type: "array[primitivo]",
      normalizer: (v) => (v == null ? [] : v),
    };
  }

  // El código original para detectar arrays con objetos representados como strings
  const arrayObjectValues = sampleValues.filter((v: unknown) => {
    if (!Array.isArray(v)) {
      if (typeof v === "string" && v.includes("[object Object]")) return true;
      return false;
    }
    return false; // Ya analizamos los arrays arriba
  });

  // Restauramos la lógica para usar arrayObjectValues
  if (
    arrayObjectValues.length > 0 &&
    arrayObjectValues.length / sampleValues.filter((v) => v !== null).length >
      0.1
  ) {
    logger.debug(
      `Columna ${columnName}: Detectado array[objeto] por strings que representan objetos`
    );
    return {
      type: "array[objeto]",
      normalizer: (v) => (v == null ? [] : v),
    };
  }

  const numericCandidates = sampleValues.map((v) => {
    if (typeof v === "number") {
      if (v.toString().length >= 5) return false;
      return true;
    }
    if (typeof v !== "string") return false;
    const cleaned = cleanStringValue(v).replace(/[$,%\s]/g, "");
    if (cleaned.length >= 5 && /^\d+$/.test(cleaned)) return false;
    return !isNaN(Number(cleaned));
  });
  if (numericCandidates.every((v) => v === true)) {
    return {
      type: "número",
      normalizer: (v) => {
        if (v == null) return 0;
        if (typeof v === "number") return v;
        if (typeof v === "string") {
          const cleaned = v.replace(/^["']|["']$/g, "").replace(/[$,%\s]/g, "");
          return Number(cleaned);
        }
        return 0;
      },
    };
  }

  logger.debug(`Columna ${columnName}: Tratando como string por defecto`);
  return {
    type: "string",
    normalizer: (v) => (v == null ? "" : cleanStringValue(v)),
  };
};

/* =======================================================
    PROCESAMIENTO POR LOTES
======================================================= */

interface BatchProcessOptions {
  sampleSize: number;
}

/**
 * Procesa un lote de datos, aplanando cada fila y aplicando la normalización
 * de tipos según el análisis realizado.
 *
 * @param dataRows Array de filas de datos
 * @param options Opciones de procesamiento
 * @returns Array de filas procesadas
 */
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

    // Pre-procesar para aplanar objetos anidados
    const flattenedDataRows: Record<string, unknown>[] = dataRows.map((row) => {
      const flattenedRow: Record<string, unknown> = {};
      // Pre-normalizar campos conocidos antes de aplanar
      const normalizedRow: Record<string, unknown> = { ...row };

      // Normalizar campos conocidos que pudieran ser 0 pero deberían ser objetos
      const objectFieldPatterns = [/^.*[aA]ddress$/, /^.*[rR]ecord$/];

      // Pre-normalizar campos conocidos que deberían ser objetos
      for (const [key, value] of Object.entries(normalizedRow)) {
        const isKnownObjectField =
          key === "supplierRecord" ||
          key === "billAddress" ||
          key === "clientRecord" ||
          objectFieldPatterns.some((pattern) => pattern.test(key));

        if (
          isKnownObjectField &&
          (value === 0 || value === "" || value === null || value === undefined)
        ) {
          // Pre-normalizar: convertir a objeto vacío para asegurar que se aplane correctamente
          normalizedRow[key] = {
            num: null,
            name: null,
          };
          logger.debug(
            `Pre-normalizando campo ${key}: valor ${value} convertido a objeto con propiedades vacías`
          );
        }
      }

      // Ahora aplanar con los valores pre-normalizados
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
    });

    const columnTypes: Record<string, ColumnTypeInfo> = analyzeColumnTypes(
      flattenedDataRows,
      options.sampleSize
    );

    // Mejorar detección de campos de fecha mediante patrón de nombres comunes
    Object.keys(columnTypes).forEach((key) => {
      // Si ya fue detectado como fecha, mantenerlo
      if (columnTypes[key].type === "fecha") return;

      // Patrones comunes para campos de fecha
      const datePatterns = [
        /^(created|updated|modified|fecha|date|time|timestamp)/i,
        /(at|on|date|time|fecha|timestamp|creacion|modificacion)$/i,
        /^(create|update|modify)_(time|date|at|on)$/i,
        /^(fecha|date)_(creacion|modificacion|created|updated)$/i,
      ];

      // Verificar si el nombre de la columna coincide con algún patrón de fecha
      const isLikelyDateField = datePatterns.some((pattern) =>
        pattern.test(key)
      );

      if (isLikelyDateField) {
        // Solo cambiamos el tipo si hay valores en esa columna que parecen potencialmente fechas
        const sampleValues = flattenedDataRows
          .slice(0, Math.min(flattenedDataRows.length, 50))
          .map((row) => row[key])
          .filter((v) => v !== null && v !== undefined);

        // Verificar si hay posibles timestamps numéricos o valores de fecha entre los ejemplos
        const potentialDateValues = sampleValues.filter((v) => {
          // Verificar valores numéricos que podrían ser timestamps
          if (typeof v === "number" && v > 1000000000 && v < 9999999999999) {
            return true;
          }
          // Verificar strings que podrían representar timestamps
          if (typeof v === "string") {
            const clean = cleanStringValue(v);
            if (/^\d{10,13}$/.test(clean) && !isNaN(Number(clean))) {
              return true;
            }
            // Verificar strings con formato ISO o común de fecha
            if (
              /^\d{4}-\d{2}-\d{2}|^\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4}/.test(
                clean
              )
            ) {
              return true;
            }
          }
          return false;
        });

        // Si al menos un valor parece una fecha, consideramos la columna como fecha
        if (potentialDateValues.length > 0) {
          logger.debug(
            `Columna ${key}: Detectada como fecha por nombre y valores compatibles (${potentialDateValues.length}/${sampleValues.length} valores posibles)`
          );
          columnTypes[key] = {
            type: "fecha",
            normalizer: normalizeDate,
          };
        }
      }
    });

    // Guardar los valores originales para aplicar normalizadores después
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
      const flattenedData = data;
      let keyFound = false;
      let currentId: string | undefined;

      // Buscar ID principal
      for (const [key, value] of Object.entries(flattenedData)) {
        if (isIdField(key) && !keyFound) {
          keyFound = true;
          currentId = cleanStringValue(value);
          break;
        }
      }

      for (const [key, value] of Object.entries(flattenedData)) {
        const path = key.split(".");
        const origValue = originalValues.get(index)?.get(key) ?? value;
        const isLongNumericString =
          (typeof value === "number" && value.toString().length >= 5) ||
          (typeof value === "string" &&
            /^\d{5,}$/.test(cleanStringValue(value)));
        const isPostalColumn =
          /^(postal|zip|cp|codigo.*postal|post.*code|postcode)$/i.test(key);
        const columnTypeInfo = columnTypes[key];
        let processedValue: ProcessedValue;

        // Tratamiento especial para campos conocidos que contienen objetos mezclados con valores 0
        const isKnownObjectField =
          key === "supplierRecord" ||
          key === "billAddress" ||
          key === "clientRecord" ||
          /^.*[aA]ddress$/.test(key) ||
          /^.*[rR]ecord$/.test(key);

        if (
          isKnownObjectField &&
          (value === 0 || value === "" || value === null || value === undefined)
        ) {
          // Para campos que ya deberían estar pre-normalizados y aplanados, asignar valores adecuados
          // Este caso solo se daría si el campo no se aplanó correctamente
          logger.debug(
            `Campo ${key} con valor ${value} encontrado después de pre-normalización. Asignando objeto vacío.`
          );
          processedValue = {
            value: {},
            type: "objeto",
            path,
            label: key,
            __parentId: currentId,
          };
        } else if (
          isPostalColumn ||
          isLongNumericString ||
          (typeof value === "string" &&
            /^[\d-]{3,10}$|^\d{2,6}[\s-]?\d{2,4}$/.test(
              cleanStringValue(value)
            ))
        ) {
          // Para campos específicos de fecha, siempre procesar como fecha
          if (key === "createdAt" || key === "updatedAt") {
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
              type: "fecha",
              path,
              label: key,
              rawValue: origValue,
              dateValue: dateObj instanceof Date ? dateObj : undefined,
            };
          } else {
            processedValue = {
              value:
                typeof origValue === "string"
                  ? cleanStringValue(origValue)
                  : cleanStringValue(origValue),
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
          logger.warn(`⚠️ Objeto encontrado después de aplanar: ${key}`, value);
          flattenObject(value as Record<string, unknown>, key);
          processedValue = {
            value: "[Objeto]",
            type: "objeto",
            path,
            label: key,
            __parentId: currentId,
          };
        } else if (columnTypeInfo) {
          if (columnTypeInfo.type === "fecha" && isDate(value)) {
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
              type: "fecha",
              path,
              label: key,
              rawValue: origValue,
              dateValue: dateObj instanceof Date ? dateObj : undefined,
            };
          } else {
            processedValue = processValue(origValue, key, currentId);
            processedValue.type = columnTypeInfo.type;
            if (
              columnTypeInfo.type === "número" &&
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
                processedValue.value = cleanStringValue(origValue);
              } else if (typeof processedValue.value === "string") {
                processedValue.value = cleanStringValue(processedValue.value);
              } else {
                processedValue.value = origValue;
              }
            }
          }
        } else {
          processedValue = processValue(origValue, key, currentId);
        }

        if (typeof processedValue.value === "string") {
          processedValue.value = cleanStringValue(processedValue.value);
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
