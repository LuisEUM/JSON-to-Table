/**
 * Pruebas unitarias para el servicio de logging
 */
import {
  LoggingService,
  LogLevel,
  setLogger,
  logger,
} from "../services/logging-service";

describe("Servicio de logging", () => {
  let originalConsoleLog: typeof console.log;
  let originalConsoleWarn: typeof console.warn;
  let originalConsoleError: typeof console.error;
  let mockConsoleLog: jest.Mock;
  let mockConsoleWarn: jest.Mock;
  let mockConsoleError: jest.Mock;

  beforeEach(() => {
    // Guardar las funciones originales
    originalConsoleLog = console.log;
    originalConsoleWarn = console.warn;
    originalConsoleError = console.error;

    // Crear mocks
    mockConsoleLog = jest.fn();
    mockConsoleWarn = jest.fn();
    mockConsoleError = jest.fn();

    // Reemplazar las funciones de console
    console.log = mockConsoleLog;
    console.warn = mockConsoleWarn;
    console.error = mockConsoleError;
  });

  afterEach(() => {
    // Restaurar las funciones originales
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
  });

  describe("LoggingService", () => {
    test("debe crear una instancia con el nivel por defecto", () => {
      const service = new LoggingService();
      expect(service.getLevel()).toBe(LogLevel.INFO);
    });

    test("debe crear una instancia con el nivel especificado", () => {
      const service = new LoggingService(LogLevel.ERROR);
      expect(service.getLevel()).toBe(LogLevel.ERROR);
    });

    test("debe permitir cambiar el nivel de log", () => {
      const service = new LoggingService(LogLevel.INFO);
      service.setLevel(LogLevel.DEBUG);
      expect(service.getLevel()).toBe(LogLevel.DEBUG);
    });

    test("debe registrar mensajes de debug solo si el nivel es DEBUG", () => {
      const service = new LoggingService(LogLevel.DEBUG);
      service.debug("mensaje debug", { data: 123 });
      expect(mockConsoleLog).toHaveBeenCalledWith("[DEBUG] mensaje debug", {
        data: 123,
      });

      mockConsoleLog.mockClear();
      service.setLevel(LogLevel.INFO);
      service.debug("mensaje debug", { data: 123 });
      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    test("debe registrar mensajes de info si el nivel es INFO o menor", () => {
      const service = new LoggingService(LogLevel.INFO);
      service.info("mensaje info", { data: 123 });
      expect(mockConsoleLog).toHaveBeenCalledWith("[INFO] mensaje info", {
        data: 123,
      });

      mockConsoleLog.mockClear();
      service.setLevel(LogLevel.DEBUG);
      service.info("mensaje info", { data: 123 });
      expect(mockConsoleLog).toHaveBeenCalledWith("[INFO] mensaje info", {
        data: 123,
      });

      mockConsoleLog.mockClear();
      service.setLevel(LogLevel.WARN);
      service.info("mensaje info", { data: 123 });
      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    test("debe registrar mensajes de warn si el nivel es WARN o menor", () => {
      const service = new LoggingService(LogLevel.WARN);
      service.warn("mensaje warn", { data: 123 });
      expect(mockConsoleWarn).toHaveBeenCalledWith("[WARN] mensaje warn", {
        data: 123,
      });

      mockConsoleWarn.mockClear();
      service.setLevel(LogLevel.DEBUG);
      service.warn("mensaje warn", { data: 123 });
      expect(mockConsoleWarn).toHaveBeenCalledWith("[WARN] mensaje warn", {
        data: 123,
      });

      mockConsoleWarn.mockClear();
      service.setLevel(LogLevel.ERROR);
      service.warn("mensaje warn", { data: 123 });
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });

    test("debe registrar mensajes de error si el nivel es ERROR o menor", () => {
      const service = new LoggingService(LogLevel.ERROR);
      service.error("mensaje error", { data: 123 });
      expect(mockConsoleError).toHaveBeenCalledWith("[ERROR] mensaje error", {
        data: 123,
      });

      mockConsoleError.mockClear();
      service.setLevel(LogLevel.DEBUG);
      service.error("mensaje error", { data: 123 });
      expect(mockConsoleError).toHaveBeenCalledWith("[ERROR] mensaje error", {
        data: 123,
      });

      mockConsoleError.mockClear();
      service.setLevel(LogLevel.NONE);
      service.error("mensaje error", { data: 123 });
      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    test("log debe ser un alias para info", () => {
      const service = new LoggingService(LogLevel.INFO);
      service.log("mensaje log", { data: 123 });
      expect(mockConsoleLog).toHaveBeenCalledWith("[INFO] mensaje log", {
        data: 123,
      });
    });
  });

  describe("Instancia global y setLogger", () => {
    test("la instancia global debe estar disponible", () => {
      expect(logger).toBeDefined();
    });

    test("setLogger debe reemplazar el logger global", () => {
      const mockLogger = {
        debug: jest.fn(),
        info: jest.fn(),
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        setLevel: jest.fn(),
        getLevel: jest.fn().mockReturnValue(LogLevel.DEBUG),
      };

      const previousLogger = setLogger(mockLogger);

      // Verificar que el logger anterior se devolvió correctamente
      expect(previousLogger).toBeDefined();

      // Usar el nuevo logger
      logger.debug("test");
      expect(mockLogger.debug).toHaveBeenCalledWith("test");

      // Restaurar el logger original
      setLogger(previousLogger);
    });
  });
});
