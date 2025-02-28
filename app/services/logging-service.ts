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
 * Instancia global del servicio de logging
 */
export const logger: ILogger = new LoggingService(
  process.env.NODE_ENV === "production" ? LogLevel.WARN : LogLevel.DEBUG
);

/**
 * Método para reemplazar el logger global (útil para testing)
 */
export function setLogger(newLogger: ILogger): ILogger {
  const previousLogger = Object.assign({}, logger);

  // Reemplazar métodos
  Object.keys(newLogger).forEach((key) => {
    if (typeof newLogger[key as keyof ILogger] === "function") {
      (logger as unknown as Record<string, unknown>)[key] =
        newLogger[key as keyof ILogger];
    }
  });

  return previousLogger;
}
