/**
 * Sistema de detección de tipos basado en el patrón estrategia
 *
 * Este sistema permite una detección de tipos extensible y mantenible,
 * donde cada tipo tiene su propia estrategia de detección independiente.
 */

import {
  isDate,
  isDateColumnName,
  isStrongDateColumn,
} from "./date-utils";
import { logger } from "../services/logging-service";

/**
 * Interfaz para estrategias de detección de tipos
 */
export interface TypeDetectionStrategy {
  /**
   * Nombre único del tipo
   */
  readonly typeName: string;

  /**
   * Prioridad de detección (valores más altos tienen mayor prioridad)
   */
  readonly priority: number;

  /**
   * Determina si un valor encaja en este tipo
   */
  matches(
    value: unknown,
    fieldName?: string,
    sampleValues?: unknown[]
  ): boolean;

  /**
   * Normaliza un valor a este tipo
   */
  normalize(value: unknown): unknown;
}

/**
 * Clase base para las estrategias de detección de tipos
 */
export abstract class BaseTypeDetectionStrategy
  implements TypeDetectionStrategy
{
  constructor(
    public readonly typeName: string,
    public readonly priority: number
  ) {}

  abstract matches(
    value: unknown,
    fieldName?: string,
    sampleValues?: unknown[]
  ): boolean;
  abstract normalize(value: unknown): unknown;
}

/**
 * Estrategia para detectar valores nulos
 */
export class NullTypeDetectionStrategy extends BaseTypeDetectionStrategy {
  constructor() {
    super("null", 100); // Alta prioridad
  }

  matches(value: unknown): boolean {
    return value === null;
  }

  normalize(): unknown {
    return "null";
  }
}

/**
 * Estrategia para detectar valores indefinidos
 */
export class UndefinedTypeDetectionStrategy extends BaseTypeDetectionStrategy {
  constructor() {
    super("undefined", 100); // Alta prioridad
  }

  matches(value: unknown): boolean {
    return value === undefined;
  }

  normalize(): unknown {
    return "undefined";
  }
}

/**
 * Estrategia para detectar fechas
 */
export class DateTypeDetectionStrategy extends BaseTypeDetectionStrategy {
  constructor() {
    super("date", 80);
  }

  matches(
    value: unknown,
    fieldName?: string,
    sampleValues?: unknown[]
  ): boolean {
    // Si el nombre de la columna indica fuertemente que es una fecha
    if (fieldName && isStrongDateColumn(fieldName)) {
      return true;
    }

    // Si el valor es una fecha válida
    if (isDate(value)) {
      return true;
    }

    // Si el nombre de la columna sugiere que es una fecha y tenemos samples
    if (
      fieldName &&
      isDateColumnName(fieldName) &&
      sampleValues &&
      sampleValues.length > 0
    ) {
      const dateValues = sampleValues.filter(isDate);
      const datePercentage =
        dateValues.length /
        sampleValues.filter((v) => v !== null && v !== undefined).length;
      return datePercentage > 0.5; // Si más del 50% son fechas
    }

    return false;
  }

  normalize(value: unknown): unknown {
    if (isDate(value)) {
      try {
        const date = value instanceof Date ? value : new Date(Number(value));
        if (!isNaN(date.getTime())) {
          return date;
        }
      } catch (e) {
        logger.warn("Error normalizing date", e);
      }
    }
    return value;
  }
}

/**
 * Estrategia para detectar booleanos
 */
export class BooleanTypeDetectionStrategy extends BaseTypeDetectionStrategy {
  constructor() {
    super("boolean", 70);
  }

  matches(
    value: unknown,
    fieldName?: string,
    sampleValues?: unknown[]
  ): boolean {
    // Valores booleanos directos
    if (typeof value === "boolean") {
      return true;
    }

    // 0/1 y "0"/"1" cuando hay suficientes muestras que lo confirman
    if (
      (value === 0 || value === 1 || value === "0" || value === "1") &&
      sampleValues
    ) {
      const booleanValues = sampleValues.filter(
        (v) =>
          v === 0 ||
          v === 1 ||
          v === "0" ||
          v === "1" ||
          v === true ||
          v === false
      );
      return booleanValues.length / sampleValues.length > 0.95;
    }

    return false;
  }

  normalize(value: unknown): unknown {
    if (value === 0 || value === "0" || value === false) return false;
    if (value === 1 || value === "1" || value === true) return true;
    return !!value;
  }
}

/**
 * Estrategia para detectar números
 */
export class NumberTypeDetectionStrategy extends BaseTypeDetectionStrategy {
  constructor() {
    super("number", 60);
  }

