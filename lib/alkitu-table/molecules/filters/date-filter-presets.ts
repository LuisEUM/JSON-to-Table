import type { DateRange, DateRangePreset } from "./filter-types";

export const PRESETS: { label: string; value: DateRangePreset }[] = [
  { label: "Personalizado", value: "custom" },
  { label: "Hoy", value: "today" },
  { label: "Ayer", value: "yesterday" },
  { label: "Esta semana", value: "thisWeek" },
  { label: "Semana pasada", value: "lastWeek" },
  { label: "Este mes", value: "thisMonth" },
  { label: "Mes pasado", value: "lastMonth" },
  { label: "Este año", value: "thisYear" },
  { label: "Año pasado", value: "lastYear" },
  { label: "Últimos 7 días", value: "last7Days" },
  { label: "Últimos 30 días", value: "last30Days" },
  { label: "Últimos 90 días", value: "last90Days" },
  { label: "Últimos 12 meses", value: "last12Months" },
];

export const getPresetDateRange = (preset: DateRangePreset): DateRange => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case "today":
      return { start: today, end: today };
    case "yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { start: yesterday, end: yesterday };
    }
    case "thisWeek": {
      const start = new Date(today);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(today);
      end.setDate(end.getDate() + (6 - end.getDay()));
      return { start, end };
    }
    case "lastWeek": {
      const start = new Date(today);
      start.setDate(start.getDate() - start.getDay() - 7);
      const end = new Date(today);
      end.setDate(end.getDate() - end.getDay() - 1);
      return { start, end };
    }
    case "thisMonth": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { start, end };
    }
    case "lastMonth": {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return { start, end };
    }
    case "thisYear": {
      const start = new Date(today.getFullYear(), 0, 1);
      const end = new Date(today.getFullYear(), 11, 31);
      return { start, end };
    }
    case "lastYear": {
      const start = new Date(today.getFullYear() - 1, 0, 1);
      const end = new Date(today.getFullYear() - 1, 11, 31);
      return { start, end };
    }
    case "last7Days": {
      const start = new Date(today);
      start.setDate(start.getDate() - 7);
      return { start, end: today };
    }
    case "last30Days": {
      const start = new Date(today);
      start.setDate(start.getDate() - 30);
      return { start, end: today };
    }
    case "last90Days": {
      const start = new Date(today);
      start.setDate(start.getDate() - 90);
      return { start, end: today };
    }
    case "last12Months": {
      const start = new Date(today);
      start.setMonth(start.getMonth() - 12);
      return { start, end: today };
    }
    default:
      return { start: undefined, end: undefined };
  }
};

/**
 * Parse a date string in various formats to a Date object.
 * Supports: dd/mm/yyyy, dd-mm-yyyy, yyyy-mm-dd, timestamps, and other formats.
 */
export const parseDate = (dateStr: string): Date | null => {
  try {
    const value = dateStr.trim();

    // Comprobar si tiene el formato dd/mm/yyyy (con barra)
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
      const [day, month, year] = value.split("/").map((n) => parseInt(n, 10));
      return new Date(year, month - 1, day);
    }
    // Comprobar si tiene el formato dd-mm-yyyy (con guión) - para compatibilidad
    else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(value)) {
      const [day, month, year] = value.split("-").map((n) => parseInt(n, 10));
      return new Date(year, month - 1, day);
    }
    // Intentar otros formatos
    else {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
  } catch {
    return null;
  }
};

/**
 * Format a Date object to the standard dd/mm/yyyy string format.
 */
export const formatDateToDDMMYYYY = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
