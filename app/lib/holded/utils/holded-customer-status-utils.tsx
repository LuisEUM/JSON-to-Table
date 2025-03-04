import React from "react";
import { Circle } from "lucide-react";
import { Customer } from "../interfaces/customer";
import {
  MembershipStatus,
  CustomerStatusResult,
  StatusColumn,
} from "../interfaces/status-types";

/**
 * Determina el estado de membresía basado en fechas de inicio y fin
 */
export function getMembershipStatus(
  startDate: string,
  endDate: string,
  isFormation = false
): MembershipStatus {
  if (startDate === "N/A" && endDate === "N/A") {
    return MembershipStatus.NO_STATUS;
  }
  const now = new Date();
  const start = startDate === "N/A" ? null : new Date(startDate);
  const end = endDate === "N/A" ? null : new Date(endDate);
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (isFormation) {
    if (start && start <= now && (!end || end > now)) {
      return MembershipStatus.ACTIVE;
    }
    return MembershipStatus.NO_STATUS;
  }
  if (start && start > now) {
    if (start <= thirtyDaysFromNow) {
      return MembershipStatus.ABOUT_TO_START;
    }
    return MembershipStatus.DEACTIVATED;
  }
  if (end && end < now) {
    return MembershipStatus.DEACTIVATED;
  }
  if (end && end <= thirtyDaysFromNow && end > now) {
    return MembershipStatus.ABOUT_TO_END;
  }
  if (start && start <= now && (!end || end > thirtyDaysFromNow)) {
    return MembershipStatus.ACTIVE;
  }
  return MembershipStatus.NO_STATUS;
}

/**
 * Obtiene las clases de color CSS para un estado de membresía
 */
export function getStatusColorClasses(status: MembershipStatus): string {
  switch (status) {
    case MembershipStatus.ABOUT_TO_START:
      return "text-yellow-500 fill-current";
    case MembershipStatus.ACTIVE:
      return "text-green-500 fill-current";
    case MembershipStatus.ABOUT_TO_END:
      return "text-orange-500 fill-current";
    case MembershipStatus.DEACTIVATED:
      return "text-red-500 fill-current";
    default:
      return "text-gray-400 fill-current";
  }
}

/**
 * Obtiene la etiqueta de texto para un estado de membresía
 */
export function getStatusLabel(status: MembershipStatus): string {
  switch (status) {
    case MembershipStatus.ABOUT_TO_START:
      return "Va a ser Alta";
    case MembershipStatus.ACTIVE:
      return "Servicio Activo";
    case MembershipStatus.ABOUT_TO_END:
      return "Va a ser Baja";
    case MembershipStatus.DEACTIVATED:
      return "Servicio Desactivado";
    default:
      return "Sin Estado";
  }
}

/**
 * Función auxiliar que extrae el nombre del servicio.
 * Toma el texto que aparece después de la primera palabra y, si existe, corta antes de " - ".
 */
function extractServiceName(fieldStr: string): string {
  const parts = fieldStr.split(" ");
  if (parts.length <= 1) return fieldStr;
  const afterFirst = parts.slice(1).join(" ");
  const dashIndex = afterFirst.indexOf(" - ");
  if (dashIndex !== -1) {
    return afterFirst.substring(0, dashIndex).trim();
  } else {
    return afterFirst.trim();
  }
}

/**
 * Agrupa los customFields del cliente en categorías y subcategorías.
 */
function getGroupedFields(customer: Customer): Record<
  string,
  {
    name: string;
    subCategories: Record<
      string,
      {
        name: string;
        fields: { field: string; value: string; property: string }[];
      }
    >;
    directFields?: { field: string; value: string; property: string }[];
  }
