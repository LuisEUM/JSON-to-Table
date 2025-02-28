/**
 * Utilidades para detección y procesamiento de fechas
 *
 * Este módulo contiene funciones especializadas para detectar diferentes tipos
 * de formatos de fecha y normalizar valores de fecha para su presentación.
 */

// Constantes para detección y validación de fechas y timestamps
export const DATE_CONSTANTS = {
  TIMESTAMP_SECONDS: {
    MIN: 1_000_000_000, // Sep 2001
    MAX: 5_000_000_000, // Aprox 2128
  },
  TIMESTAMP_MS: {
    MIN: 1_000_000_000_000, // Sep 2001
    MAX: 5_000_000_000_000, // Aprox 2128
  },
  YEAR: {
    MIN: 1970,
    MAX: 2100,
    FUTURE_MAX: 2130,
  },
};

/**
 * Interfaz para errores específicos de fechas
 */
export class DateProcessingError extends Error {
  constructor(message: string = "Error procesando fecha") {
    super(message);
    this.name = "DateProcessingError";
  }
}

/**
 * Valida que una fecha esté dentro de un rango razonable de años
 *
 * @param date - Objeto Date a validar
 * @param minYear - Año mínimo aceptable
 * @param maxYear - Año máximo aceptable
 * @returns true si la fecha es válida y está dentro del rango
 */
export function isValidDateRange(
  date: Date,
  minYear = DATE_CONSTANTS.YEAR.MIN,
  maxYear = DATE_CONSTANTS.YEAR.MAX
): boolean {
  const year = date.getFullYear();
  return !isNaN(date.getTime()) && year >= minYear && year <= maxYear;
}

/**
 * Limpia el valor de string, removiendo comillas
 */
