import type { Customer } from "../interfaces/customer";
import type {
  ServiceCategory,
  ServiceMetricsResult,
} from "../interfaces/service-types";

/**
 * Extrae la categoría principal de un campo personalizado
 */
export function extractCategory(field: string): string {
  return field.split(" ")[0];
}

/**
 * Extrae el nombre del servicio de un campo personalizado
 */
export function extractServiceName(field: string): string {
  const parts = field.split(" - ");
  return parts.length > 1 ? parts[1] : parts[0];
}

/**
 * Obtiene todas las categorías únicas de los campos personalizados
 */
export function getUniqueCategories(customers: Customer[]): string[] {
  const categories = new Set<string>();

  customers.forEach((customer) => {
    customer.customFields.forEach((field) => {
      categories.add(extractCategory(field.field));
    });
  });

  return Array.from(categories);
}

/**
 * Obtiene todos los servicios para una categoría específica
 */
export function getServicesForCategory(
  customers: Customer[],
  category: string
): string[] {
  const services = new Set<string>();

  customers.forEach((customer) => {
    customer.customFields
      .filter((field) => extractCategory(field.field) === category)
      .forEach((field) => {
        services.add(extractServiceName(field.field));
      });
  });

  return Array.from(services);
}

/**
 * Procesa un campo personalizado para extraer sus componentes
 */
export function processCustomFields(field: { field: string; value: string }): {
  mainCategory: string;
  subCategory: string;
  property: string;
} {
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

/**
 * Extrae métricas de servicio de una lista de clientes
 */
export function extractServiceMetrics(
  customers: Customer[]
): ServiceMetricsResult {
  // Initialize empty categories map
  const categories = new Map<string, ServiceCategory>();

  if (!customers || !Array.isArray(customers)) {
    console.warn("No customers data provided or invalid format");
    return { categories };
  }

  // First pass: collect all fields and create basic structure
  customers.forEach((customer) => {
    if (!customer || !Array.isArray(customer.customFields)) {
      console.warn(`Invalid customer data:`, customer);
      return;
    }

    const customerFields = new Map<
      string,
      { edition?: string; consultant?: string }
    >();

    customer.customFields.forEach((field) => {
      if (
        !field ||
        typeof field.field !== "string" ||
        typeof field.value !== "string"
      ) {
        console.warn(`Invalid field data:`, field);
        return;
      }

      const { mainCategory, subCategory, property } =
        processCustomFields(field);
      const propertyLower = property.toLowerCase();

      // Initialize category if it doesn't exist
      if (!categories.has(mainCategory)) {
        categories.set(mainCategory, {
          name: mainCategory,
          subCategories: new Map(),
          directFields: [],
          metrics: {
            activeClients: 0,
            totalClients: 0,
            consultants: new Map(),
            editions: new Map(),
          },
        });
      }

      const category = categories.get(mainCategory)!;

      // Process field based on whether it belongs to a subcategory
      if (subCategory) {
        if (!category.subCategories.has(subCategory)) {
          category.subCategories.set(subCategory, {
            name: subCategory,
            fields: [],
            metrics: {
              activeClients: 0,
              totalClients: 0,
              consultants: new Map(),
              editions: new Map(),
            },
          });
        }

        const subCat = category.subCategories.get(subCategory)!;
        subCat.fields.push({
          field: field.field,
          value: field.value,
          property,
        });

        // Store edition and consultant information for this customer
        const key = `${mainCategory}-${subCategory}`;
        if (!customerFields.has(key)) {
          customerFields.set(key, {});
        }
        const info = customerFields.get(key)!;

        if (propertyLower.includes("edición")) {
          info.edition = field.value;
        } else if (propertyLower.includes("consultor")) {
          info.consultant = field.value;
        }
      }
    });

    // Second pass: update metrics with collected information
    customerFields.forEach((info, key) => {
      if (!info.edition || info.edition === "N/A") return;

      const [mainCategory, subCategory] = key.split("-");
      if (!mainCategory || !subCategory) return;

      const category = categories.get(mainCategory);
      if (!category) return;

      const subCat = category.subCategories.get(subCategory);
      if (!subCat) return;

      // Create client info
      const clientInfo = {
        id: customer.id || "",
        name: customer.name || "",
        edition: info.edition,
        consultant: info.consultant,
      };

      // Update edition groups
      if (!subCat.metrics.editions.has(info.edition)) {
        subCat.metrics.editions.set(info.edition, {
          edition: info.edition,
          clients: [],
        });
      }

      const editionGroup = subCat.metrics.editions.get(info.edition);
      if (editionGroup) {
        editionGroup.clients.push(clientInfo);
      }

      // Update consultant groups if there's a consultant
      if (info.consultant && info.consultant !== "N/A") {
        if (!subCat.metrics.consultants.has(info.consultant)) {
          subCat.metrics.consultants.set(info.consultant, {
            consultant: info.consultant,
            editions: new Map(),
            totalClients: 0,
          });
        }

        const consultantGroup = subCat.metrics.consultants.get(info.consultant);
        if (consultantGroup) {
          if (!consultantGroup.editions.has(info.edition)) {
            consultantGroup.editions.set(info.edition, []);
          }
          const editionClients = consultantGroup.editions.get(info.edition);
          if (editionClients) {
            editionClients.push(clientInfo);
            consultantGroup.totalClients++;
          }
        }
      }

      // Update general metrics
      subCat.metrics.activeClients++;
      subCat.metrics.totalClients++;
    });
  });

  return { categories };
}
