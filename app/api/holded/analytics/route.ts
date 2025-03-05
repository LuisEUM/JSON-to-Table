import { NextRequest, NextResponse } from "next/server";
import { getContacts } from "@/app/lib/holded/services/holded-contacts-service";
import {
  HoldedContact,
  MembershipInfo,
  TrainingInfo,
} from "@/app/lib/holded/interfaces/contact-types";
import { isDateBetween } from "../../../lib/holded/utils/analytics-date-utils";
import { normalizeDate } from "@/app/table/utils/date-utils";

// Definir interfaces para los tipos de datos
interface ProcessedContact {
  id: string;
  name: string;
  status: "active" | "inactive" | "pre-deactivation" | "inactive-with-services";
  tenure: "new" | "onboarding" | "loyal" | "legend";
  memberships?: MembershipInfo[];
  trainings?: TrainingInfo[];
  [key: string]: unknown;
}

// Interfaces para los datos de análisis
interface MembershipTrend {
  date: string;
  active: number;
  expiringSoon: number;
  inactive: number;
}

interface TrainingByYear {
  year: string;
  completed: number;
  inProgress: number;
  pending: number;
}

interface StatusCount {
  name: string;
  value: number;
  color: string;
}

interface TenureCount {
  name: string;
  value: number;
  color: string;
}

interface AnalyticsData {
  stats: {
    totalContacts: number;
    activeContacts: number;
    inactiveContacts: number;
    totalMemberships: number;
    totalTrainings: number;
    averageTenure: string;
  };
  membershipTrends: MembershipTrend[];
  trainingsByYear: TrainingByYear[];
  statusCounts: StatusCount[];
  tenureCounts: TenureCount[];
}

/**
 * Endpoint para obtener análisis y KPIs de los contactos de Holded
 * GET /api/holded/analytics?type=client&startDate=2023-01-01&endDate=2023-12-31
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener la clave API de Holded (desde la solicitud o el entorno)
    const apiKey = process.env.HOLDED_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "No se ha proporcionado una clave API de Holded" },
        { status: 400 }
      );
    }

    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || undefined;
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // Convertir parámetros de fecha a objetos Date
    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    // Si el tipo es "all", tratarlo como undefined para obtener todos los contactos
    const contactType = type === "all" ? undefined : type;

    // Obtener los contactos de Holded, filtrando por tipo si se especifica
    const contacts = await getContacts(apiKey, false, contactType);

    // Filtrar contactos por fecha de creación si se especifican fechas
    const filteredContacts = filterContactsByDate(contacts, startDate, endDate);

    // Procesar los contactos para obtener información adicional
    // Nota: En un caso real, importaríamos processContacts desde el módulo correcto
    // Como es solo para demostración, usaremos datos simulados
    const processedContacts: ProcessedContact[] =
      simulateProcessedContacts(filteredContacts);

    // Calcular estadísticas generales
    const totalContacts = processedContacts.length;
    const activeContacts = processedContacts.filter(
      (c) => c.status === "active"
    ).length;
    const inactiveContacts = processedContacts.filter(
      (c) =>
        c.status === "inactive" ||
        c.status === "pre-deactivation" ||
        c.status === "inactive-with-services"
    ).length;

    // Calcular totales de membresías y formaciones
    const totalMemberships = processedContacts.reduce(
      (sum, contact) => sum + (contact.memberships?.length || 0),
      0
    );
    const totalTrainings = processedContacts.reduce(
      (sum, contact) => sum + (contact.trainings?.length || 0),
      0
    );

    // Calcular antigüedad promedio (simplificado)
    const averageTenure = calculateAverageTenure(processedContacts);

    // Preparar datos para gráficos
    const membershipTrends = prepareMembershipTrends();
    const trainingsByYear = prepareTrainingsByYear();
    const statusCounts = prepareStatusCounts(processedContacts);
    const tenureCounts = prepareTenureCounts(processedContacts);

    // Construir respuesta
    const analyticsData: AnalyticsData = {
      stats: {
        totalContacts,
        activeContacts,
        inactiveContacts,
        totalMemberships,
        totalTrainings,
        averageTenure,
      },
      membershipTrends,
      trainingsByYear,
      statusCounts,
      tenureCounts,
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Error en el análisis de contactos:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}

/**
 * Filtra contactos por fecha de creación
 * @param contacts - Lista de contactos a filtrar
 * @param startDate - Fecha de inicio opcional
 * @param endDate - Fecha de fin opcional
 * @returns Lista de contactos filtrados por fecha
 */
