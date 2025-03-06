import React from "react";
import { MembershipStatus, getStatusLabel } from "@/lib/service-utils";

interface ServicesListViewProps {
  services: Record<string, string[]>;
  statusOrder: MembershipStatus[];
}

export function ServicesListView({
  services,
  statusOrder,
}: ServicesListViewProps) {
  // Filtrar los servicios VENTAS del recuento
  const filteredServices = Object.fromEntries(
    Object.entries(services).map(([status, servicesList]) => [
      status,
      servicesList.filter(
        (service) => !service.toUpperCase().includes("VENTAS")
      ),
    ])
  );

  // Contar el total de servicios excluyendo VENTAS
  const totalServices = statusOrder.reduce(
    (total, status) => total + filteredServices[status].length,
    0
  );

  return (
    <div className='space-y-6'>
      <h2 className='text-lg font-semibold mb-4'>Servicios Por Estado</h2>
      {totalServices > 0 ? (
        statusOrder.map((status) => (
          <div key={status} className='space-y-2'>
            {/* Mostrar siempre el encabezado del estado, incluso si no hay servicios */}
            <div className='flex items-center gap-2 mb-2'>
              <div
                className={`w-3 h-3 rounded-full ${getStatusColorBg(status)}`}
              ></div>
              <h3 className='font-medium'>{getStatusLabel(status)}</h3>
              <div
                className={`flex items-center justify-center w-5 h-5 rounded-full ${getStatusColorBg(
                  status
                )} ml-1`}
              >
                <span className='text-xs text-white font-medium'>
                  {filteredServices[status].length}
                </span>
              </div>
            </div>

            {filteredServices[status].length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2 pl-5'>
                {filteredServices[status].map((name, idx) => (
                  <div
                    key={idx}
                    className='flex items-center p-2 border rounded-md hover:bg-gray-50'
                  >
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-2 text-muted-foreground pl-5'>
                No hay servicios con este estado
              </div>
            )}
          </div>
        ))
      ) : (
        <div className='text-center py-4 text-muted-foreground'>
          No se han detectado servicios
        </div>
      )}
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

// Función para verificar si un servicio pertenece a la categoría VENTAS
export function isVentasCategory(serviceName: string): boolean {
  return serviceName.toUpperCase().includes("VENTAS");
}
