/**
 * Utilidades para el manejo de fechas en la aplicación
 */

/**
 * Convierte una fecha en formato español (DD/MM/YYYY) a un objeto Date
 */
export function parseSpanishDate(dateString: string): Date {
  // Verificar si es formato DD/MM/YYYY
  const parts = dateString.split("/");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Los meses en JS son 0-indexed
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  // Si no es formato español, intentar con Date.parse
  return new Date(dateString);
}

/**
 * Formatea una fecha a string en formato ISO (YYYY-MM-DD)
 */
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Añade un año a una fecha dada
 */
export function addYearToDate(date: Date): Date {
  const newDate = new Date(date);
  newDate.setFullYear(newDate.getFullYear() + 1);
  return newDate;
}

/**
 * Determina el tipo de membresía basado en la duración entre fechas
 */
export function determineType(
  startDate: Date,
  endDate: Date
): "monthly" | "quarterly" | "biannual" | "annual" {
  const diffMonths =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    endDate.getMonth() -
    startDate.getMonth();

  if (diffMonths <= 3) return "monthly";
  if (diffMonths <= 6) return "quarterly";
  if (diffMonths <= 9) return "biannual";
  return "annual";
}

/**
 * Extrae fechas de inicio y fin de una cadena de edición
 */
export function extractDatesFromEdition(edition: string | string[] | unknown): {
  startDate: Date | null;
  endDate: Date | null;
} {
  try {
    const currentYear = new Date().getFullYear();
    const result = {
      startDate: null as Date | null,
      endDate: null as Date | null,
    };

    // Si es un array, usar el primer elemento
    if (Array.isArray(edition) && edition.length > 0) {
      // Ordenar por fecha para tomar la más reciente (asumiendo formato EDxx MES-MESyy)
      const sortedEditions = [...edition].sort((a, b) => {
        if (typeof a !== "string" || typeof b !== "string") return 0;

        // Extraer el número de edición (EDxx)
        const numA = a.match(/ED(\d+)/)?.[1];
        const numB = b.match(/ED(\d+)/)?.[1];

        if (!numA || !numB) return 0;
        return parseInt(numB) - parseInt(numA); // Orden descendente
      });

      // Usar la edición más reciente
      edition = sortedEditions[0];
    }

    // Verificar que edition es una cadena de texto
    if (typeof edition !== "string") {
      console.log(
        `Error: edition no es una cadena, es ${typeof edition}`,
        edition
      );
      return result;
    }

    // Intentar detectar patrón como "ED01 ENE-ABR21"
    const match = edition.match(/ED\d+\s+([A-Z]{3})-([A-Z]{3})(\d{2})/);
    if (match) {
      const startMonth = getMonthNumber(match[1]);
      const endMonth = getMonthNumber(match[2]);
      let year = 2000 + parseInt(match[3], 10);

      // Si la fecha parece ser del futuro lejano, ajustar
      if (year > currentYear + 3) {
        year = currentYear;
      }

      if (startMonth !== -1 && endMonth !== -1) {
        result.startDate = new Date(year, startMonth, 1);

        // El mes de finalización es el último día del mes
        const lastDay = new Date(year, endMonth + 1, 0).getDate();
        result.endDate = new Date(year, endMonth, lastDay);
      }
    }

    return result;
  } catch (error) {
    console.error("Error al procesar edición:", error);
    return {
      startDate: null,
      endDate: null,
    };
  }
}

/**
 * Convierte abreviatura de mes en español a número (0-indexed)
 */
export function getMonthNumber(monthAbbr: string): number {
  const months: Record<string, number> = {
    ENE: 0,
    FEB: 1,
    MAR: 2,
    ABR: 3,
    MAY: 4,
    JUN: 5,
    JUL: 6,
    AGO: 7,
    SEP: 8,
    OCT: 9,
    NOV: 10,
    DIC: 11,
  };

  return months[monthAbbr] !== undefined ? months[monthAbbr] : -1;
}
