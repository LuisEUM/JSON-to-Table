import { NextRequest, NextResponse } from "next/server";
import { getContacts } from "@/app/lib/holded/services/holded-contacts-service";
import {
  HoldedContact,
  MembershipInfo,
  TrainingInfo,
  ServiceInfo,
} from "@/app/lib/holded/interfaces/contact-types";
import { isDateBetween } from "../../../lib/holded/utils/analytics-date-utils";
import { normalizeDate } from "@/app/table/utils/date-utils";

// Definir interfaces para los tipos de datos
interface ProcessedContact {
  id: string;
  name: string;
  type: "client" | "lead" | "supplier" | "creditor" | "debtor";
  status:
    | "active"
    | "inactive"
    | "pre-deactivation"
    | "inactive-with-services"
    | "inactive-satisfied"
    | "inactive-unsatisfied";
  tenure: "new" | "onboarding" | "loyal" | "legend";
  memberships?: MembershipInfo[];
  trainings?: TrainingInfo[];
  startDate?: Date | null; // Fecha de inicio de servicios
  endDate?: Date | null; // Fecha de fin de servicios
  services?: ServiceInfo[];
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
  description: string;
  phase: "inicio" | "desarrollo" | "cierre";
}

interface TenureCount {
  name: string;
  value: number;
  color: string;
  description: string;
  phase: "inicio" | "desarrollo" | "cierre";
}

interface TrainingStatusCount {
  name: string;
  value: number;
  color: string;
  description: string;
  phase: "inicio" | "desarrollo" | "cierre";
}

/**
 * Contador para estados de servicios
 */
interface ServiceStatusCount {
  name: string;
  value: number;
  color: string;
  description: string;
  phase: "inicio" | "desarrollo" | "cierre";
}

interface MembershipStatusCount {
  name: string;
  value: number;
  color: string;
  description: string;
  phase: "inicio" | "desarrollo" | "cierre";
}

interface AnalyticsData {
  stats: {
    totalContacts: number;
    activeContacts: number;
    inactiveContacts: number;
    totalMemberships: number;
    totalTrainings: number;
    totalServices: number; // Nuevo: total de servicios
    averageTenure: string;
  };
  contactCountByType: {
    client?: number;
    lead?: number;
    supplier?: number;
    creditor?: number;
    debtor?: number;
  };
  membershipTrends: MembershipTrend[];
  trainingsByYear: TrainingByYear[];
  statusCounts: StatusCount[];
  tenureCounts: TenureCount[];
  trainingStatusCounts: TrainingStatusCount[];
  serviceStatusCounts: ServiceStatusCount[]; // Nuevo: estados de servicios
  membershipStatusCounts: MembershipStatusCount[]; // Nuevo: estados de membresía
  contactsByCategory: {
    active: ProcessedContact[];
    expiringSoon: ProcessedContact[];
    inactive: ProcessedContact[];
    status: Record<string, ProcessedContact[]>;
    tenure: Record<string, ProcessedContact[]>;
    completed: Record<string, ProcessedContact[]>;
    inProgress: Record<string, ProcessedContact[]>;
    pending: Record<string, ProcessedContact[]>;
    deliveredSuccess: Record<string, ProcessedContact[]>; // Servicios entregados exitosamente
    deliveredFailed: Record<string, ProcessedContact[]>; // Servicios no entregados
  };
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
    // Enviar el tipo directamente a getContacts que ya maneja el caso 'all'
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

    // Calcular contactos activos e inactivos basados en su status (ya determinado por fechas)
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

    // Contar servicios registrados
    const totalServices = processedContacts.reduce((total, contact) => {
      return (
        total + ((contact.services as ServiceInfo[] | undefined)?.length || 0)
      );
    }, 0);

    // Preparar datos para gráficos
    const membershipTrends = prepareMembershipTrends();
    const trainingsByYear = prepareTrainingsByYear();
    const statusCounts = prepareStatusCounts(processedContacts);
    const tenureCounts = prepareTenureCounts(processedContacts);
    const trainingStatusCounts = prepareTrainingStatusCounts(processedContacts);

