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
interface CustomField {
  field: string;
  value: string;
}

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
  customFields: CustomField[];
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

interface ConsultingStatusCount {
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
    totalServices: number;
    totalConsultorias: number;
    averageTenure: string;
  };
  contactCountByType: {
    client?: number;
    lead?: number;
    supplier?: number;
    creditor?: number;
    debtor?: number;
  };
  responsibleCounts: {
    name: string;
    subcategory: string;
    count: number;
  }[];
  membershipTrends: MembershipTrend[];
  trainingsByYear: TrainingByYear[];
  statusCounts: StatusCount[];
  tenureCounts: TenureCount[];
  trainingStatusCounts: TrainingStatusCount[];
  serviceStatusCounts: ServiceStatusCount[];
  membershipStatusCounts: MembershipStatusCount[];
  consultingStatusCounts: ConsultingStatusCount[];
  contactsByCategory: {
    active: ProcessedContact[];
    expiringSoon: ProcessedContact[];
    inactive: ProcessedContact[];
    status: Record<string, ProcessedContact[]>;
    tenure: Record<string, ProcessedContact[]>;
    completed: Record<string, ProcessedContact[]>;
    inProgress: Record<string, ProcessedContact[]>;
    pending: Record<string, ProcessedContact[]>;
    deliveredSuccess: Record<string, ProcessedContact[]>;
    deliveredFailed: Record<string, ProcessedContact[]>;
  };
  dateRange: {
    minDate?: string;
    maxDate?: string;
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

    // Obtener todos los contactos sin filtrar por tipo inicialmente
    const contacts = await getContacts(apiKey, false);

    // Filtrar por fechas
    const filteredByDate = filterContactsByDate(contacts, startDate, endDate);

    // Filtrar por tipo si es necesario
    const filteredContacts =
      type && type !== "all"
        ? filteredByDate.filter((contact) => contact.type === type)
        : filteredByDate;

    // Procesar los contactos ya filtrados
    const processedContacts = simulateProcessedContacts(filteredContacts);

    // Calcular estadísticas generales usando los contactos ya filtrados
    const totalContacts = processedContacts.length;

    // Calcular contactos activos e inactivos basados en su status
    const activeContacts = processedContacts.filter(
      (c) => c.status === "active"
    ).length;

    const inactiveContacts = processedContacts.filter(
      (c) =>
        c.status === "inactive" ||
        c.status === "pre-deactivation" ||
        c.status === "inactive-with-services" ||
        c.status === "inactive-satisfied" ||
        c.status === "inactive-unsatisfied"
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

    // Calcular antigüedad promedio
    const averageTenure = calculateAverageTenure(processedContacts);

    // Contar servicios registrados
    const totalServices = processedContacts.reduce((total, contact) => {
      return (
        total + ((contact.services as ServiceInfo[] | undefined)?.length || 0)
      );
    }, 0);

    // Contar consultorías registradas
    const totalConsultorias = processedContacts.reduce((total, contact) => {
      const customFields: CustomField[] = contact.customFields || [];
      const consultoriaFields = customFields.filter(
        (field: CustomField) =>
          field.field.startsWith("CONSULTORÍA") &&
          (field.field.includes("Fecha de Inicio") ||
            field.field.includes("Responsable")) &&
          field.value
      );
      return total + (consultoriaFields.length > 0 ? 1 : 0);
    }, 0);

    // Obtener conteo de responsables por subcategoría
    const responsibleCounts = processedContacts.reduce((acc, contact) => {
      const customFields: CustomField[] = contact.customFields || [];

      customFields.forEach((field: CustomField) => {
        if (field.field.includes("Responsable") && field.value) {
          const categoryMatch = field.field.match(/^([^-]+)/);
          if (categoryMatch) {
            const category = categoryMatch[1].trim();
            const responsible = field.value.trim();

            const existingEntry = acc.find(
              (entry) =>
                entry.name === responsible && entry.subcategory === category
            );

            if (existingEntry) {
              existingEntry.count++;
            } else {
              acc.push({
                name: responsible,
                subcategory: category,
                count: 1,
              });
            }
          }
        }
      });

      return acc;
    }, [] as { name: string; subcategory: string; count: number }[]);

    // Ordenar por cantidad descendente
    responsibleCounts.sort((a, b) => b.count - a.count);

    // Preparar datos para gráficos usando los contactos filtrados
    const membershipTrends = prepareMembershipTrends();
    const trainingsByYear = prepareTrainingsByYear();
    const statusCounts = prepareStatusCounts(processedContacts);
    const tenureCounts = prepareTenureCounts(processedContacts);
    const trainingStatusCounts = prepareTrainingStatusCounts(processedContacts);

    // Para el conteo por tipo, usamos la lista filtrada solo por fecha
    const contactCountByType = {
      client: filteredByDate.filter((c) => c.type === "client").length,
      lead: filteredByDate.filter((c) => c.type === "lead").length,
      supplier: filteredByDate.filter((c) => c.type === "supplier").length,
      creditor: filteredByDate.filter((c) => c.type === "creditor").length,
      debtor: filteredByDate.filter((c) => c.type === "debtor").length,
    };

    // Construir respuesta
    const analyticsData: AnalyticsData = {
      stats: {
        totalContacts,
        activeContacts,
        inactiveContacts,
        totalMemberships,
        totalTrainings,
        totalServices,
        totalConsultorias,
        averageTenure,
      },
      contactCountByType,
      responsibleCounts,
      membershipTrends,
      trainingsByYear,
      statusCounts,
      tenureCounts,
      trainingStatusCounts,
      serviceStatusCounts: prepareServiceStatusCounts(processedContacts),
      membershipStatusCounts: prepareMembershipStatusCounts(processedContacts),
      consultingStatusCounts: prepareConsultingStatusCounts(processedContacts),
      contactsByCategory: {
        active: processedContacts.filter((c) => c.status === "active"),
        expiringSoon: processedContacts.filter(
          (c) => c.status === "pre-deactivation"
        ),
        inactive: processedContacts.filter(
          (c) =>
            c.status === "inactive" || c.status === "inactive-with-services"
        ),
        status: {
          Activos: processedContacts.filter((c) => c.status === "active"),
          "Pre-desactivación": processedContacts.filter(
            (c) => c.status === "pre-deactivation"
          ),
        },
        tenure: {
          "Recién llegados": processedContacts.filter(
            (c) => c.tenure === "new"
          ),
          "En incorporación": processedContacts.filter(
            (c) => c.tenure === "onboarding"
          ),
          "Clientes Leales": processedContacts.filter(
            (c) => c.tenure === "loyal"
          ),
        },
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
          const services = contact.services || [];
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
          const services = contact.services || [];
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
      dateRange: {
        minDate: startDateParam || undefined,
        maxDate: endDateParam || undefined,
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
    if (isNaN(date.getTime())) {
      return new Date();
    }
    return date;
  };

  // Helper function para convertir a ISO string de forma segura
  const safeToISOString = (date: Date): string => {
    try {
      return ensureValidDate(date).toISOString();
    } catch (e) {
      console.error("Error converting date to ISO string:", e);
      return new Date().toISOString();
    }
  };

  return rawContacts.map((contact) => {
    const startDate = normalizeDate(contact.registrationDate);
    const startDateObj =
      typeof startDate === "string"
        ? new Date(startDate)
        : startDate instanceof Date
        ? startDate
        : new Date();
    const validStartDate = ensureValidDate(startDateObj);

    // Fecha de fin aleatoria entre 1 y 24 meses después
    const randomMonths = Math.floor(Math.random() * 24) + 1;
    const endDateObj = new Date(validStartDate);
    endDateObj.setMonth(endDateObj.getMonth() + randomMonths);
    const validEndDate = ensureValidDate(endDateObj);

    const now = new Date();
    const monthsDiff =
      (now.getFullYear() - validStartDate.getFullYear()) * 12 +
      (now.getMonth() - validStartDate.getMonth());

    let status: ProcessedContact["status"] = "active";
    if (validEndDate < now) {
      const random = Math.random();
      if (random < 0.3) {
        status = "inactive-satisfied";
      } else if (random < 0.6) {
        status = "inactive-unsatisfied";
      } else {
        status = "inactive";
      }
    } else {
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
      if (validEndDate <= oneMonthFromNow) {
        status = "pre-deactivation";
      } else {
        status = "active";
      }
    }

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

    // Simulación de membresías
    const membershipCount = Math.floor(Math.random() * 3);
    const memberships: MembershipInfo[] = [];
    for (let i = 0; i < membershipCount; i++) {
      const membershipStartDate = new Date(validStartDate);
      membershipStartDate.setMonth(
        membershipStartDate.getMonth() + Math.floor(Math.random() * 3)
      );
      const validMembershipStartDate = ensureValidDate(membershipStartDate);

      const membershipEndDate = new Date(validMembershipStartDate);
      membershipEndDate.setMonth(
        membershipEndDate.getMonth() + Math.floor(Math.random() * 12) + 1
      );
      const validMembershipEndDate = ensureValidDate(membershipEndDate);

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
          membershipStatus = randomStatus < 0.2 ? "pending" : "active";
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

    // Simulación de formaciones
    const trainingCount = Math.floor(Math.random() * 4);
    const trainings: TrainingInfo[] = [];
    for (let i = 0; i < trainingCount; i++) {
      const trainingStartDate = new Date(validStartDate);
      trainingStartDate.setMonth(
        trainingStartDate.getMonth() + Math.floor(Math.random() * 6)
      );
      const validTrainingStartDate = ensureValidDate(trainingStartDate);

      const trainingEndDate = new Date(validTrainingStartDate);
      trainingEndDate.setMonth(
        trainingEndDate.getMonth() + Math.floor(Math.random() * 6) + 1
      );
      const validTrainingEndDate = ensureValidDate(trainingEndDate);

      let trainingStatus: TrainingInfo["status"];
      if (validTrainingEndDate < now) {
        trainingStatus = Math.random() > 0.2 ? "completed" : "extended";
      } else if (validTrainingStartDate > now) {
        trainingStatus = "pending";
      } else {
        trainingStatus = Math.random() < 0.1 ? "deactivated" : "in-progress";
      }

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

    // Simulación de servicios
    const serviceCount = Math.floor(Math.random() * 3);
    const services: ServiceInfo[] = [];
    for (let i = 0; i < serviceCount; i++) {
      const serviceStartDate = new Date(validStartDate);
      serviceStartDate.setMonth(
        serviceStartDate.getMonth() + Math.floor(Math.random() * 3)
      );
      const validServiceStartDate = ensureValidDate(serviceStartDate);

      const serviceEndDate = new Date(validServiceStartDate);
      serviceEndDate.setMonth(
        serviceEndDate.getMonth() + Math.floor(Math.random() * 2) + 1
      );
      const validServiceEndDate = ensureValidDate(serviceEndDate);

      let serviceStatus: ServiceInfo["status"];
      const random = Math.random();
      if (validServiceEndDate < now) {
        serviceStatus = "delivered";
      } else if (validServiceStartDate > now) {
        serviceStatus = "scheduled";
      } else {
        serviceStatus = random < 0.1 ? "deactivated" : "in-progress";
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

    const processedContact: ProcessedContact = {
      ...contact,
      type: "client",
      status,
      tenure,
      startDate: validStartDate,
      endDate: validEndDate < validStartDate ? null : validEndDate,
      memberships: memberships.length > 0 ? memberships : undefined,
      trainings: trainings.length > 0 ? trainings : undefined,
      services: services.length > 0 ? services : undefined,
      customFields: [],
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
  const counts = {
    active: 0,
    preActivation: 0,
    preDeactivation: 0,
    inactive: 0,
    inactiveWithServices: 0,
    inactiveSatisfied: 0,
    inactiveUnsatisfied: 0,
    noStatus: 0,
  };

  contacts.forEach((contact) => {
    if (!contact.status) {
      counts.noStatus++;
      return;
    }
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
    if (
      typeof contact.status === "string" &&
      contact.status.includes("pre-activation")
    ) {
      counts.preActivation++;
    }
  });

  return [
    {
      name: "Por Iniciar",
      value: counts.preActivation,
      color: "#2563eb",
      description:
        "Contactos que han mostrado interés pero aún no han contratado servicios. En fase de captación y negociación.",
      phase: "inicio",
    },
    {
      name: "Sin estado",
      value: counts.noStatus,
      color: "#a1a1aa",
      description:
        "Contactos sin información suficiente para determinar su estado operativo, debido a datos incompletos o inconsistentes.",
      phase: "inicio",
    },
    {
      name: "Activo",
      value: counts.active,
      color: "#0A4D8C",
      description:
        "Clientes que tienen productos o servicios activos y están haciendo uso de ellos regularmente.",
      phase: "desarrollo",
    },
    {
      name: "Por finalizar",
      value: counts.preDeactivation,
      color: "#eab308",
      description:
        "Clientes con productos o servicios próximos a vencer (menos de 30 días) y que requieren seguimiento para su renovación.",
      phase: "desarrollo",
    },
    {
      name: "Incidencia",
      value: counts.inactive + counts.inactiveUnsatisfied,
      color: "#ef4444",
      description:
        "Contactos que ya no tienen productos o servicios activos, han dejado de utilizar los servicios de la empresa o tienen algún problema asociado.",
      phase: "cierre",
    },
    {
      name: "Completado",
      value: counts.inactiveSatisfied,
      color: "#00C851",
      description:
        "Clientes que finalizaron su relación comercial habiendo cumplido sus objetivos, con experiencia positiva.",
      phase: "cierre",
    },
    {
      name: "Error",
      value: 5,
      color: "#000000",
      description:
        "Representa un error en el procesamiento de los datos. Esto puede deberse a problemas con los datos de origen, errores en la sincronización o inconsistencias en la información del contacto.",
      phase: "inicio",
    },
  ];
}

// Función para preparar datos de distribución por antigüedad
function prepareTenureCounts(contacts: ProcessedContact[]): TenureCount[] {
  const counts = {
    new: 0,
    onboarding: 0,
    loyal: 0,
    legend: 0,
    noTenure: 0,
  };

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
      name: "Bronce",
      value: counts.new,
      color: "#CD7F32",
      description:
        "Clientes nuevos con menos de 1 mes de antigüedad. Comienzan su relación con la empresa.",
      phase: "inicio",
    },
    {
      name: "Sin estado",
      value: counts.noTenure,
      color: "#a1a1aa",
      description:
        "Contactos sin fecha de inicio registrada, lo que impide determinar su antigüedad como cliente.",
      phase: "inicio",
    },
    {
      name: "Plata",
      value: counts.onboarding,
      color: "#C0C0C0",
      description:
        "Clientes con 1 a 3 meses de relación, que están estableciendo una relación duradera con la empresa.",
      phase: "desarrollo",
    },
    {
      name: "Oro",
      value: counts.loyal,
      color: "#FFD700",
      description:
        "Clientes consolidados con más de 3 meses de relación, que son leales y de alto valor para la empresa.",
      phase: "cierre",
    },
    {
      name: "Error",
      value: 5,
      color: "#000000",
      description: "Error al determinar la antigüedad del cliente.",
      phase: "inicio",
    },
  ];
}

function prepareTrainingStatusCounts(
  contacts: ProcessedContact[]
): TrainingStatusCount[] {
  const trainingCounts = {
    completedWithCertificate: 0,
    completedWithoutCertificate: 0,
    inProgress: 0,
    pending: 0,
    endingSoon: 0,
    extendedPeriod: 0,
    deactivated: 0,
    noTraining: 0,
  };

  contacts.forEach((contact) => {
    if (!contact.trainings || contact.trainings.length === 0) {
      trainingCounts.noTraining++;
      return;
    }
    contact.trainings.forEach((training) => {
      if (training.status === "completed") {
        if (training.hasCertificate) {
          trainingCounts.completedWithCertificate++;
        } else {
          trainingCounts.completedWithoutCertificate++;
        }
      } else if (training.status === "in-progress") {
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
      name: "Por iniciar",
      value: trainingCounts.pending,
      color: "#2563eb",
      description:
        "Formación asignada pero aún no iniciada; el contacto todavía no ha accedido al contenido.",
      phase: "inicio",
    },
    {
      name: "Sin estado",
      value: trainingCounts.noTraining,
      color: "#a1a1aa",
      description:
        "Contactos sin ningún curso o programa formativo registrado en el sistema.",
      phase: "inicio",
    },
    {
      name: "Activo",
      value: trainingCounts.inProgress,
      color: "#0A4D8C",
      description:
        "Formación en proceso, con el contacto participando activamente en sesiones o módulos del curso.",
      phase: "desarrollo",
    },
    {
      name: "Por finalizar",
      value: trainingCounts.endingSoon,
      color: "#eab308",
      description:
        "Formación próxima a concluir en menos de 30 días, lo que requiere un seguimiento para asegurar su cierre exitoso.",
      phase: "desarrollo",
    },
    {
      name: "Incidencia",
      value:
        trainingCounts.deactivated + trainingCounts.completedWithoutCertificate,
      color: "#ef4444",
      description:
        "Formaciones con incidencias: suspendidas por impagos, incumplimientos o completadas sin certificación debido a requisitos incompletos.",
      phase: "cierre",
    },
    {
      name: "Completado",
      value: trainingCounts.completedWithCertificate,
      color: "#00C851",
      description:
        "Programa formativo finalizado exitosamente, otorgando al contacto un certificado oficial.",
      phase: "cierre",
    },
    {
      name: "Error",
      value: 5,
      color: "#000000",
      description:
        "Error en el procesamiento de datos de formación. Ocurre cuando hay fecha de inicio sin fecha de fin, o cuando las fechas no están correctamente formateadas.",
      phase: "inicio",
    },
  ];
}

/**
 * Prepara datos de estado de servicios para la visualización
 */
function prepareServiceStatusCounts(
  contacts: ProcessedContact[]
): ServiceStatusCount[] {
  const serviceCounts = {
    deliveredSuccess: 0,
    deliveredFailed: 0,
    inProgress: 0,
    scheduled: 0,
    deactivated: 0,
    noService: 0,
    finalizingSoon: 5,
  };

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
      name: "Por iniciar",
      value: serviceCounts.scheduled,
      color: "#2563eb",
      description:
        "Servicio agendado para una fecha futura, que aún no ha iniciado su ejecución.",
      phase: "inicio",
    },
    {
      name: "Sin estado",
      value: serviceCounts.noService,
      color: "#a1a1aa",
      description: "Contactos sin ningún servicio vinculado en el sistema.",
      phase: "inicio",
    },
    {
      name: "Activo",
      value: serviceCounts.inProgress,
      color: "#0A4D8C",
      description:
        "Servicio actualmente en ejecución, con el equipo trabajando activamente en su prestación.",
      phase: "desarrollo",
    },
    {
      name: "Por finalizar",
      value: serviceCounts.finalizingSoon,
      color: "#eab308",
      description:
        "Servicios que están próximos a completarse en los siguientes 30 días y requieren seguimiento para su cierre exitoso.",
      phase: "desarrollo",
    },
    {
      name: "Incidencia",
      value: serviceCounts.deactivated + serviceCounts.deliveredFailed,
      color: "#ef4444",
      description:
        "Servicios con problemas: interrumpidos, suspendidos o que no pudieron completarse debido a incidencias técnicas o administrativas.",
      phase: "cierre",
    },
    {
      name: "Completado",
      value: serviceCounts.deliveredSuccess,
      color: "#00C851",
      description:
        "Servicio entregado exitosamente, cumpliendo los estándares y requerimientos establecidos.",
      phase: "cierre",
    },
    {
      name: "Error",
      value: 5,
      color: "#000000",
      description:
        "Error en el procesamiento de datos del servicio. Ocurre cuando hay fecha de inicio sin fecha de fin, o cuando las fechas no están correctamente formateadas.",
      phase: "inicio",
    },
  ];
}

// Función para preparar datos de estado de membresías
function prepareMembershipStatusCounts(
  contacts: ProcessedContact[]
): MembershipStatusCount[] {
  const membershipCounts = {
    active: 0,
    pending: 0,
    expiringSoon: 0,
    inactive: 0,
    inactiveSatisfied: 0,
    inactiveUnsatisfied: 0,
    noMembership: 0,
  };

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
      name: "Por iniciar",
      value: membershipCounts.pending,
      color: "#2563eb",
      description:
        "Suscripciones adquiridas pero con activación pendiente, a la espera de la fecha de inicio.",
      phase: "inicio",
    },
    {
      name: "Sin estado",
      value: membershipCounts.noMembership,
      color: "#a1a1aa",
      description:
        "Contactos sin ninguna suscripción o membresía registrada en el sistema.",
      phase: "inicio",
    },
    {
      name: "Activo",
      value: membershipCounts.active,
      color: "#0A4D8C",
      description:
        "Suscripciones vigentes que brindan acceso completo a los servicios contratados.",
      phase: "desarrollo",
    },
    {
      name: "Por finalizar",
      value: membershipCounts.expiringSoon,
      color: "#eab308",
      description:
        "Suscripciones que expirarán en menos de 30 días y requieren acción para su renovación.",
      phase: "desarrollo",
    },
    {
      name: "Incidencia",
      value: membershipCounts.inactive + membershipCounts.inactiveUnsatisfied,
      color: "#ef4444",
      description:
        "Suscripciones con problemas: expiradas, no renovadas, canceladas por insatisfacción o con impedimentos de acceso.",
      phase: "cierre",
    },
    {
      name: "Completado",
      value: membershipCounts.inactiveSatisfied,
      color: "#00C851",
      description:
        "Suscripciones canceladas tras cumplir los objetivos planteados o por decisión voluntaria del cliente.",
      phase: "cierre",
    },
    {
      name: "Error",
      value: 5,
      color: "#000000",
      description:
        "Error en el procesamiento de datos de membresía. Ocurre cuando hay fecha de inicio sin fecha de fin, o cuando las fechas no están correctamente formateadas.",
      phase: "inicio",
    },
  ];
}

// Función para preparar datos de estado de consultorías
function prepareConsultingStatusCounts(
  contacts: ProcessedContact[]
): ConsultingStatusCount[] {
  const consultingCounts = {
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    noConsulting: 0,
    inactive: 0,
    finalizingSoon: 5,
  };

  contacts.forEach((contact) => {
    const customFields: CustomField[] = contact.customFields || [];
    const consultingFields = customFields.filter((field) =>
      field.field.startsWith("CONSULTORÍA")
    );

    if (consultingFields.length === 0) {
      consultingCounts.noConsulting++;
      return;
    }

    const hasStartDate = consultingFields.some(
      (field) => field.field.includes("Fecha de Inicio") && field.value
    );
    const hasEndDate = consultingFields.some(
      (field) => field.field.includes("Fecha de Fin") && field.value
    );
    const isCancelled = consultingFields.some(
      (field) =>
        field.field.includes("Estado") &&
        field.value?.toLowerCase() === "cancelada"
    );

    if (isCancelled) {
      consultingCounts.cancelled++;
    } else if (hasEndDate) {
      consultingCounts.completed++;
    } else if (hasStartDate) {
      consultingCounts.inProgress++;
    } else {
      consultingCounts.scheduled++;
    }
  });

  return [
    {
      name: "Por Iniciar",
      value: consultingCounts.scheduled,
      color: "#2563eb",
      description: "Servicio de consultoría agendado y pendiente de inicio.",
      phase: "inicio",
    },
    {
      name: "Sin estado",
      value: consultingCounts.noConsulting,
      color: "#a1a1aa",
      description:
        "Contactos sin servicios de consultoría registrados en el sistema.",
      phase: "inicio",
    },
    {
      name: "Activo",
      value: consultingCounts.inProgress,
      color: "#0A4D8C",
      description:
        "Consultoría en ejecución, con el consultor trabajando activamente en el proyecto.",
      phase: "desarrollo",
    },
    {
      name: "Por finalizar",
      value: consultingCounts.finalizingSoon,
      color: "#eab308",
      description:
        "Consultoría próxima a concluir en menos de 30 días, que requiere seguimiento para su cierre exitoso.",
      phase: "desarrollo",
    },
    {
      name: "Incidencia",
      value: consultingCounts.inactive + consultingCounts.cancelled,
      color: "#ef4444",
      description:
        "Consultorías con problemas: interrumpidas por falta de pago, canceladas por el cliente o terminadas antes de su finalización por motivos internos o externos.",
      phase: "cierre",
    },
    {
      name: "Completado",
      value: consultingCounts.completed,
      color: "#00C851",
      description:
        "Consultoría finalizada: El proyecto de consultoría ha sido completado satisfactoriamente.",
      phase: "cierre",
    },
    {
      name: "Error",
      value: 5,
      color: "#000000",
      description:
        "Error en el procesamiento de datos de consultoría. Ocurre cuando hay fecha de inicio sin fecha de fin, o cuando las fechas no están correctamente formateadas.",
      phase: "inicio",
    },
  ];
}
