export enum MembershipStatus {
  ABOUT_TO_START = "about-to-start",
  ACTIVE = "active",
  ABOUT_TO_END = "about-to-end",
  DEACTIVATED = "deactivated",
  NO_STATUS = "no-status",
}

export interface CustomField {
  field: string;
  value: string;
}

export interface Customer {
  id: string;
  name: string;
  tradeName: string;
  email: string;
  customFields: CustomField[];
}

interface GroupedField extends CustomField {
  property: string;
}

interface SubCategory {
  name: string;
  fields: GroupedField[];
}

interface MainCategory {
  name: string;
  subCategories: Record<string, SubCategory>;
  directFields?: GroupedField[];
}

export function getMembershipStatus(
  startDate: string,
  endDate: string,
  isFormation = false
): MembershipStatus {
  if (startDate === "N/A" && endDate === "N/A") {
    return MembershipStatus.NO_STATUS;
  }

  // Intentar parsear fechas en formato español (DD/MM/YYYY)
  const parseDate = (dateStr: string): Date | null => {
    if (dateStr === "N/A") return null;

    // Intentar formato español
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }

    // Intentar como fecha ISO
    return new Date(dateStr);
  };

  const now = new Date();
  const start = parseDate(startDate);
  const end = parseDate(endDate);
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
 * Maneja diferentes patrones de nombres de campos.
 */