> {
  return customer.customFields.reduce(
    (mainGroups, field) => {
      const parts = field.field.split(" - ");
      const [firstWord, ...rest] = parts[0].split(" ");
      const mainCategory = firstWord.toUpperCase();
      const subCategory = rest.join(" ").trim().toUpperCase();
      const property = parts.slice(1).join(" - ");
      if (!mainGroups[mainCategory]) {
        mainGroups[mainCategory] = {
          name: mainCategory,
          subCategories: {},
          directFields: [],
        };
      }
      if (!subCategory) {
        mainGroups[mainCategory].directFields?.push({ ...field, property });
      } else {
        if (!mainGroups[mainCategory].subCategories[subCategory]) {
          mainGroups[mainCategory].subCategories[subCategory] = {
            name: subCategory,
            fields: [],
          };
        }
        mainGroups[mainCategory].subCategories[subCategory].fields.push({
          ...field,
          property,
        });
      }
      return mainGroups;
    },
    {} as Record<
      string,
      {
        name: string;
        subCategories: Record<
          string,
          {
            name: string;
            fields: { field: string; value: string; property: string }[];
          }
        >;
        directFields?: { field: string; value: string; property: string }[];
      }
    >
  );
}

/**
 * Calcula el estado general del cliente y acumula, para cada estado, un array de nombres de servicios.
 */
export function getCustomerStatus(customer: Customer): CustomerStatusResult {
  const groupedFields = getGroupedFields(customer);

  let clientStatus: MembershipStatus | null = null;
  if (
    groupedFields["CLIENTE"] &&
    groupedFields["CLIENTE"].subCategories["INSIDERS"]
  ) {
    const fields = groupedFields["CLIENTE"].subCategories["INSIDERS"].fields;
    const inicioField = fields.find((f) =>
      f.property.toLowerCase().includes("fecha de inicio")
    );
    const finField = fields.find((f) =>
      f.property.toLowerCase().includes("fecha de fin")
    );
    clientStatus = getMembershipStatus(
      inicioField?.value || "N/A",
      finField?.value || "N/A"
    );
  }

  const services: { status: MembershipStatus; name: string }[] = [];

  const processFields = (
    fields: { field: string; value: string; property: string }[]
  ) => {
    // Caso 1: Si existe un campo de edición
    const editionField = fields.find((f) =>
      f.property.toLowerCase().endsWith("edición")
    );
    if (editionField) {
      // Extraemos el nombre usando la función auxiliar
      const serviceName = extractServiceName(editionField.field) || "Servicio";
      const serviceStatus =
        editionField.value && editionField.value !== "N/A"
          ? MembershipStatus.ACTIVE
          : MembershipStatus.NO_STATUS;
      services.push({ status: serviceStatus, name: serviceName });
      return;
    }
    // Caso 2: Para servicios con fechas
    const startDateField = fields.find(
      (f) =>
        f.property.toLowerCase().includes("fecha de inicio") ||
        f.property.toLowerCase().includes("fecha de alta")
    );
    const endDateField = fields.find(
      (f) =>
        f.property.toLowerCase().includes("fecha de fin") ||
        f.property.toLowerCase().includes("fecha de baja")
    );
    if (startDateField || endDateField) {
      const serviceName = extractServiceName(
        startDateField?.field || endDateField?.field || "Servicio"
      );
      const status = getMembershipStatus(
        startDateField?.value || "N/A",
        endDateField?.value || "N/A"
      );
      services.push({ status, name: serviceName });
      return;
    }
    // Caso 3: Por estado (estado o status)
    const stateField = fields.find(
      (f) =>
        f.property.toLowerCase().includes("estado") ||
        f.property.toLowerCase().includes("status")
    );
    if (stateField) {
      const serviceName = extractServiceName(stateField.field) || "Servicio";
      let status = MembershipStatus.NO_STATUS;
      const stateValue = stateField.value?.toLowerCase() || "";
      if (stateValue.includes("activ")) {
        status = MembershipStatus.ACTIVE;
      } else if (stateValue.includes("desactiv")) {
        status = MembershipStatus.DEACTIVATED;
      } else if (
        stateValue.includes("próximo") ||
        stateValue.includes("pendiente")
      ) {
        status = MembershipStatus.ABOUT_TO_START;
      } else if (stateValue.includes("finaliza")) {
        status = MembershipStatus.ABOUT_TO_END;
      }
      services.push({ status, name: serviceName });
      return;
    }
  };

  Object.values(groupedFields).forEach((category) => {
    if (category.directFields && category.directFields.length > 0) {
      processFields(category.directFields);
    }
    Object.values(category.subCategories).forEach((subCat) => {
      processFields(subCat.fields);
    });
  });

  const result: CustomerStatusResult = {
    clientStatus,
    [MembershipStatus.ACTIVE]: [],
    [MembershipStatus.ABOUT_TO_START]: [],
    [MembershipStatus.ABOUT_TO_END]: [],
    [MembershipStatus.DEACTIVATED]: [],
    [MembershipStatus.NO_STATUS]: [],
  };
  services.forEach((s) => {
    result[s.status].push(s.name);
  });

  return result;
}

