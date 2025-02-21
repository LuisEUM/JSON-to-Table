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

  const value = (accessorValue as ProcessedItem)?.value ?? firstValue;
  const type = (accessorValue as ProcessedItem)?.type;

  const columnName = column.id.split(".").pop() || column.id;

  // Get unique values and their counts using faceted values
  const uniqueValues = Array.from(
    column.getFacetedUniqueValues().entries()
  ).map(([value, count]) => {
    const processedValue = value as ProcessedItem;
    return {
      value: processedValue?.value
        ? String(processedValue.value)
        : String(value),
      count,
      original: value,
    };
  });

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

  console.log("FilterFactory - Columna abierta:", columnName);
  console.log("FilterFactory - Tipo de columna:", type);
  console.log(
    "FilterFactory - Valores únicos:",
    JSON.stringify(uniqueValues, null, 2)
  );
  console.log("FilterFactory - Valor mínimo:", minValue);
  console.log("FilterFactory - Valor máximo:", maxValue);

  const FilterComponent = (() => {
    if (type === "fecha" || value instanceof Date) {
      return <DateFilter {...filterProps} />;
    }

    if (
      type === "número entero" ||
      type === "número decimal" ||
      typeof value === "number"
    ) {
      return <NumberFilter {...filterProps} />;
    }

    if (type === "boolean" || typeof value === "boolean") {
      return <BooleanFilter {...filterProps} />;
    }

    if (type === "array") {
      return (
        <ArrayFilter
          {...filterProps}
          arrayType={(accessorValue as ProcessedItem)?.items?.[0]?.type}
        />
      );
    }

    return <StringFilter {...filterProps} />;
  })();

  return (
    <>
      <DialogTitle className='sr-only'>
        Filtro para columna: {columnName}
      </DialogTitle>
      {FilterComponent}
    </>
  );
}

