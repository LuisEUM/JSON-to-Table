import { isValid, parseISO } from "date-fns";

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

export const formatDateString = (value: Date | string | number): string => {
  try {
    let date: Date;

    // Normalizar la entrada a Date
    if (typeof value === "string") {
      // Primero intentar como ISO
      date = parseISO(value);
      if (!isValid(date)) {
        // Si falla, intentar como fecha normal
        date = new Date(value);
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

    // Asegurar que estamos en UTC
    const utcDate = createUTCDate(date);

    // Formatear usando un formato estricto y consistente
    const year = utcDate.getUTCFullYear();
    const month = String(utcDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(utcDate.getUTCDate()).padStart(2, "0");
    const hours = String(utcDate.getUTCHours()).padStart(2, "0");
    const minutes = String(utcDate.getUTCMinutes()).padStart(2, "0");
    const seconds = String(utcDate.getUTCSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.warn("Error al formatear fecha:", error, value);
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
    console.warn("Error al convertir fecha a UTC:", error, value);
    return new Date(NaN); // Fecha inválida
  }
};

