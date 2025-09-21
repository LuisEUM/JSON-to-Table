/**
 * Módulo de manejo de errores
 *
 * Define tipos de errores específicos para la aplicación y proporciona
 * utilidades para capturar, procesar y reportar errores de manera consistente.
 */

import { logger } from "../services/logging-service";

/**
 * Error base para todos los errores de la aplicación
 */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppError";
    // Preservar stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error específico para problemas de procesamiento de datos
 */
export class DataProcessingError extends AppError {
  public readonly data: unknown;

  constructor(message: string, data?: unknown) {
    super(message);
    this.name = "DataProcessingError";
    this.data = data;
  }
}

/**
 * Error específico para problemas con fechas
 */
export class DateProcessingError extends DataProcessingError {
  constructor(message: string, value?: unknown) {
    super(message, value);
    this.name = "DateProcessingError";
  }
}

/**
 * Error específico para problemas de tipo de datos
 */
export class TypeDetectionError extends DataProcessingError {
  public readonly expectedType: string;

  constructor(message: string, value: unknown, expectedType: string) {
    super(message, value);
    this.name = "TypeDetectionError";
    this.expectedType = expectedType;
  }
}

/**
 * Error específico para problemas de validación de datos
 */
export class ValidationError extends DataProcessingError {
  public readonly field: string;

  constructor(message: string, field: string, value?: unknown) {
    super(message, value);
    this.name = "ValidationError";
    this.field = field;
  }
}

/**
 * Envuelve una función para capturar errores y ejecutar un manejador
 *
 * @param fn Función a envolver
 * @param errorHandler Manejador de errores
 * @returns Función envuelta que maneja errores
 */
export function withErrorHandling<Args extends unknown[], R>(
  fn: (...args: Args) => R,
  errorHandler: (error: unknown, ...args: Args) => R
): (...args: Args) => R {
  return (...args: Args): R => {
    try {
      return fn(...args);
    } catch (error) {
      return errorHandler(error, ...args);
    }
  };
}

/**
 * Registra un error y opcionalmente lo reporta a un servicio externo
 *
 * @param error El error a registrar
 * @param context Contexto adicional sobre el error
 */
export function logError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  const formattedError =
    error instanceof Error ? error : new Error(String(error));

  logger.error(`Error: ${formattedError.message}`, {
    name: formattedError.name,
    stack: formattedError.stack,
    ...context,
  });

  // Aquí se podría añadir integración con servicios externos como Sentry
}

/**
 * Evalúa si un valor es un error
 *
 * @param value Valor a comprobar
 * @returns true si es un Error
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Convierte cualquier valor en un Error si no lo es ya
 *
 * @param value Valor a convertir
 * @returns Error
 */
export function toError(value: unknown): Error {
  if (isError(value)) return value;
  return new Error(
    typeof value === "string"
      ? value
      : value === null
      ? "null"
      : value === undefined
      ? "undefined"
      : JSON.stringify(value)
  );
}

export function toUTCDate(date: string | number | Date): Date {
  const d = new Date(date);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

export function formatDate(date: Date, format: string = "dd-mm-yyyy"): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return format
    .replace("yyyy", year.toString())
    .replace("mm", month)
    .replace("dd", day);
}
