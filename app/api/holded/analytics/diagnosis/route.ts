import { NextResponse } from "next/server";
import { getContacts } from "@/app/lib/holded/services/holded-contacts-service";
import { normalizeDate } from "@/lib/table-system/core/utils/date-utils";
import {
  getStartOfCurrentYear,
  getEndOfCurrentYear,
  isDateBetween,
} from "@/app/lib/holded/utils/analytics-date-utils";

interface DateSample {
  id: string;
  name: string;
  rawDate: string | null;
  normalizedDate: string | null;
  isValid: boolean;
  isInCurrentYear: boolean | null;
}

export async function GET() {
  try {
    // Obtener todos los contactos
    const contacts = await getContacts();

    // Fechas del año actual
    const startOfYear = getStartOfCurrentYear();
    const endOfYear = getEndOfCurrentYear();

    console.log(
      `Diagnóstico - Año actual: ${startOfYear.toISOString()} - ${endOfYear.toISOString()}`
    );
    console.log(`Diagnóstico - Total contactos: ${contacts.length}`);

    // Estadísticas
    const stats = {
      totalContacts: contacts.length,
      contactsWithDate: 0,
      contactsWithoutDate: 0,
      validDates: 0,
      invalidDates: 0,
      contactsInCurrentYear: 0,
      dateFormats: {} as Record<string, number>,
    };

    // Muestras de fechas (primeros 10 contactos)
    const samples: DateSample[] = [];

    // Analizar fechas
    contacts.forEach((contact, index) => {
      const createdAtRaw = contact.created_at || contact.createdAt;

      if (!createdAtRaw) {
        stats.contactsWithoutDate++;
        if (index < 10) {
          samples.push({
            id: contact.id,
            name: contact.name,
            rawDate: null,
            normalizedDate: null,
            isValid: false,
            isInCurrentYear: null,
          });
        }
        return;
      }

      stats.contactsWithDate++;

      // Registrar formato de fecha
      const format = typeof createdAtRaw;
      stats.dateFormats[format] = (stats.dateFormats[format] || 0) + 1;

      // Intentar normalizar la fecha
      let normalizedDate: Date | string | null = null;
      let isValid = false;
      let dateObj: Date | null = null;

      try {
        normalizedDate = normalizeDate(createdAtRaw);

        if (normalizedDate instanceof Date) {
          dateObj = normalizedDate;
          isValid = !isNaN(dateObj.getTime());
        } else if (typeof normalizedDate === "string") {
          dateObj = new Date(normalizedDate);
          isValid = !isNaN(dateObj.getTime());
        }

        if (isValid) {
          stats.validDates++;

          // Verificar si está en el año actual
          if (dateObj && isDateBetween(dateObj, startOfYear, endOfYear)) {
            stats.contactsInCurrentYear++;
          }
        } else {
          stats.invalidDates++;
        }
      } catch {
        stats.invalidDates++;
        isValid = false;
      }

      // Guardar muestra
      if (index < 10) {
        samples.push({
          id: contact.id,
          name: contact.name,
          rawDate: String(createdAtRaw),
          normalizedDate: normalizedDate ? String(normalizedDate) : null,
          isValid,
          isInCurrentYear: dateObj
            ? isDateBetween(dateObj, startOfYear, endOfYear)
            : null,
        });
      }
    });

    return NextResponse.json({
      stats,
      samples,
      yearRange: {
        start: startOfYear.toISOString(),
        end: endOfYear.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error en diagnóstico:", error);
    return NextResponse.json(
      { error: "Error al realizar diagnóstico" },
      { status: 500 }
    );
  }
}
