import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MembershipStatus,
  processCustomFields,
} from "@/lib/service-utils";
import { Contact } from "./ContactDetailModal";

interface ServicesCategoryViewProps {
  contact: Contact;
  servicesByStatus: Record<string, string[]>;
  statusOrder: MembershipStatus[];
}

export function ServicesCategoryView({
  contact,
  servicesByStatus,
}: ServicesCategoryViewProps) {
  // Extraer categorías de servicios de los campos personalizados
  const categories = extractServiceCategories(contact);

  return (
    <div className='space-y-4'>
      <h2 className='text-lg font-semibold mb-4'>Servicios Por Categoría</h2>

      {/* Leyenda de estados */}
      <div className='p-3 bg-gray-50 rounded-md mb-4'>
        <h3 className='font-medium text-sm mb-2'>Leyenda de Estados</h3>
        <div className='flex flex-wrap gap-4'>
          <div className='flex items-center gap-1'>
            <div className='w-3 h-3 rounded-full bg-green-500'></div>
            <span className='text-sm'>Servicio Activo</span>
            <div className='flex items-center justify-center w-5 h-5 rounded-full bg-green-500 ml-1'>
              <span className='text-xs text-white font-medium'>
                {servicesByStatus[MembershipStatus.ACTIVE].length}
              </span>
            </div>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
            <span className='text-sm'>Va a ser Alta</span>
            <div className='flex items-center justify-center w-5 h-5 rounded-full bg-yellow-500 ml-1'>
              <span className='text-xs text-white font-medium'>
                {servicesByStatus[MembershipStatus.ABOUT_TO_START].length}
              </span>
            </div>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-3 h-3 rounded-full bg-orange-500'></div>
            <span className='text-sm'>Va a ser Baja</span>
            <div className='flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 ml-1'>
              <span className='text-xs text-white font-medium'>
                {servicesByStatus[MembershipStatus.ABOUT_TO_END].length}
              </span>
            </div>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-3 h-3 rounded-full bg-red-500'></div>
            <span className='text-sm'>Servicio Desactivado</span>
            <div className='flex items-center justify-center w-5 h-5 rounded-full bg-red-500 ml-1'>
              <span className='text-xs text-white font-medium'>
                {servicesByStatus[MembershipStatus.DEACTIVATED].length}
              </span>
            </div>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-3 h-3 rounded-full bg-gray-400'></div>
            <span className='text-sm'>Sin Estado</span>
            <div className='flex items-center justify-center w-5 h-5 rounded-full bg-gray-400 ml-1'>
              <span className='text-xs text-white font-medium'>
                {servicesByStatus[MembershipStatus.NO_STATUS].length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {Object.keys(categories).length > 0 ? (
        Object.entries(categories).map(([mainCategory, subcategories]) => {
          // Contar estados por categoría principal
          const statusCounts = countStatusesByCategory(subcategories);

          return (
            <Accordion
              key={mainCategory}
              type='single'
              collapsible
              className='w-full mb-4'
            >
              <AccordionItem value={mainCategory}>
                <AccordionTrigger className='hover:no-underline'>
                  <div className='flex items-center gap-2'>
                    <div
                      className={`w-3 h-3 rounded-full ${getCategoryStatusColor(
                        Object.values(subcategories).flat()
                      )}`}
                    ></div>
                    <span className='font-medium'>{mainCategory}</span>

                    {/* Mostrar contadores de estado */}
                    <div className='flex items-center gap-1 ml-2'>
                      {Object.entries(statusCounts).map(([status, count]) =>
                        count > 0 ? (
                          <div
                            key={status}
                            className={`flex items-center justify-center w-5 h-5 rounded-full ${getStatusColorBg(
                              status as MembershipStatus
                            )}`}
                          >
                            <span className='text-xs text-white font-medium'>
                              {count}
                            </span>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {Object.entries(subcategories).length > 0 ? (
                    <div className='space-y-4'>
                      {Object.entries(subcategories).map(
                        ([subCategory, services]) => {
                          // Determinar el estado de la subcategoría
                          const subCategoryStatus =
                            getSubcategoryStatus(services);

                          return (
                            <div key={subCategory} className='ml-4'>
                              <div className='flex items-center gap-2 mb-2'>
                                <div
                                  className={
                                    subCategory.toUpperCase() === "VENTAS"
                                      ? `w-3 h-3 rounded-full bg-white border border-gray-300`
                                      : `w-3 h-3 rounded-full ${getStatusColorBg(
                                          subCategoryStatus
                                        )}`
                                  }
                                ></div>
                                <h3 className='font-medium'>
                                  {subCategory || "General"}
                                </h3>
                              </div>
                              <div className='space-y-2 pl-5'>
                                {services.map((service, idx) => (
                                  <div
                                    key={idx}
                                    className='flex items-center gap-2 p-2 border rounded-md hover:bg-gray-50'
                                  >
                                    <span className='font-medium'>
                                      {service.property}
                                    </span>
                                    <span className='ml-auto text-sm text-gray-500'>
                                      {service.value || "N/A"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <div className='text-center py-4 text-muted-foreground'>
                      No hay subcategorías disponibles
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        })
      ) : (
        <div className='text-center py-4 text-muted-foreground'>
          No se han detectado categorías de servicios
        </div>
      )}
    </div>
  );
}

// Función para contar estados por categoría
function countStatusesByCategory(
  subcategories: Record<
    string,
    Array<{ property: string; value: string; status: MembershipStatus }>
  >
): Record<MembershipStatus, number> {
  const counts = {
    [MembershipStatus.ACTIVE]: 0,
    [MembershipStatus.ABOUT_TO_START]: 0,
    [MembershipStatus.ABOUT_TO_END]: 0,
    [MembershipStatus.DEACTIVATED]: 0,
    [MembershipStatus.NO_STATUS]: 0,
  };

  // Para cada subcategoría, determinar su estado y aumentar el contador
  // excepto para la subcategoría "VENTAS" que no se contará
  Object.entries(subcategories).forEach(([key, services]) => {
    if (key.toUpperCase() !== "VENTAS") {
      const status = getSubcategoryStatus(services);
      counts[status]++;
    }
  });

  return counts;
}

// Función para determinar el estado de una subcategoría
function getSubcategoryStatus(
  services: Array<{ property: string; value: string; status: MembershipStatus }>
): MembershipStatus {
  // Buscar fechas de inicio y fin
  const startDateField = services.find(
    (s) =>
      s.property.toLowerCase().includes("fecha") &&
      (s.property.toLowerCase().includes("inicio") ||
        s.property.toLowerCase().includes("alta"))
  );

  const endDateField = services.find(
    (s) =>
      s.property.toLowerCase().includes("fecha") &&
      (s.property.toLowerCase().includes("fin") ||
        s.property.toLowerCase().includes("baja"))
  );

  if (startDateField || endDateField) {
    const startDate = startDateField?.value || "N/A";
    const endDate = endDateField?.value || "N/A";

    // Determinar estado basado en fechas
    const now = new Date();
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    if (start && start > now) {
      return MembershipStatus.ABOUT_TO_START;
    }

    if (end && end < now) {
      return MembershipStatus.DEACTIVATED;
    }

    if (end && end <= thirtyDaysFromNow && end > now) {
      return MembershipStatus.ABOUT_TO_END;
    }

    if (
      (start && start <= now && (!end || end > thirtyDaysFromNow)) ||
      (startDateField?.value && !endDateField?.value)
    ) {
      return MembershipStatus.ACTIVE;
    }
  }

  // Buscar campos de estado o edición
  const stateField = services.find(
    (s) =>
      s.property.toLowerCase().includes("estado") ||
      s.property.toLowerCase().includes("edición")
  );

  if (stateField && stateField.value) {
    return MembershipStatus.ACTIVE;
  }

  // Buscar campos de responsable
  const responsibleField = services.find(
    (s) =>
      s.property.toLowerCase().includes("responsable") ||
      s.property.toLowerCase().includes("consultor")
  );

  if (responsibleField && responsibleField.value) {
    return MembershipStatus.ACTIVE;
  }

  // Si hay algún campo con valor, considerar activo
  if (services.some((s) => s.value && s.value !== "N/A")) {
    return MembershipStatus.ACTIVE;
  }

  return MembershipStatus.NO_STATUS;
}

// Función para extraer categorías de servicios
function extractServiceCategories(
  contact: Contact
): Record<
  string,
  Record<
    string,
    Array<{ property: string; value: string; status: MembershipStatus }>
  >
> {
  const categories: Record<
    string,
    Record<
      string,
      Array<{ property: string; value: string; status: MembershipStatus }>
    >
  > = {};

  // Procesar campos personalizados
  if (contact.customFields) {
    const customFields = Array.isArray(contact.customFields)
      ? contact.customFields
      : Object.entries(contact.customFields).map(([field, value]) => ({
          field,
          value,
        }));

    customFields.forEach((field) => {
      if (!field.field) return;

      // Usar la función processCustomFields para extraer las partes
      const { mainCategory, subCategory, property } =
        processCustomFields(field);

      // Inicializar la categoría principal si no existe
      if (!categories[mainCategory]) {
        categories[mainCategory] = {};
      }

      // Inicializar la subcategoría si no existe
      const subCategoryKey = subCategory || "General";
      if (!categories[mainCategory][subCategoryKey]) {
        categories[mainCategory][subCategoryKey] = [];
      }

      // Determinar el estado del servicio (aunque ya no lo usaremos a nivel de propiedad)
      let status = MembershipStatus.NO_STATUS;
      if (field.value) {
        status = MembershipStatus.ACTIVE;
      }

      // Añadir el servicio a la subcategoría
      categories[mainCategory][subCategoryKey].push({
        property,
        value: field.value || "",
        status,
      });
    });
  }

  return categories;
}

// Función para parsear fechas en diferentes formatos
function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === "N/A") return null;

  // Intentar formato español (DD/MM/YYYY)
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  // Intentar formato YYYY/MM/DD
  const parts2 = dateStr.split("/");
  if (parts2.length === 3) {
    const year = parseInt(parts2[0], 10);
    const month = parseInt(parts2[1], 10) - 1;
    const day = parseInt(parts2[2], 10);
    if (year > 1000) {
      // Asegurarse de que es un año válido
      return new Date(year, month, day);
    }
  }

  // Intentar como fecha ISO
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
  } catch {
    // Ignorar errores
  }

  return null;
}

// Función para determinar el color de estado de una categoría
function getCategoryStatusColor(
  services: Array<{ property: string; value: string; status: MembershipStatus }>
): string {
  // Si hay al menos un servicio activo, la categoría se considera activa
  if (services.some((s) => s.status === MembershipStatus.ACTIVE)) {
    return "bg-green-500";
  }

  // Si hay al menos un servicio por activar, la categoría se considera por activar
  if (services.some((s) => s.status === MembershipStatus.ABOUT_TO_START)) {
    return "bg-yellow-500";
  }

  // Si hay al menos un servicio por desactivar, la categoría se considera por desactivar
  if (services.some((s) => s.status === MembershipStatus.ABOUT_TO_END)) {
    return "bg-orange-500";
  }

  // Si hay al menos un servicio desactivado, la categoría se considera desactivada
  if (services.some((s) => s.status === MembershipStatus.DEACTIVATED)) {
    return "bg-red-500";
  }

  // Por defecto, sin estado
  return "bg-gray-400";
}

// Función para obtener el color de fondo según el estado
function getStatusColorBg(status: MembershipStatus): string {
  switch (status) {
    case MembershipStatus.ABOUT_TO_START:
      return "bg-yellow-500";
    case MembershipStatus.ACTIVE:
      return "bg-green-500";
    case MembershipStatus.ABOUT_TO_END:
      return "bg-orange-500";
    case MembershipStatus.DEACTIVATED:
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
}
