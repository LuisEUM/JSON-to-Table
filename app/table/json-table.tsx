"use client";

import { TableHeader } from "@/components/ui/table";
import React from "react";
import {
  useMemo,
  useState,
  useCallback,
  useEffect,
  createContext,
} from "react";
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  useReactTable,
  Column, // Para leer info de pinning
  type FilterFn,
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

import { columns } from "./columns/columns"; // Ajusta la ruta a tu archivo de columnas
import {
  processData,
  type ProcessedItem,
  type ProcessedRow,
} from "./data-processor"; // Ajusta la ruta
import { TypeLegend } from "./components/type-legend"; // Ajusta la ruta
import { TablePagination } from "./components/table-pagination"; // Ajusta la ruta
import { TableSearch } from "./components/table-search"; // Ajusta la ruta
import { ColumnManagerModal } from "./components/column-manager-modal"; // Ajusta la ruta
import { ActionButtons } from "./components/action-buttons"; // Ajusta la ruta
import type { FilterCondition } from "./components/filters/filter-types";
import { ExportDropdown } from "./components/export-dropdown";
import { SecondaryTables } from "./components/secondary-tables";
import { TableSkeleton } from "./components/table-skeleton";
import { useDebounce } from "@/lib/hooks/use-debounce"; // Asegúrate de tener este hook
import { dateBetweenFilterFn } from "./components/filters/filter-types";
import { formatDate } from "@/app/utils/date-formatter";

declare module "@tanstack/table-core" {
  interface FilterFns {
    dateBetweenFilterFn: FilterFn<ProcessedRow>;
  }
}

// --------------------
// 1) Contexto de filtros (opcional)
// --------------------
export const FilterContext = createContext<{
  applyFilter: (columnId: string, filterValue: FilterCondition) => void;
}>({
  applyFilter: () => {},
});

// --------------------
// 3) Columnas "selección", "index" y "actions"
// --------------------
const selectionColumn: ColumnDef<ProcessedRow> = {
  id: "selection",
  header: ({ table }) => (
    <div className='flex items-center justify-center'>
      <input
        type='checkbox'
        className='h-4 w-4'
        {...{
          checked: table.getIsAllRowsSelected(),
          onChange: table.getToggleAllRowsSelectedHandler(),
        }}
      />
    </div>
  ),
  cell: ({ row }) => (
    <div className='flex items-center justify-center'>
      <input
        type='checkbox'
        className='h-4 w-4'
        {...{
          checked: row.getIsSelected(),
          onChange: row.getToggleSelectedHandler(),
        }}
      />
    </div>
  ),
  enableSorting: false,
  enableHiding: false,
  enableResizing: false,
  size: 50,
  minSize: 50,
  maxSize: 50,
};

const indexColumn: ColumnDef<ProcessedRow> = {
  id: "index",
  header: ({}) => (
    <div className='text-center text-muted-foreground w-6'>#</div>
  ),
  size: 50,
  enableSorting: false,
  enableHiding: false,
  cell: ({ row }) => (
    <div className='text-center text-muted-foreground w-full'>
      {row.index + 1}
    </div>
  ),
};

