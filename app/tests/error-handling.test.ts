/**
 * Pruebas unitarias para el sistema de manejo de errores
 */
import {
  AppError,
  DataProcessingError,
  DateProcessingError,
  TypeDetectionError,
  ValidationError,
  withErrorHandling,
  logError,
  isError,
  toError,
} from "@/lib/table-system/core/utils/error-handling";

describe("Sistema de manejo de errores", () => {
  describe("Clases de error", () => {
    test("AppError debe mantener el mensaje y la pila de llamadas", () => {
      const error = new AppError("Error de prueba");
      expect(error.message).toBe("Error de prueba");
      expect(error.name).toBe("AppError");
      expect(error.stack).toBeDefined();
    });

    test("DataProcessingError debe almacenar datos adicionales", () => {
      const data = { field: "test", value: 123 };
      const error = new DataProcessingError("Error de procesamiento", data);
      expect(error.message).toBe("Error de procesamiento");
      expect(error.name).toBe("DataProcessingError");
      expect(error.data).toEqual(data);
    });

    test("DateProcessingError debe tener el nombre correcto", () => {
      const error = new DateProcessingError("Error de fecha");
      expect(error.message).toBe("Error de fecha");
      expect(error.name).toBe("DateProcessingError");
    });

    test("TypeDetectionError debe almacenar el tipo esperado", () => {
      const error = new TypeDetectionError(
        "Error de tipo",
        "test value",
        "string"
      );
      expect(error.message).toBe("Error de tipo");
      expect(error.name).toBe("TypeDetectionError");
      expect(error.expectedType).toBe("string");
    });

    test("ValidationError debe almacenar el campo", () => {
      const error = new ValidationError("Error de validación", "email");
      expect(error.message).toBe("Error de validación");
      expect(error.name).toBe("ValidationError");
      expect(error.field).toBe("email");
    });
  });

  describe("withErrorHandling", () => {
    test("debe ejecutar la función normalmente si no hay errores", () => {
      const fn = jest.fn().mockReturnValue("resultado");
      const wrapped = withErrorHandling(fn, jest.fn());

      const result = wrapped("arg1", "arg2");

      expect(fn).toHaveBeenCalledWith("arg1", "arg2");
      expect(result).toBe("resultado");
    });

    test("debe ejecutar el manejador de errores si hay una excepción", () => {
      const error = new Error("Error de prueba");
      const fn = jest.fn().mockImplementation(() => {
        throw error;
      });
      const errorHandler = jest.fn().mockReturnValue("resultado de error");

      const wrapped = withErrorHandling(fn, errorHandler);
      const result = wrapped("arg1", "arg2");

      expect(fn).toHaveBeenCalledWith("arg1", "arg2");
      expect(errorHandler).toHaveBeenCalledWith(error, "arg1", "arg2");
      expect(result).toBe("resultado de error");
    });
  });

  describe("Utilidades de error", () => {
    test("isError debe identificar objetos de error", () => {
      expect(isError(new Error())).toBe(true);
      expect(isError(new AppError("test"))).toBe(true);
      expect(isError({ message: "No soy un error" })).toBe(false);
      expect(isError(null)).toBe(false);
      expect(isError(undefined)).toBe(false);
      expect(isError("error string")).toBe(false);
    });

    test("toError debe convertir valores a objetos de error", () => {
      const error = new Error("test");

      // Debe devolver el mismo error si ya es un Error
      expect(toError(error)).toBe(error);

      // Debe crear un nuevo error para otros valores
      const stringError = toError("mensaje de error");
      expect(stringError instanceof Error).toBe(true);
      expect(stringError.message).toBe("mensaje de error");

      const objError = toError({ foo: "bar" });
      expect(objError instanceof Error).toBe(true);
      expect(objError.message).toBe('{"foo":"bar"}');

      const nullError = toError(null);
      expect(nullError instanceof Error).toBe(true);
      expect(nullError.message).toBe("null");

      const undefinedError = toError(undefined);
      expect(undefinedError instanceof Error).toBe(true);
      expect(undefinedError.message).toBe("undefined");
    });
  });

  describe("logError", () => {
    let originalConsoleError: typeof console.error;
    let mockConsoleError: jest.Mock;

    beforeEach(() => {
      originalConsoleError = console.error;
      mockConsoleError = jest.fn();
      console.error = mockConsoleError;
    });

    afterEach(() => {
      console.error = originalConsoleError;
    });

    test("debe registrar errores con datos adicionales", () => {
      const error = new Error("Error de prueba");
      const context = { userId: 123, action: "test" };

      logError(error, context);

      expect(mockConsoleError).toHaveBeenCalled();
      const args = mockConsoleError.mock.calls[0];
      expect(args[0]).toContain("Error de prueba");
      expect(args[1]).toMatchObject(context);
    });

    test("debe convertir valores no error a errores", () => {
      logError("mensaje de error");

      expect(mockConsoleError).toHaveBeenCalled();
      const args = mockConsoleError.mock.calls[0];
      expect(args[0]).toContain("mensaje de error");
    });
  });
});