export function extractServiceName(fieldStr: string): string {
  if (!fieldStr) return "Servicio";

  // Patrón 1: "CATEGORÍA SUBCATEGORÍA - Propiedad"
  const pattern1 = fieldStr.match(
    /^([A-Z]+)(?:\s+([A-Z][A-Za-z\s]+))?\s+-\s+(.+)$/
  );
  if (pattern1 && pattern1[2]) {
    return pattern1[2].trim();
  }

  // Patrón 2: "CATEGORÍA - Propiedad"
  const pattern2 = fieldStr.match(/^([A-Z]+)\s+-\s+(.+)$/);
  if (pattern2) {
    // Extraer la propiedad y ver si contiene palabras clave que indiquen un servicio
    const property = pattern2[2].trim().toLowerCase();
    if (
      property.includes("fecha") ||
      property.includes("edición") ||
      property.includes("responsable") ||
      property.includes("estado")
    ) {
      // Intentar extraer el nombre del servicio de la categoría
      const categoryParts = pattern2[1].split(" ");
      if (categoryParts.length > 1) {
        return categoryParts.slice(1).join(" ").trim();
      }

      // Si no hay subcategoría, usar la propiedad sin las palabras clave
      return (
        property
          .replace("fecha de inicio", "")
          .replace("fecha de fin", "")
          .replace("fecha de alta", "")
          .replace("fecha de baja", "")
          .replace("edición", "")
          .replace("responsable", "")
          .replace("estado", "")
          .trim() || `Servicio de ${pattern2[1].toLowerCase()}`
      );
    }

    // Si la propiedad no contiene palabras clave, usarla como nombre del servicio
    return property;
  }

  // Patrón 3: "Categoría: Subcategoría - Propiedad"
  if (fieldStr.includes(":") && fieldStr.includes("-")) {
    const parts = fieldStr.split(":");
    if (parts.length > 1) {
      const subParts = parts[1].trim().split("-");
      if (subParts.length > 0) {
        return subParts[0].trim();
      }
    }
  }

  // Patrón 4: Simplemente tomar lo que hay después de la primera palabra
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
 * Maneja diferentes formatos de campos personalizados y detecta patrones en los nombres.
 */
export function getGroupedFields(
  customer: Customer
): Record<string, MainCategory> {
  // Asegurarse de que customFields sea un array
  const customFieldsArray = Array.isArray(customer.customFields)
    ? customer.customFields
    : typeof customer.customFields === "object" &&
      customer.customFields !== null
    ? Object.entries(customer.customFields).map(([field, value]) => ({
        field,
        value,
      }))
    : [];

  return customFieldsArray.reduce((mainGroups, field) => {
    // Ignorar campos sin valor o con valores vacíos
    if (field.field === undefined || field.field === null) {
      return mainGroups;
    }

    // Normalizar el nombre del campo
    const fieldName = String(field.field).trim();

    // Extraer categoría, subcategoría y propiedad
    let mainCategory = "OTROS";
    let subCategory = "";
    let property = fieldName;

    // Patrón 1: "CATEGORÍA SUBCATEGORÍA - Propiedad"
    const pattern1 = fieldName.match(
      /^([A-Z]+)(?:\s+([A-Z][A-Za-z\s]+))?\s+-\s+(.+)$/
    );
    if (pattern1) {
      mainCategory = pattern1[1].toUpperCase();
      subCategory = pattern1[2] ? pattern1[2].trim().toUpperCase() : "";
      property = pattern1[3].trim();
    }
    // Patrón 2: "Categoría: Subcategoría - Propiedad"
    else if (fieldName.includes(":") && fieldName.includes("-")) {
      const parts = fieldName.split(":");
      const categoryPart = parts[0].trim();
      const restPart = parts.slice(1).join(":").trim();

      mainCategory = categoryPart.toUpperCase();

      const subParts = restPart.split("-");
      if (subParts.length > 1) {
        subCategory = subParts[0].trim().toUpperCase();
        property = subParts.slice(1).join("-").trim();
      } else {
        property = restPart;
      }
    }
    // Patrón 3: "Categoría - Propiedad"
    else if (fieldName.includes("-")) {
      const parts = fieldName.split("-");
      mainCategory = parts[0].trim().toUpperCase();
      property = parts.slice(1).join("-").trim();
    }

    // Inicializar la categoría principal si no existe
    if (!mainGroups[mainCategory]) {
      mainGroups[mainCategory] = {
        name: mainCategory,
        subCategories: {},
        directFields: [],
      };
    }

    // Añadir el campo a la subcategoría o a los campos directos
    if (subCategory) {
      if (!mainGroups[mainCategory].subCategories[subCategory]) {
        mainGroups[mainCategory].subCategories[subCategory] = {
          name: subCategory,
          fields: [],
        };
      }
      mainGroups[mainCategory].subCategories[subCategory].fields.push({
        ...field,
        property,
        value: String(field.value),
      });
    } else {
      mainGroups[mainCategory].directFields?.push({
        ...field,
        property,
        value: String(field.value),
      });
    }

    return mainGroups;
  }, {} as Record<string, MainCategory>);
}

/**
 * Calcula el estado general del cliente y acumula, para cada estado, un array de nombres de servicios.
 * Detecta servicios basados en patrones en los nombres de campos personalizados.
 */
export function getCustomerStatus(customer: Customer): {
  clientStatus: MembershipStatus | null;
  [MembershipStatus.ACTIVE]: string[];
  [MembershipStatus.ABOUT_TO_START]: string[];
  [MembershipStatus.ABOUT_TO_END]: string[];
  [MembershipStatus.DEACTIVATED]: string[];
  [MembershipStatus.NO_STATUS]: string[];
} {
  // Objeto para almacenar los servicios agrupados por estado
  const servicesByStatus: {
    clientStatus: MembershipStatus | null;
    [MembershipStatus.ACTIVE]: string[];
    [MembershipStatus.ABOUT_TO_START]: string[];
    [MembershipStatus.ABOUT_TO_END]: string[];
    [MembershipStatus.DEACTIVATED]: string[];
    [MembershipStatus.NO_STATUS]: string[];
  } = {
    clientStatus: null,
    [MembershipStatus.ACTIVE]: [],
    [MembershipStatus.ABOUT_TO_START]: [],
    [MembershipStatus.ABOUT_TO_END]: [],
    [MembershipStatus.DEACTIVATED]: [],
    [MembershipStatus.NO_STATUS]: [],
  };

  // Si no hay campos personalizados, devolver estados vacíos
  if (!customer.customFields || customer.customFields.length === 0) {
    servicesByStatus.clientStatus = MembershipStatus.NO_STATUS;
    return servicesByStatus;
  }

  // Obtener campos agrupados por categoría y subcategoría
  const groupedFields = getGroupedFields(customer);

  // Función auxiliar para procesar un conjunto de campos y determinar su estado
  const processFields = (
    fields: GroupedField[],
    categoryName: string,
    subCategoryName?: string
  ): MembershipStatus | null => {
    // Si la categoría es VENTAS, no procesamos estos campos para el estado
    if (categoryName === "VENTAS" || subCategoryName === "VENTAS") {
      return null;
    }

    // Buscar fechas de inicio y fin
    const startDateField = fields.find(
      (field) =>
        field.property.toLowerCase().includes("fecha") &&
        (field.property.toLowerCase().includes("inicio") ||
          field.property.toLowerCase().includes("alta"))
    );

    const endDateField = fields.find(
      (field) =>
        field.property.toLowerCase().includes("fecha") &&
        (field.property.toLowerCase().includes("fin") ||
          field.property.toLowerCase().includes("baja"))
    );

    if (startDateField || endDateField) {
      const startDate = startDateField?.value || "N/A";
      const endDate = endDateField?.value || "N/A";

      // Determinar si es un servicio de formación
      const isFormation =
        categoryName === "FORMACIÓN" ||
        fields.some(
          (field) =>
            field.property.toLowerCase().includes("formación") ||
            field.property.toLowerCase().includes("curso")
        );

      return getMembershipStatus(startDate, endDate, isFormation);
    }

    // Buscar campos de edición o estado
    const editionField = fields.find(
      (field) =>
        field.property.toLowerCase().includes("edición") ||
        field.property.toLowerCase().includes("estado")
    );

    if (editionField && editionField.value && editionField.value !== "N/A") {
      return MembershipStatus.ACTIVE;
    }

    // Buscar campos de responsable
    const responsibleField = fields.find(
      (field) =>
        field.property.toLowerCase().includes("responsable") ||
        field.property.toLowerCase().includes("consultor")
    );

    if (
      responsibleField &&
      responsibleField.value &&
      responsibleField.value !== "N/A"
    ) {
      return MembershipStatus.ACTIVE;
    }

    // Ver si hay algún valor significativo
    if (fields.some((field) => field.value && field.value !== "N/A")) {
      return MembershipStatus.ACTIVE;
    }

    return MembershipStatus.NO_STATUS;
  };

  // Procesar cada categoría principal
  Object.entries(groupedFields).forEach(([categoryName, category]) => {
    // Procesar campos directos de la categoría
    if (category.directFields && category.directFields.length > 0) {
      const status = processFields(category.directFields, categoryName);
      if (status) {
        servicesByStatus[status].push(categoryName);
        if (!servicesByStatus.clientStatus) {
          servicesByStatus.clientStatus = status;
        }
      }
    }

    // Procesar subcategorías
    Object.entries(category.subCategories).forEach(
      ([subCategoryName, subCategory]) => {
        const status = processFields(
          subCategory.fields,
          categoryName,
          subCategoryName
        );
        if (status) {
          servicesByStatus[status].push(subCategoryName);
          if (!servicesByStatus.clientStatus) {
            servicesByStatus.clientStatus = status;
          }
        }
      }
    );
  });

  return servicesByStatus;
}

/**
 * Procesa un campo personalizado y extrae la categoría principal, subcategoría y propiedad.
 * Ejemplo: "CLIENTE INSIDERS - Fecha de inicio" se convierte en:
 * - mainCategory: "CLIENTE"
 * - subCategory: "INSIDERS"
 * - property: "Fecha de inicio"
 */
export function processCustomFields(field: { field: string; value: string }): {
  mainCategory: string;
  subCategory: string;
  property: string;
} {
  if (!field.field) {
    return {
      mainCategory: "OTROS",
      subCategory: "",
      property: "",
    };
  }

  const parts = field.field.split(" - ");
  const [firstWord, ...rest] = parts[0].split(" ");
  const mainCategory = firstWord;
  const subCategory = rest.join(" ").trim();
  const property = parts.slice(1).join(" - ");

  return {
    mainCategory,
    subCategory,
    property,
  };
}
