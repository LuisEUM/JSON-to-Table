import { isValid, parseISO } from "date-fns";
import { logger } from "../services/logging-service";

const createUTCDate = (date: Date): Date => {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds()
    )
  );
};

/**
 * Normaliza un formato de fecha a formato dd-mm-yyyy
 * Maneja correctamente fechas en formatos dd/mm/yyyy y dd-mm-yyyy
 */
export const formatDateString = (value: Date | string | number): string => {
  try {
    let date: Date;

    // Si es una cadena, intentar parsear diferentes formatos
    if (typeof value === "string") {
      const cleanedValue = value.trim();

      // Manejar formato dd/mm/yyyy
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleanedValue)) {
        const [day, month, year] = cleanedValue
          .split("/")
          .map((n) => parseInt(n, 10));
        date = new Date(year, month - 1, day);
      }
      // Manejar formato dd-mm-yyyy
      else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(cleanedValue)) {
        const [day, month, year] = cleanedValue
          .split("-")
          .map((n) => parseInt(n, 10));
        date = new Date(year, month - 1, day);
      }
      // Intentar ISO
      else {
        date = parseISO(cleanedValue);
        if (!isValid(date)) {
          // Último intento como fecha normal
          date = new Date(cleanedValue);
        }
      }
    } else if (typeof value === "number") {
      date = new Date(value);
    } else if (value instanceof Date) {
      date = value;
    } else {
      throw new Error("Tipo de fecha no soportado");
    }

    if (!isValid(date)) {
      throw new Error("Fecha inválida");
    }

    // Formatear siempre en formato dd-mm-yyyy
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    // Formato consistente con guion medio
    return `${day}-${month}-${year}`;
  } catch (error) {
    logger.warn("Error al formatear fecha:", error, value);
    return String(value);
  }
};

// Helper para convertir fechas a UTC
export const toUTCDate = (value: Date | string | number): Date => {
  try {
    const date =
      typeof value === "string"
        ? parseISO(value)
        : typeof value === "number"
        ? new Date(value)
        : value;

    if (!isValid(date)) {
      throw new Error("Fecha inválida");
    }

    return createUTCDate(date);
  } catch (error) {
    logger.warn("Error al convertir fecha a UTC:", error, value);
    return new Date(NaN); // Fecha inválida
  }
};
