/**
 * Utilidades para procesar contactos de Holded
 */

import {
  HoldedContact,
  ProcessedContact,
  MembershipInfo,
  TrainingInfo,
} from "../interfaces/contact-types";
import {
  parseSpanishDate,
  formatDate,
  addYearToDate,
  determineType,
  extractDatesFromEdition,
} from "./date-utils";

/**
 * Procesa los contactos de Holded para añadir información calculada
 */
export function processContacts(contacts: HoldedContact[]): ProcessedContact[] {
  const currentDate = new Date();

  return contacts.map((contact) => {
    // Convertir customFields a un mapa para facilitar acceso
    const customFields = contact.customFields || {};
    const customFieldsMap: Record<string, unknown> = {};

    // Aplanar los campos personalizados para facilitar acceso
    Object.entries(customFields).forEach(([key, value]) => {
      customFieldsMap[key] = value;
    });

    // Determinar estado del cliente
    let status: ProcessedContact["status"] = "inactive";

    // Verificar si el cliente está activo
    if (
      customFieldsMap["CLIENTE INSIDERS - Activo"] === true ||
      customFieldsMap["CLIENTE INSIDERS - Activo"] === "true" ||
      customFieldsMap["CLIENTE INSIDERS - Activo"] === "SI" ||
      customFieldsMap["CLIENTE INSIDERS - Activo"] === "Sí"
    ) {
      status = "active";
    }
    // Verificar si tiene servicios activos aunque no sea cliente activo
    else if (
      customFieldsMap[
        "CLIENTE INSIDERS - Fecha de Inicio de Servicios Activos"
      ] &&
      customFieldsMap["CLIENTE INSIDERS - Fecha de Fin de Servicios Activos"]
    ) {
      status = "inactive-with-services";
    }

    // Calcular antigüedad del cliente
    const createdAt = contact.createdAt
      ? new Date(Number(contact.createdAt) * 1000)
      : contact.created_at
      ? new Date(contact.created_at)
      : null;

    let tenure: ProcessedContact["tenure"] = "new";

    if (createdAt) {
      const monthsDiff =
        (currentDate.getFullYear() - createdAt.getFullYear()) * 12 +
        (currentDate.getMonth() - createdAt.getMonth());

      if (monthsDiff < 1) {
        tenure = "new";
      } else if (monthsDiff >= 1 && monthsDiff <= 3) {
        tenure = "onboarding";
      } else if (monthsDiff > 3 && monthsDiff <= 12) {
        tenure = "loyal";
      } else {
        tenure = "legend";
      }
    }

    // Procesar membresías
    const memberships: MembershipInfo[] = [];

    // Tipos de membresía a buscar en los campos personalizados
    const membershipTypes = ["INDIVIDUAL", "EMPRESA", "TEAMS"];

    membershipTypes.forEach((type) => {
      const startDateField = `MEMBRESÍA ${type} - Fecha de Inicio`;
      const endDateField = `MEMBRESÍA ${type} - Fecha de Fin`;

      if (customFieldsMap[startDateField]) {
        const startDate = parseSpanishDate(
          String(customFieldsMap[startDateField])
        );
        const endDate = customFieldsMap[endDateField]
          ? parseSpanishDate(String(customFieldsMap[endDateField]))
          : addYearToDate(startDate); // Si no hay fecha fin, asumir 1 año

        let membershipStatus: MembershipInfo["status"] = "inactive";

        if (currentDate < startDate) {
          membershipStatus = "pending";
        } else if (currentDate >= startDate && currentDate <= endDate) {
          // Verificar si está próximo a expirar (1 mes antes)
          const expiringDate = new Date(endDate);
          expiringDate.setMonth(expiringDate.getMonth() - 1);

          if (currentDate >= expiringDate) {
            membershipStatus = "expiring-soon";
          } else {
            membershipStatus = "active";
          }
        }

        memberships.push({
          id: `${contact.id}-${type}`,
          name: `Membresía ${type}`,
          status: membershipStatus,
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          type: determineType(startDate, endDate),
        });
      }
    });

    // Procesar formaciones
    const trainings: TrainingInfo[] = [];

    // Buscar todos los campos de formación
    const trainingFields = Object.keys(customFieldsMap).filter(
      (key) =>
        key.includes("FORMACIÓN") &&
        key.includes("Edición") &&
        customFieldsMap[key]
    );

    trainingFields.forEach((field) => {
      const trainingType = field.split(" - ")[0].replace("FORMACIÓN ", "");
      const editionValue = customFieldsMap[field];

      if (editionValue) {
        // Extraer fechas de la edición (formatos como "ED01 ENE-ABR21" o "ED05 ENE-MAR23")
        const dates = extractDatesFromEdition(editionValue);

        if (dates.startDate && dates.endDate) {
          // Calcular fecha extendida (1 año después)
          const extendedEndDate = addYearToDate(dates.endDate);

          let trainingStatus: TrainingInfo["status"] = "pending";

          if (currentDate < dates.startDate) {
            trainingStatus = "pending";
          } else if (
            currentDate >= dates.startDate &&
            currentDate <= dates.endDate
          ) {
            // Verificar si está próxima a finalizar (1 mes antes)
            const endingSoonDate = new Date(dates.endDate);
            endingSoonDate.setMonth(endingSoonDate.getMonth() - 1);

            if (currentDate >= endingSoonDate) {
              trainingStatus = "ending-soon";
            } else {
              trainingStatus = "in-progress";
            }
          } else if (
            currentDate > dates.endDate &&
            currentDate <= extendedEndDate
          ) {
            trainingStatus = "extended";
          } else {
            trainingStatus = "completed";
          }

          trainings.push({
            id: `${contact.id}-${trainingType}-${editionValue}`,
            name: trainingType,
            status: trainingStatus,
            startDate: formatDate(dates.startDate),
            endDate: formatDate(dates.endDate),
            extendedEndDate: formatDate(extendedEndDate),
          });
        }
      }
    });

    // Verificar si el cliente está en pre-desactivación
    if (status === "active") {
      const anyMembershipExpiring = memberships.some(
        (m) => m.status === "expiring-soon"
      );
      if (anyMembershipExpiring) {
        status = "pre-deactivation";
      }
    }

    return {
      ...contact,
      status,
      tenure,
      memberships,
      trainings,
      services: [],
    };
  });
}
