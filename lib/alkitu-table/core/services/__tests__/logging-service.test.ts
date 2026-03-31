/**
 * Unit tests for logging-service.ts
 *
 * Tests LoggingService, LogLevel, setLogger, loggerRegistry.
 */

import {
  LoggingService,
  LogLevel,
  setLogger,
  loggerRegistry,
  type ILogger,
} from "../logging-service";

/* =========================================================
   LogLevel enum
========================================================= */
describe("LogLevel", () => {
  it("has correct ordering: DEBUG < INFO < WARN < ERROR < NONE", () => {
    expect(LogLevel.DEBUG).toBeLessThan(LogLevel.INFO);
    expect(LogLevel.INFO).toBeLessThan(LogLevel.WARN);
    expect(LogLevel.WARN).toBeLessThan(LogLevel.ERROR);
    expect(LogLevel.ERROR).toBeLessThan(LogLevel.NONE);
  });

  it("has expected numeric values", () => {
    expect(LogLevel.DEBUG).toBe(0);
    expect(LogLevel.INFO).toBe(1);
    expect(LogLevel.WARN).toBe(2);
    expect(LogLevel.ERROR).toBe(3);
    expect(LogLevel.NONE).toBe(100);
  });
});

/* =========================================================
   LoggingService
========================================================= */
describe("LoggingService", () => {
  let service: LoggingService;
  let consoleSpy: {
    log: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  beforeEach(() => {
    consoleSpy = {
      log: jest.spyOn(console, "log").mockImplementation(),
      warn: jest.spyOn(console, "warn").mockImplementation(),
      error: jest.spyOn(console, "error").mockImplementation(),
    };
  });

  afterEach(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.warn.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe("default level (INFO)", () => {
    beforeEach(() => {
      service = new LoggingService(LogLevel.INFO);
    });

    it("getLevel returns the current level", () => {
      expect(service.getLevel()).toBe(LogLevel.INFO);
    });

    it("logs info messages", () => {
      service.info("info message");
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "[INFO] info message"
      );
    });

    it("logs warn messages", () => {
      service.warn("warning");
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        "[WARN] warning"
      );
    });

    it("logs error messages", () => {
      service.error("critical error");
      expect(consoleSpy.error).toHaveBeenCalledWith(
        "[ERROR] critical error"
      );
    });

    it("does NOT log debug messages at INFO level", () => {
      service.debug("debug info");
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it("log() is an alias for info()", () => {
      service.log("via log");
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "[INFO] via log"
      );
    });
  });

  describe("DEBUG level", () => {
    beforeEach(() => {
      service = new LoggingService(LogLevel.DEBUG);
    });

    it("logs debug messages", () => {
      service.debug("debug details");
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "[DEBUG] debug details"
      );
    });

    it("logs info messages", () => {
      service.info("info msg");
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "[INFO] info msg"
      );
    });

    it("logs warn messages", () => {
      service.warn("warn msg");
      expect(consoleSpy.warn).toHaveBeenCalled();
    });

    it("logs error messages", () => {
      service.error("error msg");
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe("WARN level", () => {
    beforeEach(() => {
      service = new LoggingService(LogLevel.WARN);
    });

    it("does NOT log debug messages", () => {
      service.debug("debug");
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it("does NOT log info messages", () => {
      service.info("info");
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it("logs warn messages", () => {
      service.warn("warning");
      expect(consoleSpy.warn).toHaveBeenCalled();
    });

    it("logs error messages", () => {
      service.error("error");
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe("ERROR level", () => {
    beforeEach(() => {
      service = new LoggingService(LogLevel.ERROR);
    });

    it("does NOT log debug messages", () => {
      service.debug("debug");
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it("does NOT log info messages", () => {
      service.info("info");
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it("does NOT log warn messages", () => {
      service.warn("warning");
      expect(consoleSpy.warn).not.toHaveBeenCalled();
    });

    it("logs error messages", () => {
      service.error("error");
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe("NONE level", () => {
    beforeEach(() => {
      service = new LoggingService(LogLevel.NONE);
    });

    it("does NOT log any messages", () => {
      service.debug("debug");
      service.info("info");
      service.warn("warn");
      service.error("error");

      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });
  });

  describe("setLevel", () => {
    it("changes the log level dynamically", () => {
      service = new LoggingService(LogLevel.ERROR);

      // Initially debug is suppressed
      service.debug("debug");
      expect(consoleSpy.log).not.toHaveBeenCalled();

      // Change to DEBUG level
      service.setLevel(LogLevel.DEBUG);
      expect(service.getLevel()).toBe(LogLevel.DEBUG);

      service.debug("now visible");
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "[DEBUG] now visible"
      );
    });
  });

  describe("additional data parameters", () => {
    it("passes additional data to console methods", () => {
      service = new LoggingService(LogLevel.DEBUG);
      const data = { key: "value" };

      service.debug("msg", data);
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "[DEBUG] msg",
        data
      );

      service.info("msg", data);
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "[INFO] msg",
        data
      );

      service.warn("msg", data);
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        "[WARN] msg",
        data
      );

      service.error("msg", data);
      expect(consoleSpy.error).toHaveBeenCalledWith(
        "[ERROR] msg",
        data
      );
    });
  });
});

/* =========================================================
   LoggerRegistry
========================================================= */
describe("LoggerRegistry", () => {
  it("returns a logger instance", () => {
    const currentLogger = loggerRegistry.get();
    expect(currentLogger).toBeDefined();
    expect(typeof currentLogger.debug).toBe("function");
    expect(typeof currentLogger.info).toBe("function");
    expect(typeof currentLogger.warn).toBe("function");
    expect(typeof currentLogger.error).toBe("function");
  });

  it("allows replacing the logger via set()", () => {
    const originalLogger = loggerRegistry.get();

    const customLogger: ILogger = {
      debug: jest.fn(),
      info: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      setLevel: jest.fn(),
      getLevel: jest.fn().mockReturnValue(LogLevel.DEBUG),
    };

    loggerRegistry.set(customLogger);
    expect(loggerRegistry.get()).toBe(customLogger);

    // Restore original
    loggerRegistry.set(originalLogger);
  });
});

/* =========================================================
   setLogger (module-level convenience function)
========================================================= */
describe("setLogger", () => {
  it("replaces the logger in the registry", () => {
    const originalLogger = loggerRegistry.get();

    const newLogger: ILogger = {
      debug: jest.fn(),
      info: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      setLevel: jest.fn(),
      getLevel: jest.fn().mockReturnValue(LogLevel.WARN),
    };

    setLogger(newLogger);
    expect(loggerRegistry.get()).toBe(newLogger);

    // Restore
    loggerRegistry.set(originalLogger);
  });
});
