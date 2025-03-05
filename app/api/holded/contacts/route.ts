// Importaciones de Next.js para manejar solicitudes y respuestas HTTP
import { NextRequest, NextResponse } from "next/server";
// Importación de servicio para enviar logs en tiempo real al cliente
import { sendLogToClients } from "@/app/services/log-stream";

/**
 * Interfaz que define la estructura básica de un contacto de Holded
 * Contiene propiedades obligatorias como id y name, y opcionales como email y phone
 */
interface HoldedContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  customer_group?: string;
  notes?: string;
  created_at?: string;
  customFields?: Record<string, unknown>; // Campos personalizados que vienen de Holded
  [key: string]: unknown; // Índice de firma para permitir propiedades adicionales
}

/**
 * Interfaz extendida para los contactos después de ser procesados
 * Añade campos calculados como status, tenure, y arrays de membresías y formaciones
 */
interface ProcessedContact extends HoldedContact {
  // Campos calculados
  status: "active" | "inactive" | "pre-deactivation" | "inactive-with-services";
  tenure: "new" | "onboarding" | "loyal" | "legend";
  memberships: MembershipInfo[];
  trainings: TrainingInfo[];
}

/**
 * Interfaz que define la estructura de una membresía
 * Incluye información sobre el estado, fechas y tipo de membresía
 */
interface MembershipInfo {
  id: string;
  name: string;
  status: "active" | "pending" | "expiring-soon" | "inactive";
  startDate: string;
  endDate: string;
  type: "monthly" | "quarterly" | "biannual" | "annual";
}

/**
 * Interfaz que define la estructura de una formación
 * Contiene información sobre el estado, fechas y opcionalmente fecha extendida
 */
interface TrainingInfo {
  id: string;
  name: string;
  status: "pending" | "in-progress" | "ending-soon" | "completed" | "extended";
  startDate: string;
  endDate: string;
  extendedEndDate?: string; // Fecha extendida opcional (típicamente 1 año después)
}

/**
 * Procesa un array de contactos de Holded y los transforma en contactos procesados
 * con información adicional calculada: estado, antigüedad, membresías y formaciones
 *
 * @param contacts - Array de contactos obtenidos de Holded
 * @returns Array de contactos procesados con información adicional
 */