    // Construir respuesta
    const analyticsData: AnalyticsData = {
      stats: {
        totalContacts,
        activeContacts,
        inactiveContacts,
        totalMemberships,
        totalTrainings,
        totalServices,
        averageTenure,
      },
      contactCountByType: {
        client: processedContacts.filter((c) => c.type === "client").length,
        lead: processedContacts.filter((c) => c.type === "lead").length,
        supplier: processedContacts.filter((c) => c.type === "supplier").length,
        creditor: processedContacts.filter((c) => c.type === "creditor").length,
        debtor: processedContacts.filter((c) => c.type === "debtor").length,
      },
      membershipTrends,
      trainingsByYear,
      statusCounts,
      tenureCounts,
      trainingStatusCounts,
      serviceStatusCounts: prepareServiceStatusCounts(processedContacts),
      membershipStatusCounts: prepareMembershipStatusCounts(processedContacts),
      contactsByCategory: {
        // Contactos para MembershipTrendsChart
        active: processedContacts.filter((c) => c.status === "active"),
        expiringSoon: processedContacts.filter(
          (c) => c.status === "pre-deactivation"
        ),
        inactive: processedContacts.filter(
          (c) =>
            c.status === "inactive" || c.status === "inactive-with-services"
        ),

        // Contactos para StatusPieChart
        status: {
          Activos: processedContacts.filter((c) => c.status === "active"),
          "Pre-desactivación": processedContacts.filter(
            (c) => c.status === "pre-deactivation"
          ),
        },

        // Contactos para TenurePieChart
        tenure: {
          Nuevos: processedContacts.filter((c) => c.tenure === "new"),
          "En Onboarding": processedContacts.filter(
            (c) => c.tenure === "onboarding"
          ),
          Leales: processedContacts.filter((c) => c.tenure === "loyal"),
          Leyendas: processedContacts.filter((c) => c.tenure === "legend"),
        },

        // Contactos para TrainingsByYearChart
        completed: processedContacts.reduce((acc, contact) => {
          const trainings = contact.trainings || [];
          trainings.forEach((training) => {
            if (training.status === "completed") {
              const year = new Date(training.endDate).getFullYear().toString();
              if (!acc[year]) acc[year] = [];
              acc[year].push(contact);
            }
          });
          return acc;
        }, {} as Record<string, ProcessedContact[]>),

        inProgress: processedContacts.reduce((acc, contact) => {
          const trainings = contact.trainings || [];
          trainings.forEach((training) => {
            if (training.status === "in-progress") {
              const year = new Date(training.startDate)
                .getFullYear()
                .toString();
              if (!acc[year]) acc[year] = [];
              acc[year].push(contact);
            }
          });
          return acc;
        }, {} as Record<string, ProcessedContact[]>),

        pending: processedContacts.reduce((acc, contact) => {
          const trainings = contact.trainings || [];
          trainings.forEach((training) => {
            if (training.status === "pending") {
              const year = new Date(training.startDate)
                .getFullYear()
                .toString();
              if (!acc[year]) acc[year] = [];
              acc[year].push(contact);
            }
          });
          return acc;
        }, {} as Record<string, ProcessedContact[]>),

        deliveredSuccess: processedContacts.reduce((acc, contact) => {
          const services =
            (contact.services as ServiceInfo[] | undefined) || [];
          services.forEach((service) => {
            if (service.status === "delivered" && service.deliverySuccess) {
              const year = new Date(service.endDate).getFullYear().toString();
              if (!acc[year]) acc[year] = [];
              acc[year].push(contact);
            }
          });
          return acc;
        }, {} as Record<string, ProcessedContact[]>),

        deliveredFailed: processedContacts.reduce((acc, contact) => {
          const services =
            (contact.services as ServiceInfo[] | undefined) || [];
          services.forEach((service) => {
            if (service.status === "delivered" && !service.deliverySuccess) {
              const year = new Date(service.endDate).getFullYear().toString();
              if (!acc[year]) acc[year] = [];
              acc[year].push(contact);
            }
          });
          return acc;
        }, {} as Record<string, ProcessedContact[]>),
      },
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
  if (rawContacts.length === 0) {
    return [];
  }

  // Helper function to ensure a date is valid
  const ensureValidDate = (date: Date): Date => {
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      // If invalid, return current date as fallback
      return new Date();
    }
    return date;
  };

