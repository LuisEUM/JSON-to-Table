import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Contact } from "./ContactDetailModal";
import {
  MembershipStatus,
  getMembershipStatus,
  getGroupedFields,
} from "@/lib/service-utils";

interface ServicesSectionProps {
  contact: Contact;
}

// Define interface for field objects
interface SubcategoryField {
  property: string;
  value: string | number | boolean | null;
}

export function ServicesSection({ contact }: ServicesSectionProps) {
  // Si no hay información del cliente o servicios
  if (!contact) {
    return (
      <div className='flex justify-center items-center h-full p-4'>
        <div className='text-center text-muted-foreground'>
          <p className='mb-2'>No hay información de servicios disponible</p>
        </div>
      </div>
    );
  }

  const hasServices =
    contact.services &&
    Array.isArray(contact.services) &&
    contact.services.length > 0;

  // Si no hay servicios
  if (!hasServices) {
    return (
      <div className='flex justify-center items-center h-full p-4'>
        <div className='text-center text-muted-foreground'>
          <p className='mb-2'>No hay servicios registrados</p>
          <p className='text-sm'>
            Este cliente no tiene servicios registrados en el sistema.
          </p>
        </div>
      </div>
    );
  }

  // Verificar si el contacto tiene membresías o formaciones
  const hasMemberships = contact.memberships && contact.memberships.length > 0;
  const hasTrainings = contact.trainings && contact.trainings.length > 0;

  // Convertir customFields a formato esperado por getCustomerStatus
  const customerData = {
    id: contact.id,
    name: contact.name,
    tradeName: typeof contact.tradeName === "string" ? contact.tradeName : "",
    email: typeof contact.email === "string" ? contact.email : "",
    customFields: Array.isArray(contact.customFields)
      ? contact.customFields
      : Object.entries(contact.customFields || {}).map(([field, value]) => ({
          field,
          value: String(value),
        })),
  };

  // Obtener servicios agrupados por categoría
  const groupedFields = getGroupedFields(customerData);

  // Verificar si hay categorías principales
  const hasCategories = Object.keys(groupedFields).length > 0;

  if (!hasMemberships && !hasTrainings && !hasCategories) {
    return (
      <div className='text-center py-6'>
        <p className='text-gray-500'>
          Este contacto no tiene servicios registrados.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Leyenda de estados */}
      <div className='flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-md'>
        <div className='flex items-center gap-1'>
          <div className='w-3 h-3 rounded-full bg-gray-400'></div>
          <span className='text-sm'>Sin Estado</span>
        </div>
        <div className='flex items-center gap-1'>
          <div className='w-3 h-3 rounded-full bg-green-500'></div>
          <span className='text-sm'>Servicio Activo</span>
        </div>
        <div className='flex items-center gap-1'>
          <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
          <span className='text-sm'>Va a ser Alta</span>
        </div>
        <div className='flex items-center gap-1'>
          <div className='w-3 h-3 rounded-full bg-orange-500'></div>
          <span className='text-sm'>Va a ser Baja</span>
        </div>
        <div className='flex items-center gap-1'>
          <div className='w-3 h-3 rounded-full bg-red-500'></div>
          <span className='text-sm'>Servicio Desactivado</span>
        </div>
      </div>

      {/* Sección de Membresías - Siempre mostrar */}
      <div className='border rounded-md overflow-hidden'>
        <Accordion type='single' collapsible className='w-full'>
          <AccordionItem value='memberships'>
            <AccordionTrigger className='px-4 py-2 hover:bg-gray-50 font-medium'>
              MEMBRESÍAS ({contact.memberships?.length || 0})
            </AccordionTrigger>
            <AccordionContent className='px-4 py-2'>
              {hasMemberships ? (
                <div className='space-y-2'>
                  {contact.memberships?.map((membership, idx) => (
                    <div
                      key={idx}
                      className='flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md'
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${getStatusColor(
                          String(membership.status)
                        )}`}
                      ></div>
                      <div className='flex-1'>
                        <div className='flex flex-col sm:flex-row sm:justify-between'>
                          <span className='text-sm font-medium'>
                            {membership.name}
                          </span>
                          <span className='text-xs text-gray-500'>
                            {formatDate(membership.startDate)} →{" "}
                            {formatDate(membership.endDate)}
                          </span>
                        </div>
                        <div className='text-xs text-gray-500'>
                          Tipo: {formatMembershipType(membership.type)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-4 text-muted-foreground'>
                  No hay membresías disponibles
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Sección de Formaciones - Siempre mostrar */}
      <div className='border rounded-md overflow-hidden'>
        <Accordion type='single' collapsible className='w-full'>
          <AccordionItem value='trainings'>
            <AccordionTrigger className='px-4 py-2 hover:bg-gray-50 font-medium'>
              FORMACIONES ({contact.trainings?.length || 0})
            </AccordionTrigger>
            <AccordionContent className='px-4 py-2'>
              {hasTrainings ? (
                <div className='space-y-2'>
                  {contact.trainings?.map((training, idx) => (
                    <div
                      key={idx}
                      className='flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md'
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${getStatusColor(
                          String(training.status)
                        )}`}
                      ></div>
                      <div className='flex-1'>
                        <div className='flex flex-col sm:flex-row sm:justify-between'>
                          <span className='text-sm font-medium'>
                            {training.name}
                          </span>
                          <span className='text-xs text-gray-500'>
                            {formatDate(training.startDate)} →{" "}
                            {formatDate(training.endDate)}
                          </span>
                        </div>
                        <div className='text-xs text-gray-500'>
                          Estado: {formatTrainingStatus(training.status)}
                          {training.extendedEndDate && (
                            <span>
                              {" "}
                              (Extendido hasta:{" "}
                              {formatDate(training.extendedEndDate)})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-4 text-muted-foreground'>
                  No hay formaciones disponibles
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Categorías de servicios detectadas */}
      {Object.entries(groupedFields).map(([category, data]) => (
        <div key={category} className='border rounded-md overflow-hidden'>
          <Accordion type='single' collapsible className='w-full'>
            <AccordionItem value={category}>
              <AccordionTrigger className='px-4 py-2 hover:bg-gray-50 font-medium'>
                {category} (
                {Object.keys(data.subCategories).length +
                  (data.directFields?.length || 0)}
                )
              </AccordionTrigger>
              <AccordionContent className='px-4 py-2'>
                {/* Campos directos de la categoría */}
                {data.directFields && data.directFields.length > 0 && (
                  <div className='mb-4'>
                    <h4 className='text-sm font-medium mb-2'>
                      Campos generales
                    </h4>
                    <div className='space-y-2'>
                      {data.directFields.map((field, idx) => (
                        <div
                          key={idx}
                          className='grid grid-cols-2 gap-2 p-2 hover:bg-gray-50 rounded-md'
                        >
                          <span className='text-sm text-gray-500'>
                            {field.property}
                          </span>
                          <span className='text-sm'>
                            {field.value || "N/A"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subcategorías */}
                {Object.entries(data.subCategories).map(
                  ([subCategory, subData]) => (
                    <div key={subCategory} className='mb-4'>
                      <Accordion type='single' collapsible className='w-full'>
                        <AccordionItem value={`${category}-${subCategory}`}>
                          <AccordionTrigger className='px-4 py-2 hover:bg-gray-50 text-sm font-medium'>
                            <div className='flex items-center gap-2'>
                              <div
                                className={`w-2 h-2 rounded-full ${getSubcategoryStatusColor(
                                  subData.fields
                                )}`}
                              ></div>
                              <span>{subCategory}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className='px-4 py-2'>
                            <div className='space-y-2'>
                              {subData.fields.map((field, idx) => (
                                <div
                                  key={idx}
                                  className='grid grid-cols-2 gap-2 p-2 hover:bg-gray-50 rounded-md'
                                >
                                  <span className='text-sm text-gray-500'>
                                    {field.property}
                                  </span>
                                  <span className='text-sm'>
                                    {field.value || "N/A"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  )
                )}

                {/* Si no hay subcategorías ni campos directos */}
                {(!data.directFields || data.directFields.length === 0) &&
                  Object.keys(data.subCategories).length === 0 && (
                    <div className='text-center py-4 text-muted-foreground'>
                      No hay datos disponibles para esta categoría
                    </div>
                  )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      ))}
    </div>
  );
}

// Función para determinar el estado de una subcategoría basado en sus campos
function getSubcategoryStatusColor(fields: SubcategoryField[]): string {
  // Buscar campo de edición
  const editionField = fields.find((f) =>
    f.property.toLowerCase().endsWith("edición")
  );

  if (editionField && editionField.value && editionField.value !== "N/A") {
    return "bg-green-500"; // Activo
  }

  // Buscar fechas
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
    const status = getMembershipStatus(
      String(startDateField?.value || "N/A"),
      String(endDateField?.value || "N/A")
    );

    return getStatusColorBg(status);
  }

  // Buscar cualquier campo con valor
  const hasValue = fields.some((f) => f.value && f.value !== "N/A");
  if (hasValue) {
    return "bg-green-500"; // Activo
  }

  return "bg-gray-400"; // Sin estado
}

// Función para obtener el color de estado
function getStatusColor(status: string | number | boolean): string {
  switch (String(status).toLowerCase()) {
    case "active":
      return "bg-green-500";
    case "about-to-start":
      return "bg-yellow-500";
    case "about-to-end":
      return "bg-orange-500";
    case "deactivated":
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
}

// Función para obtener el color de estado basado en MembershipStatus
function getStatusColorBg(status: MembershipStatus): string {
  switch (status) {
    case MembershipStatus.ACTIVE:
      return "bg-green-500";
    case MembershipStatus.ABOUT_TO_START:
      return "bg-yellow-500";
    case MembershipStatus.ABOUT_TO_END:
      return "bg-orange-500";
    case MembershipStatus.DEACTIVATED:
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
}

// Función para formatear fechas
function formatDate(dateStr?: string): string {
  if (!dateStr || dateStr === "N/A") return "N/A";

  // Intentar parsear fecha en formato español (DD/MM/YYYY)
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    return dateStr; // Ya está en formato español
  }

  // Intentar como fecha ISO
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// Función para formatear el tipo de membresía
function formatMembershipType(type: string): string {
  switch (type) {
    case "monthly":
      return "Mensual";
    case "quarterly":
      return "Trimestral";
    case "semiannual":
      return "Semestral";
    case "annual":
      return "Anual";
    default:
      return type || "Desconocido";
  }
}

// Función para formatear el estado de formación
function formatTrainingStatus(status: string): string {
  switch (status) {
    case "active":
      return "Activa";
    case "about-to-start":
      return "Próxima a iniciar";
    case "about-to-end":
      return "Próxima a finalizar";
    case "deactivated":
      return "Finalizada";
    default:
      return "Sin estado";
  }
}
