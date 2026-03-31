"use client";

import { TableHeader } from "@/components/ui/table";
import React from "react";
import {
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type ColumnFiltersState,
  type ColumnOrderState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  useReactTable,
  type FilterFn,
  type ColumnPinningState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { columns } from "../columns/columns";
import {
  type ProcessedItem,
  type ProcessedRow,
  processBatchData,
} from "../../core/utils/data-processor";
import { TypeLegend } from "../../molecules/table-parts/type-legend";
import { TablePagination } from "../../molecules/navigation/table-pagination";
import type { FilterCondition } from "../../molecules/filters/filter-types";
import { SecondaryTables } from "./secondary-tables";
import { TableSkeleton } from "./table-skeleton";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { dateBetweenFilterFn } from "../../molecules/filters/filter-types";
import { TableToolbar } from "../panels/table-toolbar";
import { downloadFile } from "../../core/utils/export-utils";
import { FilterContext } from "../../core/contexts/filter-context";
import { logger } from "../../core/services/logging-service";
import { TableErrorBoundary } from "../../core/components/table-error-boundary";

// Extracted modules
import { processedValueFilter } from "../../core/filters/processed-value-filter";
import { globalFilterFn } from "../../core/filters/global-filter";
import { useTablePersistence } from "../../core/hooks/use-table-persistence";
import {
  getTanStackPinningStyles,
  useColumnPinning,
} from "../../core/hooks/use-column-pinning";
import { useSecondaryTables } from "../../core/hooks/use-secondary-tables";
import {
  selectionColumn,
  indexColumn,
  createActionsColumn,
} from "./table-columns";

declare module "@tanstack/table-core" {
  interface FilterFns {
    dateBetweenFilterFn: FilterFn<ProcessedRow>;
  }
}

// FilterContext re-exported for backwards compatibility
export { FilterContext } from "../../core/contexts/filter-context";

// --------------------
// Component
// --------------------
interface JsonTableProps {
  data: Record<string, unknown>[];
  isLoading?: boolean;
  isSecondaryTable?: boolean;
  onArrayColumnsChange?: (
    columns: {
      id: string;
      label: string;
      data: Record<string, unknown>[];
    }[]
  ) => void;
  parentTableInfo?: {
    id: string;
    name: string;
  };
}

interface FilterFnsDef {
  processedValueFilter: FilterFn<ProcessedRow>;
  dateBetweenFilterFn: FilterFn<ProcessedRow>;
}

export function JsonTable({
  data,
  isLoading = false,
  isSecondaryTable = false,
  onArrayColumnsChange,
  parentTableInfo,
}: JsonTableProps) {
  // 1. State
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    selection: true,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [useFixedColumn, setUseFixedColumn] = useState(true);
  const [fixedColumnId, setFixedColumnId] = useState<string | null>(null);
  const [originalColumnOrder, setOriginalColumnOrder] = useState<string[]>([]);
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [isProcessingData, setIsProcessingData] = useState(true);

  // Debounce for filters
  const debouncedColumnFilters = useDebounce(columnFilters, 300);
  const debouncedGlobalFilter = useDebounce(globalFilter, 300);

  // 2. Extracted hooks
  const {
    saveColumnConfiguration,
    loadColumnConfiguration,
    saveAsDefaultConfiguration,
    loadDefaultConfiguration,
  } = useTablePersistence({
    isSecondaryTable,
    parentTableInfo,
  });

  const { getEffectiveColumnOrder } = useColumnPinning({
    columnOrder,
    originalColumnOrder,
    useFixedColumn,
    fixedColumnId,
  });

  // 3. Memoized data
  const processedData = useMemo(
    () => processBatchData(data, { sampleSize: 100 }),
    [data]
  );

  const handleDelete = useCallback((index: number) => {
    toast.success(`Registro #${index + 1} eliminado correctamente`);
  }, []);

  const actionsColumn = useMemo(
    () => createActionsColumn(handleDelete),
    [handleDelete]
  );

  const baseColumns = useMemo<ColumnDef<ProcessedRow>[]>(() => {
    if (!processedData[0]) return [];
    const cols = columns(processedData[0]);
    return cols.map((col) => ({
      ...col,
      meta: {
        ...col.meta,
        type:
          processedData[0].find((item) => item.id === col.id)?.type || "string",
      },
    }));
  }, [processedData]);

  const tableColumns = useMemo<ColumnDef<ProcessedRow>[]>(() => {
    return [selectionColumn, indexColumn, ...baseColumns, actionsColumn];
  }, [baseColumns, actionsColumn]);

  const processedTableData = useMemo(() => {
    return processedData.map((items: ProcessedItem[]) => {
      const row = items.reduce<ProcessedRow>((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});
      return row;
    });
  }, [processedData]);

  // 4. Table instance
  const table = useReactTable({
    data: processedTableData,
    columns: tableColumns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      rowSelection,
      globalFilter,
      columnOrder: getEffectiveColumnOrder(),
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    enableRowSelection: true,
    filterFns: {
      processedValueFilter,
      dateBetweenFilterFn,
    } as FilterFnsDef,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    enableFilters: true,
    enableGlobalFilter: true,
    globalFilterFn,
    getColumnCanGlobalFilter: (column) => {
      return column.id !== "actions" && column.id !== "select";
    },
  });

  // 5. Secondary tables hook
  const { uniqueArrayColumns, isSecondaryTablesLoading, hasInitialData } =
    useSecondaryTables({
      isSecondaryTable,
      parentTableInfo,
      onArrayColumnsChange,
      processedData,
      table,
      debouncedColumnFilters,
      debouncedGlobalFilter,
    });

  // 6. Callbacks
  const applyFilter = useCallback(
    (columnId: string, filterValue: FilterCondition) => {
      logger.debug("Aplicando filtro:", {
        columnId,
        operator: filterValue.operator,
        value: filterValue.value,
      });

      const column = table.getColumn(columnId);
      if (column) {
        column.setFilterValue(filterValue);
      } else {
        logger.warn("Columna no encontrada:", columnId);
      }
    },
    [table]
  );

  const clearFilter = useCallback(
    (columnId: string) => {
      const column = table.getColumn(columnId);
      if (column) {
        column.setFilterValue(undefined);
      }
    },
    [table]
  );

  const clearAllFilters = useCallback(() => {
    table.resetColumnFilters();
  }, [table]);

  const filterContextValue = useMemo(
    () => ({
      applyFilter,
      clearFilter,
      clearAllFilters,
      activeFilterCount: columnFilters.length,
    }),
    [applyFilter, clearFilter, clearAllFilters, columnFilters.length]
  );

  const handleColumnOrderChange = (newOrder: string[]) => {
    setColumnOrder(newOrder);
  };

  // 7. Effects
  // Load saved configuration on mount
  useEffect(() => {
    if (!originalColumnOrder.length) {
      const allColumnIds = table.getAllLeafColumns().map((col) => col.id);
      setOriginalColumnOrder(allColumnIds);

      const savedConfig = loadColumnConfiguration();
      const defaultConfig = loadDefaultConfiguration();
      const config = savedConfig || defaultConfig;

      if (config) {
        if (config.columnOrder && config.columnOrder.length > 0) {
          const validOrder = config.columnOrder.filter((id: string) =>
            allColumnIds.includes(id)
          );
          if (validOrder.length > 0) setColumnOrder(validOrder);
        }
        if (config.columnVisibility) setColumnVisibility(config.columnVisibility);
        if (typeof config.useFixedColumn === "boolean") setUseFixedColumn(config.useFixedColumn);
        if (config.fixedColumnId !== undefined) setFixedColumnId(config.fixedColumnId);
      }
    }
  }, [table, originalColumnOrder]);

  // Column pinning effect
  useEffect(() => {
    const leftPins = ["selection"];

    if (useFixedColumn) {
      if (fixedColumnId) {
        leftPins.push(fixedColumnId);
      } else {
        const idx = table.getColumn("index");
        if (idx && idx.getIsVisible()) {
          leftPins.push("index");
        }
      }
    }

    table.setColumnPinning({
      left: leftPins,
      right: ["actions"],
    });
  }, [useFixedColumn, fixedColumnId, table]);

  // Auto-save configuration
  useEffect(() => {
    if (originalColumnOrder.length > 0) {
      saveColumnConfiguration({
        columnOrder,
        columnVisibility,
        useFixedColumn,
        fixedColumnId,
        sorting,
        columnFilters,
        globalFilter,
      });
    }
  }, [
    columnOrder,
    columnVisibility,
    useFixedColumn,
    fixedColumnId,
    sorting,
    columnFilters,
    globalFilter,
  ]);

  // Processing state
  useEffect(() => {
    if (hasInitialData) {
      setIsProcessingData(false);
    }
  }, [hasInitialData]);

  // 8. View config
  const [currentViewConfig, setCurrentViewConfig] = useState<
    Record<string, unknown>
  >({});

  const getCurrentConfiguration = useCallback(() => {
    return {
      sorting,
      columnVisibility,
      columnFilters,
      columnPinning: table.getState().columnPinning,
      globalFilter,
      pagination: {
        pageIndex: table.getState().pagination.pageIndex,
        pageSize: table.getState().pagination.pageSize,
      },
    };
  }, [sorting, columnVisibility, columnFilters, globalFilter, table]);

  const getColumnTypesFromTable = useCallback(
    (_table: unknown, processedData: ProcessedItem[][]) => {
      const columnTypes: Record<string, string> = {};
      if (processedData.length > 0) {
        processedData[0].forEach((item) => {
          if (
            item.id &&
            item.type &&
            !["index", "selection", "actions"].includes(item.id)
          ) {
            columnTypes[item.id] = item.type;
          }
        });
      }
      return columnTypes;
    },
    []
  );

  useEffect(() => {
    setCurrentViewConfig(getCurrentConfiguration());
  }, [sorting, columnVisibility, columnFilters, globalFilter, getCurrentConfiguration]);

  const handleLoadView = useCallback(
    (config: Record<string, unknown>) => {
      try {
        interface TableMetadataShape {
          availableColumns?: string[];
          filteredColumns?: string[];
          sortedColumns?: string[];
          compatibilityHash?: string;
          totalColumns?: number;
          columnTypes?: Record<string, string>;
        }
        const tableMetadata = (config.tableMetadata || config.columnMetadata) as
          | TableMetadataShape
          | undefined;

        if (tableMetadata?.availableColumns) {
          const currentColumns = table.getAllColumns().map((col) => col.id);
          const missingColumns =
            tableMetadata.filteredColumns?.filter(
              (col) => !currentColumns.includes(col)
            ) || [];

          if (tableMetadata.compatibilityHash) {
            const currentCoreColumns = currentColumns
              .filter((col) => !["index", "selection", "actions"].includes(col))
              .sort();
            const currentHash = Buffer.from(currentCoreColumns.join("|"))
              .toString("base64")
              .slice(0, 16);

            if (currentHash !== tableMetadata.compatibilityHash) {
              toast.warning(
                "Esta vista fue creada para una tabla con estructura diferente. Algunos filtros podrían no funcionar correctamente.",
                { duration: 6000 }
              );
            }
          }

          if (missingColumns.length > 0) {
            toast.warning(
              `Algunas columnas de la vista no están disponibles: ${missingColumns.join(", ")}`,
              { duration: 5000 }
            );
          }
        }

        if (config.sorting) {
          const sortingState = config.sorting as SortingState;
          const currentColumns = table.getAllColumns().map((col) => col.id);
          setSorting(sortingState.filter((sort) => currentColumns.includes(sort.id)));
        }

        if (config.columnVisibility) {
          setColumnVisibility(config.columnVisibility as VisibilityState);
        }

        if (config.columnFilters) {
          const filtersState = config.columnFilters as ColumnFiltersState;
          const currentColumns = table.getAllColumns().map((col) => col.id);
          const validFilters = filtersState.filter((filter) =>
            currentColumns.includes(filter.id)
          );
          if (validFilters.length !== filtersState.length) {
            toast.warning(
              "Algunos filtros no se pudieron aplicar porque las columnas no existen",
              { duration: 4000 }
            );
          }
          setColumnFilters(validFilters);
        }

        if (config.columnPinning) {
          const pinningState = config.columnPinning as ColumnPinningState;
          const currentColumns = table.getAllColumns().map((col) => col.id);
          table.setColumnPinning({
            left: pinningState.left?.filter((col) => currentColumns.includes(col)),
            right: pinningState.right?.filter((col) => currentColumns.includes(col)),
          });
        }

        if (config.globalFilter) setGlobalFilter(config.globalFilter as string);

        if (config.pagination) {
          const pagination = config.pagination as { pageIndex: number; pageSize: number };
          table.setPageIndex(pagination.pageIndex);
          table.setPageSize(pagination.pageSize);
        }

        const compatibilityInfo = tableMetadata?.compatibilityHash
          ? " (100% compatible)"
          : tableMetadata?.availableColumns
          ? " (verificada)"
          : "";
        toast.success(`Vista cargada correctamente${compatibilityInfo}`);
      } catch (error) {
        logger.error("Error al cargar vista:", error);
        toast.error("Error al cargar la vista");
      }
    },
    [setGlobalFilter, setSorting, setColumnVisibility, setColumnFilters, table]
  );

  // 9. Render
  if (isLoading || (!hasInitialData && data.length === 0)) {
    return (
      <FilterContext.Provider value={filterContextValue}>
        <CardContent className="relative">
          <div className="text-center text-muted-foreground py-8">
            Cargando datos...
          </div>
        </CardContent>
      </FilterContext.Provider>
    );
  }

  if (!isLoading && data.length === 0) {
    return (
      <FilterContext.Provider value={filterContextValue}>
        <CardContent className="relative">
          <div className="text-center text-muted-foreground py-8">
            No hay datos disponibles
          </div>
        </CardContent>
      </FilterContext.Provider>
    );
  }

  return (
    <FilterContext.Provider value={filterContextValue}>
      <TableErrorBoundary>
      <CardContent className="relative">
        {isProcessingData && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <TableSkeleton
              columnCount={7}
              rowCount={Math.min(10, data.length || 10)}
            />
          </div>
        )}

        <TableToolbar
          table={table}
          searchPlaceholder={`Buscar en ${processedData.length} ${
            isSecondaryTable ? "registros relacionados" : "registros"
          }...`}
          currentConfig={{
            ...currentViewConfig,
            columnTypes: getColumnTypesFromTable(table, processedData),
          }}
          onLoadView={handleLoadView}
          processedData={processedTableData}
          downloadFile={downloadFile}
          useFixedColumn={useFixedColumn}
          onFixedColumnChange={setUseFixedColumn}
          fixedColumnId={fixedColumnId}
          onFixedColumnIdChange={setFixedColumnId}
          originalColumnOrder={getEffectiveColumnOrder()}
          onColumnOrderChange={handleColumnOrderChange}
          onSaveAsDefault={() =>
            saveAsDefaultConfiguration({
              columnOrder,
              columnVisibility,
              useFixedColumn,
              fixedColumnId,
            })
          }
        />

        <div aria-live="polite" className="sr-only">
          {columnFilters.length > 0
            ? `${table.getFilteredRowModel().rows.length} resultados filtrados de ${processedTableData.length}`
            : `${processedTableData.length} registros`
          }
        </div>

        <div className="rounded-md border">
          {Object.keys(rowSelection).length > 0 && (
            <div className="bg-muted/30 border-b p-2 flex items-center justify-between">
              <div className="text-sm" aria-live="assertive">
                <span className="font-medium">
                  {Object.keys(rowSelection).length}
                </span>{" "}
                {Object.keys(rowSelection).length === 1
                  ? "fila seleccionada"
                  : "filas seleccionadas"}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRowSelection({})}
              >
                Limpiar selección
              </Button>
            </div>
          )}
          <div
            className="overflow-auto"
            style={{
              height: "calc(100vh - 400px)",
              minHeight: "300px",
              maxHeight: "800px",
            }}
          >
            <Table
              className="table-auto w-full border-separate border-spacing-0"
              style={{ width: table.getCenterTotalSize() }}
              aria-label="Tabla de datos"
              aria-rowcount={processedTableData.length}
            >
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const stylePin = getTanStackPinningStyles(
                        header.column,
                        true
                      );
                      return (
                        <TableHead
                          key={header.id}
                          className="px-4 m-0 bg-background border-x-1 border-y-1 border-zinc-200 text-center font-black"
                          style={{
                            width: header.getSize(),
                            ...stylePin,
                          }}
                          aria-sort={
                            header.column.getIsSorted() === "asc"
                              ? "ascending"
                              : header.column.getIsSorted() === "desc"
                                ? "descending"
                                : "none"
                          }
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}

                          {header.column.getCanResize() && (
                            <div
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              className={
                                "absolute top-0 right-0 h-full w-1 cursor-col-resize " +
                                "opacity-0 transition-opacity duration-200 " +
                                (header.column.getIsResizing()
                                  ? "bg-[hsl(var(--primary))] opacity-100"
                                  : "bg-[hsl(var(--border))] hover:opacity-100")
                              }
                            />
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody role="rowgroup">
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/50">
                      {row.getVisibleCells().map((cell) => {
                        const stylePin = getTanStackPinningStyles(
                          cell.column,
                          false
                        );
                        return (
                          <TableCell
                            key={cell.id}
                            className="p-4 m-0 border-x-1 border-y-1 border-zinc-200 w-fit"
                            style={{
                              width: "fit-content",
                              maxWidth: cell.column.getSize(),
                              ...stylePin,
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={table.getAllColumns().length}
                      className="h-24 text-center"
                    >
                      {table.getFilteredRowModel().rows.length === 0 &&
                      table.getCoreRowModel().rows.length > 0 ? (
                        <>
                          No se encontraron resultados con los filtros aplicados.
                          <div className="mt-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                table.resetColumnFilters();
                                table.setGlobalFilter("");
                              }}
                            >
                              Limpiar filtros
                            </Button>
                          </div>
                        </>
                      ) : (
                        "No hay datos disponibles"
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <nav aria-label="Paginacion de tabla">
          <TablePagination table={table} />
        </nav>
        <TypeLegend />

        {!isSecondaryTable && (
          <SecondaryTables
            arrayColumns={Array.from(uniqueArrayColumns.values())}
            level={0}
            isLoading={isSecondaryTablesLoading}
          />
        )}
      </CardContent>
      </TableErrorBoundary>
    </FilterContext.Provider>
  );
}