  // Helper function to safely convert a date to ISO string
  const safeToISOString = (date: Date): string => {
    try {
      return ensureValidDate(date).toISOString();
    } catch (e) {
      console.error("Error converting date to ISO string:", e);
      return new Date().toISOString(); // Fallback to current date
    }
  };

  // Procesamos los contactos reales (simplificado para el ejemplo)
  return rawContacts.map((contact) => {
    // Simplificado para el ejemplo
    const startDate = normalizeDate(contact.registrationDate);

    // Ensure startDate is a Date object before using Date methods
    const startDateObj =
      typeof startDate === "string"
        ? new Date(startDate)
        : startDate instanceof Date
        ? startDate
        : new Date();
    // Validate the date
    const validStartDate = ensureValidDate(startDateObj);

    // Generamos una fecha de fin aleatoria entre 1 y 24 meses después
    const randomMonths = Math.floor(Math.random() * 24) + 1;
    const endDateObj = new Date(validStartDate);
    endDateObj.setMonth(endDateObj.getMonth() + randomMonths);
    // Validate the end date
    const validEndDate = ensureValidDate(endDateObj);

    // Determine status based on end date
    const now = new Date();
    const monthsDiff =
      (now.getFullYear() - validStartDate.getFullYear()) * 12 +
      (now.getMonth() - validStartDate.getMonth());

    let status: ProcessedContact["status"] = "active";
    if (validEndDate < now) {
      // Si la fecha de fin ya pasó, el contacto está inactivo
      const random = Math.random();
      if (random < 0.3) {
        status = "inactive-satisfied"; // 30% inactivos satisfechos
      } else if (random < 0.6) {
        status = "inactive-unsatisfied"; // 30% inactivos insatisfechos
      } else {
        status = "inactive"; // 40% inactivos regulares
      }
    } else {
      // Si la fecha de fin es futura, el contacto está activo o pre-desactivación
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

      if (validEndDate <= oneMonthFromNow) {
        status = "pre-deactivation";
      } else {
        status = "active";
      }
    }

    // Simplificado para el ejemplo: Determinamos si tiene servicios activos
    if (status === "inactive" && Math.random() > 0.7) {
      status = "inactive-with-services";
    }

    let tenure: ProcessedContact["tenure"] = "new";
    if (monthsDiff < 1) {
      tenure = "new";
    } else if (monthsDiff < 3) {
      tenure = "onboarding";
    } else if (monthsDiff < 12) {
      tenure = "loyal";
    } else {
      tenure = "legend";
    }

    // Simulamos membresías
    const membershipCount = Math.floor(Math.random() * 3); // 0-2 membresías
    const memberships: MembershipInfo[] = [];

    for (let i = 0; i < membershipCount; i++) {
      const membershipStartDate = new Date(validStartDate);
      membershipStartDate.setMonth(
        membershipStartDate.getMonth() + Math.floor(Math.random() * 3)
      );
      // Validate membership start date
      const validMembershipStartDate = ensureValidDate(membershipStartDate);

      const membershipEndDate = new Date(validMembershipStartDate);
      membershipEndDate.setMonth(
        membershipEndDate.getMonth() + Math.floor(Math.random() * 12) + 1
      );
      // Validate membership end date
      const validMembershipEndDate = ensureValidDate(membershipEndDate);

      // Determinamos el estado de la membresía
      let membershipStatus: MembershipInfo["status"] = "active";
      if (validMembershipEndDate < now) {
        const random = Math.random();
        if (random < 0.3) {
          membershipStatus = "inactive-satisfied";
        } else if (random < 0.6) {
          membershipStatus = "inactive-unsatisfied";
        } else {
          membershipStatus = "inactive";
        }
      } else {
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

        if (validMembershipEndDate <= oneMonthFromNow) {
          membershipStatus = "expiring-soon";
        } else {
          const randomStatus = Math.random();
          if (randomStatus < 0.2) {
            membershipStatus = "pending"; // 20% pendiente
          } else {
            membershipStatus = "active"; // 80% activo
          }
        }
      }

      memberships.push({
        id: `m-${Math.random().toString(36).substring(2, 10)}`,
        name: `Membresía ${i + 1}`,
        status: membershipStatus,
        startDate: safeToISOString(validMembershipStartDate),
        endDate: safeToISOString(validMembershipEndDate),
        type: ["monthly", "quarterly", "biannual", "annual"][
          Math.floor(Math.random() * 4)
        ] as MembershipInfo["type"],
      });
    }

    // Simulamos formaciones
    const trainingCount = Math.floor(Math.random() * 4); // 0-3 formaciones
    const trainings: TrainingInfo[] = [];

    for (let i = 0; i < trainingCount; i++) {
      const trainingStartDate = new Date(validStartDate);
      trainingStartDate.setMonth(
        trainingStartDate.getMonth() + Math.floor(Math.random() * 6)
      );
      // Validate training start date
      const validTrainingStartDate = ensureValidDate(trainingStartDate);

      const trainingEndDate = new Date(validTrainingStartDate);
      trainingEndDate.setMonth(
        trainingEndDate.getMonth() + Math.floor(Math.random() * 6) + 1
      );
      // Validate training end date
      const validTrainingEndDate = ensureValidDate(trainingEndDate);

      // Determinamos el estado de la formación
      let trainingStatus: TrainingInfo["status"];
      if (validTrainingEndDate < now) {
        trainingStatus = Math.random() > 0.2 ? "completed" : "extended";
      } else if (validTrainingStartDate > now) {
        trainingStatus = "pending";
      } else {
        // Probabilidad de que una formación esté desactivada
        if (Math.random() < 0.1) {
          trainingStatus = "deactivated";
        } else {
          trainingStatus = "in-progress";
        }
      }

      // Si la formación está extendida, añadir fecha de extensión
      let extendedEndDate = undefined;
      if (trainingStatus === "extended") {
        const extDate = new Date(validTrainingEndDate);
        extDate.setFullYear(extDate.getFullYear() + 1);
        extendedEndDate = safeToISOString(extDate);
      }

      trainings.push({
        id: `t-${Math.random().toString(36).substring(2, 10)}`,
        name: `Formación ${i + 1}`,
        status: trainingStatus,
        startDate: safeToISOString(validTrainingStartDate),
        endDate: safeToISOString(validTrainingEndDate),
        extendedEndDate,
        hasCertificate: Math.random() > 0.5,
      });
    }

    // Simulamos servicios
    const serviceCount = Math.floor(Math.random() * 3); // 0-2 servicios
    const services: ServiceInfo[] = [];

    for (let i = 0; i < serviceCount; i++) {
      const serviceStartDate = new Date(validStartDate);
      serviceStartDate.setMonth(
        serviceStartDate.getMonth() + Math.floor(Math.random() * 3)
      );
      // Validate service start date
      const validServiceStartDate = ensureValidDate(serviceStartDate);

      const serviceEndDate = new Date(validServiceStartDate);
      serviceEndDate.setMonth(
        serviceEndDate.getMonth() + Math.floor(Math.random() * 2) + 1
      );
      // Validate service end date
      const validServiceEndDate = ensureValidDate(serviceEndDate);

      // Determinamos el estado del servicio
      let serviceStatus: ServiceInfo["status"];
      const random = Math.random();

      if (validServiceEndDate < now) {
        serviceStatus = "delivered";
      } else if (validServiceStartDate > now) {
        serviceStatus = "scheduled";
      } else {
        // Probabilidad de que el servicio esté desactivado
        if (random < 0.1) {
          serviceStatus = "deactivated";
        } else {
          serviceStatus = "in-progress";
        }
      }

      services.push({
        id: `s-${Math.random().toString(36).substring(2, 10)}`,
        name: `Servicio ${i + 1}`,
        status: serviceStatus,
        startDate: safeToISOString(validServiceStartDate),
        endDate: safeToISOString(validServiceEndDate),
        deliverySuccess:
          serviceStatus === "delivered" ? Math.random() > 0.3 : undefined,
        notes: random > 0.8 ? "Notas para este servicio" : undefined,
      });
    }

    // Construir el objeto ProcessedContact
    const processedContact: ProcessedContact = {
      ...contact,
      type: "client", // Simplificado
      status,
      tenure,
      startDate: validStartDate,
      endDate: validEndDate < validStartDate ? null : validEndDate, // Para evitar fechas inconsistentes
      memberships: memberships.length > 0 ? memberships : undefined,
      trainings: trainings.length > 0 ? trainings : undefined,
      services: services.length > 0 ? services : undefined,
    };

    return processedContact;
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

// Función para preparar datos de estado de los contactos
function prepareStatusCounts(contacts: ProcessedContact[]): StatusCount[] {
  // Inicializamos contadores para cada estado
  const counts = {
    active: 0,
    preActivation: 0,
    preDeactivation: 0,
    inactive: 0,
    inactiveWithServices: 0,
    inactiveSatisfied: 0, // Nuevo: Inactivos que se fueron satisfechos
    inactiveUnsatisfied: 0, // Nuevo: Inactivos que se fueron insatisfechos
    noStatus: 0,
  };

  // Iteramos sobre los contactos para contar cada estado
  contacts.forEach((contact) => {
    // Verificamos primero si el status existe y es una cadena válida
    if (!contact.status) {
      counts.noStatus++;
      return;
    }

    // Ahora contamos basado en el status
    switch (contact.status) {
      case "active":
        counts.active++;
        break;
      case "pre-deactivation":
        counts.preDeactivation++;
        break;
      case "inactive-with-services":
        counts.inactiveWithServices++;
        break;
      case "inactive-satisfied":
        counts.inactiveSatisfied++;
        break;
      case "inactive-unsatisfied":
        counts.inactiveUnsatisfied++;
        break;
      case "inactive":
        counts.inactive++;
        break;
      default:
        counts.noStatus++;
        break;
    }

    // Consideramos pre-activation como un estado adicional
    // que podría estar presente en los datos aunque no esté en el tipo principal
    if (
      typeof contact.status === "string" &&
      contact.status.includes("pre-activation")
    ) {
      counts.preActivation++;
    }
  });

  return [
    {
      name: "Sin estado",
      value: counts.noStatus,
      color: "#a1a1aa", // gris
      description:
        "Contactos sin información suficiente: No se ha podido determinar el estado operativo de estos contactos por falta de datos o inconsistencias en la información disponible.",
      phase: "inicio", // Fase de inicio
    },
    {
      name: "Por iniciar",
      value: counts.preActivation,
      color: "#2563eb", // azul oscuro
      description:
        "Clientes con membresías pendientes: Corresponde a contactos que han adquirido servicios pero cuya fecha de activación aún no ha llegado.",
      phase: "inicio", // Fase de inicio
    },
    {
      name: "Activos",
      value: counts.active,
      color: "#00C851", // verde
      description:
        "Clientes con membresías activas: Estos contactos tienen suscripciones vigentes con acceso completo a todos los servicios contratados.",
      phase: "desarrollo", // Fase de desarrollo
    },
    {
      name: "Por finalizar",
      value: counts.preDeactivation,
      color: "#eab308", // amarillo
      description:
        "Clientes en período de pre-desactivación: Contactos cuyas membresías vencerán en menos de 30 días y requieren acciones de renovación.",
      phase: "desarrollo", // Fase de desarrollo
    },
    {
      name: "Desactivado",
      value: counts.inactive,
      color: "#ef4444", // rojo
      description:
        "Clientes con membresías desactivadas: Contactos que no tienen suscripciones activas y no pueden acceder a los servicios contratados porque no han realizado los pagos correspondientes.",
      phase: "cierre", // Fase de cierre
    },
    {
      name: "Satisfecho",
      value: counts.inactiveSatisfied,
      color: "#047230", // Verde Oscuro
      description:
        "Clientes inactivos que alcanzaron sus objetivos: Contactos que finalizaron su relación comercial porque aprendieron lo que necesitaban, se desactivaron voluntariamente por temas ajenos a la empresa o cumplieron sus metas formativas.",
      phase: "cierre", // Fase de cierre
    },
    {
      name: "Insatisfecho",
      value: counts.inactiveUnsatisfied,
      color: "#ef7b07", // Naranja
      description:
        "Clientes inactivos por insatisfacción: Contactos que cesaron su relación debido a problemas internos o insatisfacción con el servicio. Requieren análisis y seguimiento.",
      phase: "cierre", // Fase de cierre
    },
  ];
}

// Función para preparar datos de distribución por antigüedad
function prepareTenureCounts(contacts: ProcessedContact[]): TenureCount[] {
  // Inicializamos contadores para cada segmento de antigüedad
  const counts = {
    new: 0,
    onboarding: 0,
    loyal: 0,
    legend: 0,
    noTenure: 0, // Añadimos "Sin antigüedad"
  };

  // Iteramos a través de los contactos para contar los diferentes segmentos
  contacts.forEach((contact) => {
    if (!contact.tenure) {
      counts.noTenure++;
    } else if (contact.tenure === "new") {
      counts.new++;
    } else if (contact.tenure === "onboarding") {
      counts.onboarding++;
    } else if (contact.tenure === "loyal") {
      counts.loyal++;
    } else if (contact.tenure === "legend") {
      counts.legend++;
    }
  });

  return [
    {
      name: "Sin estado",
      value: counts.noTenure,
      color: "#a1a1aa", // Gris
      description:
        "Contactos sin información de fecha de inicio: No se ha podido determinar la antigüedad por falta de datos o inconsistencias en las fechas registradas.",
      phase: "inicio", // Fase de inicio por defecto
    },
    {
      name: "Recién llegados",
      value: counts.new,
      color: "#2563eb", // azul oscuro
      description:
        "Clientes con menos de 1 mes de antigüedad: Se encuentran en fase inicial de onboarding y adaptación a los servicios contratados.",
      phase: "inicio", // Fase de adopción
    },
    {
      name: "Exploradores",
      value: counts.onboarding,
      color: "#eab308", // amarillo
      description:
        "Clientes con 1 a 3 meses de antigüedad: Etapa crítica de adopción donde se consolida el uso regular de los servicios.",
      phase: "desarrollo", // Fase de adopción
    },
    {
      name: "Leales",
      value: counts.loyal,
      color: "#00C851", // verde
      description:
        "Clientes con más de 3 meses de antigüedad: Muestran uso regular de los servicios y alta retención, con menor probabilidad de abandono.",
      phase: "cierre", // Fase de consolidación
    },
    {
      name: "Veteranos",
      value: counts.legend,
      color: "#8b5cf6", // Morado
      description:
        "Clientes con más de 1 año de antigüedad: Base de clientes altamente leal y potenciales promotores de los servicios.",
      phase: "cierre", // Fase de madurez
    },
  ];
}

function prepareTrainingStatusCounts(
  contacts: ProcessedContact[]
): TrainingStatusCount[] {
  // Calculamos los conteos de cada tipo de formación
  const trainingCounts = {
    completedWithCertificate: 0, // Completadas con certificado
    completedWithoutCertificate: 0, // Completadas sin certificado
    inProgress: 0, // En progreso
    pending: 0, // Pendientes
    endingSoon: 0, // Por finalizar pronto
    extendedPeriod: 0, // Periodo extendido
    deactivated: 0, // Desactivadas
    noTraining: 0, // Sin formación
  };

  // Iteramos a través de los contactos para contar los diferentes estados de formación
  contacts.forEach((contact) => {
    if (!contact.trainings || contact.trainings.length === 0) {
      trainingCounts.noTraining++;
      return;
    }

    contact.trainings.forEach((training) => {
      if (training.status === "completed") {
        // Verificar si tiene certificado
        if (training.hasCertificate) {
          trainingCounts.completedWithCertificate++;
        } else {
          trainingCounts.completedWithoutCertificate++;
        }
      } else if (training.status === "in-progress") {
        // Verificar si está próxima a finalizar (menos de un mes)
        const endDate = training.endDate ? new Date(training.endDate) : null;
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

        if (endDate && endDate <= oneMonthFromNow && endDate >= new Date()) {
          trainingCounts.endingSoon++;
        } else {
          trainingCounts.inProgress++;
        }
      } else if (training.status === "pending") {
        trainingCounts.pending++;
      } else if (training.status === "extended") {
        trainingCounts.extendedPeriod++;
      } else if (training.status === "deactivated") {
        trainingCounts.deactivated++;
      }
    });
  });

  return [
    {
      name: "Sin estado",
      value: trainingCounts.noTraining,
      color: "#a1a1aa", // gris
      description:
        "Contacto sin formaciones asignadas: No tiene cursos o programas formativos registrados en el sistema.",
      phase: "inicio", // Fase de desarrollo por defecto
    },
    {
      name: "Por iniciar",
      value: trainingCounts.pending,
      color: "#2563eb", // Azul Oscuro
      description:
        "Formación pendiente: El contacto tiene asignada la formación pero aún no ha iniciado ninguna sesión o no ha accedido al contenido.",
      phase: "inicio", // Fase de inicio
    },
    {
      name: "En progreso",
      value: trainingCounts.inProgress,
      color: "#60a5fa", // azul
      description:
        "Formación en curso: El contacto está participando activamente en el programa formativo. Ha completado al menos una sesión o módulo.",
      phase: "desarrollo", // Fase de desarrollo
    },
    {
      name: "Por finalizar",
      value: trainingCounts.endingSoon,
      color: "#eab308", // amarillo
      description:
        "Formación próxima a finalizar: La formación concluirá en menos de 30 días. Es necesario evaluar si requiere acciones adicionales.",
      phase: "desarrollo", // Fase de desarrollo
    },
    {
      name: "Desactivado",
      value: trainingCounts.deactivated,
      color: "#ef4444", // rojo
      description:
        "Formación desactivada: El acceso a la formación ha sido suspendido debido a impagos o incumplimiento de condiciones por parte del cliente.",
      phase: "cierre", // Fase de cierre
    },
    {
      name: "Completado",
      value: trainingCounts.completedWithCertificate,
      color: "#00C851", // verde
      description:
        "Formación completada con certificado: El contacto ha finalizado con éxito el programa formativo y ha recibido un certificado oficial de aprovechamiento.",
      phase: "cierre", // Fase de cierre
    },
    {
      name: "Sin certificado",
      value: trainingCounts.completedWithoutCertificate,
      color: "#ef7b07", // Naranja Oscuro
      description:
        "Formación completada sin certificado: El contacto ha finalizado el programa formativo pero no ha recibido un certificado, posiblemente por no cumplir los requisitos mínimos para la certificación.",
      phase: "cierre", // Fase de cierre
    },
  ];
}

/**
 * Prepara datos de estado de servicios para la visualización
 */
function prepareServiceStatusCounts(
  contacts: ProcessedContact[]
): ServiceStatusCount[] {
  // Calculamos los conteos de cada tipo de servicio
  const serviceCounts = {
    deliveredSuccess: 0, // Entregado exitosamente
    deliveredFailed: 0, // No se pudo entregar
    inProgress: 0, // En proceso
    scheduled: 0, // Programado
    deactivated: 0, // Desactivado por impagos o incumplimiento
    noService: 0, // Sin servicios asignados
  };

  // Iteramos a través de los contactos para contar los diferentes estados de servicios
  contacts.forEach((contact) => {
    const services = (contact.services as ServiceInfo[] | undefined) || [];

    if (services.length === 0) {
      serviceCounts.noService++;
      return;
    }

    services.forEach((service) => {
      if (service.status === "delivered") {
        if (service.deliverySuccess) {
          serviceCounts.deliveredSuccess++;
        } else {
          serviceCounts.deliveredFailed++;
        }
      } else if (service.status === "in-progress") {
        serviceCounts.inProgress++;
      } else if (service.status === "scheduled") {
        serviceCounts.scheduled++;
      } else if (service.status === "deactivated") {
        serviceCounts.deactivated++;
      }
    });
  });

  return [
    {
      name: "Sin estado",
      value: serviceCounts.noService,
      color: "#a1a1aa", // gris
      description:
        "Contacto sin servicios asignados: No tiene servicios registrados en el sistema.",
      phase: "inicio", // Fase de inicio por defecto
    },
    {
      name: "Por iniciar",
      value: serviceCounts.scheduled,
      color: "#2563eb", // Azul Oscuro
      description:
        "Servicio programado: El servicio está agendado para una fecha futura. Se han establecido los parámetros pero aún no se ha iniciado el trabajo.",
      phase: "inicio", // Fase de programación
    },
    {
      name: "En progreso",
      value: serviceCounts.inProgress,
      color: "#60a5fa", // azul
      description:
        "Servicio en proceso: El equipo está trabajando activamente en la prestación del servicio. Se encuentra en fase de producción o desarrollo.",
      phase: "desarrollo", // Fase de ejecución
    },
    {
      name: "Desactivado",
      value: serviceCounts.deactivated,
      color: "#ef4444", // rojo
      description:
        "Servicio desactivado: El servicio ha sido suspendido debido a que el cliente debe dinero o no ha cumplido con su parte del acuerdo, aunque ya se ha iniciado el proyecto.",
      phase: "cierre", // Fase de cierre
    },
    {
      name: "Completado",
      value: serviceCounts.deliveredSuccess,
      color: "#00C851", // verde
      description:
        "Servicio completado con éxito: El servicio ha sido entregado al cliente de manera satisfactoria, cumpliendo todos los requisitos y estándares de calidad establecidos.",
      phase: "cierre", // Fase de entrega
    },
    {
      name: "No completado",
      value: serviceCounts.deliveredFailed,
      color: "#ef7b07", // Naranja
      description:
        "Servicio no entregado: No fue posible completar la entrega del servicio al cliente por problemas técnicos, falta de información, o circunstancias fuera de control.",
      phase: "cierre", // Fase de entrega
    },
  ];
}

// Función para preparar datos de estado de membresías
function prepareMembershipStatusCounts(
  contacts: ProcessedContact[]
): MembershipStatusCount[] {
  // Inicializamos contadores para cada estado
  const membershipCounts = {
    active: 0,
    pending: 0,
    expiringSoon: 0,
    inactive: 0,
    inactiveSatisfied: 0,
    inactiveUnsatisfied: 0,
    noMembership: 0,
  };

  // Iteramos a través de los contactos para contar los diferentes estados de membresía
  contacts.forEach((contact) => {
    if (!contact.memberships || contact.memberships.length === 0) {
      membershipCounts.noMembership++;
      return;
    }

    contact.memberships.forEach((membership) => {
      if (membership.status === "active") {
        membershipCounts.active++;
      } else if (membership.status === "pending") {
        membershipCounts.pending++;
      } else if (membership.status === "expiring-soon") {
        membershipCounts.expiringSoon++;
      } else if (membership.status === "inactive-satisfied") {
        membershipCounts.inactiveSatisfied++;
      } else if (membership.status === "inactive-unsatisfied") {
        membershipCounts.inactiveUnsatisfied++;
      } else if (membership.status === "inactive") {
        membershipCounts.inactive++;
      }
    });
  });

  return [
    {
      name: "Sin estado",
      value: membershipCounts.noMembership,
      color: "#a1a1aa", // gris
      description:
        "Contactos sin membresías: No tienen suscripciones registradas en el sistema.",
      phase: "inicio", // Fase de inicio por defecto
    },
    {
      name: "Activo",
      value: membershipCounts.active,
      color: "#00C851", // verde
      description:
        "Membresías activas: Suscripciones vigentes con acceso completo a todos los servicios contratados.",
      phase: "desarrollo", // Fase de desarrollo
    },
    {
      name: "Por iniciar",
      value: membershipCounts.pending,
      color: "#2563eb", // azul oscuro
      description:
        "Membresías pendientes de activación: Suscripciones que han sido adquiridas pero cuya fecha de inicio aún no ha llegado.",
      phase: "inicio", // Fase de inicio
    },
    {
      name: "Por finalizar",
      value: membershipCounts.expiringSoon,
      color: "#eab308", // amarillo
      description:
        "Membresías próximas a vencer: Suscripciones que expirarán en menos de 30 días y requieren atención para su renovación.",
      phase: "desarrollo", // Fase de desarrollo
    },
    {
      name: "Desactivado",
      value: membershipCounts.inactive,
      color: "#ef4444", // rojo
      description:
        "Membresías inactivas: Suscripciones que han expirado y no han sido renovadas, por lo que el cliente no tiene acceso a los servicios contratados.",
      phase: "cierre", // Fase de cierre
    },
    {
      name: "Satisfecho",
      value: membershipCounts.inactiveSatisfied,
      color: "#047230", // Verde Oscuro
      description:
        "Membresías canceladas por objetivos cumplidos: El cliente finalizó su suscripción porque alcanzó sus metas de aprendizaje o quedó satisfecho con el servicio recibido.",
      phase: "cierre", // Fase de cierre
    },
    {
      name: "Insatisfecho",
      value: membershipCounts.inactiveUnsatisfied,
      color: "#ef7b07", // Naranja
      description:
        "Membresías canceladas por insatisfacción: El cliente finalizó su suscripción debido a problemas con el servicio o porque no se cumplieron sus expectativas.",
      phase: "cierre", // Fase de cierre
    },
  ];
}