function filterContactsByDate(
  contacts: HoldedContact[],
  startDate?: Date,
  endDate?: Date
): HoldedContact[] {
  console.log(`Filtrando ${contacts.length} contactos`);
  console.log(
    `Fecha inicio: ${startDate ? startDate.toISOString() : "No definida"}`
  );
  console.log(`Fecha fin: ${endDate ? endDate.toISOString() : "No definida"}`);

  if (!startDate && !endDate) {
    console.log("Sin filtro de fechas, devolviendo todos los contactos");
    return contacts;
  }

  let contactsWithDate = 0;
  let contactsWithInvalidDate = 0;
  let contactsBeforeStartDate = 0;
  let contactsAfterEndDate = 0;
  let contactsInRange = 0;

  const filteredContacts = contacts.filter((contact) => {
    // Verificar ambos campos de fecha posibles
    const createdAtRaw = contact.created_at || contact.createdAt;

    if (!createdAtRaw) {
      console.log(`Contacto sin fecha: ${contact.id} - ${contact.name}`);
      return false;
    }

    contactsWithDate++;

    // Usar normalizeDate para manejar diferentes formatos de fecha
    let createdAt: Date | null = null;

    try {
      const normalizedDate = normalizeDate(createdAtRaw);

      // Si normalizeDate devuelve una fecha, usarla
      if (normalizedDate instanceof Date) {
        createdAt = normalizedDate;
      }
      // Si devuelve un string, intentar convertirlo a Date
      else if (typeof normalizedDate === "string") {
        createdAt = new Date(normalizedDate);
        if (isNaN(createdAt.getTime())) {
          throw new Error(`No se pudo convertir a fecha: ${normalizedDate}`);
        }
      }
    } catch (error) {
      contactsWithInvalidDate++;
      console.log(
        `Error normalizando fecha: ${createdAtRaw} para contacto ${contact.id}`,
        error
      );
      return false;
    }

    if (!createdAt || isNaN(createdAt.getTime())) {
      contactsWithInvalidDate++;
      console.log(
        `Fecha inválida después de normalización: ${createdAtRaw} para contacto ${contact.id}`
      );
      return false;
    }

    // Mostrar algunas fechas de muestra
    if (contactsWithDate <= 5) {
      console.log(
        `Muestra de fecha: ${createdAtRaw} -> ${createdAt.toISOString()}`
      );
    }

    // Si solo hay fecha de inicio
    if (startDate && !endDate) {
      if (createdAt < startDate) {
        contactsBeforeStartDate++;
        return false;
      }
      contactsInRange++;
      return true;
    }

    // Si solo hay fecha de fin
    if (!startDate && endDate) {
      if (createdAt > endDate) {
        contactsAfterEndDate++;
        return false;
      }
      contactsInRange++;
      return true;
    }

    // Si hay ambas fechas
    if (startDate && endDate) {
      if (!isDateBetween(createdAt, startDate, endDate)) {
        if (createdAt < startDate) contactsBeforeStartDate++;
        if (createdAt > endDate) contactsAfterEndDate++;
        return false;
      }
      contactsInRange++;
      return true;
    }

    return true;
  });

  console.log(`Estadísticas de filtrado:
    - Contactos con fecha: ${contactsWithDate}
    - Contactos con fecha inválida: ${contactsWithInvalidDate}
    - Contactos antes de la fecha de inicio: ${contactsBeforeStartDate}
    - Contactos después de la fecha de fin: ${contactsAfterEndDate}
    - Contactos en rango: ${contactsInRange}
    - Total filtrados: ${filteredContacts.length}
  `);

  return filteredContacts;
}

// Función para simular contactos procesados (solo para demostración)
function simulateProcessedContacts(
  rawContacts: HoldedContact[]
): ProcessedContact[] {
  const statuses: Array<
    "active" | "inactive" | "pre-deactivation" | "inactive-with-services"
  > = ["active", "inactive", "pre-deactivation", "inactive-with-services"];
  const tenures: Array<"new" | "onboarding" | "loyal" | "legend"> = [
    "new",
    "onboarding",
    "loyal",
    "legend",
  ];

  return rawContacts.map((contact, index) => {
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomTenure = tenures[Math.floor(Math.random() * tenures.length)];
    const membershipCount = Math.floor(Math.random() * 3);
    const trainingCount = Math.floor(Math.random() * 4);

    return {
      id: contact.id || `id-${index}`,
      name: contact.name || `Contact ${index}`,
      status: randomStatus,
      tenure: randomTenure,
      memberships: Array(membershipCount)
        .fill(0)
        .map((_, i) => ({
          id: `m-${i}`,
          name: `Membership ${i}`,
          status: "active",
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          type: "monthly",
        })),
      trainings: Array(trainingCount)
        .fill(0)
        .map((_, i) => ({
          id: `t-${i}`,
          name: `Training ${i}`,
          status: "completed",
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        })),
    };
  });
}

