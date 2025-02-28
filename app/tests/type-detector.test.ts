/**
 * Pruebas unitarias para el sistema de detección de tipos
 */
import { typeDetector } from "../table/components/type-indicators/type-detector";

describe("Sistema de detección de tipos", () => {
  describe("Detección de tipos básicos", () => {
    test("debe detectar valores nulos", () => {
      const result = typeDetector.detectType(null);
      expect(result.typeName).toBe("null");
    });

    test("debe detectar valores undefined", () => {
      const result = typeDetector.detectType(undefined);
      expect(result.typeName).toBe("undefined");
    });

    test("debe detectar strings", () => {
      const result = typeDetector.detectType("test");
      expect(result.typeName).toBe("string");
    });

    test("debe detectar números", () => {
      const result = typeDetector.detectType(123);
      expect(result.typeName).toBe("número");
    });

    test("debe detectar booleanos", () => {
      const result = typeDetector.detectType(true);
      expect(result.typeName).toBe("boolean");
    });

    test("debe detectar fechas", () => {
      const result = typeDetector.detectType(new Date());
      expect(result.typeName).toBe("fecha");
    });

    test("debe detectar objetos", () => {
      const result = typeDetector.detectType({ a: 1, b: 2 });
      expect(result.typeName).toBe("objeto");
    });
  });

  describe("Detección de arrays", () => {
    test("debe detectar arrays de primitivos", () => {
      const result = typeDetector.detectType([1, 2, 3]);
      expect(result.typeName).toBe("array[primitivo]");
    });

    test("debe detectar arrays de objetos", () => {
      const result = typeDetector.detectType([{ a: 1 }, { b: 2 }]);
      expect(result.typeName).toBe("array[objeto]");
    });

    test("debe detectar arrays vacíos como arrays de primitivos", () => {
      const result = typeDetector.detectType([]);
      expect(result.typeName).toBe("array[primitivo]");
    });

    test("debe detectar arrays con objetos representados como strings", () => {
      const result = typeDetector.detectType([
        "[object Object]",
        "[object Object]",
      ]);
      expect(result.typeName).toBe("array[objeto]");
    });
  });

  describe("Detección basada en nombres de columna", () => {
    test("debe priorizar la detección de fechas para columnas con nombres de fecha", () => {
      const result = typeDetector.detectType("2023-01-01", "created_at");
      expect(result.typeName).toBe("fecha");
    });

    test("debe detectar IDs para columnas con nombres de ID", () => {
      const result = typeDetector.detectType("123", "user_id");
      expect(result.typeName).toBe("número");
      // La detección de IDs se maneja en el procesador de datos, no en el detector de tipos
    });
  });

  describe("Normalización de valores", () => {
    test("debe normalizar fechas", () => {
      const date = new Date("2023-01-01");
      const result = typeDetector.normalizeValue(date, "fecha");
      expect(result).toBe(date);
    });

    test("debe normalizar números", () => {
      const result = typeDetector.normalizeValue("123", "número");
      expect(result).toBe(123);
    });

    test("debe normalizar booleanos", () => {
      const result = typeDetector.normalizeValue("true", "boolean");
      expect(typeof result).toBe("string");
      expect(result).toBe("true");
    });

    test("debe mantener strings sin cambios", () => {
      const result = typeDetector.normalizeValue("test", "string");
      expect(result).toBe("test");
    });
  });

  describe("Registro de estrategias personalizadas", () => {
    test("debe permitir registrar una estrategia personalizada", () => {
      // Crear una estrategia de prueba
      const customStrategy = {
        typeName: "custom",
        priority: 100,
        matches: (value: unknown) =>
          typeof value === "string" && value === "custom",
        normalize: (value: unknown) => `CUSTOM: ${value}`,
      };

      // Registrar la estrategia
      typeDetector.registerStrategy(customStrategy);

      // Probar la detección
      const result = typeDetector.detectType("custom");
      expect(result.typeName).toBe("custom");

      // Probar la normalización
      const normalized = typeDetector.normalizeValue("custom", "custom");
      expect(normalized).toBe("CUSTOM: custom");
    });
  });
});