function processContacts(contacts: HoldedContact[]): ProcessedContact[] {
  const currentDate = new Date(); // Fecha actual para cálculos

  return contacts.map((contact) => {
    // Convertir array de customFields a un mapa para facilitar el acceso
    // Los campos personalizados de Holded vienen como array de {field, value}
    const customFieldsMap: Record<string, string> = {};
    if (Array.isArray(contact.customFields)) {
      contact.customFields.forEach((field) => {
        if (typeof field === "object" && field.field && "value" in field) {
          customFieldsMap[field.field] = field.value as string;
        }
      });
    }

    // Determinar estado del cliente basado en el valor del campo "Estado del Cliente"
    let status: ProcessedContact["status"] = "inactive"; // Por defecto es inactivo
    const clientStatus =
      customFieldsMap["CLIENTE INSIDERS - Estado del Cliente"];

    if (clientStatus === "ACTIVO") {
      status = "active"; // Cliente activo
    } else if (
      clientStatus === "BAJA" &&
      customFieldsMap["CLIENTE INSIDERS - Fecha de Fin de Servicios Activos"]
    ) {
      // Cliente dado de baja pero con servicios activos aún
      status = "inactive-with-services";
    }

    // Calcular antigüedad del cliente basado en su fecha de creación
    // La API de Holded proporciona timestamp en segundos (UNIX)
    const createdAt = contact.createdAt
      ? new Date(Number(contact.createdAt) * 1000)
      : null;
    let tenure: ProcessedContact["tenure"] = "new"; // Por defecto es nuevo

    if (createdAt) {
      // Calcular diferencia en meses entre fecha actual y creación
      const monthsDiff =
        (currentDate.getFullYear() - createdAt.getFullYear()) * 12 +
        (currentDate.getMonth() - createdAt.getMonth());

      // Clasificar por antigüedad
      if (monthsDiff < 1) {
        tenure = "new"; // Menos de 1 mes
      } else if (monthsDiff >= 1 && monthsDiff <= 3) {
        tenure = "onboarding"; // Entre 1 y 3 meses
      } else if (monthsDiff > 3 && monthsDiff <= 12) {
        tenure = "loyal"; // Entre 3 y 12 meses
      } else {
        tenure = "legend"; // Más de 12 meses
      }
    }

    // Procesar membresías del cliente a partir de campos personalizados
    const memberships: MembershipInfo[] = [];

    // Tipos de membresía a buscar en los campos personalizados
    const membershipTypes = [
      "MARKETING SALÓN",
      "INSIDE CLUB",
      "GESTIÓN DIRECTIVA",
      "TEAMS",
    ];

    // Procesar cada tipo de membresía
    membershipTypes.forEach((type) => {
      const startDateField = `MEMBRESÍA ${type} - Fecha de Inicio`;
      const endDateField = `MEMBRESÍA ${type} - Fecha de Fin`;

      // Si existe fecha de inicio, procesar la membresía
      if (customFieldsMap[startDateField]) {
        // Convertir fechas de formato español a objeto Date
        const startDate = parseSpanishDate(customFieldsMap[startDateField]);
        // Si hay fecha de fin usar esa, sino asumir 1 año
        const endDate = customFieldsMap[endDateField]
          ? parseSpanishDate(customFieldsMap[endDateField])
          : addYearToDate(startDate);

        // Determinar estado de la membresía
        let status: MembershipInfo["status"] = "inactive";

        if (currentDate < startDate) {
          status = "pending"; // Fecha futura, pendiente de iniciar
        } else if (currentDate >= startDate && currentDate <= endDate) {
          // En periodo activo, verificar si está próxima a expirar (1 mes antes)
          const expiringDate = new Date(endDate);
          expiringDate.setMonth(expiringDate.getMonth() - 1);

          if (currentDate >= expiringDate) {
            status = "expiring-soon"; // A menos de 1 mes de expirar
          } else {
            status = "active"; // Activa normalmente
          }
        }

        // Solo añadir si la fecha de inicio es válida
        if (!isNaN(startDate.getTime())) {
          memberships.push({
            id: `${contact.id}-${type}`, // ID único
            name: `Membresía ${type}`, // Nombre descriptivo
            status,
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
            type: determineType(startDate, endDate), // Determinar tipo por duración
          });
        }
      }
    });

    // Procesar formaciones del cliente
    const trainings: TrainingInfo[] = [];

    // Buscar todos los campos de formación que contengan información de edición
    const trainingFields = Object.keys(customFieldsMap).filter(
      (key) =>
        key.includes("FORMACIÓN") &&
        key.includes("Edición") &&
        customFieldsMap[key]
    );

    // Procesar cada campo de formación encontrado
    trainingFields.forEach((field) => {
      // Extraer el tipo de formación del nombre del campo
      const trainingType = field.split(" - ")[0].replace("FORMACIÓN ", "");
      const editionValue = customFieldsMap[field];

      if (editionValue) {
        // Extraer fechas de la edición (formatos como "ED01 ENE-ABR21")
        const dates = extractDatesFromEdition(editionValue);

        if (dates.startDate && dates.endDate) {
          // Calcular fecha extendida (1 año después del fin)
          const extendedEndDate = new Date(dates.endDate);
          extendedEndDate.setFullYear(extendedEndDate.getFullYear() + 1);

          // Determinar estado de la formación
          let status: TrainingInfo["status"] = "pending";

          if (currentDate < dates.startDate) {
            status = "pending"; // No ha iniciado
          } else if (
            currentDate >= dates.startDate &&
            currentDate <= dates.endDate
          ) {
            // En curso, verificar si está próxima a finalizar (1 mes antes)
            const endingSoonDate = new Date(dates.endDate);
            endingSoonDate.setMonth(endingSoonDate.getMonth() - 1);

            if (currentDate >= endingSoonDate) {
              status = "ending-soon"; // A menos de 1 mes de terminar
            } else {
              status = "in-progress"; // En curso normal
            }
          } else if (
            currentDate > dates.endDate &&
            currentDate <= extendedEndDate
          ) {
            status = "extended"; // En período extendido (hasta 1 año después)
          } else {
            status = "completed"; // Completada (más de 1 año después)
          }

          // Agregar formación a la lista
          trainings.push({
            id: `${contact.id}-${trainingType}-${editionValue}`, // ID único
            name: `${trainingType} ${editionValue}`, // Nombre descriptivo
            status,
            startDate: formatDate(dates.startDate),
            endDate: formatDate(dates.endDate),
            extendedEndDate: formatDate(extendedEndDate),
          });
        }
      }
    });

    // Verificar si el cliente está en pre-desactivación
    // Esto ocurre si está activo pero alguna membresía está por expirar
    if (status === "active") {
      const anyMembershipExpiring = memberships.some(
        (m) => m.status === "expiring-soon"
      );
      if (anyMembershipExpiring) {
        status = "pre-deactivation"; // Marcar como pre-desactivación
      }
    }

    // Devolver contacto procesado con toda la información adicional
    return {
      ...contact, // Mantener todos los campos originales
      status,
      tenure,
      memberships,
      trainings,
    };
  });
}

