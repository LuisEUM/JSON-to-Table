/**
 * Pruebas unitarias para las utilidades de fecha
 */
import {
  isDate,
  normalizeDate,
  isDateColumnName,
  isStrongDateColumn,
  cleanStringValue,
  DateProcessingError,
} from "../table/utils/date-utils";

describe("Utilidades de fecha", () => {
  describe("isDate", () => {
    test("debe reconocer objetos Date válidos", () => {
      expect(isDate(new Date())).toBe(true);
      expect(isDate(new Date("2023-01-01"))).toBe(true);
    });

    test("debe reconocer timestamps en segundos", () => {
      expect(isDate(1609459200)).toBe(true); // 2021-01-01 00:00:00
    });

    test("debe reconocer timestamps en milisegundos", () => {
      expect(isDate(1609459200000)).toBe(true); // 2021-01-01 00:00:00
    });

    test("debe reconocer fechas en formato ISO", () => {
      expect(isDate("2023-01-01")).toBe(true);
      expect(isDate("2023-01-01T00:00:00")).toBe(true);
    });

    test("debe reconocer fechas en formatos comunes", () => {
      expect(isDate("01/01/2023")).toBe(true);
      expect(isDate("01-01-2023")).toBe(true);
      expect(isDate("1 Jan 2023")).toBe(true);
    });

    test("debe rechazar valores que no son fechas", () => {
      expect(isDate("no soy una fecha")).toBe(false);
      expect(isDate(123)).toBe(false); // Número muy pequeño para ser timestamp
      expect(isDate(null)).toBe(false);
      expect(isDate(undefined)).toBe(false);
      expect(isDate({})).toBe(false);
      expect(isDate([])).toBe(false);
    });

    test("debe rechazar códigos postales y valores similares", () => {
      expect(isDate("28001")).toBe(false);
      expect(isDate("90210")).toBe(false);
    });
  });

  describe("normalizeDate", () => {
    test("debe normalizar fechas ISO", () => {
      const result = normalizeDate("2023-01-01");
      expect(result).toBeInstanceOf(Date);
      if (result instanceof Date) {
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(0); // Enero es 0
        expect(result.getDate()).toBe(1);
      }
    });

    test("debe normalizar timestamps en segundos", () => {
      const result = normalizeDate(1609459200); // 2021-01-01 00:00:00
      expect(result).toBeInstanceOf(Date);
      if (result instanceof Date) {
        expect(result.getFullYear()).toBe(2021);
        expect(result.getMonth()).toBe(0);
        expect(result.getDate()).toBe(1);
      }
    });

    test("debe normalizar timestamps en milisegundos", () => {
      const result = normalizeDate(1609459200000); // 2021-01-01 00:00:00
      expect(result).toBeInstanceOf(Date);
      if (result instanceof Date) {
        expect(result.getFullYear()).toBe(2021);
        expect(result.getMonth()).toBe(0);
        expect(result.getDate()).toBe(1);
      }
    });

    test("debe normalizar fechas en formato común", () => {
      const result = normalizeDate("01/01/2023");
      expect(result).toBeInstanceOf(Date);
      if (result instanceof Date) {
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(0);
        expect(result.getDate()).toBe(1);
      }
    });

    test("debe devolver string para valores no válidos", () => {
      expect(typeof normalizeDate(null)).toBe("string");
      expect(typeof normalizeDate(undefined)).toBe("string");
      expect(typeof normalizeDate("no soy una fecha")).toBe("string");
      expect(typeof normalizeDate({})).toBe("string");
      expect(typeof normalizeDate([])).toBe("string");
    });
  });

  describe("isDateColumnName", () => {
    test("debe identificar nombres de columna relacionados con fechas", () => {
      expect(isDateColumnName("fecha")).toBe(true);
      expect(isDateColumnName("date")).toBe(true);
      expect(isDateColumnName("created_at")).toBe(true);
      expect(isDateColumnName("updatedAt")).toBe(true);
      expect(isDateColumnName("timestamp")).toBe(true);
      expect(isDateColumnName("birth_date")).toBe(true);
      expect(isDateColumnName("start_time")).toBe(true);
    });

    test("debe rechazar nombres de columna no relacionados con fechas", () => {
      expect(isDateColumnName("nombre")).toBe(false);
      expect(isDateColumnName("price")).toBe(false);
      expect(isDateColumnName("quantity")).toBe(false);
      expect(isDateColumnName("is_active")).toBe(false);
    });
  });

  describe("isStrongDateColumn", () => {
    test("debe identificar nombres de columna que son definitivamente fechas", () => {
      expect(isStrongDateColumn("created_at")).toBe(true);
      expect(isStrongDateColumn("updatedAt")).toBe(true);
      expect(isStrongDateColumn("timestamp")).toBe(true);
      expect(isStrongDateColumn("deletedAt")).toBe(true);
    });

    test("debe rechazar nombres de columna que no son definitivamente fechas", () => {
      expect(isStrongDateColumn("fecha")).toBe(false);
      expect(isStrongDateColumn("date")).toBe(false);
      expect(isStrongDateColumn("birth_date")).toBe(false);
    });
  });

  describe("cleanStringValue", () => {
    test("debe limpiar comillas de strings", () => {
      expect(cleanStringValue('"test"')).toBe("test");
      expect(cleanStringValue("'test'")).toBe("test");
    });

    test("debe convertir valores no string a string", () => {
      expect(cleanStringValue(123)).toBe("123");
      expect(cleanStringValue(true)).toBe("true");
      expect(cleanStringValue(null)).toBe("");
      expect(cleanStringValue(undefined)).toBe("");
    });
  });

  describe("DateProcessingError", () => {
    test("debe crear un error con el mensaje correcto", () => {
      const error = new DateProcessingError("Error de prueba");
      expect(error.message).toBe("Error de prueba");
      expect(error.name).toBe("DateProcessingError");
    });

    test("debe mantener la pila de llamadas", () => {
      const error = new DateProcessingError("Error de prueba");
      expect(error.stack).toBeDefined();
    });
  });
});