/**
 * Crea las columnas personalizadas para mostrar:
 * - El Estado del Cliente (con ícono y etiqueta).
 * - Los nombres de los servicios en cada estado renderizados como badges.
 */
export function createCustomStatusColumns(): StatusColumn[] {
  return [
    {
      id: "clientStatus",
      header: "Estado del Cliente",
      cell: ({ row }: { row: { original: Customer } }) => {
        const customer = row.original;
        const { clientStatus } = getCustomerStatus(customer);
        if (!clientStatus) return "N/A";
        return (
          <div className='flex items-center gap-1'>
            <Circle
              className={`h-3 w-3 ${getStatusColorClasses(clientStatus)}`}
            />
            <span className='text-sm'>{getStatusLabel(clientStatus)}</span>
          </div>
        );
      },
    },
    {
      id: "activeServices",
      header: "Servicio Activo",
      cell: ({ row }: { row: { original: Customer } }) => {
        const customer = row.original;
        const { [MembershipStatus.ACTIVE]: activeServices } =
          getCustomerStatus(customer);
        return activeServices.length > 0 ? (
          <div className='flex flex-wrap gap-1'>
            {activeServices.map((name, idx) => (
              <span
                key={idx}
                className='bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded'
              >
                {name}
              </span>
            ))}
          </div>
        ) : (
          "N/A"
        );
      },
    },
    {
      id: "aboutToStartServices",
      header: "Va a ser Alta",
      cell: ({ row }: { row: { original: Customer } }) => {
        const customer = row.original;
        const { [MembershipStatus.ABOUT_TO_START]: services } =
          getCustomerStatus(customer);
        return services.length > 0 ? (
          <div className='flex flex-wrap gap-1'>
            {services.map((name, idx) => (
              <span
                key={idx}
                className='bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded'
              >
                {name}
              </span>
            ))}
          </div>
        ) : (
          "N/A"
        );
      },
    },
    {
      id: "aboutToEndServices",
      header: "Va a ser Baja",
      cell: ({ row }: { row: { original: Customer } }) => {
        const customer = row.original;
        const { [MembershipStatus.ABOUT_TO_END]: services } =
          getCustomerStatus(customer);
        return services.length > 0 ? (
          <div className='flex flex-wrap gap-1'>
            {services.map((name, idx) => (
              <span
                key={idx}
                className='bg-orange-100 text-orange-800 text-xs font-medium px-2 py-0.5 rounded'
              >
                {name}
              </span>
            ))}
          </div>
        ) : (
          "N/A"
        );
      },
    },
    {
      id: "deactivatedServices",
      header: "Servicio Desactivado",
      cell: ({ row }: { row: { original: Customer } }) => {
        const customer = row.original;
        const { [MembershipStatus.DEACTIVATED]: services } =
          getCustomerStatus(customer);
        return services.length > 0 ? (
          <div className='flex flex-wrap gap-1'>
            {services.map((name, idx) => (
              <span
                key={idx}
                className='bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded'
              >
                {name}
              </span>
            ))}
          </div>
        ) : (
          "N/A"
        );
      },
    },
    {
      id: "noStatusServices",
      header: "Sin Estado",
      cell: ({ row }: { row: { original: Customer } }) => {
        const customer = row.original;
        const { [MembershipStatus.NO_STATUS]: services } =
          getCustomerStatus(customer);
        return services.length > 0 ? (
          <div className='flex flex-wrap gap-1'>
            {services.map((name, idx) => (
              <span
                key={idx}
                className='bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded'
              >
                {name}
              </span>
            ))}
          </div>
        ) : (
          "N/A"
        );
      },
    },
  ];
}