/**
 * Convierte una fecha en formato español (DD/MM/YYYY) a objeto Date
 *
 * @param dateString - Cadena de fecha en formato DD/MM/YYYY
 * @returns Objeto Date correspondiente
 */
function parseSpanishDate(dateString: string): Date {
  if (!dateString) return new Date(); // Si no hay fecha, usar la actual

  const parts = dateString.split("/");
  if (parts.length !== 3) return new Date(); // Formato incorrecto

  // Extraer día, mes y año
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Meses en JS son 0-indexed
  const year = parseInt(parts[2], 10);

  return new Date(year, month, day);
}

/**
 * Convierte un objeto Date a cadena ISO
 *
 * @param date - Objeto Date a formatear
 * @returns Cadena ISO de la fecha
 */
function formatDate(date: Date): string {
  return date.toISOString();
}

/**
 * Añade un año a una fecha dada
 *
 * @param date - Fecha base
 * @returns Nueva fecha un año después
 */
function addYearToDate(date: Date): Date {
  const newDate = new Date(date);
  newDate.setFullYear(newDate.getFullYear() + 1);
  return newDate;
}

/**
 * Determina el tipo de membresía basado en la duración entre dos fechas
 *
 * @param startDate - Fecha de inicio
 * @param endDate - Fecha de fin
 * @returns Tipo de membresía (mensual, trimestral, semestral, anual)
 */
function determineType(
  startDate: Date,
  endDate: Date
): "monthly" | "quarterly" | "biannual" | "annual" {
  // Calcular diferencia en meses
  const diffMonths =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    endDate.getMonth() -
    startDate.getMonth();

  // Clasificar según duración
  if (diffMonths <= 3) return "monthly";
  if (diffMonths <= 6) return "quarterly";
  if (diffMonths <= 9) return "biannual";
  return "annual";
}

/**
 * Extrae fechas de inicio y fin a partir de una cadena de edición
 * Maneja diferentes formatos y casos de error
 *
 * @param edition - Cadena o array con información de edición (ej: "ED01 ENE-ABR21")
 * @returns Objeto con fechas de inicio y fin extraídas
 */
