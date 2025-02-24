"use client";

import { useContext } from "react";
import type { Column, AccessorFnColumnDef } from "@tanstack/react-table";
import { DateFilter } from "./date-filter";
import { NumberFilter } from "./number-filter";
import { StringFilter } from "./string-filter";
import { BooleanFilter } from "./boolean-filter";
import { ArrayFilter } from "./array-filter";
import type { ProcessedItem } from "../../data-processor";
import type { FilterComponentProps, FilterCondition } from "./filter-types";
import type { ProcessedRow } from "../../data-processor";
import { FilterContext } from "../../json-table";
import { DialogTitle } from "@/components/ui/dialog";

interface FilterFactoryProps extends FilterComponentProps {
  column: Column<ProcessedRow>;
}

export function FilterFactory({ column, ...props }: FilterFactoryProps) {
  const { applyFilter } = useContext(FilterContext);

  const firstValue = column.getFacetedUniqueValues().keys().next().value;
  const accessorValue = (
    column.columnDef as AccessorFnColumnDef<ProcessedRow>
  ).accessorFn?.(column.getFacetedRowModel().rows[0]?.original, 0);

  if (!firstValue && !accessorValue) {
    return (
      <>
        <DialogTitle className='sr-only'>Filtro de columna</DialogTitle>
        <StringFilter {...props} />
      </>
    );
  }

  // Procesar y unificar valores únicos
  const uniqueValuesMap = new Map<string, number>();

  column.getFacetedUniqueValues().forEach((count, value) => {
    const processedValue = value as ProcessedItem;
    const stringValue = processedValue?.value
      ? String(processedValue.value)
      : String(value);

    // Sumar el contador para valores iguales
    uniqueValuesMap.set(
      stringValue,
      (uniqueValuesMap.get(stringValue) || 0) + count
    );
  });

  // Convertir el Map a array de objetos
  const uniqueValues = Array.from(uniqueValuesMap.entries()).map(
    ([value, count]) => ({
      value,
      count,
      original: value,
    })
  );

  console.log("🔍 Valores únicos procesados:", {
    columnId: column.id,
    uniqueValues: uniqueValues.map((v) => ({
      value: v.value,
      count: v.count,
    })),
  });

  const type = (accessorValue as ProcessedItem)?.type;
  const columnName = column.id.split(".").pop() || column.id;

  // Get min and max values for number columns
  const [minValue, maxValue] = column.getFacetedMinMaxValues() ?? [
    undefined,
    undefined,
  ];

  const filterProps = {
    ...props,
    columnName,
    columnType: type || "unknown",
    uniqueValues,
    minValue,
    maxValue,
    onApply: (condition: FilterCondition) => {
      applyFilter(column.id, condition);
      props.onApply(condition);
    },
  };

  return (
    <>
      <DialogTitle className='sr-only'>Filtro de columna</DialogTitle>
      {type === "array" ? (
        <ArrayFilter {...filterProps} />
      ) : type === "fecha" ? (
        <DateFilter {...filterProps} />
      ) : type === "número" ? (
        <NumberFilter {...filterProps} />
      ) : type === "boolean" ? (
        <BooleanFilter {...filterProps} />
      ) : (
        <StringFilter {...filterProps} />
      )}
    </>
  );
}