  matches(value: unknown, fieldName?: string): boolean {
    // Detectar números directamente
    if (typeof value === "number") {
      // Excluir timestamps potenciales (solo si realmente son fechas)
      if (value.toString().length >= 10 && isDate(value)) {
        return false;
      }
      return true;
    }

    // Detectar strings que son claramente números (incluyendo stats de Pokémon)
    if (typeof value === "string") {
      // Limpiar string de comillas y otros caracteres no numéricos
      const cleaned = value.replace(/^["']|["']$/g, "").replace(/[$,%\s]/g, "");

      // Casos especiales para stats de Pokémon (números pequeños con comillas)
      // Hacer más agresiva la detección para propiedades anidadas como stats
      if (/^\d+$/.test(cleaned)) {
        // Si es una propiedad de stats, siempre detectar como número
        if (fieldName && /^stats\.|\.stats\./.test(fieldName)) {
          return true;
        }
        // Para números pequeños, casi siempre detectar como número
        if (cleaned.length <= 4) {
          return true;
        }
      }

      // Excluir strings numéricas largas que podrían ser IDs
      if (cleaned.length >= 5 && /^\d+$/.test(cleaned)) {
        return false;
      }

      // Para otros valores, comprobar si se puede convertir a número
      return !isNaN(Number(cleaned));
    }

    return false;
  }

  normalize(value: unknown): unknown {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      // Limpieza más agresiva para valores numéricos en strings
      const cleaned = value.replace(/^["']|["']$/g, "").replace(/[$,%\s]/g, "");
      return Number(cleaned);
    }
    return 0;
  }
}

/**
 * Estrategia para detectar objetos
 */
export class ObjectTypeDetectionStrategy extends BaseTypeDetectionStrategy {
  constructor() {
    super("object", 50);
  }

  matches(value: unknown): boolean {
    return (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    );
  }

  normalize(value: unknown): unknown {
    return value === null || value === undefined ? {} : value;
  }
}

/**
 * Estrategia para detectar arrays de objetos
 */
export class ObjectArrayTypeDetectionStrategy extends BaseTypeDetectionStrategy {
  constructor() {
    super("objectArray", 45);
  }

  matches(value: unknown): boolean {
    if (!Array.isArray(value)) {
      if (typeof value === "string" && value.includes("[object Object]")) {
        return true;
      }
      return false;
    }

    if (value.length === 0) return false;

    for (const item of value) {
      if (
        typeof item === "object" &&
        item !== null &&
        !Array.isArray(item) &&
        !(item instanceof Date)
      ) {
        return true;
      }

      if (
        typeof item === "string" &&
        (item.includes("[object Object]") ||
          item.trim() === "[object Object]" ||
          /^\{.*\}$/.test(item.trim()))
      ) {
        return true;
      }
    }

    return false;
  }

  normalize(value: unknown): unknown {
    return Array.isArray(value) ? value : [];
  }
}

/**
 * Estrategia para detectar arrays de primitivos
 */
export class PrimitiveArrayTypeDetectionStrategy extends BaseTypeDetectionStrategy {
  constructor() {
    super("primitiveArray", 40);
  }

  matches(value: unknown): boolean {
    if (!Array.isArray(value)) return false;
    if (value.length === 0) return true;

    // No es array de objetos
    return !value.some(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        !Array.isArray(item) &&
        !(item instanceof Date)
    );
  }

  normalize(value: unknown): unknown {
    return Array.isArray(value) ? value : [];
  }
}

/**
 * Fallback strategy for values that can be meaningfully represented as strings.
 * Has the lowest priority so all other type strategies are tried first.
 * Returns false for null/undefined (those are handled by dedicated strategies).
 */
export class FallbackTypeDetectionStrategy extends BaseTypeDetectionStrategy {
  constructor() {
    super("string", 10); // lowest priority
  }

  matches(value: unknown): boolean {
    // Only match values that are actual strings or can be meaningfully represented as strings
    // Returns false for null/undefined (those should be handled by other strategies)
    return value !== null && value !== undefined;
  }

  normalize(value: unknown): unknown {
    return String(value);
  }
}

/**
 * @deprecated Use FallbackTypeDetectionStrategy instead. Kept for backward compatibility.
 */
export const StringTypeDetectionStrategy = FallbackTypeDetectionStrategy;

/**
 * Clase que coordina la detección de tipos usando las estrategias disponibles
 */
export class TypeDetector {
  private strategies: TypeDetectionStrategy[] = [];

  constructor() {
    // Registrar estrategias por defecto en orden de prioridad
    this.registerStrategy(new NullTypeDetectionStrategy());
    this.registerStrategy(new UndefinedTypeDetectionStrategy());
    this.registerStrategy(new DateTypeDetectionStrategy());
    this.registerStrategy(new BooleanTypeDetectionStrategy());
    this.registerStrategy(new ObjectTypeDetectionStrategy());
    this.registerStrategy(new ObjectArrayTypeDetectionStrategy());
    this.registerStrategy(new PrimitiveArrayTypeDetectionStrategy());
    this.registerStrategy(new NumberTypeDetectionStrategy());
    this.registerStrategy(new FallbackTypeDetectionStrategy());
  }

  /**
   * Registra una nueva estrategia de detección de tipos
   */
  registerStrategy(strategy: TypeDetectionStrategy): void {
    this.strategies.push(strategy);
    // Ordenar estrategias por prioridad (mayor primero)
    this.strategies.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Detecta el tipo de un valor
   */
  detectType(
    value: unknown,
    fieldName?: string,
    sampleValues?: unknown[]
  ): TypeDetectionStrategy {
    for (const strategy of this.strategies) {
      if (strategy.matches(value, fieldName, sampleValues)) {
        return strategy;
      }
    }

    // Nunca debería llegar aquí (FallbackTypeDetectionStrategy matches most values)
    return this.strategies[this.strategies.length - 1];
  }

  /**
   * Normaliza un valor según su tipo detectado
   */
  normalizeValue(
    value: unknown,
    fieldName?: string,
    sampleValues?: unknown[]
  ): unknown {
    const strategy = this.detectType(value, fieldName, sampleValues);
    return strategy.normalize(value);
  }
}

// Singleton para uso en toda la aplicación
export const typeDetector = new TypeDetector();
