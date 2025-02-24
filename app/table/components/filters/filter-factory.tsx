"use client";

import type { Column, AccessorFnColumnDef } from "@tanstack/react-table";
import { DateFilter } from "./date-filter";
import { NumberFilter } from "./number-filter";
import { StringFilter } from "./string-filter";
import type { ProcessedItem } from "../../data-processor";
import type { FilterComponentProps } from "./filter-types";
import type { ProcessedRow } from "../../data-processor";
import { DialogTitle } from "@/components/ui/dialog";
import { ObjectArrayFilter } from "./object-array-filter";
import { SimpleArrayFilter } from "./simple-array-filter";

interface FilterFactoryProps extends FilterComponentProps {
  column: Column<ProcessedRow>;
}

export function FilterFactory(props: FilterFactoryProps) {
  const { column } = props;
  const firstValue = column.getFacetedRowModel().rows[0]?.getValue(column.id);

  const accessorValue = (
    column.columnDef as AccessorFnColumnDef<ProcessedRow>
  ).accessorFn?.(column.getFacetedRowModel().rows[0]?.original, 0);

  // Añadir logging para depuración
  console.log("🔍 Abriendo filtro:", {
    columnId: column.id,
    firstValue,
    accessorValue,
    meta: column.columnDef.meta,
    columnType: (column.columnDef.meta as { type: string })?.type ||
      (column.getFacetedRowModel().rows[0]?.original[column.id] as ProcessedItem)
        ?.type ||
      "string",
    rowsCount: column.getFacetedRowModel().rows.length,
    uniqueValues: column.getFacetedUniqueValues(),
  });

  if (!firstValue && !accessorValue) {
    return (
      <>
        <DialogTitle className='sr-only'>Filtro de columna</DialogTitle>
        <StringFilter {...props} />
      </>
    );
  }

  const columnType =
    (column.columnDef.meta as { type: string })?.type ||
    (column.getFacetedRowModel().rows[0]?.original[column.id] as ProcessedItem)
      ?.type ||
    "string";

  // Determinar el tipo de filtro basado en el tipo de columna
  switch (columnType) {
    case "array[objeto]":
      return (
        <>
          <DialogTitle className='sr-only'>Filtro de lista de objetos</DialogTitle>
          <ObjectArrayFilter {...props} />
        </>
      );
    case "array[primitivo]":
      return (
        <>
          <DialogTitle className='sr-only'>Filtro de lista de valores</DialogTitle>
          <SimpleArrayFilter {...props} />
        </>
      );
    case "número":
      return (
        <>
          <DialogTitle className='sr-only'>Filtro numérico</DialogTitle>
          <NumberFilter {...props} />
        </>
      );
    case "fecha":
      return <DateFilter {...props} />;
    case "boolean":
    case "string":
    default:
      return (
        <>
          <DialogTitle className='sr-only'>Filtro de texto</DialogTitle>
          <StringFilter {...props} />
        </>
      );
  }
}