// Función para calcular la antigüedad promedio
function calculateAverageTenure(contacts: ProcessedContact[]): string {
  const tenureMap: Record<string, number> = {
    new: 0,
    onboarding: 3,
    loyal: 12,
    legend: 24,
  };

  const totalMonths = contacts.reduce((sum, contact) => {
    return sum + (tenureMap[contact.tenure] || 0);
  }, 0);

  const averageMonths = totalMonths / contacts.length;

  if (averageMonths < 1) {
    return "< 1 mes";
  } else if (averageMonths < 12) {
    return `${Math.round(averageMonths)} meses`;
  } else {
    const years = Math.floor(averageMonths / 12);
    const months = Math.round(averageMonths % 12);
    return months > 0 ? `${years} años, ${months} meses` : `${years} años`;
  }
}

// Función para preparar datos de tendencias de membresías
function prepareMembershipTrends(): MembershipTrend[] {
  // Simplificado: Usar los últimos 6 meses
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();

  return Array(6)
    .fill(0)
    .map((_, index) => {
      const monthIndex = (currentMonth - index + 12) % 12;
      const monthName = months[monthIndex];

      // Simular datos para demostración
      const active = Math.floor(Math.random() * 100) + 50;
      const expiringSoon = Math.floor(Math.random() * 30) + 10;
      const inactive = Math.floor(Math.random() * 40) + 20;

      return {
        date: monthName,
        active,
        expiringSoon,
        inactive,
      };
    })
    .reverse();
}

// Función para preparar datos de formaciones por año
function prepareTrainingsByYear(): TrainingByYear[] {
  const currentYear = new Date().getFullYear();

  return Array(3)
    .fill(0)
    .map((_, index) => {
      const year = (currentYear - index).toString();

      // Simular datos para demostración
      const completed = Math.floor(Math.random() * 80) + 40;
      const inProgress = Math.floor(Math.random() * 50) + 20;
      const pending = Math.floor(Math.random() * 30) + 10;

      return {
        year,
        completed,
        inProgress,
        pending,
      };
    })
    .reverse();
}

// Función para preparar datos de distribución por estado
function prepareStatusCounts(contacts: ProcessedContact[]): StatusCount[] {
  const statusCounts: Record<string, number> = {
    active: 0,
    "pre-deactivation": 0,
    inactive: 0,
    "inactive-with-services": 0,
  };

  contacts.forEach((contact) => {
    if (statusCounts.hasOwnProperty(contact.status)) {
      statusCounts[contact.status]++;
    }
  });

  return [
    { name: "Activos", value: statusCounts["active"], color: "#4ade80" },
    {
      name: "Pre-desactivación",
      value: statusCounts["pre-deactivation"],
      color: "#facc15",
    },
    { name: "Inactivos", value: statusCounts["inactive"], color: "#f87171" },
    {
      name: "Inactivos con Servicios",
      value: statusCounts["inactive-with-services"],
      color: "#a78bfa",
    },
  ];
}

// Función para preparar datos de distribución por antigüedad
function prepareTenureCounts(contacts: ProcessedContact[]): TenureCount[] {
  const tenureCounts: Record<string, number> = {
    new: 0,
    onboarding: 0,
    loyal: 0,
    legend: 0,
  };

  contacts.forEach((contact) => {
    if (tenureCounts.hasOwnProperty(contact.tenure)) {
      tenureCounts[contact.tenure]++;
    }
  });

  return [
    { name: "Nuevos", value: tenureCounts["new"], color: "#60a5fa" },
    {
      name: "En Onboarding",
      value: tenureCounts["onboarding"],
      color: "#4ade80",
    },
    { name: "Leales", value: tenureCounts["loyal"], color: "#facc15" },
    { name: "Leyendas", value: tenureCounts["legend"], color: "#a78bfa" },
  ];
}
