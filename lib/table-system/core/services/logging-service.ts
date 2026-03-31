/**
 * Servicio de logging configurable
 *
 * Permite centralizar y configurar los logs de la aplicación, facilitando
 * la habilitación/deshabilitación de logs según el entorno y el nivel de detalle.
 */

/**
 * Niveles de log disponibles
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 100,
}

/**
 * Interfaz para servicios de logging
 */
export interface ILogger {
  debug(message: string, ...data: unknown[]): void;
  info(message: string, ...data: unknown[]): void;
  log(message: string, ...data: unknown[]): void; // Alias para info (compatibilidad)
  warn(message: string, ...data: unknown[]): void;
  error(message: string, ...data: unknown[]): void;
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
}

/**
 * Implementación básica del servicio de logging
 */
export class LoggingService implements ILogger {
  private level: LogLevel;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  /**
   * Establece el nivel de log actual
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Obtiene el nivel de log actual
   */
  getLevel(): LogLevel {
    return this.level;
  }

  /**
   * Log de nivel debug (información detallada para desarrollo)
   */
  debug(message: string, ...data: unknown[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(`[DEBUG] ${message}`, ...data);
    }
  }

  /**
   * Log de nivel info (información general)
   */
  info(message: string, ...data: unknown[]): void {
    if (this.level <= LogLevel.INFO) {
      console.log(`[INFO] ${message}`, ...data);
    }
  }

  /**
   * Alias para info (para compatibilidad con console.log)
   */
  log(message: string, ...data: unknown[]): void {
    this.info(message, ...data);
  }

  /**
   * Log de nivel warn (advertencias)
   */
  warn(message: string, ...data: unknown[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, ...data);
    }
  }

  /**
   * Log de nivel error (errores críticos)
   */
  error(message: string, ...data: unknown[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, ...data);
    }
  }
}

/**
 * Registry that holds the current logger instance.
 * Provides a clean way to swap loggers (e.g. for testing) without
 * mutating properties on a shared singleton object.
 */
class LoggerRegistry {
  private currentLogger: ILogger;

  constructor(defaultLogger: ILogger) {
    this.currentLogger = defaultLogger;
  }

  get(): ILogger {
    return this.currentLogger;
  }

  set(newLogger: ILogger): void {
    this.currentLogger = newLogger;
  }
}

const registry = new LoggerRegistry(
  new LoggingService(
    process.env.NODE_ENV === "production" ? LogLevel.WARN : LogLevel.DEBUG
  )
);

// Convenience export - most code uses this
export const logger = registry.get();

// For testing/configuration
export function setLogger(newLogger: ILogger): void {
  registry.set(newLogger);
}

export { registry as loggerRegistry };