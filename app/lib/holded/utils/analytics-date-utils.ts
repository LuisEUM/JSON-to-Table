/**
 * Utilidades de fechas específicas para la analítica
 * Este archivo contiene funciones de utilidad para manejar fechas en el contexto de la analítica
 * sin modificar las utilidades de fecha existentes
 */

import { format, isValid, addDays, subDays, subMonths } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Formatea una fecha en formato ISO a un formato legible
 * @param dateString - Fecha en formato ISO
 * @param formatStr - Formato de salida (por defecto: dd/MM/yyyy)
 * @returns Fecha formateada
 */
export function formatAnalyticsDate(
  dateString: string | Date,
  formatStr = "dd/MM/yyyy"
): string {
  try {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;

    if (!isValid(date)) {
      return "Fecha inválida";
    }

    return format(date, formatStr, { locale: es });
  } catch (error) {
    console.error("Error al formatear fecha:", error);
    return "Error de formato";
  }
}

/**
 * Obtiene la fecha de inicio del mes actual
 * @returns Fecha de inicio del mes actual
 */
export function getStartOfCurrentMonth(): Date {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1);
}

/**
 * Obtiene la fecha de fin del mes actual
 * @returns Fecha de fin del mes actual
 */
export function getEndOfCurrentMonth(): Date {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth() + 1, 0);
}

/**
 * Obtiene la fecha de inicio del mes anterior
 * @returns Fecha de inicio del mes anterior
 */
export function getStartOfPreviousMonth(): Date {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth() - 1, 1);
}

/**
 * Obtiene la fecha de fin del mes anterior
 * @returns Fecha de fin del mes anterior
 */
export function getEndOfPreviousMonth(): Date {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 0);
}

/**
 * Obtiene la fecha de inicio del año actual
 * @returns Fecha de inicio del año actual
 */
export function getStartOfCurrentYear(): Date {
  const today = new Date();
  return new Date(today.getFullYear(), 0, 1);
}

/**
 * Obtiene la fecha de fin del año actual
 * @returns Fecha de fin del año actual
 */
export function getEndOfCurrentYear(): Date {
  const today = new Date();
  return new Date(today.getFullYear(), 11, 31);
}

/**
 * Obtiene la fecha de hace X meses
 * @param months - Número de meses a restar
 * @returns Fecha de hace X meses
 */
export function getDateMonthsAgo(months: number): Date {
  return subMonths(new Date(), months);
}

/**
 * Obtiene la fecha de hace X días
 * @param days - Número de días a restar
 * @returns Fecha de hace X días
 */
export function getDateDaysAgo(days: number): Date {
  return subDays(new Date(), days);
}

/**
 * Obtiene la fecha de dentro de X días
 * @param days - Número de días a sumar
 * @returns Fecha de dentro de X días
 */
export function getDateDaysFromNow(days: number): Date {
  return addDays(new Date(), days);
}

/**
 * Convierte una fecha a formato ISO (YYYY-MM-DD)
 * @param date - Fecha a convertir
 * @returns Fecha en formato ISO
 */
export function toISODateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Verifica si una fecha está entre dos fechas
 * @param date - Fecha a verificar
 * @param startDate - Fecha de inicio
 * @param endDate - Fecha de fin
 * @returns true si la fecha está entre las fechas de inicio y fin
 */
export function isDateBetween(
  date: Date,
  startDate: Date,
  endDate: Date
): boolean {
  return date >= startDate && date <= endDate;
}