export function cleanStringValue(v: unknown): string {
  if (v === null || v === undefined) return "";
  return typeof v === "string"
    ? v.replace(/^["']|["']$/g, "")
    : String(v).replace(/^["']|["']$/g, "");
}

/**
 * Comprueba si un valor es una instancia de Date válida
 */
export function isDateInstance(value: unknown): boolean {
  return (
    value instanceof Date &&
    isValidDateRange(
      value,
      DATE_CONSTANTS.YEAR.MIN,
      DATE_CONSTANTS.YEAR.FUTURE_MAX
    )
  );
}

/**
 * Comprueba si un número representa un timestamp en segundos
 */
export function isTimestampInSeconds(value: number): boolean {
  if (value === 0 || value === 1) return false;
  if (value < 31536000) return false; // menos de un año en segundos

  if (
    value >= DATE_CONSTANTS.TIMESTAMP_SECONDS.MIN &&
    value <= DATE_CONSTANTS.TIMESTAMP_SECONDS.MAX
  ) {
    const date = new Date(value * 1000);
    return isValidDateRange(
      date,
      DATE_CONSTANTS.YEAR.MIN,
      DATE_CONSTANTS.YEAR.FUTURE_MAX
    );
  }

  return false;
}

/**
 * Comprueba si un número representa un timestamp en milisegundos
 */
export function isTimestampInMs(value: number): boolean {
  if (
    value >= DATE_CONSTANTS.TIMESTAMP_MS.MIN &&
    value <= DATE_CONSTANTS.TIMESTAMP_MS.MAX
  ) {
    const date = new Date(value);
    return isValidDateRange(
      date,
      DATE_CONSTANTS.YEAR.MIN,
      DATE_CONSTANTS.YEAR.FUTURE_MAX
    );
  }

  return false;
}

/**
 * Comprueba si un número representa algún tipo de timestamp, basado en su magnitud
 */
export function isNumericTimestamp(value: number): boolean {
  if (value === 0 || value === 1) return false;
  if (value < 31536000) return false; // menos de un año en segundos

  // Determinamos basado en la longitud del número
  const date =
    value.toString().length <= 10 ? new Date(value * 1000) : new Date(value);

  return isValidDateRange(
    date,
    DATE_CONSTANTS.YEAR.MIN,
    DATE_CONSTANTS.YEAR.MAX
  );
}

/**
 * Comprueba si una cadena tiene formato ISO de fecha
 */
export function isISODateString(value: string): boolean {
  const cleanValue = cleanStringValue(value);

  // Formato ISO estricto (YYYY-MM-DD o con hora)
  const isoDateRegex =
    /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/;

  if (isoDateRegex.test(cleanValue)) {
    const date = new Date(cleanValue);
    return isValidDateRange(
      date,
      DATE_CONSTANTS.YEAR.MIN,
      DATE_CONSTANTS.YEAR.MAX
    );
  }

  return false;
}

/**
 * Comprueba si una cadena tiene formato común de fecha (DD/MM/YYYY, MM/DD/YYYY)
 */
export function isCommonDateFormat(value: string): boolean {
  const cleanValue = cleanStringValue(value);

  // Test específico para los formatos más comunes que deben ser detectados
  if (/^(\d{1,2})[-\/\.](\d{1,2})[-\/\.](\d{4})$/.test(cleanValue)) {
    return true;
  }

  // Para formatos con texto de mes como '1 Jan 2023'
  if (/^\d{1,2}\s+[A-Za-z]{3,}\s+\d{4}$/.test(cleanValue)) {
    return true;
  }

  // Rechazar códigos postales y cadenas muy largas
  if (/^[\d-]{3,10}$/.test(cleanValue)) return false;
  if (cleanValue.length > 30 || cleanValue.split(/\s+/).length > 5)
    return false;

  // Formatos comunes con separadores
  const dateRegex = /^(\d{1,2})([-\/\.])(\d{1,2})\2(\d{4})$/;
  const match = cleanValue.match(dateRegex);

  if (match) {
    const [, first, , second, year] = match;

    // Intentar con formatos DD/MM/YYYY y MM/DD/YYYY
    const formats = [
      `${year}-${second.padStart(2, "0")}-${first.padStart(2, "0")}`, // DD/MM/YYYY
      `${year}-${first.padStart(2, "0")}-${second.padStart(2, "0")}`, // MM/DD/YYYY
    ];

    return formats.some((dateStr) => {
      const date = new Date(dateStr);
      return isValidDateRange(
        date,
        DATE_CONSTANTS.YEAR.MIN,
        DATE_CONSTANTS.YEAR.MAX
      );
    });
  }

  return false;
}

/**
 * Comprueba si una cadena tiene un formato de fecha con mes en texto
 */
export function isTextMonthDateFormat(value: string): boolean {
  const cleanValue = cleanStringValue(value);

  // Formatos con mes en texto
  const textMonthPatterns = [
    /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})$/i,
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})$/i,
  ];

  if (textMonthPatterns.some((pattern) => pattern.test(cleanValue))) {
    try {
      const date = new Date(cleanValue);
      return isValidDateRange(
        date,
        DATE_CONSTANTS.YEAR.MIN,
        DATE_CONSTANTS.YEAR.MAX
      );
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Comprueba si una cadena representa un timestamp numérico
 */
export function isStringTimestamp(value: string): boolean {
  const cleanValue = cleanStringValue(value);

  if (!/^\d{10,13}$/.test(cleanValue)) return false;

  // Rechazar timestamps muy pequeños
  if (cleanValue.length === 10 && parseInt(cleanValue) < 31536000) return false;

  const timestamp = parseInt(cleanValue);

  if (
    cleanValue.length === 10 &&
    timestamp >= DATE_CONSTANTS.TIMESTAMP_SECONDS.MIN &&
    timestamp <= DATE_CONSTANTS.TIMESTAMP_SECONDS.MAX
  ) {
    const date = new Date(timestamp * 1000);
    return isValidDateRange(
      date,
      DATE_CONSTANTS.YEAR.MIN,
      DATE_CONSTANTS.YEAR.FUTURE_MAX
    );
  }

  if (
    cleanValue.length === 13 &&
    timestamp >= DATE_CONSTANTS.TIMESTAMP_MS.MIN &&
    timestamp <= DATE_CONSTANTS.TIMESTAMP_MS.MAX
  ) {
    const date = new Date(timestamp);
    return isValidDateRange(
      date,
      DATE_CONSTANTS.YEAR.MIN,
      DATE_CONSTANTS.YEAR.FUTURE_MAX
    );
  }

  // Intentar como timestamp en segundos o milisegundos basado en longitud
  const date =
    cleanValue.length === 10 ? new Date(timestamp * 1000) : new Date(timestamp);

  return isValidDateRange(
    date,
    DATE_CONSTANTS.YEAR.MIN,
    DATE_CONSTANTS.YEAR.MAX
  );
}

/**
 * Comprueba si un valor es una fecha válida
 */
export function isDate(value: unknown): boolean {
  // Si es una instancia de Date, verificar que sea válida
  if (value instanceof Date) return !isNaN(value.getTime());

  // Si es un número, verificar si es un timestamp válido
  if (typeof value === "number") {
    // Rechazar números pequeños que no representan timestamps razonables
    if (value < 31536000) return false; // menos de un año en segundos
    return isNumericTimestamp(value);
  }

  // Si es un string, aplicar validaciones más estrictas
  if (typeof value === "string") {
    const cleaned = cleanStringValue(value);

    // Rechazar códigos postales y números cortos
    if (/^\d{5}$/.test(cleaned)) return false;

    // Usar validadores específicos para cada formato
    return (
      isISODateString(cleaned) ||
      isCommonDateFormat(cleaned) ||
      isTextMonthDateFormat(cleaned) ||
      isStringTimestamp(cleaned)
    );
  }

  return false;
}

/**
 * Normaliza un valor a una fecha
 *
 * @param value Valor a normalizar
 * @returns Date si es una fecha válida, string si no lo es
 */
export function normalizeDate(value: unknown): Date | string {
  try {
    if (value instanceof Date) {
      return value;
    }

    if (typeof value === "number") {
      // Convertir timestamp a Date
      const date = new Date(value * (value < 1e12 ? 1000 : 1));
      if (isValidDateRange(date)) {
        return date;
      }
    }

    if (typeof value === "string") {
      const cleaned = cleanStringValue(value);

      // Intentar como ISO
      if (isISODateString(cleaned)) {
        const date = new Date(cleaned);
        if (isValidDateRange(date)) {
          return date;
        }
      }

      // Intentar como formato común
      if (isCommonDateFormat(cleaned)) {
        const [day, month, year] = cleaned.split(/[/-]/).map(Number);
        const date = new Date(year, month - 1, day);
        if (isValidDateRange(date)) {
          return date;
        }
      }

      // Intentar como timestamp en string
      if (isStringTimestamp(cleaned)) {
        const timestamp = parseInt(cleaned, 10);
        const date = new Date(timestamp * (timestamp < 1e12 ? 1000 : 1));
        if (isValidDateRange(date)) {
          return date;
        }
      }
    }

    return String(value);
  } catch {
    return String(value);
  }
}

/**
 * Verifica si un nombre de columna sugiere que contiene fechas
 */
export function isDateColumnName(fieldName: string): boolean {
  const datePatterns = [
    /date/i,
    /fecha/i,
    /(created|updated|modified|deleted)_?at/i,
    /timestamp/i,
    /(start|end)_?time/i,
    /birth/i,
    /time/i,
  ];
  return datePatterns.some((pattern) => pattern.test(fieldName));
}

/**
 * Verifica si un nombre de columna indica fuertemente que contiene fechas
 */
export function isStrongDateColumn(fieldName: string): boolean {
  const strongDatePatterns = [
    // No considerar "fecha" o "date" como campos fuertes de fecha
    // /^date$/i,
    // /^fecha$/i,
    /^(created|updated|modified|deleted)_?at$/i,
    /^(created|updated|deleted)At$/i,
    /^timestamp$/i,
  ];
  return strongDatePatterns.some((pattern) => pattern.test(fieldName));
}
