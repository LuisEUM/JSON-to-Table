import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Contact } from "./ContactDetailModal";
import {
  MembershipStatus,
  getStatusLabel,
  getCustomerStatus,
} from "@/lib/service-utils";
import { ServicesListView } from "./ServicesListView";
import { ServicesCategoryView } from "./ServicesCategoryView";

interface DynamicServicesSectionProps {
  contact: Contact;
}

export function DynamicServicesSection({
  contact,
}: DynamicServicesSectionProps) {
  // Verificar si el contacto tiene campos personalizados
  if (
    !contact.customFields ||
    (Array.isArray(contact.customFields) && contact.customFields.length === 0)
  ) {
    return (
      <div className='text-center py-6'>
        <p className='text-gray-500'>
          Este contacto no tiene campos personalizados.
        </p>
      </div>
    );
  }

  // Convertir customFields a formato esperado por getCustomerStatus
  const customerData = {
    id: contact.id,
    name: contact.name,
    tradeName: typeof contact.tradeName === "string" ? contact.tradeName : "",
    email: typeof contact.email === "string" ? contact.email : "",
    customFields: Array.isArray(contact.customFields)
      ? contact.customFields
      : Object.entries(contact.customFields).map(([field, value]) => ({
          field,
          value: String(value),
        })),
  };

  // Obtener el estado del cliente y los servicios agrupados por estado
  const { clientStatus, ...servicesByStatus } = getCustomerStatus(customerData);

  // Orden predefinido de los tabs
  const tabOrder: MembershipStatus[] = [
    MembershipStatus.ACTIVE,
    MembershipStatus.ABOUT_TO_START,
    MembershipStatus.ABOUT_TO_END,
    MembershipStatus.DEACTIVATED,
    MembershipStatus.NO_STATUS,
  ];

  return (
    <div className='flex flex-col h-full'>
      {/* Estado general del cliente - Fijo en la parte superior */}
      {clientStatus && (
        <div className='flex items-center gap-2 p-3 bg-gray-50 rounded-md mb-4'>
          <div
            className={`w-3 h-3 rounded-full ${getStatusColorBg(clientStatus)}`}
          ></div>
          <span className='font-medium'>
            Estado general del cliente: {getStatusLabel(clientStatus)}
          </span>
        </div>
      )}

      {/* Tabs para diferentes vistas de servicios */}
      <Tabs defaultValue='by-category' className='flex-1 flex flex-col'>
        <TabsList className='w-full grid grid-cols-2 mb-4'>
          <TabsTrigger value='by-category'>Por Categoría</TabsTrigger>
          <TabsTrigger value='by-status'>Por Estado</TabsTrigger>
        </TabsList>

        {/* Contenido scrollable */}
        <div className='flex-1 overflow-hidden'>
          {/* Vista por categoría */}
          <TabsContent value='by-category' className='h-full'>
            <ScrollArea className='h-[calc(100vh-300px)] pr-4'>
              <ServicesCategoryView
                contact={contact}
                servicesByStatus={servicesByStatus}
                statusOrder={tabOrder}
              />
            </ScrollArea>
          </TabsContent>

          {/* Vista por estado */}
          <TabsContent value='by-status' className='h-full'>
            <ScrollArea className='h-[calc(100vh-300px)] pr-4'>
              <ServicesListView
                services={servicesByStatus}
                statusOrder={tabOrder}
              />
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
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

// Función para obtener el estado visual para una categoría
export function getCategoryVisualStatus(
  category: string,
  status: MembershipStatus
): string {
  // Excepción para la categoría VENTAS
  if (category.toUpperCase() === "VENTAS") {
    return "bg-white border border-gray-300";
  }

  // Para el resto de categorías, usar el color normal según estado
  return getStatusColorBg(status);
}