function createActionsColumn(
  onDelete: (index: number) => void
): ColumnDef<ProcessedRow> {
  return {
    id: "actions",
    header: ({}) => (
      <div className='text-center text-muted-foreground w-28'>Acciones</div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
    cell: ({ row }) => (
      <div className='flex items-center justify-center'>
        <ActionButtons
          row={row.original}
          onDelete={() => onDelete(row.index)}
        />
      </div>
    ),
  };
}

// --------------------
// 4) Funciones para pinning con TanStack (sin solaparse)
// --------------------
function getTanStackPinningStyles(
  column: Column<ProcessedRow>,
  isHeader = false
): React.CSSProperties {
  const isPinned = column.getIsPinned();

  return {
    position: isPinned ? "sticky" : "relative",
    left: isPinned === "left" ? column.getStart("left") : undefined,
    right: isPinned === "right" ? column.getStart("right") : undefined,
    top: isHeader ? 0 : undefined,
    zIndex: isPinned ? (isHeader ? 30 : 10) : 1,
    backgroundColor: "oklch(.985 0 0)",
  };
}

// --------------------
// 5) Componente principal
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

interface FilterFns {
  processedValueFilter: FilterFn<ProcessedRow>;
  dateBetweenFilterFn: FilterFn<ProcessedRow>;
}

// const generateColumns = (data: ProcessedRow[]): ColumnDef<ProcessedRow>[] => {
//   if (!data.length) return [];

//   const firstRow = data[0];
//   return Object.keys(firstRow).map((key) => {
//     const column: ColumnDef<ProcessedRow> = {
//       id: key,
//       accessorKey: key,
//       header: key,
//       cell: (info) => {
//         const value = info.getValue() as ProcessedItem;
//         if (!value) return null;
//         return String(value.value);
//       },
//     };

//     // Obtener el tipo de la columna del primer valor no nulo
//     const columnType = data.find((row) => row[key])?.[key as keyof ProcessedRow]
//       ?.type;

//     if (columnType === "date") {
//       column.filterFn = "dateBetweenFilterFn";
//     }

//     return column;
//   });
// };

export function JsonTable({
  data,
  isLoading = false,
  isSecondaryTable = false,
  onArrayColumnsChange,
  parentTableInfo,
}: JsonTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [isSecondaryTablesLoading, setIsSecondaryTablesLoading] =
    useState(false);
  const [useFixedColumn, setUseFixedColumn] = useState(false);
  const [fixedColumnId, setFixedColumnId] = useState<string | null>(null);
  const [originalColumnOrder, setOriginalColumnOrder] = useState<string[]>([]);
  const [isProcessingData, setIsProcessingData] = useState(true);
  const [hasInitialData, setHasInitialData] = useState(false);

  // Debounce para los filtros
  const debouncedColumnFilters = useDebounce(columnFilters, 300);
  const debouncedGlobalFilter = useDebounce(globalFilter, 300);

  // Map para almacenar las columnas de arrays únicos
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

  // 2. Todos los useMemo
  const processedData = useMemo(
    () => data.map((item) => processData(item)),
    [data]
  );

  const handleDelete = useCallback((index: number) => {
    // Por ahora solo mostrar el toast ya que el manejo de datos
    // se debe hacer desde el componente padre
    toast.success(`Registro #${index + 1} eliminado correctamente`);
    // TODO: Implementar lógica de eliminación a través de props
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

      const rowId =
        row["id"]?.value ||
        Object.values(row).find((item) => item.isId)?.value ||
        Object.values(row).find((item) =>
          item.path?.[item.path.length - 1].toLowerCase().includes("id")
        )?.value;

      console.log("📝 Procesando fila para arrays:", {
        rowId,
        hasId: !!rowId,
        rowKeys: Object.keys(row),
      });

      Object.values(row).forEach((item) => {
        // Solo procesamos arrays de objetos para tablas secundarias
        if (
          item.type === "array[objeto]" ||
          (item.type === "array" && item.items?.[0]?.type === "objeto")
        ) {
          const columnId = item.path.join(".");

          // Verificar si ya existe esta columna
          if (!uniqueArrayColumns.has(columnId)) {
            console.log("📊 Creando nueva tabla secundaria:", {
              columnId,
              rowId,
              type: item.type,
            });

            const processedData =
              item.items?.map((subItem) => {
                console.log("🔄 Procesando subitem:", {
                  parentId: rowId,
                  columnId,
                  subItemType: subItem.type,
                });

                return {
                  ...(subItem.value as object),
                  __parentId: rowId,
                  __parentTable: parentTableInfo?.id || columnId,
                };
              }) || [];

            uniqueArrayColumns.set(columnId, {
              id: columnId,
              label: item.path.join("."),
              data: processedData,
              parentTable: parentTableInfo,
            });
          } else {
            // Para columnas existentes, solo agregar datos si el padre es diferente
            // Esto evita duplicación de datos en tablas secundarias
            const existingColumn = uniqueArrayColumns.get(columnId);

            if (existingColumn) {
              // Verificar si estos datos (basados en parentId) ya están incluidos
              const hasParentId = existingColumn.data.some(
                (record) => record.__parentId === rowId
              );

              if (!hasParentId) {
                console.log(
                  "📊 Agregando datos a tabla secundaria existente:",
                  {
                    columnId,
                    rowId,
                    existingDataLength: existingColumn.data.length,
                  }
                );

                // Procesar y agregar nuevos datos que no están duplicados
                const newProcessedData =
                  item.items?.map((subItem) => ({
                    ...(subItem.value as object),
                    __parentId: rowId,
                    __parentTable: parentTableInfo?.id || columnId,
                  })) || [];

                // Actualizar la columna con los datos combinados
                uniqueArrayColumns.set(columnId, {
                  ...existingColumn,
                  data: [...existingColumn.data, ...newProcessedData],
                });
              }
            }
          }
        }
        // No procesamos arrays de primitivos para tablas secundarias
        else if (item.type === "array[primitivo]") {
          console.log(
            "📊 Ignorando array de primitivos para tablas secundarias:",
            {
              columnId: item.path.join("."),
              rowId,
              type: item.type,
              values: item.items?.map((i) => i.value).slice(0, 3), // Mostrar solo los primeros 3 valores
            }
          );
        }
      });

      return row;
    });
  }, [processedData, parentTableInfo, uniqueArrayColumns]);

  // 3. Instancia de la tabla
  const table = useReactTable({
    data: processedTableData,
    columns: tableColumns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    enableRowSelection: true,
    filterFns: {
      processedValueFilter: (row, columnId, filterValue) => {
        if (
          !filterValue ||
          typeof filterValue !== "object" ||
          !("operator" in filterValue)
        ) {
          return true;
        }

        const processedValue = row.original[columnId] as ProcessedItem;
        if (!processedValue) return false;

        const rawValue = processedValue.value;

        switch (filterValue.operator) {
          case "arrIncludesSome":
            if (processedValue.type === "fecha") {
              const date =
                rawValue instanceof Date
                  ? rawValue
                  : new Date(rawValue as string | number);
              if (!isNaN(date.getTime())) {
                const dateStr = formatDate(date, "yyyy-MM-dd");
                return (
                  Array.isArray(filterValue.value) &&
                  filterValue.value.includes(dateStr)
                );
              }
              return false;
            }
            return (
              Array.isArray(filterValue.value) &&
              filterValue.value.includes(String(rawValue))
            );
          case "in":
            return (
              Array.isArray(filterValue.value) &&
              filterValue.value.includes(String(rawValue))
            );
          case "notIn":
            return (
              Array.isArray(filterValue.value) &&
              !filterValue.value.includes(String(rawValue))
            );
          case "equals":
            return rawValue === filterValue.value;
          case "notEquals":
            return rawValue !== filterValue.value;
          case "contains":
            return String(rawValue)
              .toLowerCase()
              .includes(String(filterValue.value).toLowerCase());
          case "notContains":
            return !String(rawValue)
              .toLowerCase()
              .includes(String(filterValue.value).toLowerCase());
          case "startsWith":
            return String(rawValue)
              .toLowerCase()
              .startsWith(String(filterValue.value).toLowerCase());
          case "endsWith":
            return String(rawValue)
              .toLowerCase()
              .endsWith(String(filterValue.value).toLowerCase());
          case "greaterThan":
            return Number(rawValue) > Number(filterValue.value);
          case "lessThan":
            return Number(rawValue) < Number(filterValue.value);
          case "between":
            if (
              filterValue.value !== undefined &&
              filterValue.additionalValue !== undefined
            ) {
              const min = Number(filterValue.value);
              const max = Number(filterValue.additionalValue);
              const value = Number(rawValue);
              return value >= min && value <= max;
            }
            return false;
          case "notBetween":
            if (
              filterValue.value !== undefined &&
              filterValue.additionalValue !== undefined
            ) {
              const min = Number(filterValue.value);
              const max = Number(filterValue.additionalValue);
              const value = Number(rawValue);
              return value < min || value > max;
            }
            return false;
          case "isNull":
            return rawValue === null || rawValue === undefined;
          case "isNotNull":
            return rawValue !== null && rawValue !== undefined;
          case "includesString":
            if (typeof filterValue.value === "string") {
              const pattern = filterValue.value.split("|");
              return pattern.some((value: string) =>
                String(rawValue).toLowerCase().includes(value.toLowerCase())
              );
            }
            return false;
          default:
            return true;
        }
      },
      dateBetweenFilterFn,
    } as FilterFns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    enableFilters: true,
    enableGlobalFilter: true,
    globalFilterFn: (row, columnId, filterValue) => {
      const searchTerm = String(filterValue).toLowerCase();
      if (!searchTerm) return true;

      console.log("🔍 Buscando en la fila:", {
        searchTerm,
        rowId: row.id,
        originalLength: Object.keys(row.original).length,
      });

      // Buscar en todos los valores de la fila
      const searchInObject = (obj: unknown): boolean => {
        if (!obj) return false;

        // Si es un ProcessedItem, buscar en su valor
        if (
          typeof obj === "object" &&
          obj !== null &&
          "value" in obj &&
          "type" in obj
        ) {
          const processedItem = obj as ProcessedItem;

          // Para string, buscar directamente
          if (typeof processedItem.value === "string") {
            const value = processedItem.value.toLowerCase();
            if (value.includes(searchTerm)) return true;
          }
          // Para números, convertir a string y buscar
          else if (typeof processedItem.value === "number") {
            const value = String(processedItem.value).toLowerCase();
            if (value.includes(searchTerm)) return true;
          }
          // Para fechas, buscar en el formato legible
          else if (processedItem.type === "fecha") {
            const value = String(processedItem.value).toLowerCase();
            if (value.includes(searchTerm)) return true;
          }
          // Para booleanos, buscar por 'verdadero' o 'falso'
          else if (processedItem.type === "boolean") {
            const boolString = processedItem.value ? "verdadero" : "falso";
            if (boolString.includes(searchTerm)) return true;
          }

          // Si es un array, buscar en sus items
          if (
            processedItem.type.includes("array") &&
            Array.isArray(processedItem.items)
          ) {
            return processedItem.items.some((item: unknown) =>
              searchInObject(item)
            );
          }
        }

        // Si es un objeto, buscar recursivamente
        if (typeof obj === "object" && obj !== null) {
          return Object.values(obj).some((value) => searchInObject(value));
        }

        // Para valores primitivos
        if (obj !== undefined && obj !== null) {
          return String(obj).toLowerCase().includes(searchTerm);
        }

        return false;
      };

      // Buscar en toda la fila
      const found = searchInObject(row.original);
      console.log("🔍 Resultado de búsqueda:", {
        rowId: row.id,
        found,
      });
      return found;
    },
    getColumnCanGlobalFilter: (column) => {
      // Permitir filtrado global en todas las columnas excepto acciones o columnas especiales
      return column.id !== "actions" && column.id !== "select";
    },
  });

  // 4. Callbacks
  const applyFilter = useCallback(
    (columnId: string, filterValue: FilterCondition) => {
      table.getColumn(columnId)?.setFilterValue(filterValue);
    },
    [table]
  );

  const filterContextValue = useMemo(
    () => ({
      applyFilter,
    }),
    [applyFilter]
  );

  // 5. Efectos
  useEffect(() => {
    if (!processedData.length) {
      if (onArrayColumnsChange) {
        onArrayColumnsChange([]);
      }
      return;
    }

    const newArrayColumns = Array.from(uniqueArrayColumns.values());

    // Deduplicar y limpiar tablas secundarias vacías
    const validArrayColumns = newArrayColumns.filter(
      (col) => col.data && col.data.length > 0 && col.id
    );

    console.log("📊 Array columns procesadas:", {
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

  useEffect(() => {
    if (!originalColumnOrder.length) {
      setOriginalColumnOrder(table.getAllLeafColumns().map((col) => col.id));
    }
  }, [table, originalColumnOrder]);

  useEffect(() => {
    const indexColumn = table.getColumn("index");
    if (indexColumn) {
      indexColumn.toggleVisibility(!useFixedColumn);
    }

    const leftPins = ["selection"];
    if (useFixedColumn && fixedColumnId) {
      leftPins.push(fixedColumnId);
    } else {
      leftPins.push("index");
    }

    table.setColumnPinning({
      left: leftPins,
      right: ["actions"],
    });
  }, [useFixedColumn, fixedColumnId, table]);

  // Función para procesar las tablas secundarias
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
            item.type === "array[objeto]" ||
            (item.type === "array" && item.items?.[0]?.type === "objeto")
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

      // Pequeño delay para asegurar que la UI se actualice
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

  // Efecto para controlar el estado inicial de carga
  useEffect(() => {
    if (data.length > 0 && !hasInitialData) {
      setHasInitialData(true);
    }
  }, [data.length, hasInitialData]);

  // Efecto para procesar las tablas secundarias cuando cambian los filtros
  useEffect(() => {
    const processData = async () => {
      setIsProcessingData(true);
      const filteredRows = table.getFilteredRowModel().rows;
      const filteredData = filteredRows.map((row) => row.original);
      await processSecondaryTables(filteredData);
      setIsProcessingData(false);
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

  // Render loading state
  if (isLoading || (!hasInitialData && data.length === 0)) {
    return (
      <FilterContext.Provider value={filterContextValue}>
        <CardContent className='relative'>
          <div className='text-center text-muted-foreground py-8'>
            Cargando datos...
          </div>
        </CardContent>
      </FilterContext.Provider>
    );
  }

  // Render empty state
  if (!isLoading && data.length === 0) {
    return (
      <FilterContext.Provider value={filterContextValue}>
        <CardContent className='relative'>
          <div className='text-center text-muted-foreground py-8'>
            No hay datos disponibles
          </div>
        </CardContent>
      </FilterContext.Provider>
    );
  }

  return (
    <FilterContext.Provider value={filterContextValue}>
      <CardContent className='relative'>
        {/* Mostrar skeleton loader mientras se procesan los datos */}
        {isProcessingData && (
          <div className='absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center'>
            <TableSkeleton
              columnCount={7}
              rowCount={Math.min(10, data.length || 10)}
            />
          </div>
        )}

        {/* Encabezado: barra de búsqueda y modal de columnas */}
        <div className='mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='w-full sm:w-72'>
            <TableSearch table={table} />
          </div>
          <div className='flex justify-end'>
            <ColumnManagerModal
              table={table}
              useFixedColumn={useFixedColumn}
              onFixedColumnChange={setUseFixedColumn}
              fixedColumnId={fixedColumnId}
              onFixedColumnIdChange={setFixedColumnId}
              originalColumnOrder={originalColumnOrder}
            />
            <ExportDropdown
              selectedRows={table.getSelectedRowModel().rows}
              allRows={table.getCoreRowModel().rows}
            />
          </div>
        </div>

        {/* Contenedor principal de la tabla */}
        <div className='rounded-md border'>
          <div
            className='overflow-auto'
            style={{
              height: "calc(100vh - 400px)", // Ajusta este valor según necesites
              minHeight: "300px",
              maxHeight: "800px",
            }}
          >
            <Table
              className='table-auto w-full border-separate border-spacing-0'
              style={{ width: table.getCenterTotalSize() }}
            >
              {/* ENCABEZADO */}
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
                          className='px-4 m-0 bg-background border-x-1 border-y-1 border-zinc-200 text-center font-black'
                          style={{
                            width: header.getSize(),
                            ...stylePin,
                          }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}

                          {/* Resizer */}
                          {header.column.getCanResize() && (
                            <div
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              // Classes de Tailwind para la "resizer"
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

              {/* CUERPO */}
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className='hover:bg-muted/50'>
                      {row.getVisibleCells().map((cell) => {
                        const stylePin = getTanStackPinningStyles(
                          cell.column,
                          false
                        );
                        return (
                          <TableCell
                            key={cell.id}
                            className='p-4 m-0 border-x-1 border-y-1 border-zinc-200 w-fit'
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
                      className='h-24 text-center'
                    >
                      {table.getFilteredRowModel().rows.length === 0 &&
                      table.getCoreRowModel().rows.length > 0 ? (
                        <>
                          No se encontraron resultados con los filtros
                          aplicados.
                          <div className='mt-2'>
                            <Button
                              variant='outline'
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

        {/* Paginación y leyenda */}
        <TablePagination table={table} />
        <TypeLegend />

        {/* Tablas secundarias */}
        {!isSecondaryTable && (
          <SecondaryTables
            arrayColumns={Array.from(uniqueArrayColumns.values())}
            level={0}
            isLoading={isSecondaryTablesLoading}
          />
        )}
      </CardContent>
    </FilterContext.Provider>
  );
}
