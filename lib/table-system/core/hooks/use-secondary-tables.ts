"use client";

import { useState, useCallback, useEffect } from "react";
import type { Table } from "@tanstack/react-table";
import type { ProcessedItem, ProcessedRow } from "../utils/data-processor";
import { logger } from "../services/logging-service";

interface ArrayColumnInfo {
  id: string;
  label: string;
  data: Record<string, unknown>[];
  parentTable?: { id: string; name: string };
}

interface UseSecondaryTablesOptions {
  isSecondaryTable: boolean;
  parentTableInfo?: { id: string; name: string };
  onArrayColumnsChange?: (columns: ArrayColumnInfo[]) => void;
  processedData: ProcessedItem[][];
  table: Table<ProcessedRow>;
  debouncedColumnFilters: unknown;
  debouncedGlobalFilter: string;
}

export function useSecondaryTables(options: UseSecondaryTablesOptions) {
  const {
    isSecondaryTable,
    parentTableInfo,
    onArrayColumnsChange,
    processedData,
    table,
    debouncedColumnFilters,
    debouncedGlobalFilter,
  } = options;

  const [isSecondaryTablesLoading, setIsSecondaryTablesLoading] =
    useState(false);
  const [hasInitialData, setHasInitialData] = useState(false);

  // Map para almacenar las columnas de arrays unicos
  const [uniqueArrayColumns] = useState(
    () =>
      new Map<
        string,
        {
          id: string;
          label: string;
          data: Record<string, unknown>[];
          parentTable?: {
            id: string;
            name: string;
          };
        }
      >()
  );

  // Funcion para procesar las tablas secundarias
  const processSecondaryTables = useCallback(
    (filteredData: ProcessedRow[]) => {
      if (isSecondaryTable) return; // No procesar si es una tabla secundaria

      setIsSecondaryTablesLoading(true);
      uniqueArrayColumns.clear();

      filteredData.forEach((row) => {
        const rowId =
          row["id"]?.value ||
          Object.values(row).find((item) => item.isId)?.value ||
          Object.values(row).find((item) =>
            item.path?.[item.path.length - 1].toLowerCase().includes("id")
          )?.value;

        Object.values(row).forEach((item) => {
          if (
            item.type === "objectArray" ||
            (item.type === "array" && item.items?.[0]?.type === "object")
          ) {
            const columnId = item.path.join(".");

            if (!uniqueArrayColumns.has(columnId)) {
              const processedData =
                item.items?.map((subItem) => ({
                  ...(subItem.value as object),
                  __parentId: rowId,
                  __parentTable: parentTableInfo?.id || columnId,
                })) || [];

              uniqueArrayColumns.set(columnId, {
                id: columnId,
                label: item.path.join("."),
                data: processedData,
                parentTable: parentTableInfo,
              });
            } else {
              const existingColumn = uniqueArrayColumns.get(columnId);
              if (existingColumn) {
                const hasParentId = existingColumn.data.some(
                  (record) => record.__parentId === rowId
                );

                if (!hasParentId) {
                  const newProcessedData =
                    item.items?.map((subItem) => ({
                      ...(subItem.value as object),
                      __parentId: rowId,
                      __parentTable: parentTableInfo?.id || columnId,
                    })) || [];

                  uniqueArrayColumns.set(columnId, {
                    ...existingColumn,
                    data: [...existingColumn.data, ...newProcessedData],
                  });
                }
              }
            }
          }
        });
      });

      if (onArrayColumnsChange) {
        onArrayColumnsChange(Array.from(uniqueArrayColumns.values()));
      }

      // Pequeno delay para asegurar que la UI se actualice
      setTimeout(() => {
        setIsSecondaryTablesLoading(false);
      }, 300);
    },
    [
      isSecondaryTable,
      uniqueArrayColumns,
      parentTableInfo,
      onArrayColumnsChange,
    ]
  );

  // Efecto que notifica sobre cambios en las columnas de arrays
  useEffect(() => {
    if (!processedData.length) {
      if (onArrayColumnsChange) {
        onArrayColumnsChange([]);
      }
      return;
    }

    const newArrayColumns = Array.from(uniqueArrayColumns.values());

    // Deduplicar y limpiar tablas secundarias vacias
    const validArrayColumns = newArrayColumns.filter(
      (col) => col.data && col.data.length > 0 && col.id
    );

    logger.debug("Array columns procesadas:", {
      count: validArrayColumns.length,
      totalRegistros: validArrayColumns.reduce(
        (acc, col) => acc + col.data.length,
        0
      ),
      columns: validArrayColumns.map((col) => ({
        id: col.id,
        label: col.label,
        dataLength: col.data.length,
        firstItemParentId: col.data[0]?.__parentId,
      })),
    });

    // Notificar cambios en las columnas si existe el callback
    if (onArrayColumnsChange) {
      onArrayColumnsChange(validArrayColumns);
    }
  }, [
    processedData,
    parentTableInfo,
    isSecondaryTable,
    onArrayColumnsChange,
    uniqueArrayColumns,
  ]);

  // Efecto para controlar el estado inicial de carga
  useEffect(() => {
    if (processedData.length > 0 && !hasInitialData) {
      setHasInitialData(true);
    }
  }, [processedData.length, hasInitialData]);

  // Efecto para procesar las tablas secundarias cuando cambian los filtros
  useEffect(() => {
    const processData = async () => {
      const filteredRows = table.getFilteredRowModel().rows;
      const filteredData = filteredRows.map((row) => row.original);
      await processSecondaryTables(filteredData);
    };

    if (hasInitialData) {
      processData();
    }
  }, [
    debouncedColumnFilters,
    debouncedGlobalFilter,
    table,
    processSecondaryTables,
    hasInitialData,
  ]);

  return {
    uniqueArrayColumns,
    isSecondaryTablesLoading,
    hasInitialData,
    setHasInitialData,
  };
}
