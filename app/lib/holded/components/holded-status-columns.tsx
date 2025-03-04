import { ColumnDef } from "@tanstack/react-table";
import { Customer } from "../interfaces/customer";
import { createCustomStatusColumns } from "../utils/holded-customer-status-utils";
import { MembershipStatus } from "../interfaces/status-types";
import {
  getStatusColorClasses,
  getStatusLabel,
} from "../utils/holded-customer-status-utils";
import React from "react";

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
