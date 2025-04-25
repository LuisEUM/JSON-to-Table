import { ColumnDef } from "@tanstack/react-table";
import { Customer } from "../interfaces/customer";
import {
  getStatusColorClasses,
  getStatusLabel,
  getCustomerStatus,
} from "../utils/holded-customer-status-utils";
import { MembershipStatus, StatusColumn } from "../interfaces/status-types";
import React from "react";
import { Circle } from "lucide-react";

/**
 * Componente que muestra el estado de membresía con el color y etiqueta correspondientes
 */
export function StatusCell({ status }: { status: MembershipStatus }) {
  const colorClass = getStatusColorClasses(status);
  const label = getStatusLabel(status);

  return (
    <div className={`flex items-center gap-2 ${colorClass}`}>
      <span className='w-2 h-2 rounded-full bg-current'></span>
      <span>{label}</span>
    </div>
  );
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
            <span>{getStatusLabel(clientStatus)}</span>
          </div>
        );
      },
    },
    // Otras columnas de estado que necesites
  ];
}

/**
 * Integra las columnas de estado de Holded con el sistema de tablas
 * @param existingColumns Columnas existentes a las que se añadirán las columnas de estado
 * @returns Columnas combinadas
 */
export function withHoldedStatusColumns<T extends Customer>(
  existingColumns: ColumnDef<T>[]
): ColumnDef<T>[] {
  const statusColumns =
    createCustomStatusColumns() as unknown as ColumnDef<T>[];
  return [...existingColumns, ...statusColumns];
}

/**
 * Obtiene solo las columnas de estado de Holded
 * @returns Columnas de estado de Holded
 */
export function getHoldedStatusColumns<T extends Customer>(): ColumnDef<T>[] {
  return createCustomStatusColumns() as unknown as ColumnDef<T>[];
}