function extractDatesFromEdition(edition: string | string[] | unknown): {
  startDate: Date | null;
  endDate: Date | null;
} {
  try {
    const currentYear = new Date().getFullYear();
    const result = {
      startDate: null as Date | null,
      endDate: null as Date | null,
    };

    // Si es un array, usar el primer elemento (más reciente)
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
      const startMonth = getMonthNumber(match[1]); // Mes de inicio (0-11)
      const endMonth = getMonthNumber(match[2]); // Mes de fin (0-11)
      let year = 2000 + parseInt(match[3], 10); // Año completo (20xx)

      // Si la fecha parece ser del futuro lejano, ajustar
      if (year > currentYear + 3) {
        year = currentYear;
      }

      if (startMonth !== -1 && endMonth !== -1) {
        // Crear fecha de inicio (primer día del mes)
        result.startDate = new Date(year, startMonth, 1);

        // Crear fecha de fin (último día del mes)
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
 * Convierte una abreviatura de mes en español a su número correspondiente (0-11)
 *
 * @param monthAbbr - Abreviatura de tres letras del mes
 * @returns Número del mes (0-11) o -1 si no se reconoce
 */
function getMonthNumber(monthAbbr: string): number {
  const months: Record<string, number> = {
    ENE: 0, // Enero
    FEB: 1, // Febrero
    MAR: 2, // Marzo
    ABR: 3, // Abril
    MAY: 4, // Mayo
    JUN: 5, // Junio
    JUL: 6, // Julio
    AGO: 7, // Agosto
    SEP: 8, // Septiembre
    OCT: 9, // Octubre
    NOV: 10, // Noviembre
    DIC: 11, // Diciembre
  };

  return months[monthAbbr] !== undefined ? months[monthAbbr] : -1;
}

/**
 * Calcula diferentes KPIs a partir de los contactos procesados
 * Genera estadísticas sobre formaciones y tendencias de membresías
 *
 * @param processedContacts - Array de contactos ya procesados
 * @returns Objeto con diferentes KPIs calculados
 */
function calculateKPIs(processedContacts: ProcessedContact[]) {
  const currentDate = new Date();

  // 1. Agregación por formaciones: Agrupar información de formaciones por nombre
  const trainingsByName: Record<
    string,
    Array<{
      contactId: string;
      startDate: string;
      status: TrainingInfo["status"];
    }>
  > = {};

  // Agrupación de formaciones por año
  const trainingsByYear: Record<number, Record<string, number>> = {};

  // Procesar formaciones de cada contacto
  processedContacts.forEach((contact) => {
    contact.trainings.forEach((training) => {
      // Agregación por nombre
      if (!trainingsByName[training.name]) {
        trainingsByName[training.name] = [];
      }
      trainingsByName[training.name].push({
        contactId: contact.id,
        startDate: training.startDate,
        status: training.status,
      });

      // Agregación por año
      const year = new Date(training.startDate).getFullYear();
      if (!trainingsByYear[year]) {
        trainingsByYear[year] = {};
      }
      if (!trainingsByYear[year][training.name]) {
        trainingsByYear[year][training.name] = 0;
      }
      trainingsByYear[year][training.name]++;
    });
  });

  // 2. Tendencias de membresías: Analizar activaciones y desactivaciones
  const membershipTrends = {
    activations: {} as Record<string, number>, // Activaciones históricas
    deactivations: {} as Record<string, number>, // Desactivaciones históricas
    projectedActivations: {} as Record<string, number>, // Proyecciones futuras de activación
    projectedDeactivations: {} as Record<string, number>, // Proyecciones futuras de desactivación
  };

  // Procesar membresías de cada contacto
  processedContacts.forEach((contact) => {
    contact.memberships.forEach((membership) => {
      const startYear = new Date(membership.startDate).getFullYear();
      const startMonth = new Date(membership.startDate).getMonth();
      const endYear = new Date(membership.endDate).getFullYear();
      const endMonth = new Date(membership.endDate).getMonth();

      // Activaciones históricas: Agrupar por año-mes
      const startKey = `${startYear}-${startMonth}`;
      if (!membershipTrends.activations[startKey]) {
        membershipTrends.activations[startKey] = 0;
      }
      membershipTrends.activations[startKey]++;

      // Desactivaciones históricas: Agrupar por año-mes
      const endKey = `${endYear}-${endMonth}`;
      if (!membershipTrends.deactivations[endKey]) {
        membershipTrends.deactivations[endKey] = 0;
      }
      membershipTrends.deactivations[endKey]++;

      // Proyecciones futuras (para el mes actual y futuro)
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      // Proyección de activaciones futuras
      if (
        startYear >= currentYear &&
        (startYear > currentYear || startMonth >= currentMonth)
      ) {
        if (!membershipTrends.projectedActivations[startKey]) {
          membershipTrends.projectedActivations[startKey] = 0;
        }
        membershipTrends.projectedActivations[startKey]++;
      }

      // Proyección de desactivaciones futuras
      if (
        endYear >= currentYear &&
        (endYear > currentYear || endMonth >= currentMonth)
      ) {
        if (!membershipTrends.projectedDeactivations[endKey]) {
          membershipTrends.projectedDeactivations[endKey] = 0;
        }
        membershipTrends.projectedDeactivations[endKey]++;
      }
    });
  });

  // Devolver todos los KPIs calculados
  return {
    trainingEvolution: trainingsByName,
    trainingsByYear,
    membershipTrends,
  };
}

/**
 * Clase de error personalizada para errores de la API de Holded
 * Permite incluir código de estado HTTP y detalles adicionales
 */
class HoldedApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "HoldedApiError";
  }
}

/**
 * Obtiene todos los contactos de Holded paginando las peticiones
 *
 * @param holdedApiKey - Clave de API para autenticarse con Holded
 * @returns Promise con array de todos los contactos
 */
async function fetchAllContacts(
  holdedApiKey: string
): Promise<HoldedContact[]> {
  let allContacts: HoldedContact[] = [];
  let page = 1;
  const limit = 100; // Límite máximo de la API de Holded
  let hasMoreContacts = true;

  // Notificar inicio de obtención de contactos
  sendLogToClients("🔄 Obteniendo contactos de Holded...");

  // Iterar mientras haya más páginas de contactos
  while (hasMoreContacts) {
    sendLogToClients(`📃 Obteniendo página ${page} de contactos...`);

    // Construir URL con paginación
    const url = `https://api.holded.com/api/invoicing/v1/contacts?page=${page}&limit=${limit}`;

    // Realizar petición a la API de Holded
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        key: holdedApiKey, // Clave de API para autenticación
      },
    });

    // Manejar respuestas de error
    if (!response.ok) {
      let errorDetails;
      try {
        errorDetails = await response.json();
      } catch {
        errorDetails = { message: "No se pudo parsear la respuesta de error" };
      }

      // Lanzar error personalizado
      throw new HoldedApiError(
        `Error al obtener contactos (${response.status}: ${response.statusText})`,
        response.status,
        errorDetails
      );
    }

    // Procesar contactos de esta página
    const contacts = await response.json();

    if (Array.isArray(contacts) && contacts.length > 0) {
      // Añadir contactos de esta página al resultado acumulado
      allContacts = [...allContacts, ...contacts];
      sendLogToClients(
        `✅ Obtenidos ${contacts.length} contactos de la página ${page}`
      );
      page++;

      // Si recibimos menos contactos que el límite, hemos terminado
      if (contacts.length < limit) {
        hasMoreContacts = false;
      }
    } else {
      // No hay más contactos o formato inesperado
      hasMoreContacts = false;
    }
  }

  // Notificar finalización
  sendLogToClients(`✅ Total de contactos obtenidos: ${allContacts.length}`);
  return allContacts;
}

