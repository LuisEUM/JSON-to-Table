"use client";

import { useContext } from "react";
import type { Column, AccessorFnColumnDef } from "@tanstack/react-table";
import { DateFilter } from "./date-filter";
import { NumberFilter } from "./number-filter";
import { StringFilter } from "./string-filter";
import { ArrayFilter } from "./array-filter";
import { AtomicPrimitiveArrayFilter } from "./atomic-primitive-array-filter";
import { ObjectPropertyFilter } from "./object-property-filter";
import { DataPatternAnalyzer } from "./pattern-analyzer";
import type { ProcessedItem } from "../../core/utils/data-processor";
import type { FilterComponentProps, FilterCondition } from "./filter-types";
import type { ProcessedRow } from "../../core/utils/data-processor";
import { FilterContext } from "../../core/contexts/filter-context";
import { DialogTitle } from "@/components/primitives/ui/dialog";
import { logger } from "../../core/services/logging-service";

function shouldUseAdaptiveFilter(
  uniqueValues: FilterComponentProps["uniqueValues"]
): boolean {
  if (uniqueValues.length === 0) return false;
  const hasObjects = uniqueValues.some(
    (option) =>
      typeof option.original === "object" &&
      option.original !== null &&
      !Array.isArray(option.original)
  );
  const hasArraysOfObjects = uniqueValues.some(
    (option) =>
      Array.isArray(option.original) &&
      option.original.length > 0 &&
      typeof option.original[0] === "object" &&
      option.original[0] !== null
  );
  return hasObjects || hasArraysOfObjects;
}

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

  // Para arrays, necesitamos un procesamiento especial
  const columnType =
    (column.columnDef.meta as { type: string })?.type ||
    (column.getFacetedRowModel().rows[0]?.original[column.id] as ProcessedItem)
      ?.type ||
    "string";

  let uniqueValues: Array<{ value: unknown; count: number; original: unknown }>;

  if (
    columnType === "array" ||
    columnType === "objectArray" ||
    columnType === "primitiveArray"
  ) {
    // Para arrays, pasar los ProcessedItem originales sin convertir a string
    const uniqueValuesMap = new Map<ProcessedItem, number>();
    let processedCount = 0;
    const MAX_UNIQUE_VALUES = 5000;

    column.getFacetedUniqueValues().forEach((count, value) => {
      const processedValue = value as ProcessedItem;

      // Para arrays, mantener el ProcessedItem completo
      uniqueValuesMap.set(processedValue, count);

      processedCount++;
      if (processedCount >= MAX_UNIQUE_VALUES) {
        return;
      }
    });

    uniqueValues = Array.from(uniqueValuesMap.entries()).map(
      ([processedItem, count]) => ({
        value: processedItem,
        count,
        original: processedItem, // Mantener el ProcessedItem original
      })
    );
  } else {
    // Para otros tipos, usar el procesamiento normal
    const uniqueValuesMap = new Map<string, number>();
    let processedCount = 0;
    const MAX_UNIQUE_VALUES = 5000;

    column.getFacetedUniqueValues().forEach((count, value) => {
      const processedValue = value as ProcessedItem;
      const stringValue =
        processedValue?.value !== undefined
          ? String(processedValue.value)
          : String(value);

      uniqueValuesMap.set(
        stringValue,
        (uniqueValuesMap.get(stringValue) || 0) + count
      );

      processedCount++;
      if (processedCount >= MAX_UNIQUE_VALUES) {
        return;
      }
    });

    uniqueValues = Array.from(uniqueValuesMap.entries()).map(
      ([value, count]) => ({
        value,
        count,
        original: value,
      })
    );
  }

  logger.debug("Valores unicos procesados:", {
    columnId: column.id,
    columnType,
    uniqueValues: uniqueValues.map((v) => ({
      value: v.value,
      count: v.count,
    })),
  });

  const columnName = column.id.split(".").pop() || column.id;

  // Get min and max values for number columns
  const [minValue, maxValue] = column.getFacetedMinMaxValues() ?? [
    undefined,
    undefined,
  ];

  // Debug: Ver qué initialValue se está pasando
  logger.debug("FilterFactory initialValue debug:", {
    columnId: column.id,
    columnType,
    propsInitialValue: props.initialValue,
    currentFilter: column.getFilterValue(),
  });

  const filterProps = {
    ...props,
    columnName,
    columnType,
    uniqueValues,
    minValue,
    maxValue,
    onApply: (condition: FilterCondition) => {
      applyFilter(column.id, condition);
      props.onApply(condition);
    },
  };

  // Check if this column would benefit from adaptive filtering
  const useAdaptiveFiltering = shouldUseAdaptiveFilter(uniqueValues);

  logger.debug("Filter selection for column:", {
    columnId: column.id,
    columnType,
    useAdaptiveFiltering,
    sampleData: uniqueValues.slice(0, 3).map((v) => ({
      type: typeof v.original,
      isArray: Array.isArray(v.original),
      hasObjects:
        Array.isArray(v.original) &&
        v.original.length > 0 &&
        typeof v.original[0] === "object",
    })),
  });

  // Seleccionar el componente de filtro basado en el tipo y contenido
  logger.debug("FILTER FACTORY - Seleccionando filtro:", {
    columnId: column.id,
    columnType,
    uniqueValuesCount: uniqueValues.length,
    sampleValues: uniqueValues.slice(0, 3),
  });

  switch (columnType) {
    case "number":
      return <NumberFilter {...filterProps} />;
    case "date":
      return <DateFilter {...filterProps} />;
    case "array":
      return <ArrayFilter {...filterProps} arrayType={columnType} />;
    case "primitiveArray":
      return (
        <AtomicPrimitiveArrayFilter {...filterProps} arrayType={columnType} />
      );
    case "objectArray":
      return <ArrayFilter {...filterProps} arrayType={columnType} />;
    case "boolean":
    case "string":
    default:
      // For string/default columns, check if they contain complex objects
      if (useAdaptiveFiltering) {
        const strategy = DataPatternAnalyzer.analyzeColumn(
          filterProps.uniqueValues
        );
        if (strategy.type === "object-property") {
          return <ObjectPropertyFilter {...filterProps} />;
        }
      }
      return <StringFilter {...filterProps} />;
  }
}