/**
 * Manejador de la ruta HTTP GET para obtener contactos procesados
 *
 * @param request - Objeto de solicitud Next.js
 * @returns Respuesta HTTP con los datos procesados o error
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar que se proporcionó una clave de API
    sendLogToClients("🔍 Verificando clave API de Holded...");
    const holdedApiKey = request.headers.get("X-Holded-Api-Key");

    if (!holdedApiKey) {
      const error = "Falta la clave API de Holded";
      sendLogToClients(`❌ ${error}`);
      return NextResponse.json({ error }, { status: 400 });
    }

    try {
      // Obtener contactos de Holded
      const allContacts = await fetchAllContacts(holdedApiKey);
      sendLogToClients("✅ Procesando datos de contactos...");

      // Procesar los contactos para enriquecerlos con información adicional
      const processedContacts = processContacts(allContacts);

      // Calcular KPIs basados en los contactos procesados
      const kpis = calculateKPIs(processedContacts);

      // Devolver respuesta exitosa con todos los datos
      return NextResponse.json({
        success: true,
        data: processedContacts, // Datos principales
        kpis, // Indicadores calculados
        summary: {
          totalContacts: processedContacts.length,
          // Conteo por estado
          statusCounts: {
            active: processedContacts.filter((c) => c.status === "active")
              .length,
            inactive: processedContacts.filter((c) => c.status === "inactive")
              .length,
            preDeactivation: processedContacts.filter(
              (c) => c.status === "pre-deactivation"
            ).length,
            inactiveWithServices: processedContacts.filter(
              (c) => c.status === "inactive-with-services"
            ).length,
          },
          // Conteo por antigüedad
          tenureCounts: {
            new: processedContacts.filter((c) => c.tenure === "new").length,
            onboarding: processedContacts.filter(
              (c) => c.tenure === "onboarding"
            ).length,
            loyal: processedContacts.filter((c) => c.tenure === "loyal").length,
            legend: processedContacts.filter((c) => c.tenure === "legend")
              .length,
          },
        },
      });
    } catch (fetchError) {
      // Re-lanzar errores específicos de fetch
      throw fetchError;
    }
  } catch (error) {
    // Manejo general de errores
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    sendLogToClients(`❌ Error: ${errorMessage}`);

    // Responder con formato de error adecuado
    if (error instanceof HoldedApiError) {
      // Error específico de la API de Holded
      return NextResponse.json(
        {
          error: `Error al obtener contactos: ${error.message}`,
          status: error.status,
          details: error.details,
        },
        { status: error.status }
      );
    } else {
      // Error general
      return NextResponse.json(
        { error: `Error al obtener contactos: ${errorMessage}` },
        { status: 500 }
      );
    }
  }
}
